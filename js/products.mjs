export const PRODUCTS = [
  { id: 1, name: 'Labial mate', category: 'Maquillaje', price: 28000, icon: '💄', description: 'Color intenso para uso diario.' },
  { id: 2, name: 'Paleta de sombras', category: 'Maquillaje', price: 45000, icon: '🎨', description: 'Seis tonos para looks variados.' },
  { id: 3, name: 'Base líquida', category: 'Maquillaje', price: 38000, icon: '✨', description: 'Cobertura ligera y acabado natural.' },
  { id: 4, name: 'Shampoo nutritivo', category: 'Cuidado capilar', price: 32000, icon: '🫧', description: 'Limpieza suave para cabello cotidiano.' },
  { id: 5, name: 'Mascarilla reparadora', category: 'Cuidado capilar', price: 42000, icon: '🌿', description: 'Hidratación semanal para el cabello.' },
  { id: 6, name: 'Sérum capilar', category: 'Cuidado capilar', price: 36000, icon: '💧', description: 'Brillo y suavidad para las puntas.' }
];

export function getCategories() {
  return [...new Set(PRODUCTS.map((product) => product.category))];
}
