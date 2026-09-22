import { PRODUCTS, getCategories } from './products.mjs';

const catalog = document.querySelector('#catalog');
const filters = document.querySelector('#filters');
const resultMessage = document.querySelector('#result-message');

function formatPrice(price) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(price);
}

function renderProducts(category = 'Todos') {
  const visibleProducts = category === 'Todos'
    ? PRODUCTS
    : PRODUCTS.filter((product) => product.category === category);

  catalog.innerHTML = visibleProducts.map((product) => `
    <article class="product-card">
      <div class="product-icon" aria-hidden="true">${product.icon}</div>
      <p class="product-category">${product.category}</p>
      <h3>${product.name}</h3>
      <p>${product.description}</p>
      <strong>${formatPrice(product.price)}</strong>
    </article>
  `).join('');

  resultMessage.textContent = `${visibleProducts.length} producto(s) visibles.`;
}

function renderFilters() {
  ['Todos', ...getCategories()].forEach((category, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = category;
    button.className = 'filter-button';
    button.setAttribute('aria-pressed', String(index === 0));
    button.addEventListener('click', () => {
      document.querySelectorAll('.filter-button').forEach((item) => item.setAttribute('aria-pressed', 'false'));
      button.setAttribute('aria-pressed', 'true');
      renderProducts(category);
    });
    filters.append(button);
  });
}

renderFilters();
renderProducts();
