
// home.js — hero slider + featured products for the landing page

mountLayout('home');
mountCartDrawer();

(function initHeroSlider() {
  const slides = document.querySelectorAll('.hero-slide');
  const dotsContainer = document.getElementById('heroDots');
  const nextBtn = document.getElementById('heroNext');
  const prevBtn = document.getElementById('heroPrev');
  const slider = document.getElementById('heroSlider');

  // If hero slider elements are missing, don't crash the whole page
  if (!slides.length || !dotsContainer || !nextBtn || !prevBtn || !slider) {
    console.warn('Hero slider elements not found.');
    return;
  }

  let current = 0;
  let timer = null;

  // Create dots
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'hero-dot' + (i === 0 ? ' active' : '');
    dot.type = 'button';

    dot.addEventListener('click', () => {
      goTo(i);
      stopAutoplay();
      startAutoplay();
    });

    dotsContainer.appendChild(dot);
  });

  const dots = document.querySelectorAll('.hero-dot');

  function goTo(index) {
    if (!slides.length) return;

    slides[current].classList.remove('active');

    if (dots[current]) {
      dots[current].classList.remove('active');
    }

    current = (index + slides.length) % slides.length;

    slides[current].classList.add('active');

    if (dots[current]) {
      dots[current].classList.add('active');
    }
  }

  function next() {
    goTo(current + 1);
  }

  function prev() {
    goTo(current - 1);
  }

  function startAutoplay() {
    stopAutoplay();
    timer = setInterval(next, 4500);
  }

  function stopAutoplay() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  nextBtn.addEventListener('click', () => {
    next();
    stopAutoplay();
    startAutoplay();
  });

  prevBtn.addEventListener('click', () => {
    prev();
    stopAutoplay();
    startAutoplay();
  });

  slider.addEventListener('mouseenter', stopAutoplay);
  slider.addEventListener('mouseleave', startAutoplay);

  startAutoplay();
})();


function productCard(p) {
  const hasDiscount = Number(p.discount_percent || 0) > 0;

  const price = Number(p.price || 0);
  const originalPrice = Number(p.original_price || 0);
  const rating = Number(p.rating || 0);
  const ratingCount = Number(p.rating_count || 0);

  // starString fallback so products don't fail if the function isn't loaded
  let stars = '';

  try {
    if (typeof starString === 'function') {
      stars = starString(rating);
    } else {
      stars = '★'.repeat(Math.round(rating)) +
              '☆'.repeat(Math.max(0, 5 - Math.round(rating)));
    }
  } catch (e) {
    stars = '★★★★★';
  }

  return `
    <a href="product.html?id=${p.id}" class="product-card" style="display:block;">

      ${
        hasDiscount
          ? `<div class="discount-badge">-${p.discount_percent}%</div>`
          : ''
      }

      <img
        src="${p.image_url || ''}"
        alt="${p.name || 'Product'}"
        loading="lazy"
      />

      <div class="product-info">

        <div class="product-category">
          ${p.category || ''}
        </div>

        <div class="product-name">
          ${p.name || 'Product'}
        </div>

        <div class="product-rating">
          <span class="stars">${stars}</span>
          (${ratingCount})
        </div>

        <div class="price-row">

          <span class="product-price">
            Rs. ${price.toLocaleString()}
          </span>

          ${
            hasDiscount && originalPrice
              ? `<span class="product-price-original">
                  Rs. ${originalPrice.toLocaleString()}
                </span>`
              : ''
          }

        </div>

        <button
          class="add-to-cart-btn"
          type="button"
          onclick='event.preventDefault(); event.stopPropagation(); addToCart(${JSON.stringify(p)})'
        >
          Add to Cart
        </button>

      </div>
    </a>
  `;
}


async function loadFeatured() {
  const grid = document.getElementById('featuredGrid');

  if (!grid) {
    console.warn('featuredGrid not found.');
    return;
  }

  grid.innerHTML = `<p class="loading">Loading products...</p>`;

  try {
    const response = await fetch(
      'https://shopping-site-production.up.railway.app/api/products',
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(
        `Products API returned ${response.status}`
      );
    }

    const products = await response.json();

    if (!Array.isArray(products)) {
      throw new Error('Products API did not return an array.');
    }

    if (products.length === 0) {
      grid.innerHTML = `
        <p class="loading">
          No products available right now.
        </p>
      `;
      return;
    }

    const featured = products.slice(0, 4);

    grid.innerHTML = featured
      .map(productCard)
      .join('');

  } catch (err) {

    console.error('Could not load products:', err);

    grid.innerHTML = `
      <p class="loading">
        Could not load products. Please refresh the page.
      </p>
    `;
  }
}

loadFeatured();

