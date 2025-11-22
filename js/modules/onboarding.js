/**
 * Onboarding Module
 * Handles first-time user onboarding experience
 */

(function () {
  'use strict';

  const ONBOARDING_KEY = 'onboarding-completed';
  let currentSlide = 1;
  let totalSlides = 4;

  const elements = {
    modal: helpers.$('onboarding-modal'),
    slides: null,
    dots: null,
    skipBtn: helpers.$('skip-onboarding'),
    nextBtn: helpers.$('next-onboarding'),
    finishBtn: helpers.$('finish-onboarding'),
  };

  /**
   * Initialize onboarding
   */
  function init() {
    // Check if onboarding already completed
    if (helpers.getLocal(ONBOARDING_KEY)) {
      return;
    }

    // Get slide elements
    elements.slides = helpers.qsa('.onboarding-slide');
    elements.dots = helpers.qsa('.onboarding-dots .dot');
    totalSlides = elements.slides.length;

    // Set up event listeners
    setupEventListeners();

    // Show onboarding modal
    showOnboarding();
  }

  /**
   * Setup event listeners
   */
  function setupEventListeners() {
    // Skip button
    if (elements.skipBtn) {
      helpers.on(elements.skipBtn, 'click', skipOnboarding);
    }

    // Next button
    if (elements.nextBtn) {
      helpers.on(elements.nextBtn, 'click', nextSlide);
    }

    // Finish button
    if (elements.finishBtn) {
      helpers.on(elements.finishBtn, 'click', finishOnboarding);
    }

    // Dot navigation
    elements.dots.forEach((dot) => {
      helpers.on(dot, 'click', () => {
        const slideNum = parseInt(dot.getAttribute('data-slide'));
        goToSlide(slideNum);
      });
    });

    // Keyboard navigation
    helpers.on(document, 'keydown', handleKeyboard);

    // Touch gestures
    setupTouchGestures();
  }

  /**
   * Show onboarding modal
   */
  function showOnboarding() {
    if (elements.modal) {
      helpers.removeClass(elements.modal, 'hidden');
      elements.modal.setAttribute('aria-hidden', 'false');

      // Focus modal for accessibility
      elements.modal.focus();

      // Track event
      trackOnboarding('onboarding_started');
    }
  }

  /**
   * Hide onboarding modal
   */
  function hideOnboarding() {
    if (elements.modal) {
      helpers.addClass(elements.modal, 'hidden');
      elements.modal.setAttribute('aria-hidden', 'true');
    }
  }

  /**
   * Go to next slide
   */
  function nextSlide() {
    if (currentSlide < totalSlides) {
      goToSlide(currentSlide + 1);
    } else {
      finishOnboarding();
    }
  }

  /**
   * Go to previous slide
   */
  function prevSlide() {
    if (currentSlide > 1) {
      goToSlide(currentSlide - 1);
    }
  }

  /**
   * Go to specific slide
   * @param {number} slideNum - Slide number
   */
  function goToSlide(slideNum) {
    if (slideNum < 1 || slideNum > totalSlides) {
      return;
    }

    // Update current slide
    currentSlide = slideNum;

    // Update slides
    elements.slides.forEach((slide, index) => {
      const isActive = index + 1 === currentSlide;
      helpers.toggleClass(slide, 'active', isActive);
    });

    // Update dots
    elements.dots.forEach((dot, index) => {
      const isActive = index + 1 === currentSlide;
      helpers.toggleClass(dot, 'active', isActive);
    });

    // Update buttons
    updateButtons();

    // Track slide view
    trackOnboarding(`onboarding_slide_${currentSlide}`);
  }

  /**
   * Update button visibility
   */
  function updateButtons() {
    const isLastSlide = currentSlide === totalSlides;

    if (elements.nextBtn && elements.finishBtn) {
      helpers.toggleClass(elements.nextBtn, 'hidden', isLastSlide);
      helpers.toggleClass(elements.finishBtn, 'hidden', !isLastSlide);
    }
  }

  /**
   * Skip onboarding
   */
  function skipOnboarding() {
    hideOnboarding();
    completeOnboarding();
    trackOnboarding('onboarding_skipped', { slide: currentSlide });
  }

  /**
   * Finish onboarding
   */
  function finishOnboarding() {
    hideOnboarding();
    completeOnboarding();
    trackOnboarding('onboarding_completed');

    // Show success message
    helpers.toast('Welcome! Let\'s get started!', 'success');
  }

  /**
   * Mark onboarding as completed
   */
  function completeOnboarding() {
    helpers.setLocal(ONBOARDING_KEY, true);
  }

  /**
   * Handle keyboard navigation
   * @param {KeyboardEvent} event
   */
  function handleKeyboard(event) {
    // Only handle if modal is visible
    if (helpers.hasClass(elements.modal, 'hidden')) {
      return;
    }

    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        prevSlide();
        break;
      case 'ArrowRight':
        event.preventDefault();
        nextSlide();
        break;
      case 'Escape':
        event.preventDefault();
        skipOnboarding();
        break;
      case 'Enter':
        event.preventDefault();
        if (currentSlide === totalSlides) {
          finishOnboarding();
        } else {
          nextSlide();
        }
        break;
    }
  }

  /**
   * Setup touch gestures for mobile
   */
  function setupTouchGestures() {
    let touchStartX = 0;
    let touchEndX = 0;

    helpers.on(elements.modal, 'touchstart', (event) => {
      touchStartX = event.changedTouches[0].screenX;
    });

    helpers.on(elements.modal, 'touchend', (event) => {
      touchEndX = event.changedTouches[0].screenX;
      handleSwipe();
    });

    function handleSwipe() {
      const swipeThreshold = 50;
      const diff = touchStartX - touchEndX;

      if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
          // Swipe left - next slide
          nextSlide();
        } else {
          // Swipe right - previous slide
          prevSlide();
        }
      }
    }
  }

  /**
   * Reset onboarding (for testing)
   */
  function reset() {
    helpers.removeLocal(ONBOARDING_KEY);
    currentSlide = 1;
    goToSlide(1);
  }

  /**
   * Track onboarding events
   * @param {string} eventName
   * @param {Object} params
   */
  function trackOnboarding(eventName, params = {}) {
    console.log('[Onboarding]', eventName, params);
    // Implement your analytics tracking here
  }

  /**
   * Check if onboarding is completed
   * @returns {boolean}
   */
  function isCompleted() {
    return !!helpers.getLocal(ONBOARDING_KEY);
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Export public API
  window.PWAOnboarding = {
    init,
    show: showOnboarding,
    hide: hideOnboarding,
    reset,
    isCompleted,
  };
})();
