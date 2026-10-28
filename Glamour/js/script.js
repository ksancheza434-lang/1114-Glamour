/* ===========================================================
   Glamour — Tienda virtual (DEMO)
   JavaScript puro. Datos ficticios de demostración.
   -----------------------------------------------------------
   Secciones:
   1. Configuración general
   2. Datos (categorías y productos)
   3. Utilidades
   4. Render del catálogo y filtros
   5. Carrito de compras (+ localStorage)
   6. Descuentos por volumen
   7. Pedido, modal y WhatsApp
   8. Formularios (cotización y contacto)
   9. Interfaz general (menú, scroll, notificaciones)
   =========================================================== */

/* ============ 1. CONFIGURACIÓN GENERAL ==================== */
const CONFIG = {
  nombreTienda: "Glamour",

  // Número de WhatsApp para enviar el pedido (solo dígitos, con indicativo).
  // Ejemplo: "573001112233". Déjalo vacío si aún no lo has configurado.
  whatsapp: "",

  // Cantidad mínima configurable para considerarse pedido mayorista
  minimoMayorista: 6,

  // Reglas de descuento por volumen (se aplican por producto según su cantidad)
  reglasMayoristas: [
    { desde: 1,  hasta: 5,        descuento: 0.00, etiqueta: "Precio al detal" },
    { desde: 6,  hasta: 11,       descuento: 0.05, etiqueta: "Mayorista 5 %" },
    { desde: 12, hasta: Infinity, descuento: 0.10, etiqueta: "Mayorista 10 %" }
  ],

  claveAlmacenamiento: "glamour_carrito_v1"
};

/* ============ 2. DATOS ==================================== */
const IMG = {
  maquillaje1: "https://images.pexels.com/photos/6527702/pexels-photo-6527702.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  maquillaje2: "https://images.pexels.com/photos/6527699/pexels-photo-6527699.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  labiales1:   "https://images.pexels.com/photos/7810600/pexels-photo-7810600.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  labiales2:   "https://images.pexels.com/photos/6527701/pexels-photo-6527701.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  labiales3:   "https://images.pexels.com/photos/7810602/pexels-photo-7810602.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  labiales4:   "https://images.pexels.com/photos/6527698/pexels-photo-6527698.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  lujo:        "https://images.pexels.com/photos/3750640/pexels-photo-3750640.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  labiales5:   "https://images.pexels.com/photos/25533534/pexels-photo-25533534.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  espejo:      "https://images.pexels.com/photos/6527704/pexels-photo-6527704.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  mujer:       "https://images.pexels.com/photos/11118765/pexels-photo-11118765.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  capilar1:    "https://images.pexels.com/photos/19833253/pexels-photo-19833253.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  capilar2:    "https://images.pexels.com/photos/18066458/pexels-photo-18066458.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  accesorios:  "https://images.pexels.com/photos/17307534/pexels-photo-17307534.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  acondicion:  "https://images.pexels.com/photos/17407168/pexels-photo-17407168.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  facial1:     "https://images.pexels.com/photos/19522722/pexels-photo-19522722.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  emprende:    "https://images.pexels.com/photos/18351014/pexels-photo-18351014.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  facial2:     "https://images.pexels.com/photos/4841525/pexels-photo-4841525.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  facial3:     "https://images.pexels.com/photos/4841264/pexels-photo-4841264.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  jabones:     "https://images.pexels.com/photos/29502141/pexels-photo-29502141.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  corporal:    "https://images.pexels.com/photos/13472061/pexels-photo-13472061.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
};

