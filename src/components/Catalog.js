/**
 * Renders the catalog
 * @param container
 * @param products
 * @param onProductSelect
 */
export function renderCatalog(container, products, onProductSelect) {
    container.innerHTML = `
    <div class="catalog-header">
      <h2>Product Catalog</h2>
    </div>
    <div class="product-list">
      ${products.map(product => `
        <div class="product-item" data-id="${product.id}">
          <img src="${product.thumbnail}" alt="${product.title}" class="product-thumb">
          <div class="product-info">
            <h3>${product.title}</h3>
            <p class="price">$${product.price}</p>
          </div>
        </div>
      `).join('')}
    </div>
  `;

    container.querySelectorAll('.product-item').forEach(item => {
        item.addEventListener('click', () => {
            const id = item.dataset.id;
            const product = products.find(p => p.id === id);
            onProductSelect(product);
        });
    });
}
