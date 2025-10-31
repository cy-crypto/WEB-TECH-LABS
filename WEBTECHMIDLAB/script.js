document.addEventListener('DOMContentLoaded', function() {
    const viewMoreBtnGrid = document.querySelector('.btn-view-more-grid');
    const viewMoreBtnSlider = document.querySelector('.btn-view-more-slider');
    const testimonialsContainer = document.querySelector('.testimonials-initial');
    const sliderControls = document.querySelector('.slider-controls');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    const hiddenCards = document.querySelectorAll('.hidden-card');
    
    let currentSlide = 0;
    let isSliderActive = false;
    let isGridActive = false;
    let cardsPerView = getCardsPerView();
    let autoSlideInterval;

    // Grid View More button functionality
    viewMoreBtnGrid.addEventListener('click', function() {
        activateGrid();
    });

    // Slider View More button functionality
    viewMoreBtnSlider.addEventListener('click', function() {
        activateSlider();
    });
    
    function activateGrid() {
        // Show all hidden cards
        hiddenCards.forEach(card => {
            card.classList.remove('hidden-card');
        });
        
        // Apply grid layout
        testimonialsContainer.classList.add('grid-active');
        testimonialsContainer.classList.remove('slider-active');
        sliderControls.classList.add('hidden');
        
        // Hide both view more buttons
        viewMoreBtnGrid.classList.add('hidden');
        viewMoreBtnSlider.classList.add('hidden');
        
        isGridActive = true;
        isSliderActive = false;
        
        // Stop auto-slide if it was running
        clearInterval(autoSlideInterval);
    }
    
    function activateSlider() {
        // Show all hidden cards
        hiddenCards.forEach(card => {
            card.classList.remove('hidden-card');
        });
        
        // Apply slider layout
        testimonialsContainer.classList.add('slider-active');
        testimonialsContainer.classList.remove('grid-active');
        sliderControls.classList.remove('hidden');
        
        // Hide both view more buttons
        viewMoreBtnGrid.classList.add('hidden');
        viewMoreBtnSlider.classList.add('hidden');
        
        isSliderActive = true;
        isGridActive = false;
        
        // Force reflow to ensure CSS changes are applied
        void testimonialsContainer.offsetWidth;
        
        updateSlider();
        startAutoSlide();
    }
    
    // Slider navigation
    prevBtn.addEventListener('click', function() {
        if (currentSlide <= 0) {
            currentSlide = testimonialCards.length - cardsPerView;
        } else {
            currentSlide--;
        }
        updateSlider();
        resetAutoSlide();
    });
    
    nextBtn.addEventListener('click', function() {
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
        const cardWidth = firstCard.offsetWidth + parseInt(cardStyle.marginRight || 0);
        
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
    
    window.addEventListener('resize', function() {
        if (isSliderActive) {
            const newCardsPerView = getCardsPerView();
            if (newCardsPerView !== cardsPerView) {
                cardsPerView = newCardsPerView;
                currentSlide = 0;
                updateSlider();
            }
        }
    });
    
    testimonialsContainer.addEventListener('mouseenter', function() {
        if (isSliderActive) {
            clearInterval(autoSlideInterval);
        }
    });
    
    testimonialsContainer.addEventListener('mouseleave', function() {
        if (isSliderActive) {
            startAutoSlide();
        }
    });
    
    sliderControls.addEventListener('mouseenter', function() {
        if (isSliderActive) {
            clearInterval(autoSlideInterval);
        }
    });
    
    sliderControls.addEventListener('mouseleave', function() {
        if (isSliderActive) {
            startAutoSlide();
        }
    });
});