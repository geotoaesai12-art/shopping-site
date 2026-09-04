```javascript
// cart.js — shared cart drawer + checkout flow (coupon, payment method, city), used on every page.
// Depends on getCart()/saveCart()/renderCartCount() from partials.js.

const API_BASE = 'https://shopping-site-production.up.railway.app';

let appliedCoupon = null; // { code, percent }

function mountCartDrawer() {
  const mount = document.getElementById('cartDrawerMount');
  if (!mount) return;

  mount.innerHTML = `
    <div id="cartOverlay" class="overlay hidden"></div>
    <aside id="cartDrawer" class="cart-drawer hidden">
      <div class="cart-header">
        <h2>Your Cart</h2>
        <button id="closeCart" class="close-btn">✕</button>
      </div>
      <div id="cartItems" class="cart-items"></div>
      <div class="cart-footer">
        <div class="cart-total">Total: <span id="cartTotal">Rs. 0</span></div>
        <button id="checkoutBtn" class="checkout-btn">Proceed to Checkout</button>
      </div>
    </aside>

    <div id="checkoutOverlay" class="overlay hidden"></div>
    <div id="checkoutModal" class="modal hidden">
      <h2>Checkout</h2>
      <form id="checkoutForm">
        <label>Full Name<input type="text" id="custName" required /></label>
        <label>Email<input type="email" id="custEmail" required /></label>
        <label>City<input type="text" id="custCity" required placeholder="e.g. Lahore" /></label>
        <label>Delivery Address<textarea id="custAddress" required></textarea></label>

        <label>Coupon code (optional)</label>
        <div class="coupon-apply-row">
          <input type="text" id="couponInput" placeholder="e.g. SALE11" />
          <button type="button" id="applyCouponBtn">Apply</button>
        </div>
        <div id="couponFeedback"></div>

        <label>Payment method</label>
        <div class="payment-methods" id="paymentMethods">
          <label class="payment-option selected"><input type="radio" name="paymentMethod" value="cod" checked /> Cash on Delivery</label>
          <label class="payment-option"><input type="radio" name="paymentMethod" value="easypaisa" /> EasyPaisa</label>
          <label class="payment-option"><input type="radio" name="paymentMethod" value="jazzcash" /> JazzCash</label>
          <label class="payment-option"><input type="radio" name="paymentMethod" value="bank" /> Bank Transfer</label>
        </div>

        <div class="price-breakdown" id="priceBreakdown"></div>
        <div class="modal-actions">
          <button type="button" id="cancelCheckout" class="btn-secondary">Cancel</button>
          <button type="submit" class="btn-primary">Place Order</button>
        </div>
      </form>
    </div>

    <div id="confirmOverlay" class="overlay hidden"></div>
    <div id="confirmModal" class="modal hidden">
      <h2>✅ Order Placed!</h2>
      <p id="confirmText"></p>
      <div id="confirmTracking"></div>
      <button id="closeConfirm" class="btn-primary" style="margin-top:14px;">Continue Shopping</button>
    </div>
  `;

  document.getElementById('cartBtn')?.addEventListener('click', openCart);
  document.getElementById('closeCart').addEventListener('click', closeCartFn);
  document.getElementById('cartOverlay').addEventListener('click', closeCartFn);
  document.getElementById('checkoutBtn').addEventListener('click', openCheckout);
  document.getElementById('cancelCheckout').addEventListener('click', closeCheckout);
  document.getElementById('checkoutOverlay').addEventListener('click', closeCheckout);
  document.getElementById('checkoutForm').addEventListener('submit', submitOrder);
  document.getElementById('applyCouponBtn').addEventListener('click', applyCoupon);

  document.getElementById('closeConfirm').addEventListener('click', () => {
    document.getElementById('confirmModal').classList.add('hidden');
    document.getElementById('confirmOverlay').classList.add('hidden');
  });

  document.querySelectorAll('#paymentMethods .payment-option').forEach(opt => {
    opt.addEventListener('click', () => {
      document.querySelectorAll('#paymentMethods .payment-option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      opt.querySelector('input').checked = true;
    });
  });
}

function addToCart(product) {
  const cart = getCart();
  const existing = cart.find(i => i.product_id === product.id);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      product_id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      quantity: 1
    });
  }

  saveCart(cart);
}

function updateQuantity(productId, delta) {
  let cart = getCart();

  cart = cart
    .map(i =>
      i.product_id === productId
        ? { ...i, quantity: i.quantity + delta }
        : i
    )
    .filter(i => i.quantity > 0);

  saveCart(cart);
  renderCartDrawer();
}

function removeFromCart(productId) {
  const cart = getCart().filter(i => i.product_id !== productId);
  saveCart(cart);
  renderCartDrawer();
}

function cartTotal() {
  return getCart().reduce(
    (sum, i) => sum + i.price * i.quantity,
    0
  );
}

function renderCartDrawer() {
  const cart = getCart();
  const container = document.getElementById('cartItems');

  if (cart.length === 0) {
    container.innerHTML = `<p class="empty-cart">Your cart is empty.</p>`;
  } else {
    container.innerHTML = cart
      .map(
        item => `
      <div class="cart-item">
        <img src="${item.image_url}" alt="${item.name}" />
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">Rs. ${item.price.toLocaleString()} x ${item.quantity}</div>
          <div class="qty-controls">
            <button onclick="updateQuantity(${item.product_id}, -1)">−</button>
            <span>${item.quantity}</span>
            <button onclick="updateQuantity(${item.product_id}, 1)">+</button>
            <button class="remove-item" onclick="removeFromCart(${item.product_id})">Remove</button>
          </div>
        </div>
      </div>
    `
      )
      .join('');
  }

  document.getElementById('cartTotal').textContent =
    `Rs. ${cartTotal().toLocaleString()}`;
}

function openCart() {
  renderCartDrawer();
  document.getElementById('cartDrawer').classList.remove('hidden');
  document.getElementById('cartOverlay').classList.remove('hidden');
}

function closeCartFn() {
  document.getElementById('cartDrawer').classList.add('hidden');
  document.getElementById('cartOverlay').classList.add('hidden');
}

function renderPriceBreakdown() {
  const subtotal = cartTotal();
  const discount = appliedCoupon
    ? Math.round(subtotal * (appliedCoupon.percent / 100))
    : 0;

  const total = subtotal - discount;

  document.getElementById('priceBreakdown').innerHTML = `
    <div class="row">
      <span>Subtotal</span>
      <span>Rs. ${subtotal.toLocaleString()}</span>
    </div>

    ${
      discount > 0
        ? `<div class="row discount">
            <span>Discount (${appliedCoupon.code})</span>
            <span>-Rs. ${discount.toLocaleString()}</span>
          </div>`
        : ''
    }

    <div class="row grand-total">
      <span>Total</span>
      <span>Rs. ${total.toLocaleString()}</span>
    </div>
  `;
}

function openCheckout() {
  if (getCart().length === 0) return;

  appliedCoupon = null;

  document.getElementById('couponInput').value = '';
  document.getElementById('couponFeedback').innerHTML = '';

  renderPriceBreakdown();

  document.getElementById('checkoutModal').classList.remove('hidden');
  document.getElementById('checkoutOverlay').classList.remove('hidden');
}

function closeCheckout() {
  document.getElementById('checkoutModal').classList.add('hidden');
  document.getElementById('checkoutOverlay').classList.add('hidden');
}

async function applyCoupon() {
  const code = document.getElementById('couponInput').value.trim();
  const feedback = document.getElementById('couponFeedback');

  if (!code) return;

  try {
    const res = await fetch(`${API_BASE}/api/coupons/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ code })
    });

    const data = await res.json();

    if (data.valid) {
      appliedCoupon = {
        code: code.toUpperCase(),
        percent: data.percent
      };

      feedback.innerHTML =
        `<div class="coupon-feedback valid">✓ ${data.percent}% discount applied!</div>`;
    } else {
      appliedCoupon = null;

      feedback.innerHTML =
        `<div class="coupon-feedback invalid">Invalid or expired code.</div>`;
    }

    renderPriceBreakdown();
  } catch (err) {
    feedback.innerHTML =
      `<div class="coupon-feedback invalid">Could not check code right now.</div>`;
  }
}

