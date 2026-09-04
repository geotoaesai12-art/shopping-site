// shop.js — product catalog, search, and category filtering

document.addEventListener('DOMContentLoaded', () => {
  mountLayout('shop');
  mountCartDrawer();

  let allProducts = [];
  let activeCategory = 'All';

  const API_BASE = 'https://shopping-site-production.up.railway.app';

  const urlParams = new URLSearchParams(window.location.search);

  if (urlParams.get('category')) {
    activeCategory = urlParams.get('category');
  }

  async function loadProducts() {
    const grid = document.getElementById('productGrid');

    if (!grid) {
      console.error('productGrid not found');
      return;
    }

    grid.innerHTML = '<p class="loading">Loading products...</p>';

    try {
      const res = await fetch(`${API_BASE}/api/products`);

      if (!res.ok) {
        throw new Error(`Products API error: ${res.status}`);
      }

      const data = await res.json();

      if (!Array.isArray(data)) {
        throw new Error('Invalid products response');
      }

      allProducts = data;

      await renderCategories();

      const searchTerm = urlParams.get('search');

      if (searchTerm) {
        const headerInput = document.getElementById('headerSearchInput');

        if (headerInput) {
          headerInput.value = searchTerm;
        }
      }

      applyFilters();

    } catch (err) {
      console.error('Could not load products:', err);

      grid.innerHTML = `
        <p class="loading">
          Could not load products. Please refresh the page.
        </p>
      `;
    }
  }

  async function loadCategories() {
    try {
      const res = await fetch(`${API_BASE}/api/categories`);

      if (!res.ok) {
        throw new Error(`Categories API error: ${res.status}`);
      }

      const data = await res.json();

      return Array.isArray(data) ? data : [];

    } catch (err) {
      console.error('Could not load categories:', err);

      // Fallback categories
      return ['Electronics', 'Fashion', 'Home', 'Books'];
    }
  }

  function productCard(p) {
    const hasDiscount = Number(p.discount_percent) > 0;

    const price = Number(p.price || 0);
    const originalPrice = Number(p.original_price || 0);
    const rating = Number(p.rating || 0);
    const ratingCount = Number(p.rating_count || 0);
    const stock = Number(p.stock || 0);

    return `
      <div class="product-card">

        ${hasDiscount
          ? `<div class="discount-badge">-${p.discount_percent}%</div>`
          : ''
        }

        <a href="product.html?id=${encodeURIComponent(p.id)}" class="product-card-link">

          <img
            src="${p.image_url}"
            alt="${p.name}"
            loading="lazy"
            onerror="this.src='https://picsum.photos/seed/product-${p.id}/500/500';"
          />

          <div class="product-info">

            <div class="product-category">
              ${p.category}
            </div>

            <div class="product-name">
              ${p.name}
            </div>

            <div class="product-rating">
              <span class="stars">${starString(rating)}</span>
              (${ratingCount})
            </div>

            <div class="price-row">

              <span class="product-price">
                Rs. ${price.toLocaleString()}
              </span>

              ${hasDiscount && originalPrice > price
                ? `
                  <span class="product-price-original">
                    Rs. ${originalPrice.toLocaleString()}
                  </span>
                `
                : ''
              }

            </div>

          </div>

        </a>

        <button
          class="add-to-cart-btn"
          ${stock <= 0 ? 'disabled' : ''}
          data-product-id="${p.id}"
        >
          ${stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>

      </div>
    `;
  }

  function renderProducts(products) {
    const grid = document.getElementById('productGrid');

    if (!grid) return;

    if (!products || products.length === 0) {
      grid.innerHTML = `
        <p class="loading">
          No products found.
        </p>
      `;
      return;
    }

    grid.innerHTML = products.map(productCard).join('');

    // Add-to-cart buttons
    grid.querySelectorAll('.add-to-cart-btn').forEach(button => {

      button.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();

        const productId = Number(button.dataset.productId);

        const product = allProducts.find(
          p => Number(p.id) === productId
        );

        if (!product) {
          console.error('Product not found:', productId);
          return;
        }

        if (typeof addToCart === 'function') {
          addToCart(product);
        } else {
          console.error('addToCart function not found');
        }
      });

    });
  }

  async function renderCategories() {
    const nav = document.getElementById('categoryNav');

    if (!nav) return;

    const loadedCategories = await loadCategories();

    const categories = [
      'All',
      ...loadedCategories.filter(
        c => c && c !== 'All'
      )
    ];

    nav.innerHTML = categories.map(category => `
      <button
        class="category-chip ${category === activeCategory ? 'active' : ''}"
        data-category="${category}"
      >
        ${category}
      </button>
    `).join('');

    nav.querySelectorAll('.category-chip').forEach(button => {

      button.addEventListener('click', () => {

        activeCategory = button.dataset.category;

        applyFilters();

        renderCategories();

        // Update URL without reloading
        const newUrl = new URL(window.location.href);

        if (activeCategory === 'All') {
          newUrl.searchParams.delete('category');
        } else {
          newUrl.searchParams.set('category', activeCategory);
        }

        window.history.replaceState(
          {},
          '',
          newUrl.toString()
        );

      });

    });
  }

  function applyFilters() {
    const headerInput =
      document.getElementById('headerSearchInput');

    const search = (
      headerInput
        ? headerInput.value
        : (urlParams.get('search') || '')
    )
      .trim()
      .toLowerCase();

    let filtered = [...allProducts];

    // Category filter
    if (activeCategory !== 'All') {
      filtered = filtered.filter(product =>
        String(product.category).toLowerCase() ===
        String(activeCategory).toLowerCase()
      );
    }

    // Search filter
    if (search) {
      filtered = filtered.filter(product => {

        const name = String(product.name || '').toLowerCase();
        const category = String(product.category || '').toLowerCase();

        return (
          name.includes(search) ||
          category.includes(search)
        );

      });
    }

    renderProducts(filtered);
  }

  // Search input
  document.addEventListener('input', event => {

    if (event.target.id === 'headerSearchInput') {
      applyFilters();
    }

  });

  // Load everything
  loadProducts();
});
