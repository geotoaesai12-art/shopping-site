// partials.js — shared header + footer, injected on every page.

const API_BASE = 'https://shopping-site-production.up.railway.app';

const LOGO_SVG = `<svg class="logo-mark" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M8 12V9a4 4 0 0 1 8 0v3" stroke="#FF7A1A" stroke-width="2" stroke-linecap="round"/>
  <rect x="5" y="12" width="22" height="16" rx="3" fill="#FF7A1A"/>
  <path d="M12 16v2a2 2 0 0 0 4 0v-2" stroke="#131A22" stroke-width="1.6" stroke-linecap="round"/>
</svg>`;

function renderHeader(activePage) {
  const token = localStorage.getItem('token');
  const userName = localStorage.getItem('userName');

  const accountHTML = token
    ? `<a href="#" id="logoutLink" class="account-link"><span class="small-label">Hi, ${userName ? userName.split(' ')[0] : 'there'}</span>Log out</a>`
    : `<a href="login.html" class="account-link"><span class="small-label">Welcome</span>Sign in / Register</a>`;

  return `
  <div class="offer-bar">🔥 <strong>11.11 MEGA SALE</strong> — Up to 50% OFF everything · Use code <strong>SALE11</strong> at checkout · Free delivery on orders over Rs. 3,000</div>
  <header class="site-header">
    <div class="header-bar">
      <a href="index.html" class="logo">
        ${LOGO_SVG}
        <span class="logo-word">SAHN</span>
      </a>
      <form class="header-search" id="headerSearchForm">
        <input type="text" id="headerSearchInput" placeholder="Search products, brands and categories..." />
        <button type="submit">🔍</button>
      </form>
      <div class="header-actions">
        ${accountHTML}
        <button id="cartBtn" class="cart-btn">🛒 Cart <span id="cartCount">0</span></button>
      </div>
    </div>
    <nav class="nav-strip">
      <div class="container">
        <a href="index.html" class="${activePage === 'home' ? 'active' : ''}">Home</a>
        <a href="shop.html" class="${activePage === 'shop' ? 'active' : ''}">All Products</a>
        <a href="shop.html?category=Electronics">Electronics</a>
        <a href="shop.html?category=Fashion">Fashion</a>
        <a href="shop.html?category=Home">Home</a>
        <a href="shop.html?category=Books">Books</a>
        <a href="contact.html" class="${activePage === 'contact' ? 'active' : ''}">Contact</a>
        <a href="track.html" class="${activePage === 'track' ? 'active' : ''}">Track Order</a>
      </div>
    </nav>
  </header>`;
}

function renderFooter() {
  return `
  <footer class="site-footer">
    <div class="footer-main">
      <div class="footer-brand">
        <div class="logo">
          ${LOGO_SVG}
          <span class="logo-word">SAHN</span>
        </div>
        <p>Everyday goods, sourced simply and priced fairly. One store for the things you actually need — delivered fast, across Pakistan.</p>
        <div class="footer-flag">🇵🇰 Proudly serving customers across Pakistan</div>
        <div class="footer-social">
          <a href="https://wa.me/923000000000" target="_blank" rel="noopener" aria-label="WhatsApp">
            <svg viewBox="0 0 24 24" fill="#C7CCD1"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.2-.7.8-.8 1-.2.2-.3.2-.5.1-.2-.1-1-.4-1.9-1.2-.7-.6-1.2-1.4-1.3-1.6-.1-.2 0-.4.1-.5.1-.1.2-.3.4-.4.1-.1.2-.3.2-.4.1-.2 0-.3 0-.4 0-.1-.6-1.4-.8-1.9-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 1.9 0 1.1.8 2.2 1 2.4.1.2 1.6 2.5 4 3.5.6.2 1 .4 1.3.5.6.2 1.1.2 1.5.1.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2-.1-.1-.2-.2-.4-.3z"/></svg>
          </a>
          <a href="https://facebook.com/sahnstore" target="_blank" rel="noopener" aria-label="Facebook">
            <svg viewBox="0 0 24 24" fill="none" stroke="#C7CCD1" stroke-width="2"><path d="M15 8h-2a2 2 0 0 0-2 2v10M9 13h4"/></svg>
          </a>
          <a href="https://x.com/sahnstore" target="_blank" rel="noopener" aria-label="X (Twitter)">
            <svg viewBox="0 0 24 24" fill="#C7CCD1"><path d="M18.9 3H21l-6.7 7.6L22.2 21h-6.4l-5-6.5L4.9 21H2.8l7.2-8.2L1.8 3h6.5l4.5 6 6.1-6zm-1.1 16.1h1.2L7.3 4.8H6l11.8 14.3z"/></svg>
          </a>
        </div>
      </div>

      <div class="footer-col">
        <h4>Shop</h4>
        <a href="shop.html">All products</a>
        <a href="shop.html?category=Electronics">Electronics</a>
        <a href="shop.html?category=Fashion">Fashion</a>
        <a href="shop.html?category=Home">Home</a>
      </div>

      <div class="footer-col">
        <h4>Support</h4>
        <a href="contact.html">Contact us</a>
        <a href="#">Shipping info</a>
        <a href="#">Returns & refunds</a>
      </div>

      <div class="footer-col">
        <h4>Get in touch</h4>
        <p>hello@sahn.pk</p>
        <p>+92 300 0000000</p>
        <p>Mon–Sat, 10am–7pm PKT</p>
      </div>
    </div>

    <div class="footer-bottom">© 2026 SAHN Store. All rights reserved.</div>
  </footer>`;
}

function mountLayout(activePage) {
  document.getElementById('headerMount').innerHTML = renderHeader(activePage);
  document.getElementById('footerMount').innerHTML = renderFooter();

  const logoutLink = document.getElementById('logoutLink');

  if (logoutLink) {
    logoutLink.addEventListener('click', async (e) => {
      e.preventDefault();

      const token = localStorage.getItem('token');

      try {
        await fetch(`${API_BASE}/api/auth/logout`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      } catch {}

      localStorage.removeItem('token');
      localStorage.removeItem('userName');

      window.location.href = 'index.html';
    });
  }

  const searchForm = document.getElementById('headerSearchForm');

  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const q = document.getElementById('headerSearchInput').value.trim();

      if (
        window.location.pathname.includes('shop.html') &&
        typeof applyFilters === 'function'
      ) {
        applyFilters();
      } else {
        window.location.href = q
          ? `shop.html?search=${encodeURIComponent(q)}`
          : 'shop.html';
      }
    });
  }

  renderCartCount();
}

// ---------- Cart helpers (shared across all pages) ----------

function getCart() {
  return JSON.parse(localStorage.getItem('cart') || '[]');
}

function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
  renderCartCount();
}

function renderCartCount() {
  const el = document.getElementById('cartCount');

  if (!el) return;

  el.textContent = getCart().reduce(
    (sum, i) => sum + i.quantity,
    0
  );
}

function starString(rating) {
  const full = Math.round(rating);

  return '★'.repeat(full) + '☆'.repeat(5 - full);
}