function trackingTimelineHTML(stages) {
  return `
    <div class="tracking-timeline">
      ${stages
        .map(
          s => `
        <div class="tracking-step ${s.done ? 'done' : ''} ${s.current ? 'current' : ''}">
          <div class="tracking-dot">${s.done && !s.current ? '✓' : ''}</div>
          <div class="tracking-label">${s.label}</div>
        </div>
      `
        )
        .join('')}
    </div>
  `;
}

async function submitOrder(e) {
  e.preventDefault();

  const customer_name = document.getElementById('custName').value;
  const email = document.getElementById('custEmail').value;
  const city = document.getElementById('custCity').value;
  const address = document.getElementById('custAddress').value;

  const payment_method =
    document.querySelector(
      '#paymentMethods input[name="paymentMethod"]:checked'
    ).value;

  const coupon_code = appliedCoupon ? appliedCoupon.code : '';

  const items = getCart().map(i => ({
    product_id: i.product_id,
    quantity: i.quantity
  }));

  try {
    const res = await fetch(`${API_BASE}/api/orders`, {
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
    });

    const data = await res.json();

    if (!res.ok) {
      alert(`Order failed: ${data.error}`);
      return;
    }

    closeCheckout();
    localStorage.removeItem('cart');
    renderCartCount();
    closeCartFn();

    document.getElementById('confirmText').textContent =
      `Order #${data.order_id} placed successfully! Total: Rs. ${data.total.toLocaleString()}. We'll keep you updated as it moves through our warehouse to your door.`;

    document.getElementById('confirmTracking').innerHTML = `
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

    document.getElementById('confirmModal').classList.remove('hidden');
    document.getElementById('confirmOverlay').classList.remove('hidden');

    if (typeof loadProducts === 'function') {
      loadProducts();
    }

  } catch (err) {
    alert('Something went wrong placing your order.');
  }
}
```

