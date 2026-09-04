```javascript
// product.js — single product detail page

const API_BASE = 'https://shopping-site-production.up.railway.app';

mountLayout('shop');
mountCartDrawer();

const productId = new URLSearchParams(window.location.search).get('id');
let currentProduct = null;
let qty = 1;

async function loadProduct() {
  if (!productId) {
    document.getElementById('productDetail').innerHTML =
      `<p class="loading">No product selected.</p>`;
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/products/${productId}`);

    if (!res.ok) {
      document.getElementById('productDetail').innerHTML =
        `<p class="loading">Product not found.</p>`;
      return;
    }

    currentProduct = await res.json();
    renderProduct();

  } catch (err) {
    document.getElementById('productDetail').innerHTML =
      `<p class="loading">Could not load product. Is the backend server running?</p>`;
  }
}

function renderProduct() {
  const p = currentProduct;
  const hasDiscount = p.discount_percent > 0;

  document.title = `${p.name} — SAHN`;

  document.getElementById('productDetail').innerHTML = `
    <div class="pd-image">
      <img src="${p.image_url}" alt="${p.name}" />
    </div>

    <div class="pd-info">
      <div class="pd-category">${p.category}</div>

      <h1>${p.name}</h1>

      <div class="pd-rating">
        <span class="stars">${starString(p.rating)}</span>
        ${p.rating} out of 5 · ${p.rating_count} ratings
      </div>

      <div class="pd-price-block">
        <div class="pd-price-row">
          <span class="pd-price">
            Rs. ${p.price.toLocaleString()}
          </span>

          ${
            hasDiscount
              ? `
                <span class="pd-original">
                  Rs. ${p.original_price.toLocaleString()}
                </span>

                <span class="pd-discount">
                  ${p.discount_percent}% off
                </span>
              `
              : ''
          }
        </div>

        <div class="pd-inclusive">
          Inclusive of all taxes
        </div>
      </div>

      <div class="pd-row">
        <span class="label">Availability</span>

        <span class="${
          p.stock > 0
            ? 'pd-badge-instock'
            : 'pd-badge-outstock'
        }">
          ${
            p.stock > 0
              ? `In stock (${p.stock} left)`
              : 'Out of stock'
          }
        </span>
      </div>

      <div class="pd-row">
        <span class="label">Delivery</span>

        <span>
          Get it in ${p.delivery_days}
          day${p.delivery_days > 1 ? 's' : ''}
          — free on orders over Rs. 3,000
        </span>
      </div>

      ${
        p.coupon_code
          ? `
            <div class="coupon-box">
              <div>
                Use code
                <span class="code">${p.coupon_code}</span>
                for an extra discount at checkout
              </div>

              <button
                onclick="navigator.clipboard.writeText('${p.coupon_code}'); this.textContent='Copied!'"
              >
                Copy
              </button>
            </div>
          `
          : ''
      }

      <div class="qty-select">
        <span
          class="label"
          style="color:var(--muted); font-size:14px;"
        >
          Quantity
        </span>

        <div class="qty-controls">
          <button id="qtyMinus">−</button>
          <span id="qtyValue">1</span>
          <button id="qtyPlus">+</button>
        </div>
      </div>

      <div class="pd-actions">
        <button
          class="pd-add-cart"
          id="pdAddCart"
          ${p.stock <= 0 ? 'disabled' : ''}
        >
          Add to Cart
        </button>

        <button
          class="pd-buy-now"
          id="pdBuyNow"
          ${p.stock <= 0 ? 'disabled' : ''}
        >
          Buy Now
        </button>
      </div>

      <div class="pd-description">
        <h3>About this product</h3>
        <p>${p.description}</p>
      </div>
    </div>
  `;

  document.getElementById('qtyMinus').addEventListener('click', () => {
    if (qty > 1) {
      qty--;
    }

    document.getElementById('qtyValue').textContent = qty;
  });

  document.getElementById('qtyPlus').addEventListener('click', () => {
    if (qty < p.stock) {
      qty++;
    }

    document.getElementById('qtyValue').textContent = qty;
  });

  document.getElementById('pdAddCart').addEventListener('click', () => {
    for (let i = 0; i < qty; i++) {
      addToCart(p);
    }
  });

  document.getElementById('pdBuyNow').addEventListener('click', () => {
    for (let i = 0; i < qty; i++) {
      addToCart(p);
    }

    openCart();

    setTimeout(openCheckout, 150);
  });
}

loadProduct();
```
