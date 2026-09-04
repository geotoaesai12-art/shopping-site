// shop.js — product catalog, search, and category filtering for shop.html

mountLayout('shop');
mountCartDrawer();

let allProducts = [];
let activeCategory = 'All';

const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('category')) activeCategory = urlParams.get('category');
if (urlParams.get('search')) document.addEventListener('DOMContentLoaded', () => {});

async function loadProducts() {
  try {
    const res = await fetch('/api/products');
    allProducts = await res.json();
    renderCategories();

    const searchTerm = urlParams.get('search');
    if (searchTerm) {
      const headerInput = document.getElementById('headerSearchInput');
      if (headerInput) headerInput.value = searchTerm;
    }
    applyFilters();
  } catch (err) {
    document.getElementById('productGrid').innerHTML = `<p class="loading">Could not load products. Is the backend server running?</p>`;
  }
}

async function loadCategories() {
  try {
    const res = await fetch('/api/categories');
    return await res.json();
  } catch { return []; }
}

function productCard(p) {
  const hasDiscount = p.discount_percent > 0;
  return `
    <a href="product.html?id=${p.id}" class="product-card" style="display:block;">
      ${hasDiscount ? `<div class="discount-badge">-${p.discount_percent}%</div>` : ''}
      <img src="${p.image_url}" alt="${p.name}" loading="lazy" />
      <div class="product-info">
        <div class="product-category">${p.category}</div>
        <div class="product-name">${p.name}</div>
        <div class="product-rating"><span class="stars">${starString(p.rating)}</span> (${p.rating_count})</div>
        <div class="price-row">
          <span class="product-price">Rs. ${p.price.toLocaleString()}</span>
          ${hasDiscount ? `<span class="product-price-original">Rs. ${p.original_price.toLocaleString()}</span>` : ''}
        </div>
        <button class="add-to-cart-btn" ${p.stock <= 0 ? 'disabled' : ''} onclick='event.preventDefault(); addToCart(${JSON.stringify(p)})'>
          ${p.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </a>
  `;
}

function renderProducts(products) {
  const grid = document.getElementById('productGrid');
  if (products.length === 0) {
    grid.innerHTML = `<p class="loading">No products found.</p>`;
    return;
  }
  grid.innerHTML = products.map(productCard).join('');
}

async function renderCategories() {
  const categories = ['All', ...await loadCategories()];
  const nav = document.getElementById('categoryNav');
  nav.innerHTML = categories.map(c => `
    <button class="category-chip ${c === activeCategory ? 'active' : ''}" data-category="${c}">${c}</button>
  `).join('');

  nav.querySelectorAll('.category-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      activeCategory = btn.dataset.category;
      applyFilters();
      renderCategories();
    });
  });
}

function applyFilters() {
  const headerInput = document.getElementById('headerSearchInput');
  const search = (headerInput ? headerInput.value : (urlParams.get('search') || '')).toLowerCase();
  let filtered = allProducts;
  if (activeCategory !== 'All') filtered = filtered.filter(p => p.category === activeCategory);
  if (search) filtered = filtered.filter(p => p.name.toLowerCase().includes(search));
  renderProducts(filtered);
}

document.addEventListener('input', (e) => {
  if (e.target.id === 'headerSearchInput') applyFilters();
});

loadProducts();
