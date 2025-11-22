/**
 * Main App Entry Point
 * Initializes PWA functionality and manages app lifecycle
 */

(function () {
  'use strict';

  /**
   * App configuration
   */
  const config = {
    version: '1.0.0',
    cacheName: 'pwa-cache-v1.0.0',
    enableAnalytics: true,
    enableNotifications: false,
  };

  /**
   * Initialize the app
   */
  function init() {
    console.log('[App] Initializing PWA v' + config.version);

    // Initialize logger first to capture all logs
    if (window.PWALogger) {
      window.PWALogger.init();
    }

    // Initialize settings module
    if (window.PWASettings) {
      window.PWASettings.init();
    }

    // Register service worker
    registerServiceWorker();

    // Setup offline detection
    setupOfflineDetection();

    // Setup demo functionality
    setupDemoControls();

    // Hide skeleton and show content after initial load
    setTimeout(hideSkeletonScreen, 800);

    // Log app ready
    console.log('[App] PWA initialized successfully');
  }

  /**
   * Register service worker
   */
  async function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) {
      console.warn('[App] Service workers not supported');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');

      console.log('[App] Service worker registered:', registration.scope);

      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('[App] New service worker available');
            showUpdateNotification();
          }
        });
      });

      // Check for updates periodically
      setInterval(() => {
        registration.update();
      }, 60000); // Check every minute

    } catch (error) {
      console.error('[App] Service worker registration failed:', error);
    }
  }

  /**
   * Show update notification
   */
  function showUpdateNotification() {
    const notification = document.createElement('div');
    notification.className = 'update-notification';
    notification.innerHTML = `
      <div class="update-content">
        <span>A new version is available!</span>
        <button class="btn btn-primary btn-sm" id="reload-btn">Reload</button>
      </div>
    `;

    Object.assign(notification.style, {
      position: 'fixed',
      top: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: '#2196F3',
      color: 'white',
      padding: '16px 24px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      zIndex: '1000',
      animation: 'slideDown 0.3s ease',
    });

    document.body.appendChild(notification);

    const reloadBtn = helpers.$('reload-btn');
    if (reloadBtn) {
      helpers.on(reloadBtn, 'click', () => {
        window.location.reload();
      });
    }
  }

  /**
   * Setup offline detection
   */
  function setupOfflineDetection() {
    const offlineIndicator = helpers.$('offline-indicator');

    function updateOnlineStatus() {
      const isOnline = navigator.onLine;

      if (offlineIndicator) {
        helpers.toggleClass(offlineIndicator, 'hidden', isOnline);
      }

      if (!isOnline) {
        console.log('[App] App is offline');
        helpers.toast('You are offline. Some features may be limited.', 'warning', 5000);
      } else {
        console.log('[App] App is online');
        helpers.toast('You are back online!', 'success');
      }
    }

    // Listen for online/offline events
    helpers.on(window, 'online', updateOnlineStatus);
    helpers.on(window, 'offline', updateOnlineStatus);

    // Check initial state
    updateOnlineStatus();
  }

  /**
   * Hide skeleton screen and show content
   */
  function hideSkeletonScreen() {
    const skeleton = helpers.$('skeleton-screen');
    const content = helpers.$('main-content');

    if (skeleton && content) {
      helpers.addClass(skeleton, 'hidden');
      helpers.removeClass(content, 'hidden');
    }
  }

  /**
   * Setup demo controls
   */
  function setupDemoControls() {
    const testOfflineBtn = helpers.$('test-offline');
    const clearCacheBtn = helpers.$('clear-cache');
    const statusMessage = helpers.$('status-message');

    if (testOfflineBtn) {
      helpers.on(testOfflineBtn, 'click', testOfflineMode);
    }

    if (clearCacheBtn) {
      helpers.on(clearCacheBtn, 'click', clearCache);
    }

    async function testOfflineMode() {
      showStatus('Testing offline mode...', 'info');

      try {
        // Try to fetch a resource
        const response = await fetch('/manifest.json');

        if (response.ok) {
          showStatus('✓ Offline mode is working! Resource loaded from cache.', 'success');
        } else {
          showStatus('× Failed to load resource', 'error');
        }
      } catch (error) {
        showStatus('✓ Offline mode is working! You can use the app without internet.', 'success');
      }
    }

    async function clearCache() {
      showStatus('Clearing cache...', 'info');

      try {
        const cacheNames = await caches.keys();

        await Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );

        showStatus('✓ Cache cleared successfully!', 'success');

        // Reload after a delay
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } catch (error) {
        console.error('[App] Error clearing cache:', error);
        showStatus('× Failed to clear cache', 'error');
      }
    }

    function showStatus(message, type) {
      if (statusMessage) {
        statusMessage.textContent = message;
        statusMessage.className = `status-message ${type}`;
        statusMessage.style.display = 'block';

        setTimeout(() => {
          statusMessage.style.display = 'none';
        }, 5000);
      }
    }
  }

  /**
   * Handle app visibility changes
   */
  function setupVisibilityChange() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        console.log('[App] App hidden');
      } else {
        console.log('[App] App visible');
        // Check for updates when app becomes visible
        checkForUpdates();
      }
    });
  }

  /**
   * Check for app updates
   */
  async function checkForUpdates() {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        registration.update();
      }
    }
  }

  /**
   * Setup performance monitoring
   */
  function setupPerformanceMonitoring() {
    // Performance observer for long tasks
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            console.log('[Performance]', entry.name, entry.duration + 'ms');
          }
        });

        observer.observe({ entryTypes: ['measure', 'navigation'] });
      } catch (error) {
        console.error('[Performance] Error setting up observer:', error);
      }
    }

    // Log core web vitals when available
    if ('web-vital' in window) {
      // This would require importing web-vitals library
      // For now, just log paint timing
      window.addEventListener('load', () => {
        const perfData = performance.getEntriesByType('navigation')[0];
        if (perfData) {
          console.log('[Performance] Load time:', perfData.loadEventEnd - perfData.fetchStart + 'ms');
        }
      });
    }
  }

  /**
   * Handle errors globally
   */
  function setupErrorHandling() {
    window.addEventListener('error', (event) => {
      console.error('[App] Error:', event.error);
      // Send to error tracking service
      trackError(event.error);
    });

    window.addEventListener('unhandledrejection', (event) => {
      console.error('[App] Unhandled promise rejection:', event.reason);
      // Send to error tracking service
      trackError(event.reason);
    });
  }

  /**
   * Track errors
   * @param {Error} error
   */
  function trackError(error) {
    // Implement your error tracking here
    // Example: Sentry, Bugsnag, etc.
    console.log('[Analytics] Error tracked:', error);
  }

  /**
   * Request notification permission
   */
  async function requestNotificationPermission() {
    if (!('Notification' in window)) {
      console.log('[App] Notifications not supported');
      return;
    }

    if (!config.enableNotifications) {
      return;
    }

    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      console.log('[App] Notification permission:', permission);
    }
  }

  /**
   * Get app info
   * @returns {Object}
   */
  function getAppInfo() {
    return {
      version: config.version,
      isOnline: navigator.onLine,
      isStandalone: window.matchMedia('(display-mode: standalone)').matches,
      serviceWorkerActive: 'serviceWorker' in navigator && !!navigator.serviceWorker.controller,
      notificationsEnabled: 'Notification' in window && Notification.permission === 'granted',
    };
  }

  /**
   * Log app info
   */
  function logAppInfo() {
    const info = getAppInfo();
    console.log('[App] Info:', info);
  }

  // Setup additional features
  setupVisibilityChange();
  setupPerformanceMonitoring();
  setupErrorHandling();

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Log app info after initialization
  window.addEventListener('load', logAppInfo);

  // Export public API
  window.PWAApp = {
    init,
    getInfo: getAppInfo,
    getVersion: () => config.version,
    checkForUpdates,
    requestNotifications: requestNotificationPermission,
    config,
  };

  // Make helpers globally available
  window.helpers = helpers;
})();
