// cart.js — shared cart drawer + checkout flow

const CART_API_BASE = 'https://shopping-site-production.up.railway.app';

let appliedCoupon = null;

function mountCartDrawer() {
  const mount = document.getElementById('cartDrawerMount');

  if (!mount) return;

  mount.innerHTML = `
    <div id="cartOverlay" class="overlay hidden"></div>

    <aside id="cartDrawer" class="cart-drawer hidden">

      <div class="cart-header">
        <h2>Your Cart</h2>
        <button id="closeCart" class="close-btn" type="button">✕</button>
      </div>

      <div id="cartItems" class="cart-items"></div>

      <div class="cart-footer">
        <div class="cart-total">
          Total: <span id="cartTotal">Rs. 0</span>
        </div>

        <button id="checkoutBtn" class="checkout-btn" type="button">
          Proceed to Checkout
        </button>
      </div>

    </aside>

    <div id="checkoutOverlay" class="overlay hidden"></div>

    <div id="checkoutModal" class="modal hidden">

      <h2>Checkout</h2>

      <form id="checkoutForm">

        <label>
          Full Name
          <input type="text" id="custName" required />
        </label>

        <label>
          Email
          <input type="email" id="custEmail" required />
        </label>

        <label>
          City
          <input
            type="text"
            id="custCity"
            required
            placeholder="e.g. Lahore"
          />
        </label>

        <label>
          Delivery Address
          <textarea id="custAddress" required></textarea>
        </label>

        <label>
          Coupon code (optional)
        </label>

        <div class="coupon-apply-row">

          <input
            type="text"
            id="couponInput"
            placeholder="e.g. SALE11"
          />

          <button type="button" id="applyCouponBtn">
            Apply
          </button>

        </div>

        <div id="couponFeedback"></div>

        <label>
          Payment method
        </label>

        <div class="payment-methods" id="paymentMethods">

          <label class="payment-option selected">
            <input
              type="radio"
              name="paymentMethod"
              value="cod"
              checked
            />
            Cash on Delivery
          </label>

          <label class="payment-option">
            <input
              type="radio"
              name="paymentMethod"
              value="easypaisa"
            />
            EasyPaisa
          </label>

          <label class="payment-option">
            <input
              type="radio"
              name="paymentMethod"
              value="jazzcash"
            />
            JazzCash
          </label>

          <label class="payment-option">
            <input
              type="radio"
              name="paymentMethod"
              value="bank"
            />
            Bank Transfer
          </label>

        </div>

        <div
          class="price-breakdown"
          id="priceBreakdown"
        ></div>

        <div class="modal-actions">

          <button
            type="button"
            id="cancelCheckout"
            class="btn-secondary"
          >
            Cancel
          </button>

          <button
            type="submit"
            class="btn-primary"
          >
            Place Order
          </button>

        </div>

      </form>

    </div>

    <div id="confirmOverlay" class="overlay hidden"></div>

    <div id="confirmModal" class="modal hidden">

      <h2>✅ Order Placed!</h2>

      <p id="confirmText"></p>

      <div id="confirmTracking"></div>

      <button
        id="closeConfirm"
        class="btn-primary"
        type="button"
        style="margin-top:14px;"
      >
        Continue Shopping
      </button>

    </div>
  `;

  const cartBtn = document.getElementById('cartBtn');
  const closeCartButton = document.getElementById('closeCart');
  const cartOverlay = document.getElementById('cartOverlay');
  const checkoutButton = document.getElementById('checkoutBtn');
  const cancelCheckoutButton = document.getElementById('cancelCheckout');
  const checkoutOverlay = document.getElementById('checkoutOverlay');
  const checkoutForm = document.getElementById('checkoutForm');
  const applyCouponButton = document.getElementById('applyCouponBtn');
  const closeConfirmButton = document.getElementById('closeConfirm');

  if (cartBtn) {
    cartBtn.addEventListener('click', openCart);
  }

  if (closeCartButton) {
    closeCartButton.addEventListener('click', closeCartFn);
  }

  if (cartOverlay) {
    cartOverlay.addEventListener('click', closeCartFn);
  }

  if (checkoutButton) {
    checkoutButton.addEventListener('click', openCheckout);
  }

  if (cancelCheckoutButton) {
    cancelCheckoutButton.addEventListener('click', closeCheckout);
  }

  if (checkoutOverlay) {
    checkoutOverlay.addEventListener('click', closeCheckout);
  }

  if (checkoutForm) {
    checkoutForm.addEventListener('submit', submitOrder);
  }

  if (applyCouponButton) {
    applyCouponButton.addEventListener('click', applyCoupon);
  }

  if (closeConfirmButton) {
    closeConfirmButton.addEventListener('click', () => {

      const modal = document.getElementById('confirmModal');
      const overlay = document.getElementById('confirmOverlay');

      if (modal) {
        modal.classList.add('hidden');
      }

      if (overlay) {
        overlay.classList.add('hidden');
      }

    });
  }

  document
    .querySelectorAll('#paymentMethods .payment-option')
    .forEach(option => {

      option.addEventListener('click', () => {

        document
          .querySelectorAll('#paymentMethods .payment-option')
          .forEach(item => {
            item.classList.remove('selected');
          });

        option.classList.add('selected');

        const input = option.querySelector('input');

        if (input) {
          input.checked = true;
        }

      });

    });

  renderCartDrawer();
}


