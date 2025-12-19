// Testimonials slider & grid behavior (copied from original static site)
// Only run in browser environment (not Node.js)
(function() {
  'use strict';
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    return; // Exit early if not in browser
  }

  document.addEventListener('DOMContentLoaded', function () {
    const viewMoreBtnGrid = document.querySelector('.btn-view-more-grid');
    const viewMoreBtnSlider = document.querySelector('.btn-view-more-slider');
    const testimonialsContainer = document.querySelector('.testimonials-initial');
    const sliderControls = document.querySelector('.slider-controls');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    const hiddenCards = document.querySelectorAll('.hidden-card');

    if (
      !viewMoreBtnGrid ||
      !viewMoreBtnSlider ||
      !testimonialsContainer ||
      !sliderControls
    ) {
      // Page without testimonials; do nothing.
      return;
    }

    let currentSlide = 0;
    let isSliderActive = false;
    let isGridActive = false;
    let cardsPerView = getCardsPerView();
    let autoSlideInterval;

    // Grid View More button functionality
    viewMoreBtnGrid.addEventListener('click', function () {
      activateGrid();
    });

    // Slider View More button functionality
    viewMoreBtnSlider.addEventListener('click', function () {
      activateSlider();
    });

    function activateGrid() {
      hiddenCards.forEach((card) => {
        card.classList.remove('hidden-card');
      });

      testimonialsContainer.classList.add('grid-active');
      testimonialsContainer.classList.remove('slider-active');
      sliderControls.classList.add('hidden');

      viewMoreBtnGrid.classList.add('hidden');
      viewMoreBtnSlider.classList.add('hidden');

      isGridActive = true;
      isSliderActive = false;

      clearInterval(autoSlideInterval);
    }

    function activateSlider() {
      hiddenCards.forEach((card) => {
        card.classList.remove('hidden-card');
      });

      testimonialsContainer.classList.add('slider-active');
      testimonialsContainer.classList.remove('grid-active');
      sliderControls.classList.remove('hidden');

      viewMoreBtnGrid.classList.add('hidden');
      viewMoreBtnSlider.classList.add('hidden');

      isSliderActive = true;
      isGridActive = false;

      void testimonialsContainer.offsetWidth;

      updateSlider();
      startAutoSlide();
    }

    // Slider navigation
    prevBtn.addEventListener('click', function () {
      if (currentSlide <= 0) {
        currentSlide = testimonialCards.length - cardsPerView;
      } else {
        currentSlide--;
      }
      updateSlider();
      resetAutoSlide();
    });

    nextBtn.addEventListener('click', function () {
      const maxSlide = testimonialCards.length - cardsPerView;
      if (currentSlide >= maxSlide) {
        currentSlide = 0;
      } else {
        currentSlide++;
      }
      updateSlider();
      resetAutoSlide();
    });

    function updateSlider() {
      if (!isSliderActive) return;

      const firstCard = testimonialCards[0];
      const cardStyle = window.getComputedStyle(firstCard);
      const cardWidth =
        firstCard.offsetWidth + parseInt(cardStyle.marginRight || '0', 10);

      const translateX = -currentSlide * cardWidth;
      testimonialsContainer.style.transform = `translateX(${translateX}px)`;

      const maxSlide = testimonialCards.length - cardsPerView;
      prevBtn.disabled = false;
      nextBtn.disabled = false;
    }

    function getCardsPerView() {
      const width = window.innerWidth;
      if (width >= 1024) return 3;
      if (width >= 768) return 2;
      return 1;
    }

    function startAutoSlide() {
      if (!isSliderActive) return;

      autoSlideInterval = setInterval(() => {
        const maxSlide = testimonialCards.length - cardsPerView;

        if (currentSlide >= maxSlide) {
          currentSlide = 0;
        } else {
          currentSlide++;
        }

        updateSlider();
      }, 2000);
    }

    function resetAutoSlide() {
      clearInterval(autoSlideInterval);
      startAutoSlide();
    }

    window.addEventListener('resize', function () {
      if (isSliderActive) {
        const newCardsPerView = getCardsPerView();
        if (newCardsPerView !== cardsPerView) {
          cardsPerView = newCardsPerView;
          currentSlide = 0;
          updateSlider();
        }
      }
    });

    testimonialsContainer.addEventListener('mouseenter', function () {
      if (isSliderActive) {
        clearInterval(autoSlideInterval);
      }
    });

    testimonialsContainer.addEventListener('mouseleave', function () {
      if (isSliderActive) {
        startAutoSlide();
      }
    });

    sliderControls.addEventListener('mouseenter', function () {
      if (isSliderActive) {
        clearInterval(autoSlideInterval);
      }
    });

    sliderControls.addEventListener('mouseleave', function () {
      if (isSliderActive) {
        startAutoSlide();
      }
    });
  });

  // Add to Cart functionality
  function addToCart(productId) {
    const btn = document.getElementById('addToCartBtn');
    const messageDiv = document.getElementById('cartMessage');
    
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Adding...';
    }

    fetch('/cart/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ productId, quantity: 1 })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        if (messageDiv) {
          messageDiv.style.display = 'block';
          messageDiv.textContent = '✓ Added to cart!';
          setTimeout(() => {
            messageDiv.style.display = 'none';
          }, 3000);
        }
        
        // Update cart count in header
        const cartCountElement = document.querySelector('.cart-count');
        if (cartCountElement) {
          cartCountElement.textContent = data.cartCount;
        }
      }
    })
    .catch(err => {
      console.error('Error:', err);
      alert('Failed to add item to cart. Please try again.');
    })
    .finally(() => {
      if (btn) {
        btn.disabled = false;
        btn.textContent = 'Add To Cart';
      }
    });
  }

  // Make addToCart globally available
  window.addToCart = addToCart;
})();
