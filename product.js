// product.js — single product detail page

document.addEventListener('DOMContentLoaded', () => {

  const API_BASE = 'https://shopping-site-production.up.railway.app';

  mountLayout('shop');
  mountCartDrawer();

  const productId =
    new URLSearchParams(window.location.search).get('id');

  let currentProduct = null;
  let qty = 1;

  async function loadProduct() {

    const detail = document.getElementById('productDetail');

    if (!detail) {
      console.error('productDetail element not found');
      return;
    }

    if (!productId) {
      detail.innerHTML = `
        <p class="loading">No product selected.</p>
      `;
      return;
    }

    detail.innerHTML = `
      <p class="loading">Loading product...</p>
    `;

    try {

      const res = await fetch(
        `${API_BASE}/api/products/${encodeURIComponent(productId)}`
      );

      if (!res.ok) {
        detail.innerHTML = `
          <p class="loading">Product not found.</p>
        `;
        return;
      }

      const product = await res.json();

      if (!product || !product.id) {
        detail.innerHTML = `
          <p class="loading">Product not found.</p>
        `;
        return;
      }

      currentProduct = product;
      qty = 1;

      renderProduct();

    } catch (err) {

      console.error('Product loading error:', err);

      detail.innerHTML = `
        <p class="loading">
          Could not load product. Please refresh the page.
        </p>
      `;
    }
  }

  function renderProduct() {

    const p = currentProduct;

    if (!p) return;

    const detail = document.getElementById('productDetail');

    if (!detail) return;

    const hasDiscount =
      Number(p.discount_percent || 0) > 0;

    const price =
      Number(p.price || 0);

    const originalPrice =
      Number(p.original_price || 0);

    const rating =
      Number(p.rating || 0);

    const ratingCount =
      Number(p.rating_count || 0);

    const stock =
      Number(p.stock || 0);

    const deliveryDays =
      Number(p.delivery_days || 1);

    document.title = `${p.name} — SAHN`;

    detail.innerHTML = `

      <div class="pd-image">

        <img
          src="${p.image_url}"
          alt="${p.name}"
          onerror="this.src='https://picsum.photos/seed/product-${p.id}/700/700';"
        />

      </div>

      <div class="pd-info">

        <div class="pd-category">
          ${p.category || ''}
        </div>

        <h1>
          ${p.name || 'Product'}
        </h1>

        <div class="pd-rating">

          <span class="stars">
            ${starString(rating)}
          </span>

          ${rating.toFixed(1)} out of 5 ·
          ${ratingCount} ratings

        </div>

        <div class="pd-price-block">

          <div class="pd-price-row">

            <span class="pd-price">
              Rs. ${price.toLocaleString()}
            </span>

            ${
              hasDiscount && originalPrice > price
                ? `
                  <span class="pd-original">
                    Rs. ${originalPrice.toLocaleString()}
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

          <span class="label">
            Availability
          </span>

          <span class="${
            stock > 0
              ? 'pd-badge-instock'
              : 'pd-badge-outstock'
          }">

            ${
              stock > 0
                ? `In stock (${stock} left)`
                : 'Out of stock'
            }

          </span>

        </div>

        <div class="pd-row">

          <span class="label">
            Delivery
          </span>

          <span>
            Get it in ${deliveryDays}
            day${deliveryDays > 1 ? 's' : ''}
            — free on orders over Rs. 3,000
          </span>

        </div>

        ${
          p.coupon_code
            ? `
              <div class="coupon-box">

                <div>
                  Use code
                  <span class="code">
                    ${p.coupon_code}
                  </span>
                  for an extra discount at checkout
                </div>

                <button id="copyCoupon">
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

            <button id="qtyMinus">
              −
            </button>

            <span id="qtyValue">
              1
            </span>

            <button id="qtyPlus">
              +
            </button>

          </div>

        </div>

        <div class="pd-actions">

          <button
            class="pd-add-cart"
            id="pdAddCart"
            ${stock <= 0 ? 'disabled' : ''}
          >
            ${stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>

          <button
            class="pd-buy-now"
            id="pdBuyNow"
            ${stock <= 0 ? 'disabled' : ''}
          >
            ${stock <= 0 ? 'Out of Stock' : 'Buy Now'}
          </button>

        </div>

        <div class="pd-description">

          <h3>
            About this product
          </h3>

          <p>
            ${p.description || 'No description available.'}
          </p>

        </div>

      </div>
    `;

    // Quantity minus
    const minusButton =
      document.getElementById('qtyMinus');

    if (minusButton) {

      minusButton.addEventListener('click', () => {

        if (qty > 1) {
          qty--;
        }

        const value =
          document.getElementById('qtyValue');

        if (value) {
          value.textContent = qty;
        }

      });

    }

    // Quantity plus
    const plusButton =
      document.getElementById('qtyPlus');

    if (plusButton) {

      plusButton.addEventListener('click', () => {

        if (qty < stock) {
          qty++;
        }

        const value =
          document.getElementById('qtyValue');

        if (value) {
          value.textContent = qty;
        }

      });

    }

    // Add to cart
    const addButton =
      document.getElementById('pdAddCart');

    if (addButton) {

      addButton.addEventListener('click', () => {

        if (typeof addToCart !== 'function') {
          console.error('addToCart function not found');
          return;
        }

        for (let i = 0; i < qty; i++) {
          addToCart(p);
        }

      });

    }

    // Buy now
    const buyButton =
      document.getElementById('pdBuyNow');

    if (buyButton) {

      buyButton.addEventListener('click', () => {

        if (typeof addToCart !== 'function') {
          console.error('addToCart function not found');
          return;
        }

        for (let i = 0; i < qty; i++) {
          addToCart(p);
        }

        if (typeof openCart === 'function') {
          openCart();
        }

        setTimeout(() => {

          if (typeof openCheckout === 'function') {
            openCheckout();
          }

        }, 200);

      });

    }

    // Coupon copy
    const copyCoupon =
      document.getElementById('copyCoupon');

    if (copyCoupon && p.coupon_code) {

      copyCoupon.addEventListener('click', async () => {

        try {

          await navigator.clipboard.writeText(
            p.coupon_code
          );

          copyCoupon.textContent = 'Copied!';

          setTimeout(() => {
            copyCoupon.textContent = 'Copy';
          }, 1500);

        } catch (err) {

          console.error(
            'Could not copy coupon:',
            err
          );

        }

      });

    }

  }

  loadProduct();

});
