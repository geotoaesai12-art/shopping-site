
// home.js
// Hero slider + featured products

const API_BASE = 'https://shopping-site-production.up.railway.app';


// ========================================
// PAGE START
// ========================================

document.addEventListener('DOMContentLoaded', () => {

  // Layout ko safely load karo
  try {
    if (typeof mountLayout === 'function') {
      mountLayout('home');
    }
  } catch (error) {
    console.error('Layout error:', error);
  }

  // Cart ko safely load karo
  try {
    if (typeof mountCartDrawer === 'function') {
      mountCartDrawer();
    }
  } catch (error) {
    console.error('Cart error:', error);
  }

  // Hero start
  initHeroSlider();

  // Products load
  loadFeatured();

});


// ========================================
// HERO SLIDER
// ========================================

function initHeroSlider() {

  const slides = document.querySelectorAll('.hero-slide');
  const dotsContainer = document.getElementById('heroDots');
  const nextBtn = document.getElementById('heroNext');
  const prevBtn = document.getElementById('heroPrev');
  const slider = document.getElementById('heroSlider');

  console.log('Hero slides found:', slides.length);

  if (!slides.length) {
    console.warn('No hero slides found.');
    return;
  }

  let current = 0;
  let timer = null;

  // Remove old active classes
  slides.forEach(slide => {
    slide.classList.remove('active');
  });

  // First slide active
  slides[0].classList.add('active');


  // ========================================
  // DOTS
  // ========================================

  if (dotsContainer) {

    dotsContainer.innerHTML = '';

    slides.forEach((slide, index) => {

      const dot = document.createElement('button');

      dot.type = 'button';
      dot.className = 'hero-dot';

      if (index === 0) {
        dot.classList.add('active');
      }

      dot.addEventListener('click', () => {

        goTo(index);

        restartAutoplay();

      });

      dotsContainer.appendChild(dot);

    });

  }


  function updateDots() {

    if (!dotsContainer) return;

    const dots = dotsContainer.querySelectorAll('.hero-dot');

    dots.forEach((dot, index) => {

      dot.classList.toggle(
        'active',
        index === current
      );

    });

  }


  function goTo(index) {

    slides[current].classList.remove('active');

    current =
      (index + slides.length) %
      slides.length;

    slides[current].classList.add('active');

    updateDots();

  }


  function next() {

    goTo(current + 1);

  }


  function previous() {

    goTo(current - 1);

  }


  function startAutoplay() {

    if (timer) {
      clearInterval(timer);
    }

    timer = setInterval(() => {

      next();

    }, 4000);

  }


  function stopAutoplay() {

    if (timer) {

      clearInterval(timer);

      timer = null;

    }

  }


  function restartAutoplay() {

    stopAutoplay();

    startAutoplay();

  }


  // ========================================
  // NEXT BUTTON
  // ========================================

  if (nextBtn) {

    nextBtn.addEventListener('click', () => {

      next();

      restartAutoplay();

    });

  }


  // ========================================
  // PREVIOUS BUTTON
  // ========================================

  if (prevBtn) {

    prevBtn.addEventListener('click', () => {

      previous();

      restartAutoplay();

    });

  }


  // ========================================
  // PAUSE ON MOUSE
  // ========================================

  if (slider) {

    slider.addEventListener(
      'mouseenter',
      stopAutoplay
    );

    slider.addEventListener(
      'mouseleave',
      startAutoplay
    );

  }


  // ========================================
  // START AUTO SLIDE
  // ========================================

  startAutoplay();

  console.log('Hero autoplay started.');

}


// ========================================
// PRODUCT CARD
// ========================================

function productCard(product) {

  const discount =
    Number(product.discount_percent || 0);

  const price =
    Number(product.price || 0);

  const originalPrice =
    Number(product.original_price || 0);

  const rating =
    Number(product.rating || 0);

  const ratingCount =
    Number(product.rating_count || 0);


  let stars = '';


  try {

    if (typeof starString === 'function') {

      stars = starString(rating);

    } else {

      const rounded =
        Math.max(
          0,
          Math.min(
            5,
            Math.round(rating)
          )
        );

      stars =
        '★'.repeat(rounded) +
        '☆'.repeat(5 - rounded);

    }

  } catch (error) {

    stars = '★★★★★';

  }


  return `

    <a
      href="product.html?id=${product.id}"
      class="product-card"
      style="display:block;"
    >

      ${
        discount > 0
          ? `
            <div class="discount-badge">
              -${discount}%
            </div>
          `
          : ''
      }


      <img
        src="${product.image_url || ''}"
        alt="${product.name || 'Product'}"
        loading="lazy"
      />


      <div class="product-info">

        <div class="product-category">
          ${product.category || ''}
        </div>


        <div class="product-name">
          ${product.name || 'Product'}
        </div>


        <div class="product-rating">

          <span class="stars">
            ${stars}
          </span>

          (${ratingCount})

        </div>


        <div class="price-row">

          <span class="product-price">
            Rs. ${price.toLocaleString()}
          </span>


          ${
            discount > 0 && originalPrice > 0
              ? `
                <span class="product-price-original">
                  Rs. ${originalPrice.toLocaleString()}
                </span>
              `
              : ''
          }

        </div>


        <button
          class="add-to-cart-btn"
          type="button"
          onclick="event.preventDefault(); event.stopPropagation(); addProductToCart(${product.id})"
        >
          Add to Cart
        </button>

      </div>

    </a>

  `;

}


// ========================================
// ADD PRODUCT TO CART SAFELY
// ========================================

function addProductToCart(productId) {

  try {

    const product =
      window.__products?.find(
        p => Number(p.id) === Number(productId)
      );

    if (!product) {

      console.error(
        'Product not found for cart:',
        productId
      );

      return;

    }

    if (typeof addToCart === 'function') {

      addToCart(product);

    } else {

      console.warn(
        'addToCart function is not available.'
      );

    }

  } catch (error) {

    console.error(
      'Add to cart error:',
      error
    );

  }

}


// ========================================
// LOAD FEATURED PRODUCTS
// ========================================

async function loadFeatured() {

  const grid =
    document.getElementById('featuredGrid');


  if (!grid) {

    console.warn(
      'featuredGrid element not found.'
    );

    return;

  }


  grid.innerHTML = `
    <p class="loading">
      Loading products...
    </p>
  `;


  try {

    console.log(
      'Loading products from:',
      API_BASE
    );


    const response =
      await fetch(
        `${API_BASE}/api/products`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          },
          cache: 'no-store'
        }
      );


    console.log(
      'Products response:',
      response.status
    );


    if (!response.ok) {

      throw new Error(
        `Products API error: ${response.status}`
      );

    }


    const products =
      await response.json();


    console.log(
      'Products received:',
      products
    );


    if (!Array.isArray(products)) {

      throw new Error(
        'Products response is not an array.'
      );

    }


    if (products.length === 0) {

      grid.innerHTML = `
        <p class="loading">
          No products available right now.
        </p>
      `;

      return;

    }


    // Products globally save kar do
    window.__products = products;


    // First 4 featured products
    const featured =
      products.slice(0, 4);


    grid.innerHTML =
      featured
        .map(productCard)
        .join('');


    console.log(
      'Featured products displayed:',
      featured.length
    );


  } catch (error) {

    console.error(
      'Could not load products:',
      error
    );


    grid.innerHTML = `
      <p class="loading">
        Could not load products.
        Please refresh the page.
      </p>
    `;

  }

}