function addToCart(product) {

  if (!product) return;

  const cart = getCart();

  const existing = cart.find(
    item => Number(item.product_id) === Number(product.id)
  );

  if (existing) {

    existing.quantity =
      Number(existing.quantity || 0) + 1;

  } else {

    cart.push({
      product_id: Number(product.id),
      name: product.name,
      price: Number(product.price || 0),
      image_url: product.image_url,
      quantity: 1
    });

  }

  saveCart(cart);

  renderCartDrawer();
}


function updateQuantity(productId, delta) {

  let cart = getCart();

  cart = cart
    .map(item => {

      if (Number(item.product_id) === Number(productId)) {

        return {
          ...item,
          quantity:
            Number(item.quantity || 0) + Number(delta)
        };

      }

      return item;

    })
    .filter(item => Number(item.quantity) > 0);

  saveCart(cart);

  renderCartDrawer();
}


function removeFromCart(productId) {

  const cart = getCart().filter(
    item => Number(item.product_id) !== Number(productId)
  );

  saveCart(cart);

  renderCartDrawer();
}


function cartTotal() {

  return getCart().reduce(
    (sum, item) =>
      sum +
      Number(item.price || 0) *
      Number(item.quantity || 0),
    0
  );

}


function renderCartDrawer() {

  const container =
    document.getElementById('cartItems');

  const totalElement =
    document.getElementById('cartTotal');

  if (!container || !totalElement) {
    return;
  }

  const cart = getCart();

  if (cart.length === 0) {

    container.innerHTML = `
      <p class="empty-cart">
        Your cart is empty.
      </p>
    `;

  } else {

    container.innerHTML = cart
      .map(item => {

        const itemPrice =
          Number(item.price || 0);

        const itemQuantity =
          Number(item.quantity || 0);

        return `
          <div class="cart-item">

            <img
              src="${item.image_url}"
              alt="${item.name}"
              onerror="this.style.display='none';"
            />

            <div class="cart-item-info">

              <div class="cart-item-name">
                ${item.name}
              </div>

              <div class="cart-item-price">
                Rs. ${itemPrice.toLocaleString()}
                x ${itemQuantity}
              </div>

              <div class="qty-controls">

                <button
                  type="button"
                  onclick="updateQuantity(${item.product_id}, -1)"
                >
                  −
                </button>

                <span>
                  ${itemQuantity}
                </span>

                <button
                  type="button"
                  onclick="updateQuantity(${item.product_id}, 1)"
                >
                  +
                </button>

                <button
                  type="button"
                  class="remove-item"
                  onclick="removeFromCart(${item.product_id})"
                >
                  Remove
                </button>

              </div>

            </div>

          </div>
        `;

      })
      .join('');

  }

  totalElement.textContent =
    `Rs. ${cartTotal().toLocaleString()}`;
}


