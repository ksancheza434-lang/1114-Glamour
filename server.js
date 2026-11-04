const express = require("express");
const path = require("path");
require("dotenv").config();
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "2mb" }));
app.use(express.static(__dirname));

if (!process.env.DATABASE_URL) {
  console.error("Falta DATABASE_URL en el archivo .env");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Supabase normalmente requiere SSL para conexiones PostgreSQL.
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000
});

let databaseConnected = false;

async function prepareDatabase() {
  if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes("[YOUR-PASSWORD]")) {
    throw new Error("Configura DATABASE_URL con la cadena real de conexión de Supabase.");
  }

  await pool.query("SELECT NOW()");

  await pool.query(`
    CREATE TABLE IF NOT EXISTS pedidos (
      id BIGSERIAL PRIMARY KEY,
      numero TEXT UNIQUE NOT NULL,
      nombre TEXT NOT NULL,
      correo TEXT,
      telefono TEXT,
      direccion JSONB,
      ciudad TEXT,
      departamento TEXT,
      envio TEXT,
      productos JSONB NOT NULL DEFAULT '[]'::jsonb,
      total NUMERIC(12,2) NOT NULL DEFAULT 0,
      estado TEXT NOT NULL DEFAULT 'Pendiente de pago',
      creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS solicitudes_mayoristas (
      id BIGSERIAL PRIMARY KEY,
      nombre TEXT NOT NULL,
      correo TEXT NOT NULL,
      empresa TEXT,
      identificacion TEXT,
      mensaje TEXT,
      estado TEXT NOT NULL DEFAULT 'Pendiente',
      creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS suscriptores (
      id BIGSERIAL PRIMARY KEY,
      correo TEXT UNIQUE NOT NULL,
      consentimiento BOOLEAN NOT NULL DEFAULT FALSE,
      creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS inventario (
      variante_id TEXT PRIMARY KEY,
      cantidad INTEGER NOT NULL CHECK (cantidad >= 0),
      actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS configuracion_tienda (
      clave TEXT PRIMARY KEY,
      valor JSONB NOT NULL,
      actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  // Compatibilidad con una tabla pedidos creada por la versión anterior.
  await pool.query(`
    ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS direccion JSONB;
    ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS productos JSONB NOT NULL DEFAULT '[]'::jsonb;
    ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS numero TEXT;
    ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS estado TEXT DEFAULT 'Pendiente de pago';
    CREATE UNIQUE INDEX IF NOT EXISTS pedidos_numero_unique ON pedidos(numero) WHERE numero IS NOT NULL;
  `);

  databaseConnected = true;
  console.log("Conectado a PostgreSQL. Tablas listas.");
}

function requireDatabase(req, res, next) {
  if (!databaseConnected) {
    return res.status(503).json({ ok: false, error: "La base de datos no está conectada." });
  }
  next();
}

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    tienda: "Glamour Beauty Supply",
    baseDeDatos: databaseConnected ? "Conectada a PostgreSQL" : "Desconectada"
  });
});

// Guardar un pedido y descontar inventario en una sola transacción.
app.post("/api/orders", requireDatabase, async (req, res) => {
  const body = req.body || {};
  const name = String(body.name || body.nombre || "").trim();
  const email = String(body.email || body.correo || "").trim();
  const phone = String(body.phone || body.telefono || "").trim();
  const address = body.address || body.direccion || {};
  const items = Array.isArray(body.items) ? body.items : (Array.isArray(body.productos) ? body.productos : []);

  if (!name || !items.length) {
    return res.status(400).json({ ok: false, error: "El pedido necesita nombre y al menos un producto." });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    for (const item of items) {
      const variantId = String(item.variantId || item.variante_id || "").trim();
      const qty = Number(item.quantity ?? item.qty);
      const initialStock = Number(item.availableStock ?? item.stockDisponible);
      if (!variantId || !Number.isInteger(qty) || qty < 1) {
        throw new Error("Hay un producto o una cantidad inválida en el pedido.");
      }

      // Inicializa el registro con el inventario del catálogo la primera vez.
      await client.query(
        `INSERT INTO inventario (variante_id, cantidad)
         VALUES ($1, $2) ON CONFLICT (variante_id) DO NOTHING`,
        [variantId, Number.isInteger(initialStock) && initialStock >= 0 ? initialStock : 0]
      );

      const stockResult = await client.query(
        "SELECT cantidad FROM inventario WHERE variante_id = $1 FOR UPDATE",
        [variantId]
      );
      if (stockResult.rows[0].cantidad < qty) {
        throw new Error(`Inventario insuficiente para ${item.variantName || variantId}. Disponible: ${stockResult.rows[0].cantidad}.`);
      }
      await client.query(
        "UPDATE inventario SET cantidad = cantidad - $1, actualizado_en = NOW() WHERE variante_id = $2",
        [qty, variantId]
      );
    }

    const number = "GL-" + Date.now().toString(36).toUpperCase();
    const city = String(address.city || body.city || "").trim();
    const region = String(address.region || body.region || "").trim();
    const total = Number(body.total);
    if (!Number.isFinite(total) || total < 0) throw new Error("El total del pedido no es válido.");

    const inserted = await client.query(
      `INSERT INTO pedidos
       (numero, nombre, correo, telefono, direccion, ciudad, departamento, envio, productos, total, estado)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10,'Pendiente de pago')
       RETURNING id, numero, nombre, correo, telefono, direccion, ciudad, departamento, envio, productos, total, estado, creado_en`,
      [
        number, name, email || null, phone || null, JSON.stringify(address),
        city || null, region || null, body.shipping || body.envio || null,
        JSON.stringify(items), total
      ]
    );

    const inventoryResult = await client.query("SELECT variante_id, cantidad FROM inventario");
    const inventory = Object.fromEntries(inventoryResult.rows.map(r => [r.variante_id, r.cantidad]));

    await client.query("COMMIT");
    res.status(201).json({
      ok: true,
      message: "Pedido guardado correctamente.",
      order: {
        number: inserted.rows[0].numero,
        total: Number(inserted.rows[0].total),
        status: inserted.rows[0].estado,
        createdAt: inserted.rows[0].creado_en
      },
      inventory
    });
  } catch (error) {
    await client.query("ROLLBACK");
    res.status(400).json({ ok: false, error: error.message || "No se pudo guardar el pedido." });
  } finally {
    client.release();
  }
});

app.get("/api/inventory", requireDatabase, async (req, res) => {
  try {
    const result = await pool.query("SELECT variante_id, cantidad FROM inventario");
    res.json({ ok: true, inventory: Object.fromEntries(result.rows.map(r => [r.variante_id, r.cantidad])) });
  } catch (error) {
    console.error("Error leyendo inventario:", error);
    res.status(500).json({ ok: false, error: "No se pudo consultar el inventario." });
  }
});

app.post("/api/wholesale-requests", requireDatabase, async (req, res) => {
  try {
    const b = req.body || {};
    const name = String(b.fullName || "").trim();
    const email = String(b.email || "").trim();
    if (!name || !email) return res.status(400).json({ ok: false, error: "Nombre y correo son obligatorios." });

    const result = await pool.query(
      `INSERT INTO solicitudes_mayoristas (nombre, correo, empresa, identificacion, mensaje)
       VALUES ($1,$2,$3,$4,$5) RETURNING id, estado, creado_en`,
      [name, email, b.companyName || null, b.taxId || null, b.message || null]
    );
    res.status(201).json({ ok: true, request: result.rows[0] });
  } catch (error) {
    console.error("Error guardando solicitud mayorista:", error);
    res.status(500).json({ ok: false, error: "No se pudo guardar la solicitud." });
  }
});

app.post("/api/newsletter", requireDatabase, async (req, res) => {
  try {
    const email = String((req.body || {}).email || "").trim().toLowerCase();
    const consent = (req.body || {}).consent === true;
    if (!email || !consent) return res.status(400).json({ ok: false, error: "Correo y consentimiento son obligatorios." });

    await pool.query(
      `INSERT INTO suscriptores (correo, consentimiento)
       VALUES ($1, TRUE)
       ON CONFLICT (correo) DO UPDATE SET consentimiento = TRUE`,
      [email]
    );
    res.status(201).json({ ok: true, message: "Suscripción guardada." });
  } catch (error) {
    console.error("Error guardando suscripción:", error);
    res.status(500).json({ ok: false, error: "No se pudo guardar la suscripción." });
  }
});

app.patch("/api/theme", requireDatabase, async (req, res) => {
  try {
    await pool.query(
      `INSERT INTO configuracion_tienda (clave, valor)
       VALUES ('theme', $1::jsonb)
       ON CONFLICT (clave) DO UPDATE SET valor = EXCLUDED.valor, actualizado_en = NOW()`,
      [JSON.stringify(req.body || {})]
    );
    res.json({ ok: true, message: "Apariencia guardada." });
  } catch (error) {
    console.error("Error guardando apariencia:", error);
    res.status(500).json({ ok: false, error: "No se pudo guardar la apariencia." });
  }
});

app.get("/api/theme", requireDatabase, async (req, res) => {
  try {
    const result = await pool.query("SELECT valor FROM configuracion_tienda WHERE clave = 'theme'");
    res.json({ ok: true, theme: result.rows[0]?.valor || null });
  } catch (error) {
    res.status(500).json({ ok: false, error: "No se pudo consultar la apariencia." });
  }
});

async function startServer() {
  try {
    await prepareDatabase();
  } catch (error) {
    databaseConnected = false;
    console.error("No se pudo conectar a PostgreSQL:", error.message);
  }

  app.listen(PORT, () => {
    console.log(`Glamour Beauty Supply en http://localhost:${PORT}`);
    console.log(databaseConnected ? "Base de datos conectada." : "ATENCIÓN: servidor activo, pero SIN base de datos.");
  });
}

process.on("SIGINT", async () => {
  await pool.end();
  process.exit(0);
});

startServer();