// Imagen alternativa (SVG en línea) si una URL no carga
const IMG_ALTERNATIVA =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400">
       <rect width="400" height="400" fill="#fbe4ec"/>
       <circle cx="200" cy="165" r="62" fill="#f8d3e0"/>
       <text x="50%" y="63%" text-anchor="middle" font-family="Arial" font-size="26" fill="#c2185b">Glamour</text>
       <text x="50%" y="72%" text-anchor="middle" font-family="Arial" font-size="15" fill="#9e1250">Imagen no disponible</text>
     </svg>`
  );

const CATEGORIAS = [
  { id: "maquillaje",   nombre: "Maquillaje",            texto: "Labiales, bases, sombras y más", imagen: IMG.maquillaje1 },
  { id: "facial",       nombre: "Cuidado facial",        texto: "Limpieza, hidratación y brillo",  imagen: IMG.facial1 },
  { id: "capilar",      nombre: "Cuidado capilar",       texto: "Shampoo, acondicionador y aceites", imagen: IMG.capilar1 },
  { id: "tratamientos", nombre: "Tratamientos capilares",texto: "Keratina, ampollas y mascarillas", imagen: IMG.acondicion },
  { id: "accesorios",   nombre: "Accesorios de belleza", texto: "Brochas, esponjas y organizadores", imagen: IMG.accesorios },
  { id: "ofertas",      nombre: "Ofertas especiales",    texto: "Precios rebajados por tiempo limitado", imagen: IMG.labiales5 }
];

/* Productos de EJEMPLO. Precios de demostración en pesos colombianos (COP). */
const PRODUCTOS = [
  { id: 1,  nombre: "Labial líquido mate",        categoria: "maquillaje",   descripcion: "Alta pigmentación y larga duración, acabado aterciopelado.", precio: 32000, precioMayorista: 25000, precioAnterior: null,  stock: 40, etiquetas: ["vendido"], imagen: IMG.labiales1 },
  { id: 2,  nombre: "Set de labiales nude x5",    categoria: "maquillaje",   descripcion: "Cinco tonos nude ideales para uso diario y eventos.",        precio: 89000, precioMayorista: 72000, precioAnterior: 110000, stock: 18, etiquetas: ["oferta"], imagen: IMG.labiales2 },
  { id: 3,  nombre: "Base líquida cobertura alta",categoria: "maquillaje",   descripcion: "Acabado natural, resistente al sudor, 12 horas de duración.", precio: 68000, precioMayorista: 55000, precioAnterior: null,  stock: 25, etiquetas: ["nuevo"],  imagen: IMG.maquillaje2 },
  { id: 4,  nombre: "Paleta de sombras 18 tonos", categoria: "maquillaje",   descripcion: "Mates y satinados de fácil difuminado y gran fijación.",      precio: 75000, precioMayorista: 60000, precioAnterior: null,  stock: 22, etiquetas: ["vendido"], imagen: IMG.maquillaje1 },
  { id: 5,  nombre: "Máscara de pestañas volumen",categoria: "maquillaje",   descripcion: "Cepillo curvo que define y aporta volumen inmediato.",       precio: 38000, precioMayorista: 30000, precioAnterior: 45000, stock: 35, etiquetas: ["oferta"], imagen: IMG.labiales4 },
  { id: 6,  nombre: "Rubor compacto en polvo",    categoria: "maquillaje",   descripcion: "Textura sedosa con acabado luminoso y natural.",             precio: 29000, precioMayorista: 23000, precioAnterior: null,  stock: 0,  etiquetas: [],         imagen: IMG.labiales3 },
  { id: 7,  nombre: "Iluminador líquido perla",   categoria: "maquillaje",   descripcion: "Brillo sutil para pómulos, hombros y clavículas.",           precio: 42000, precioMayorista: 34000, precioAnterior: null,  stock: 30, etiquetas: ["nuevo"],  imagen: IMG.espejo },

  { id: 8,  nombre: "Gel limpiador facial suave", categoria: "facial",       descripcion: "Limpieza profunda sin resecar, apto para piel sensible.",    precio: 36000, precioMayorista: 29000, precioAnterior: null,  stock: 45, etiquetas: [],         imagen: IMG.facial1 },
  { id: 9,  nombre: "Sérum vitamina C 30 ml",     categoria: "facial",       descripcion: "Unifica el tono y aporta luminosidad día a día.",            precio: 58000, precioMayorista: 46000, precioAnterior: 72000, stock: 20, etiquetas: ["oferta","vendido"], imagen: IMG.facial2 },
  { id: 10, nombre: "Crema hidratante de día",    categoria: "facial",       descripcion: "Hidratación ligera con ácido hialurónico y aloe.",           precio: 49000, precioMayorista: 39000, precioAnterior: null,  stock: 28, etiquetas: [],         imagen: IMG.facial3 },
  { id: 11, nombre: "Jabón facial artesanal",     categoria: "facial",       descripcion: "Elaborado con ingredientes naturales y aceites esenciales.", precio: 18000, precioMayorista: 13500, precioAnterior: null,  stock: 60, etiquetas: ["nuevo"],  imagen: IMG.jabones },

  { id: 12, nombre: "Shampoo hidratación intensa",categoria: "capilar",      descripcion: "Fórmula sin sal para cabello seco y quebradizo, 500 ml.",    precio: 45000, precioMayorista: 36000, precioAnterior: null,  stock: 50, etiquetas: ["vendido"], imagen: IMG.capilar1 },
  { id: 13, nombre: "Acondicionador reparador",   categoria: "capilar",      descripcion: "Desenreda y sella la cutícula para un brillo duradero.",     precio: 43000, precioMayorista: 34000, precioAnterior: null,  stock: 48, etiquetas: [],         imagen: IMG.acondicion },
  { id: 14, nombre: "Shampoo herbal anticaída",   categoria: "capilar",      descripcion: "Extractos vegetales que fortalecen el cuero cabelludo.",     precio: 52000, precioMayorista: 41000, precioAnterior: 62000, stock: 26, etiquetas: ["oferta"], imagen: IMG.capilar2 },
  { id: 15, nombre: "Aceite capilar nutritivo",   categoria: "tratamientos", descripcion: "Control del frizz y puntas abiertas con acabado sedoso.",    precio: 39000, precioMayorista: 31000, precioAnterior: null,  stock: 33, etiquetas: ["nuevo"],  imagen: IMG.corporal },
  { id: 16, nombre: "Tratamiento de keratina",    categoria: "tratamientos", descripcion: "Mascarilla profesional para alisado y reparación profunda.", precio: 95000, precioMayorista: 76000, precioAnterior: 115000, stock: 15, etiquetas: ["oferta","vendido"], imagen: IMG.lujo },
  { id: 17, nombre: "Ampollas capilares x6",      categoria: "tratamientos", descripcion: "Choque de nutrición semanal para cabello maltratado.",       precio: 56000, precioMayorista: 44000, precioAnterior: null,  stock: 21, etiquetas: [],         imagen: IMG.facial1 },
  { id: 18, nombre: "Set de brochas profesional", categoria: "accesorios",   descripcion: "12 brochas de fibra suave con estuche organizador.",         precio: 79000, precioMayorista: 62000, precioAnterior: null,  stock: 17, etiquetas: ["vendido"], imagen: IMG.accesorios },
  { id: 19, nombre: "Esponjas difuminadoras x3",  categoria: "accesorios",   descripcion: "Aplicación uniforme de base, corrector y polvos.",           precio: 22000, precioMayorista: 16000, precioAnterior: 28000, stock: 55, etiquetas: ["oferta"], imagen: IMG.mujer },
  { id: 20, nombre: "Espejo de tocador con luz",  categoria: "accesorios",   descripcion: "Luz LED regulable y base giratoria para maquillaje.",        precio: 110000, precioMayorista: 88000, precioAnterior: null, stock: 9,  etiquetas: ["nuevo"],  imagen: IMG.espejo }
];

/* ============ 3. UTILIDADES =============================== */
const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

/** Formatea un número como pesos colombianos: $25.000 COP */
function formatearCOP(valor) {
  const entero = Math.round(valor);
  return "$" + entero.toLocaleString("es-CO") + " COP";
}

/** Nombre legible de una categoría */
function nombreCategoria(id) {
  const c = CATEGORIAS.find(x => x.id === id);
  return c ? c.nombre : "General";
}

/** Devuelve true si el producto está en oferta */
function estaEnOferta(p) {
  return p.etiquetas.includes("oferta");
}

/** Muestra una notificación flotante */
function notificar(texto, tipo = "exito") {
  const cont = $("#notificaciones");
  const div = document.createElement("div");
  div.className = "notificacion " + tipo;
  div.setAttribute("role", "status");
  div.textContent = texto;
  cont.appendChild(div);
  setTimeout(() => div.remove(), 3200);
}

/* ============ 4. CATÁLOGO Y FILTROS ======================= */
const estadoFiltros = { texto: "", categoria: "todas", orden: "destacados", soloOfertas: false };

function productosFiltrados() {
  let lista = [...PRODUCTOS];
  const t = estadoFiltros.texto.trim().toLowerCase();

  if (t) {
    lista = lista.filter(p =>
      p.nombre.toLowerCase().includes(t) ||
      p.descripcion.toLowerCase().includes(t) ||
      nombreCategoria(p.categoria).toLowerCase().includes(t)
    );
  }
  if (estadoFiltros.categoria === "ofertas") {
    lista = lista.filter(estaEnOferta);
  } else if (estadoFiltros.categoria !== "todas") {
    lista = lista.filter(p => p.categoria === estadoFiltros.categoria);
  }
  if (estadoFiltros.soloOfertas) lista = lista.filter(estaEnOferta);

  if (estadoFiltros.orden === "precio-asc") lista.sort((a, b) => a.precio - b.precio);
  if (estadoFiltros.orden === "precio-desc") lista.sort((a, b) => b.precio - a.precio);
  if (estadoFiltros.orden === "nombre") lista.sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));

  return lista;
}

function plantillaEtiquetas(p) {
  const textos = { nuevo: "Nuevo", oferta: "Oferta", vendido: "Más vendido" };
  return p.etiquetas.map(e => `<span class="etiqueta ${e}">${textos[e] || e}</span>`).join("");
}

function tarjetaProducto(p) {
  const agotado = p.stock <= 0;
  return `
  <article class="tarjeta-producto" data-id="${p.id}">
    <div class="marco-img">
      <img src="${p.imagen}" alt="${p.nombre} — producto de ejemplo" loading="lazy"
           onerror="this.onerror=null;this.src='${IMG_ALTERNATIVA}'">
      <div class="etiquetas">${plantillaEtiquetas(p)}</div>
    </div>
    <div class="cuerpo-producto">
      <span class="cat-producto">${nombreCategoria(p.categoria)}</span>
      <h3>${p.nombre}</h3>
      <p class="desc-producto">${p.descripcion}</p>
      <div class="precios">
        <span class="precio">${formatearCOP(p.precio)}</span>
        ${p.precioAnterior ? `<span class="precio-antes">${formatearCOP(p.precioAnterior)}</span>` : ""}
      </div>
      ${p.precioMayorista ? `<span class="precio-mayor">Mayorista: ${formatearCOP(p.precioMayorista)} (desde ${CONFIG.minimoMayorista} uds.)</span>` : ""}
      <span class="disponibilidad ${agotado ? "agotado" : "disponible"}">
        ${agotado ? "● Agotado (demostración)" : `● Disponible — ${p.stock} uds. (demo)`}
      </span>
      <div class="acciones-producto">
        <div class="selector-cantidad">
          <button type="button" class="menos" aria-label="Disminuir cantidad de ${p.nombre}">−</button>
          <input type="number" class="cantidad" value="1" min="1" max="99" aria-label="Cantidad de ${p.nombre}" ${agotado ? "disabled" : ""}>
          <button type="button" class="mas" aria-label="Aumentar cantidad de ${p.nombre}">+</button>
        </div>
        <button class="btn btn-primario btn-pequeno agregar" ${agotado ? "disabled" : ""}>
          ${agotado ? "No disponible" : "Agregar al carrito"}
        </button>
      </div>
    </div>
  </article>`;
}

function renderCatalogo() {
  const cont = $("#grid-productos");
  const lista = productosFiltrados();
  $("#conteo-resultados").textContent =
    `${lista.length} producto${lista.length === 1 ? "" : "s"} encontrado${lista.length === 1 ? "" : "s"}`;

  if (!lista.length) {
    cont.innerHTML = `<div class="sin-resultados">
      <span aria-hidden="true">🔍</span>
      <h3>No encontramos productos</h3>
      <p>Intenta con otra palabra o cambia los filtros seleccionados.</p>
      <button class="btn btn-secundario" id="reiniciar-filtros" type="button">Ver todos los productos</button>
    </div>`;
    const btn = $("#reiniciar-filtros");
    if (btn) btn.addEventListener("click", reiniciarFiltros);
    return;
  }
  cont.innerHTML = lista.map(tarjetaProducto).join("");
}

function reiniciarFiltros() {
  estadoFiltros.texto = "";
  estadoFiltros.categoria = "todas";
  estadoFiltros.orden = "destacados";
  estadoFiltros.soloOfertas = false;
  $("#busqueda-catalogo").value = "";
  $("#busqueda-header").value = "";
  $("#filtro-categoria").value = "todas";
  $("#filtro-orden").value = "destacados";
  sincronizarChips();
  marcarCategoriaActiva();
  renderCatalogo();
}

function sincronizarChips() {
  $$(".chip[data-filtro]").forEach(ch => {
    const f = ch.dataset.filtro;
    const activo = (f === "todos" && estadoFiltros.categoria === "todas" && !estadoFiltros.soloOfertas) ||
                   (f === "ofertas" && estadoFiltros.soloOfertas);
    ch.classList.toggle("activo", activo);
    ch.setAttribute("aria-pressed", activo ? "true" : "false");
  });
}

function marcarCategoriaActiva() {
  $$(".tarjeta-categoria").forEach(t =>
    t.classList.toggle("activo", t.dataset.cat === estadoFiltros.categoria));
}

function renderCategorias() {
  $("#grid-categorias").innerHTML = CATEGORIAS.map(c => `
    <button class="tarjeta-categoria" type="button" data-cat="${c.id}">
      <img src="${c.imagen}" alt="Categoría ${c.nombre}" loading="lazy"
           onerror="this.onerror=null;this.src='${IMG_ALTERNATIVA}'">
      <div class="info"><h3>${c.nombre}</h3><p>${c.texto}</p></div>
    </button>`).join("");

  // Opciones del select de categorías
  const sel = $("#filtro-categoria");
  sel.innerHTML = `<option value="todas">Todas las categorías</option>` +
    CATEGORIAS.map(c => `<option value="${c.id}">${c.nombre}</option>`).join("");

  $$(".tarjeta-categoria").forEach(t => t.addEventListener("click", () => {
    estadoFiltros.categoria = t.dataset.cat;
    estadoFiltros.soloOfertas = t.dataset.cat === "ofertas";
    sel.value = t.dataset.cat;
    sincronizarChips();
    marcarCategoriaActiva();
    renderCatalogo();
    document.getElementById("catalogo").scrollIntoView({ behavior: "smooth" });
  }));
}

/* ============ 5. CARRITO ================================== */
let carrito = cargarCarrito();

function cargarCarrito() {
  try {
    const guardado = JSON.parse(localStorage.getItem(CONFIG.claveAlmacenamiento));
    if (Array.isArray(guardado)) {
      // Se valida que los productos aún existan en el catálogo
      return guardado
        .filter(i => PRODUCTOS.some(p => p.id === i.id))
        .map(i => ({ id: i.id, cantidad: Math.max(1, parseInt(i.cantidad, 10) || 1) }));
    }
  } catch (e) { /* almacenamiento no disponible o dañado */ }
  return [];
}

function guardarCarrito() {
  try {
    localStorage.setItem(CONFIG.claveAlmacenamiento, JSON.stringify(carrito));
  } catch (e) { /* modo privado del navegador */ }
}

function productoPorId(id) { return PRODUCTOS.find(p => p.id === id); }

/** Agrega un producto validando cantidad mínima de 1 */
function agregarAlCarrito(id, cantidad = 1) {
  const producto = productoPorId(id);
  if (!producto) return;
  if (producto.stock <= 0) { notificar("Producto agotado (demostración).", "aviso"); return; }

  cantidad = Math.max(1, parseInt(cantidad, 10) || 1);
  const item = carrito.find(i => i.id === id);
  if (item) item.cantidad = Math.min(99, item.cantidad + cantidad);
  else carrito.push({ id, cantidad: Math.min(99, cantidad) });

  guardarCarrito();
  actualizarCarrito();
  notificar(`${producto.nombre} agregado (${cantidad} ud.)`, "exito");
}

function cambiarCantidad(id, delta) {
  const item = carrito.find(i => i.id === id);
  if (!item) return;
  const nueva = item.cantidad + delta;
  if (nueva < 1) { eliminarDelCarrito(id); return; }   // nunca menos de 1
  item.cantidad = Math.min(99, nueva);
  guardarCarrito();
  actualizarCarrito();
}

function eliminarDelCarrito(id) {
  const p = productoPorId(id);
  carrito = carrito.filter(i => i.id !== id);
  guardarCarrito();
  actualizarCarrito();
  notificar(`${p ? p.nombre : "Producto"} eliminado del carrito.`, "aviso");
}

function vaciarCarrito() {
  if (!carrito.length) { notificar("El carrito ya está vacío.", "aviso"); return; }
  carrito = [];
  guardarCarrito();
  actualizarCarrito();
  notificar("Carrito vaciado.", "aviso");
}

/* ============ 6. DESCUENTOS POR VOLUMEN =================== */
/** Devuelve la regla aplicable según la cantidad */
function reglaPorCantidad(cantidad) {
  return CONFIG.reglasMayoristas.find(r => cantidad >= r.desde && cantidad <= r.hasta) ||
         CONFIG.reglasMayoristas[0];
}

/** Calcula los totales del carrito aplicando descuentos por volumen */
function calcularResumen() {
  const lineas = carrito.map(item => {
    const p = productoPorId(item.id);
    const regla = reglaPorCantidad(item.cantidad);
    const precioBase = p.precio;
    // Si existe precio mayorista y se alcanza el mínimo, se usa como base
    const usaMayorista = p.precioMayorista && item.cantidad >= CONFIG.minimoMayorista;
    const base = usaMayorista ? p.precioMayorista : precioBase;
    const precioFinal = base * (1 - regla.descuento);
    const subtotalSinDescuento = precioBase * item.cantidad;
    const subtotal = precioFinal * item.cantidad;
    return {
      producto: p, cantidad: item.cantidad, regla, usaMayorista,
      precioUnitario: precioBase, precioFinal,
      subtotal, ahorro: subtotalSinDescuento - subtotal
    };
  });

  const articulos = lineas.reduce((s, l) => s + l.cantidad, 0);
  const subtotalBruto = lineas.reduce((s, l) => s + l.precioUnitario * l.cantidad, 0);
  const ahorroTotal = lineas.reduce((s, l) => s + l.ahorro, 0);
  const total = subtotalBruto - ahorroTotal;
  return { lineas, articulos, subtotalBruto, ahorroTotal, total };
}

/* ---- Render del carrito ---- */
function actualizarCarrito() {
  const resumen = calcularResumen();
  $("#contador-carrito").textContent = resumen.articulos;
  const cont = $("#items-carrito");

  if (!carrito.length) {
    cont.innerHTML = `<div class="carrito-vacio">
      <span aria-hidden="true">🛍️</span>
      <h3>Tu carrito está vacío</h3>
      <p>Explora el catálogo y agrega tus productos favoritos.</p>
    </div>`;
  } else {
    cont.innerHTML = resumen.lineas.map(l => `
      <div class="item-carrito" data-id="${l.producto.id}">
        <img src="${l.producto.imagen}" alt="${l.producto.nombre}"
             onerror="this.onerror=null;this.src='${IMG_ALTERNATIVA}'">
        <div>
          <h4>${l.producto.nombre}</h4>
          <span class="precio-unit">${formatearCOP(l.precioFinal)} c/u · ${l.regla.etiqueta}</span>
          <div class="mini-cantidad">
            <button type="button" class="menos-carrito" aria-label="Quitar una unidad">−</button>
            <span>${l.cantidad}</span>
            <button type="button" class="mas-carrito" aria-label="Agregar una unidad">+</button>
          </div>
          <span class="subtotal">Subtotal: ${formatearCOP(l.subtotal)}</span>
        </div>
        <button class="btn-eliminar" type="button" aria-label="Eliminar ${l.producto.nombre}">🗑</button>
      </div>`).join("");
  }

  $("#carrito-articulos").textContent = resumen.articulos;
  $("#carrito-subtotal").textContent = formatearCOP(resumen.subtotalBruto);
  $("#carrito-ahorro").textContent = "− " + formatearCOP(resumen.ahorroTotal);
  $("#carrito-total").textContent = formatearCOP(resumen.total);

  const aviso = $("#aviso-descuento");
  if (resumen.ahorroTotal > 0) {
    aviso.style.display = "block";
    aviso.textContent = `¡Descuento por volumen aplicado! Ahorras ${formatearCOP(resumen.ahorroTotal)}.`;
  } else if (resumen.articulos > 0) {
    aviso.style.display = "block";
    aviso.textContent = `Agrega ${CONFIG.minimoMayorista} unidades del mismo producto y obtén precio mayorista.`;
  } else {
    aviso.style.display = "none";
  }

  renderResumenDetal(resumen);
}

/** Resumen del pedido mostrado en la sección "Compra al detal" */
function renderResumenDetal(resumen) {
  const cont = $("#resumen-detal");
  if (!carrito.length) {
    cont.innerHTML = `<p class="nota">Aún no has agregado productos. Tu resumen aparecerá aquí automáticamente.</p>`;
    return;
  }
  cont.innerHTML = `
    <div class="tabla-envoltorio">
      <table>
        <caption class="sr-only">Resumen del pedido actual</caption>
        <thead><tr><th>Producto</th><th>Cant.</th><th>Precio aplicado</th><th>Subtotal</th></tr></thead>
        <tbody>
          ${resumen.lineas.map(l => `<tr>
            <td>${l.producto.nombre}</td>
            <td>${l.cantidad}</td>
            <td>${formatearCOP(l.precioFinal)}<br><small>${l.regla.etiqueta}</small></td>
            <td>${formatearCOP(l.subtotal)}</td></tr>`).join("")}
        </tbody>
        <tfoot>
          <tr><th colspan="3">Total (${resumen.articulos} artículos)</th><th>${formatearCOP(resumen.total)}</th></tr>
        </tfoot>
      </table>
    </div>`;
}

function abrirCarrito() {
  $("#panel-carrito").classList.add("abierto");
  $("#fondo-oscuro").classList.add("visible");
  $("#panel-carrito").setAttribute("aria-hidden", "false");
}
function cerrarCarrito() {
  $("#panel-carrito").classList.remove("abierto");
  $("#fondo-oscuro").classList.remove("visible");
  $("#panel-carrito").setAttribute("aria-hidden", "true");
}

/* ============ 7. PEDIDO, MODAL Y WHATSAPP ================= */
function abrirModalPedido() {
  if (!carrito.length) { notificar("Agrega productos antes de continuar con el pedido.", "aviso"); return; }
  const r = calcularResumen();
  $("#contenido-pedido").innerHTML = `
    <div class="tabla-envoltorio">
      <table>
        <thead><tr><th>Producto</th><th>Cant.</th><th>Unitario</th><th>Descuento</th><th>Subtotal</th></tr></thead>
        <tbody>
          ${r.lineas.map(l => `<tr>
            <td>${l.producto.nombre}</td>
            <td>${l.cantidad}</td>
            <td>${formatearCOP(l.precioUnitario)}</td>
            <td>${l.ahorro > 0 ? formatearCOP(l.ahorro) + `<br><small>${l.regla.etiqueta}</small>` : "—"}</td>
            <td>${formatearCOP(l.subtotal)}</td></tr>`).join("")}
        </tbody>
      </table>
    </div>
    <div class="linea-total"><span>Subtotal sin descuentos</span><span>${formatearCOP(r.subtotalBruto)}</span></div>
    <div class="linea-total"><span>Descuentos aplicados</span><span>− ${formatearCOP(r.ahorroTotal)}</span></div>
    <div class="linea-total grande"><span>Total final</span><span>${formatearCOP(r.total)}</span></div>
    <p class="nota">Esta versión de demostración <strong>no procesa pagos reales</strong> ni confirma pedidos
    en ningún sistema comercial. El resumen es únicamente informativo.</p>`;
  $("#modal-pedido").classList.add("abierto");
  cerrarCarrito();
}

function cerrarModalPedido() { $("#modal-pedido").classList.remove("abierto"); }

/** Genera el texto del pedido para WhatsApp */
function textoPedido() {
  const r = calcularResumen();
  let txt = `Hola, quiero preparar este pedido en ${CONFIG.nombreTienda} (demostración):\n\n`;
  r.lineas.forEach(l => {
    txt += `• ${l.producto.nombre} x${l.cantidad} — ${formatearCOP(l.precioFinal)} c/u = ${formatearCOP(l.subtotal)} (${l.regla.etiqueta})\n`;
  });
  txt += `\nArtículos: ${r.articulos}`;
  txt += `\nDescuentos: ${formatearCOP(r.ahorroTotal)}`;
  txt += `\nTotal: ${formatearCOP(r.total)}`;
  return txt;
}

function enviarPorWhatsApp() {
  if (!CONFIG.whatsapp) {
    notificar("Debes configurar el número de WhatsApp en js/script.js (CONFIG.whatsapp) antes de usar esta función.", "error");
    return;
  }
  window.open(`https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(textoPedido())}`, "_blank", "noopener");
}

function prepararPedido() {
  const r = calcularResumen();
  $("#contenido-pedido").insertAdjacentHTML("beforeend",
    `<div class="mensaje-form ok" style="display:block">Pedido de ejemplo preparado:
     ${r.articulos} artículos por ${formatearCOP(r.total)}. Guarda o copia este resumen; recuerda que
     es una demostración y no se envía a ninguna empresa real.</div>`);
  notificar("Pedido de ejemplo preparado correctamente.", "exito");
}

/* ============ 8. FORMULARIOS ============================== */
function mostrarError(campo, mensaje) {
  campo.classList.toggle("invalido", Boolean(mensaje));
  const span = campo.querySelector(".error-campo");
  if (span) span.textContent = mensaje || "";
  return !mensaje;
}

const RE_EMAIL = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
const RE_TEL = /^[0-9+\s()-]{7,20}$/;

/** Validación del formulario de cotización mayorista */
function validarCotizacion(e) {
  e.preventDefault();
  const f = e.target;
  let ok = true;
  ok &= mostrarError(f.nombre.closest(".campo"), f.nombre.value.trim().length < 3 ? "Escribe tu nombre completo (mínimo 3 caracteres)." : "");
  ok &= mostrarError(f.correo.closest(".campo"), !RE_EMAIL.test(f.correo.value.trim()) ? "Ingresa un correo electrónico válido." : "");
  ok &= mostrarError(f.negocio.closest(".campo"), f.negocio.value.trim().length < 2 ? "Indica el nombre de tu negocio o emprendimiento." : "");
  const cant = parseInt(f.cantidad.value, 10);
  ok &= mostrarError(f.cantidad.closest(".campo"),
    (!cant || cant < CONFIG.minimoMayorista) ? `La cantidad mínima mayorista es ${CONFIG.minimoMayorista} unidades.` : "");
  ok &= mostrarError(f.detalle.closest(".campo"), f.detalle.value.trim().length < 10 ? "Cuéntanos qué productos te interesan (mínimo 10 caracteres)." : "");

  const msg = $("#mensaje-cotizacion");
  if (!ok) { msg.className = "mensaje-form error"; msg.textContent = "Revisa los campos marcados en rojo."; return; }

  const regla = reglaPorCantidad(cant);
  msg.className = "mensaje-form ok";
  msg.textContent = `¡Gracias, ${f.nombre.value.trim()}! Solicitud de cotización registrada en esta demostración ` +
    `para ${cant} unidades (${regla.etiqueta}, ${(regla.descuento * 100).toFixed(0)} % de descuento). ` +
    `Este formulario no envía información a ninguna empresa real.`;
  notificar("Solicitud de cotización registrada (demo).", "exito");
  f.reset();
}

/** Validación del formulario de contacto */
function validarContacto(e) {
  e.preventDefault();
  const f = e.target;
  let ok = true;
  ok &= mostrarError(f.nombre.closest(".campo"), f.nombre.value.trim().length < 3 ? "Escribe tu nombre completo." : "");
  ok &= mostrarError(f.correo.closest(".campo"), !RE_EMAIL.test(f.correo.value.trim()) ? "Ingresa un correo electrónico válido." : "");
  const tel = f.telefono.value.trim();
  ok &= mostrarError(f.telefono.closest(".campo"), (tel && !RE_TEL.test(tel)) ? "El teléfono solo admite números y símbolos + ( ) -." : "");
  ok &= mostrarError(f.tipo.closest(".campo"), !f.tipo.value ? "Selecciona el tipo de cliente." : "");
  ok &= mostrarError(f.mensaje.closest(".campo"), f.mensaje.value.trim().length < 10 ? "Tu mensaje debe tener al menos 10 caracteres." : "");

  const msg = $("#mensaje-contacto");
  if (!ok) { msg.className = "mensaje-form error"; msg.textContent = "Faltan datos o hay campos incorrectos."; return; }

  msg.className = "mensaje-form ok";
  msg.textContent = `¡Mensaje validado correctamente, ${f.nombre.value.trim()}! Recuerda: este formulario es una ` +
    `demostración, no guarda ni envía información a ninguna empresa real.`;
  notificar("Formulario enviado (demostración).", "exito");
  f.reset();
}

/* ============ 9. INTERFAZ GENERAL ========================= */
function iniciarEventos() {
  /* --- Búsqueda del encabezado --- */
  $("#form-busqueda").addEventListener("submit", e => {
    e.preventDefault();
    estadoFiltros.texto = $("#busqueda-header").value;
    $("#busqueda-catalogo").value = estadoFiltros.texto;
    renderCatalogo();
    document.getElementById("catalogo").scrollIntoView({ behavior: "smooth" });
  });
  $("#busqueda-header").addEventListener("input", e => {
    estadoFiltros.texto = e.target.value;
    $("#busqueda-catalogo").value = e.target.value;
    renderCatalogo();
  });

  /* --- Filtros del catálogo --- */
  $("#busqueda-catalogo").addEventListener("input", e => {
    estadoFiltros.texto = e.target.value;
    $("#busqueda-header").value = e.target.value;
    renderCatalogo();
  });
  $("#filtro-categoria").addEventListener("change", e => {
    estadoFiltros.categoria = e.target.value;
    estadoFiltros.soloOfertas = e.target.value === "ofertas";
    sincronizarChips(); marcarCategoriaActiva(); renderCatalogo();
  });
  $("#filtro-orden").addEventListener("change", e => {
    estadoFiltros.orden = e.target.value; renderCatalogo();
  });
  $$(".chip[data-filtro]").forEach(ch => ch.addEventListener("click", () => {
    if (ch.dataset.filtro === "todos") reiniciarFiltros();
    else {
      estadoFiltros.soloOfertas = !estadoFiltros.soloOfertas;
      sincronizarChips(); renderCatalogo();
    }
  }));

  /* --- Delegación de eventos en el catálogo --- */
  $("#grid-productos").addEventListener("click", e => {
    const tarjeta = e.target.closest(".tarjeta-producto");
    if (!tarjeta) return;
    const id = parseInt(tarjeta.dataset.id, 10);
    const input = tarjeta.querySelector(".cantidad");

    if (e.target.classList.contains("mas"))
      input.value = Math.min(99, (parseInt(input.value, 10) || 1) + 1);
    if (e.target.classList.contains("menos"))
      input.value = Math.max(1, (parseInt(input.value, 10) || 1) - 1); // nunca menor que 1
    if (e.target.classList.contains("agregar")) {
      agregarAlCarrito(id, input.value);
      input.value = 1;
    }
  });
  $("#grid-productos").addEventListener("change", e => {
    if (e.target.classList.contains("cantidad")) {
      let v = parseInt(e.target.value, 10);
      if (isNaN(v) || v < 1) v = 1;
      e.target.value = Math.min(99, v);
    }
  });

  /* --- Carrito --- */
  $("#btn-carrito").addEventListener("click", abrirCarrito);
  $("#cerrar-carrito").addEventListener("click", cerrarCarrito);
  $("#fondo-oscuro").addEventListener("click", cerrarCarrito);
  $("#btn-vaciar").addEventListener("click", vaciarCarrito);
  $("#btn-pedido").addEventListener("click", abrirModalPedido);
  $("#btn-pedido-detal").addEventListener("click", abrirModalPedido);

  $("#items-carrito").addEventListener("click", e => {
    const item = e.target.closest(".item-carrito");
    if (!item) return;
    const id = parseInt(item.dataset.id, 10);
    if (e.target.classList.contains("mas-carrito")) cambiarCantidad(id, 1);
    if (e.target.classList.contains("menos-carrito")) cambiarCantidad(id, -1);
    if (e.target.classList.contains("btn-eliminar")) eliminarDelCarrito(id);
  });

  /* --- Modal de pedido --- */
  $("#cerrar-modal").addEventListener("click", cerrarModalPedido);
  $("#modal-pedido").addEventListener("click", e => {
    if (e.target.id === "modal-pedido") cerrarModalPedido();
  });
  $("#btn-preparar").addEventListener("click", prepararPedido);
  $("#btn-whatsapp").addEventListener("click", enviarPorWhatsApp);
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") { cerrarCarrito(); cerrarModalPedido(); }
  });

  /* --- Formularios --- */
  $("#form-cotizacion").addEventListener("submit", validarCotizacion);
  $("#form-contacto").addEventListener("submit", validarContacto);

  /* --- Calculadora mayorista --- */
  $("#calc-cantidad").addEventListener("input", calcularSimulador);
  $("#calc-producto").addEventListener("change", calcularSimulador);

  /* --- Menú móvil --- */
  $("#btn-menu").addEventListener("click", () => {
    const nav = $("#navegacion");
    const abierto = nav.classList.toggle("abierta");
    $("#btn-menu").setAttribute("aria-expanded", abierto ? "true" : "false");
  });
  $$("#navegacion a").forEach(a => a.addEventListener("click", () => {
    $("#navegacion").classList.remove("abierta");
  }));

  /* --- Botón volver arriba + enlace activo --- */
  const btnSubir = $("#btn-subir");
  window.addEventListener("scroll", () => {
    btnSubir.classList.toggle("visible", window.scrollY > 500);
    resaltarEnlaceActivo();
  });
  btnSubir.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

function resaltarEnlaceActivo() {
  const secciones = ["inicio", "categorias", "catalogo", "detal", "mayorista", "contacto"];
  let actual = "inicio";
  secciones.forEach(id => {
    const el = document.getElementById(id);
    if (el && window.scrollY >= el.offsetTop - 160) actual = id;
  });
  $$("#navegacion a").forEach(a =>
    a.classList.toggle("activo", a.getAttribute("href") === "#" + actual));
}

/* --- Tabla comparativa detal vs mayorista --- */
function renderTablaPrecios() {
  const seleccion = PRODUCTOS.filter(p => p.precioMayorista).slice(0, 8);
  $("#tabla-precios").innerHTML = seleccion.map(p => {
    const ahorro = p.precio - p.precioMayorista;
    const pct = Math.round((ahorro / p.precio) * 100);
    return `<tr>
      <td>${p.nombre}</td>
      <td>${nombreCategoria(p.categoria)}</td>
      <td>${formatearCOP(p.precio)}</td>
      <td>${formatearCOP(p.precioMayorista)}</td>
      <td>${formatearCOP(ahorro)} (${pct} %)</td></tr>`;
  }).join("");
}

/* --- Simulador de ahorro mayorista --- */
function renderSimulador() {
  $("#calc-producto").innerHTML = PRODUCTOS
    .filter(p => p.precioMayorista)
    .map(p => `<option value="${p.id}">${p.nombre}</option>`).join("");
  $("#calc-cantidad").value = CONFIG.minimoMayorista;
  calcularSimulador();
}

function calcularSimulador() {
  const p = productoPorId(parseInt($("#calc-producto").value, 10));
  let cant = parseInt($("#calc-cantidad").value, 10);
  if (isNaN(cant) || cant < 1) cant = 1;
  if (!p) return;
  const regla = reglaPorCantidad(cant);
  const base = (p.precioMayorista && cant >= CONFIG.minimoMayorista) ? p.precioMayorista : p.precio;
  const unitario = base * (1 - regla.descuento);
  const total = unitario * cant;
  const sinDescuento = p.precio * cant;
  $("#calc-resultado").innerHTML = `
    <div class="linea-total"><span>Condición aplicada</span><strong>${regla.etiqueta}</strong></div>
    <div class="linea-total"><span>Precio unitario final</span><strong>${formatearCOP(unitario)}</strong></div>
    <div class="linea-total"><span>Precio sin descuento</span><span>${formatearCOP(sinDescuento)}</span></div>
    <div class="linea-total"><span>Ahorro estimado</span><span>${formatearCOP(sinDescuento - total)}</span></div>
    <div class="linea-total grande"><span>Total ${cant} uds.</span><span>${formatearCOP(total)}</span></div>`;
}

/* --- Reglas de descuento dibujadas dinámicamente --- */
function renderReglas() {
  $("#cajas-descuento").innerHTML = CONFIG.reglasMayoristas.map(r => `
    <div class="caja-descuento">
      <strong>${(r.descuento * 100).toFixed(0)} %</strong>
      <p>${r.hasta === Infinity ? `Desde ${r.desde} unidades` : `De ${r.desde} a ${r.hasta} unidades`}</p>
      <small>${r.etiqueta}</small>
    </div>`).join("");
  $$(".min-mayorista").forEach(el => el.textContent = CONFIG.minimoMayorista);
  $("#calc-cantidad").min = 1;
  $("#cot-cantidad").min = CONFIG.minimoMayorista;
  $("#cot-cantidad").value = CONFIG.minimoMayorista;
}

/* --- Rotador de mensajes de la barra superior --- */
function iniciarBarraSuperior() {
  const mensajes = $$(".barra-superior .mensaje");
  let i = 0;
  setInterval(() => {
    mensajes[i].classList.remove("activo");
    i = (i + 1) % mensajes.length;
    mensajes[i].classList.add("activo");
  }, 4000);
}

/* ============ ARRANQUE ==================================== */
document.addEventListener("DOMContentLoaded", () => {
  renderCategorias();
  renderCatalogo();
  renderTablaPrecios();
  renderReglas();
  renderSimulador();
  iniciarEventos();
  sincronizarChips();
  actualizarCarrito();
  iniciarBarraSuperior();
  $("#anio").textContent = new Date().getFullYear();
  $$(".nombre-tienda").forEach(el => el.textContent = CONFIG.nombreTienda);
});