function openCart() {

  renderCartDrawer();

  const drawer =
    document.getElementById('cartDrawer');

  const overlay =
    document.getElementById('cartOverlay');

  if (drawer) {
    drawer.classList.remove('hidden');
  }

  if (overlay) {
    overlay.classList.remove('hidden');
  }

}


function closeCartFn() {

  const drawer =
    document.getElementById('cartDrawer');

  const overlay =
    document.getElementById('cartOverlay');

  if (drawer) {
    drawer.classList.add('hidden');
  }

  if (overlay) {
    overlay.classList.add('hidden');
  }

}


function renderPriceBreakdown() {

  const breakdown =
    document.getElementById('priceBreakdown');

  if (!breakdown) return;

  const subtotal = cartTotal();

  const discount =
    appliedCoupon
      ? Math.round(
          subtotal *
          (Number(appliedCoupon.percent) / 100)
        )
      : 0;

  const total =
    subtotal - discount;

  breakdown.innerHTML = `

    <div class="row">

      <span>
        Subtotal
      </span>

      <span>
        Rs. ${subtotal.toLocaleString()}
      </span>

    </div>

    ${
      discount > 0
        ? `
          <div class="row discount">

            <span>
              Discount (${appliedCoupon.code})
            </span>

            <span>
              -Rs. ${discount.toLocaleString()}
            </span>

          </div>
        `
        : ''
    }

    <div class="row grand-total">

      <span>
        Total
      </span>

      <span>
        Rs. ${total.toLocaleString()}
      </span>

    </div>

  `;

}


function openCheckout() {

  if (getCart().length === 0) {
    return;
  }

  appliedCoupon = null;

  const couponInput =
    document.getElementById('couponInput');

  const couponFeedback =
    document.getElementById('couponFeedback');

  if (couponInput) {
    couponInput.value = '';
  }

  if (couponFeedback) {
    couponFeedback.innerHTML = '';
  }

  renderPriceBreakdown();

  const modal =
    document.getElementById('checkoutModal');

  const overlay =
    document.getElementById('checkoutOverlay');

  if (modal) {
    modal.classList.remove('hidden');
  }

  if (overlay) {
    overlay.classList.remove('hidden');
  }

}


function closeCheckout() {

  const modal =
    document.getElementById('checkoutModal');

  const overlay =
    document.getElementById('checkoutOverlay');

  if (modal) {
    modal.classList.add('hidden');
  }

  if (overlay) {
    overlay.classList.add('hidden');
  }

}


async function applyCoupon() {

  const input =
    document.getElementById('couponInput');

  const feedback =
    document.getElementById('couponFeedback');

  if (!input || !feedback) {
    return;
  }

  const code =
    input.value.trim();

  if (!code) {
    return;
  }

  try {

    const res =
      await fetch(
        `${CART_API_BASE}/api/coupons/validate`,
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json'
          },

          body: JSON.stringify({
            code
          })
        }
      );

    const data =
      await res.json();

    if (data.valid) {

      appliedCoupon = {
        code: code.toUpperCase(),
        percent: Number(data.percent || 0)
      };

      feedback.innerHTML = `
        <div class="coupon-feedback valid">
          ✓ ${data.percent}% discount applied!
        </div>
      `;

    } else {

      appliedCoupon = null;

      feedback.innerHTML = `
        <div class="coupon-feedback invalid">
          Invalid or expired code.
        </div>
      `;

    }

    renderPriceBreakdown();

  } catch (error) {

    console.error(
      'Coupon error:',
      error
    );

    feedback.innerHTML = `
      <div class="coupon-feedback invalid">
        Could not check code right now.
      </div>
    `;

  }

}


