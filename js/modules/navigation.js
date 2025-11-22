/**
 * Navigation Module
 * Handles app navigation and routing
 */

(function () {
  'use strict';

  const navItems = helpers.qsa('.nav-item');
  const menuToggle = helpers.$('menu-toggle');

  /**
   * Initialize navigation
   */
  function init() {
    setupNavigation();
    setupMenuToggle();
    setupBackButton();
    updateActiveNav();
  }

  /**
   * Setup navigation click handlers
   */
  function setupNavigation() {
    navItems.forEach((item) => {
      helpers.on(item, 'click', handleNavClick);
    });

    // Handle browser back/forward
    helpers.on(window, 'popstate', handlePopState);
  }

  /**
   * Handle navigation click
   * @param {Event} event
   */
  function handleNavClick(event) {
    event.preventDefault();

    const href = event.currentTarget.getAttribute('href');
    const label = event.currentTarget.getAttribute('aria-label');

    // Navigate to the page
    navigateTo(href, label);

    // Provide touch feedback
    provideTouchFeedback(event.currentTarget);
  }

  /**
   * Navigate to a page
   * @param {string} path - Path to navigate to
   * @param {string} title - Page title
   */
  function navigateTo(path, title = 'PWA Template') {
    // Update browser history
    window.history.pushState({ path }, title, path);

    // Update active navigation
    updateActiveNav(path);

    // Load content
    loadContent(path);

    // Update document title
    document.title = title;

    // Track navigation
    trackNavigation(path, title);
  }

  /**
   * Handle browser back/forward buttons
   * @param {PopStateEvent} event
   */
  function handlePopState(event) {
    const path = event.state?.path || '/';
    updateActiveNav(path);
    loadContent(path);
  }

  /**
   * Update active navigation item
   * @param {string} currentPath - Current path
   */
  function updateActiveNav(currentPath = window.location.pathname) {
    navItems.forEach((item) => {
      const href = item.getAttribute('href');
      const isActive = href === currentPath;

      helpers.toggleClass(item, 'active', isActive);

      if (isActive) {
        item.setAttribute('aria-current', 'page');
      } else {
        item.removeAttribute('aria-current');
      }
    });
  }

  /**
   * Load content for the given path
   * @param {string} path - Path to load content for
   */
  function loadContent(path) {
    const mainContent = helpers.$('main-content');

    if (!mainContent) {
      return;
    }

    // Show skeleton screen
    showSkeleton();

    // Simulate content loading (replace with actual content loading)
    setTimeout(() => {
      hideSkeleton();

      // Update content based on path
      updateContentForPath(path);
    }, 500);
  }

  /**
   * Update content based on path
   * @param {string} path - Current path
   */
  function updateContentForPath(path) {
    const content = helpers.$('main-content');

    if (!content) {
      return;
    }

    console.log('[Navigation] Content updated for path:', path);

    // Route to appropriate page
    switch (path) {
      case '/':
        renderHomePage(content);
        break;
      case '/explore':
        renderExplorePage(content);
        break;
      case '/favorites':
        renderFavoritesPage(content);
        break;
      case '/settings':
        renderSettingsPage(content);
        break;
      default:
        renderNotFoundPage(content);
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Render home page
   */
  function renderHomePage(container) {
    container.innerHTML = `
      <div class="page-content">
        <h1>Welcome to Modern PWA</h1>
        <p>This is a Progressive Web App template with offline support.</p>
        <div class="feature-grid">
          <div class="feature-card">
            <h3>📱 Installable</h3>
            <p>Install on your device for a native app experience</p>
          </div>
          <div class="feature-card">
            <h3>🔌 Offline Ready</h3>
            <p>Works offline with smart caching strategies</p>
          </div>
          <div class="feature-card">
            <h3>⚡ Fast</h3>
            <p>Optimized for performance and speed</p>
          </div>
          <div class="feature-card">
            <h3>🔧 Developer Tools</h3>
            <p>Built-in logging and debugging capabilities</p>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render explore page
   */
  function renderExplorePage(container) {
    container.innerHTML = `
      <div class="page-content">
        <h1>Explore</h1>
        <p>Discover new features and content.</p>
      </div>
    `;
  }

  /**
   * Render favorites page
   */
  function renderFavoritesPage(container) {
    container.innerHTML = `
      <div class="page-content">
        <h1>Favorites</h1>
        <p>Your saved items will appear here.</p>
      </div>
    `;
  }

  /**
   * Render settings page
   */
  function renderSettingsPage(container) {
    if (window.PWASettings) {
      window.PWASettings.render(container);
    } else {
      container.innerHTML = `
        <div class="page-content">
          <h1>Settings</h1>
          <p>Settings module not loaded.</p>
        </div>
      `;
    }
  }

  /**
   * Render 404 page
   */
  function renderNotFoundPage(container) {
    container.innerHTML = `
      <div class="page-content">
        <h1>404 - Page Not Found</h1>
        <p>The page you're looking for doesn't exist.</p>
      </div>
    `;
  }

  /**
   * Setup menu toggle (for mobile sidebar)
   */
  function setupMenuToggle() {
    if (menuToggle) {
      helpers.on(menuToggle, 'click', toggleMenu);
    }
  }

  /**
   * Toggle menu
   */
  function toggleMenu() {
    const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', !isExpanded);

    // In a full implementation, this would toggle a sidebar menu
    console.log('[Navigation] Menu toggled:', !isExpanded);

    // Provide touch feedback
    provideTouchFeedback(menuToggle);
  }

  /**
   * Setup back button behavior
   */
  function setupBackButton() {
    // Monitor history state
    const initialHistoryLength = window.history.length;

    // Handle Android back button
    helpers.on(window, 'popstate', () => {
      const currentLength = window.history.length;

      // If we're at the start of the history, consider closing the app
      if (currentLength <= initialHistoryLength) {
        console.log('[Navigation] At start of history');
        // In a real app, you might show an exit confirmation
      }
    });
  }

  /**
   * Show skeleton screen
   */
  function showSkeleton() {
    const skeleton = helpers.$('skeleton-screen');
    const content = helpers.$('main-content');

    if (skeleton && content) {
      helpers.removeClass(skeleton, 'hidden');
      helpers.addClass(content, 'hidden');
    }
  }

  /**
   * Hide skeleton screen
   */
  function hideSkeleton() {
    const skeleton = helpers.$('skeleton-screen');
    const content = helpers.$('main-content');

    if (skeleton && content) {
      helpers.addClass(skeleton, 'hidden');
      helpers.removeClass(content, 'hidden');
    }
  }

  /**
   * Provide touch feedback
   * @param {HTMLElement} element
   */
  function provideTouchFeedback(element) {
    if (!element) {
      return;
    }

    // Add active class temporarily
    element.classList.add('touch-active');

    setTimeout(() => {
      element.classList.remove('touch-active');
    }, 150);

    // Haptic feedback if available
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  }

  /**
   * Track navigation
   * @param {string} path
   * @param {string} title
   */
  function trackNavigation(path, title) {
    console.log('[Navigation] Navigated to:', path, title);
    // Implement your analytics tracking here
  }

  /**
   * Go back
   */
  function goBack() {
    window.history.back();
  }

  /**
   * Go forward
   */
  function goForward() {
    window.history.forward();
  }

  // Add touch-active style
  const style = document.createElement('style');
  style.textContent = `
    .touch-active {
      opacity: 0.7;
      transform: scale(0.98);
      transition: all 0.1s ease;
    }
  `;
  document.head.appendChild(style);

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Export public API
  window.PWANavigation = {
    init,
    navigateTo,
    goBack,
    goForward,
  };
})();
