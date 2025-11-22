/**
 * PWA Install Module
 * Handles install prompt and app installation
 */

(function () {
  'use strict';

  let deferredPrompt = null;
  const installBanner = helpers.$('install-banner');
  const installBtn = helpers.$('install-btn');
  const dismissBtn = helpers.$('dismiss-install');

  /**
   * Initialize install functionality
   */
  function init() {
    // Check if already installed
    if (isInstalled()) {
      return;
    }

    // Check if user previously dismissed
    const dismissed = helpers.getLocal('install-dismissed');
    if (dismissed) {
      const dismissedTime = new Date(dismissed);
      const daysSinceDismissed = Math.floor(
        (Date.now() - dismissedTime.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Show again after 7 days
      if (daysSinceDismissed < 7) {
        return;
      }
    }

    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for app installed event
    window.addEventListener('appinstalled', handleAppInstalled);

    // Set up button listeners
    if (installBtn) {
      helpers.on(installBtn, 'click', showInstallPrompt);
    }

    if (dismissBtn) {
      helpers.on(dismissBtn, 'click', dismissInstallBanner);
    }

    // Check display mode
    checkDisplayMode();
  }

  /**
   * Handle beforeinstallprompt event
   * @param {Event} event
   */
  function handleBeforeInstallPrompt(event) {
    // Prevent default prompt
    event.preventDefault();

    // Store the event for later use
    deferredPrompt = event;

    // Show custom install banner
    showInstallBanner();

    console.log('[Install] Install prompt available');
  }

  /**
   * Show install banner
   */
  function showInstallBanner() {
    if (installBanner) {
      helpers.removeClass(installBanner, 'hidden');

      // Track banner shown
      trackEvent('install_banner_shown');
    }
  }

  /**
   * Show install prompt
   */
  async function showInstallPrompt() {
    if (!deferredPrompt) {
      helpers.toast('Install prompt not available', 'error');
      return;
    }

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for user response
    const { outcome } = await deferredPrompt.userChoice;

    console.log('[Install] User choice:', outcome);

    if (outcome === 'accepted') {
      helpers.toast('App will be installed!', 'success');
      trackEvent('install_accepted');
    } else {
      helpers.toast('Installation cancelled', 'info');
      trackEvent('install_dismissed');
    }

    // Hide the banner
    hideInstallBanner();

    // Clear the deferred prompt
    deferredPrompt = null;
  }

  /**
   * Dismiss install banner
   */
  function dismissInstallBanner() {
    hideInstallBanner();

    // Store dismissal time
    helpers.setLocal('install-dismissed', new Date().toISOString());

    // Track dismissal
    trackEvent('install_banner_dismissed');
  }

  /**
   * Hide install banner
   */
  function hideInstallBanner() {
    if (installBanner) {
      helpers.addClass(installBanner, 'hidden');
    }
  }

  /**
   * Handle app installed event
   */
  function handleAppInstalled() {
    console.log('[Install] App installed successfully');

    // Hide the banner
    hideInstallBanner();

    // Clear dismissal flag
    helpers.removeLocal('install-dismissed');

    // Show success message
    helpers.toast('App installed successfully!', 'success');

    // Track installation
    trackEvent('app_installed');
  }

  /**
   * Check if app is installed
   * @returns {boolean}
   */
  function isInstalled() {
    // Check display mode
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return true;
    }

    // Check if running as PWA on iOS
    if (window.navigator.standalone === true) {
      return true;
    }

    return false;
  }

  /**
   * Check display mode and update UI
   */
  function checkDisplayMode() {
    if (isInstalled()) {
      console.log('[Install] App is running in standalone mode');

      // Hide install banner
      hideInstallBanner();

      // Add class to body
      document.body.classList.add('standalone');

      // Track standalone launch
      trackEvent('app_launched_standalone');
    } else {
      console.log('[Install] App is running in browser mode');
      document.body.classList.add('browser');
    }
  }

  /**
   * Track analytics event
   * @param {string} eventName
   * @param {Object} params
   */
  function trackEvent(eventName, params = {}) {
    console.log('[Analytics]', eventName, params);

    // Implement your analytics tracking here
    // Example: gtag('event', eventName, params);
    // Example: analytics.track(eventName, params);
  }

  /**
   * Get install status
   * @returns {Object}
   */
  function getInstallStatus() {
    return {
      isInstalled: isInstalled(),
      hasPrompt: !!deferredPrompt,
      isDismissed: !!helpers.getLocal('install-dismissed'),
    };
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Export public API
  window.PWAInstall = {
    init,
    showPrompt: showInstallPrompt,
    getStatus: getInstallStatus,
    isInstalled,
  };
})();