function trackingTimelineHTML(stages) {

  return `
    <div class="tracking-timeline">

      ${stages
        .map(stage => `
          <div class="tracking-step ${stage.done ? 'done' : ''} ${stage.current ? 'current' : ''}">

            <div class="tracking-dot">
              ${
                stage.done && !stage.current
                  ? '✓'
                  : ''
              }
            </div>

            <div class="tracking-label">
              ${stage.label}
            </div>

          </div>
        `)
        .join('')}

    </div>
  `;

}


async function submitOrder(event) {

  event.preventDefault();

  const nameInput =
    document.getElementById('custName');

  const emailInput =
    document.getElementById('custEmail');

  const cityInput =
    document.getElementById('custCity');

  const addressInput =
    document.getElementById('custAddress');

  const paymentInput =
    document.querySelector(
      '#paymentMethods input[name="paymentMethod"]:checked'
    );

  if (
    !nameInput ||
    !emailInput ||
    !cityInput ||
    !addressInput ||
    !paymentInput
  ) {
    return;
  }

  const customer_name =
    nameInput.value.trim();

  const email =
    emailInput.value.trim();

  const city =
    cityInput.value.trim();

  const address =
    addressInput.value.trim();

  const payment_method =
    paymentInput.value;

  const coupon_code =
    appliedCoupon
      ? appliedCoupon.code
      : '';

  const items =
    getCart().map(item => ({
      product_id: Number(item.product_id),
      quantity: Number(item.quantity)
    }));

  if (items.length === 0) {
    alert('Your cart is empty.');
    return;
  }

  try {

    const res =
      await fetch(
        `${CART_API_BASE}/api/orders`,
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json'
          },

          body: JSON.stringify({
            customer_name,
            email,
            address,
            city,
            payment_method,
            coupon_code,
            items
          })
        }
      );

    const data =
      await res.json();

    if (!res.ok) {

      alert(
        `Order failed: ${data.error || 'Unknown error'}`
      );

      return;
    }

    closeCheckout();

    localStorage.removeItem('cart');

    if (typeof renderCartCount === 'function') {
      renderCartCount();
    }

    closeCartFn();

    const confirmText =
      document.getElementById('confirmText');

    if (confirmText) {

      confirmText.textContent =
        `Order #${data.order_id} placed successfully! Total: Rs. ${Number(data.total || 0).toLocaleString()}. We'll keep you updated as it moves through our warehouse to your door.`;

    }

    const confirmTracking =
      document.getElementById('confirmTracking');

    if (confirmTracking) {

      confirmTracking.innerHTML = `

        ${trackingTimelineHTML([
          {
            key: 'received',
            label: 'Order received',
            done: true,
            current: true
          },
          {
            key: 'warehouse',
            label: 'Warehouse'
          },
          {
            key: 'packed',
            label: 'Packed'
          },
          {
            key: 'out_for_delivery',
            label: 'Out for delivery'
          },
          {
            key: 'delivered',
            label: 'Delivered'
          }
        ])}

        <a
          href="track.html?id=${data.order_id}"
          style="display:block; text-align:center; margin-top:14px; font-size:13.5px; color:var(--link);"
        >
          Track this order →
        </a>

      `;

    }

    const confirmModal =
      document.getElementById('confirmModal');

    const confirmOverlay =
      document.getElementById('confirmOverlay');

    if (confirmModal) {
      confirmModal.classList.remove('hidden');
    }

    if (confirmOverlay) {
      confirmOverlay.classList.remove('hidden');
    }

    renderCartDrawer();

  } catch (error) {

    console.error(
      'Order error:',
      error
    );

    alert(
      'Something went wrong placing your order.'
    );

  }

}
