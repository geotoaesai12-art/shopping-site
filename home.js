// home.js — hero slider + featured products for the landing page

mountLayout('home');
mountCartDrawer();

(function initHeroSlider() {
  const slides = document.querySelectorAll('.hero-slide');
  const dotsContainer = document.getElementById('heroDots');
  let current = 0;
  let timer;

  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'hero-dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => goTo(i));
    dotsContainer.appendChild(dot);
  });
  const dots = document.querySelectorAll('.hero-dot');

  function goTo(index) {
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = (index + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current].classList.add('active');
  }
  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }
  function startAutoplay() { timer = setInterval(next, 4500); }
  function stopAutoplay() { clearInterval(timer); }

  document.getElementById('heroNext').addEventListener('click', () => { next(); stopAutoplay(); startAutoplay(); });
  document.getElementById('heroPrev').addEventListener('click', () => { prev(); stopAutoplay(); startAutoplay(); });

  const slider = document.getElementById('heroSlider');
  slider.addEventListener('mouseenter', stopAutoplay);
  slider.addEventListener('mouseleave', startAutoplay);
  startAutoplay();
})();

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
        <button class="add-to-cart-btn" onclick='event.preventDefault(); addToCart(${JSON.stringify(p)})'>Add to Cart</button>
      </div>
    </a>
  `;
}

async function loadFeatured() {
  try {
    const res = await fetch('/api/products');
    const products = await res.json();
    const featured = products.slice(0, 4);
    document.getElementById('featuredGrid').innerHTML = featured.map(productCard).join('');
  } catch (err) {
    document.getElementById('featuredGrid').innerHTML = `<p class="loading">Could not load products. Is the backend server running?</p>`;
  }
}

loadFeatured();
