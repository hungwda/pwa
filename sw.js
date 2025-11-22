/**
 * Service Worker for PWA
 * Implements caching strategies for offline functionality
 */

const CACHE_VERSION = 'v1.1.0';
const CACHE_NAME = `pwa-cache-${CACHE_VERSION}`;
const RUNTIME_CACHE = `runtime-${CACHE_VERSION}`;

// Assets to cache immediately on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/css/main.css',
  '/css/skeleton.css',
  '/css/modal.css',
  '/css/settings.css',
  '/css/responsive.css',
  '/js/app.js',
  '/js/modules/logger.js',
  '/js/modules/install.js',
  '/js/modules/onboarding.js',
  '/js/modules/navigation.js',
  '/js/modules/share.js',
  '/js/modules/settings.js',
  '/js/utils/helpers.js',
  '/manifest.json',
  '/assets/icons/icon-192x192.png',
  '/assets/icons/icon-512x512.png'
];

// Install event - cache essential assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Precaching app shell');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName.startsWith('pwa-cache-') && cacheName !== CACHE_NAME ||
                     cacheName.startsWith('runtime-') && cacheName !== RUNTIME_CACHE;
            })
            .map((cacheName) => {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Network-first strategy for API calls
  if (event.request.url.includes('/api/')) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  // For navigation requests (HTML pages), use navigation strategy
  // This fixes the SPA routing issue where refreshing on /explore or /settings returns 404
  if (event.request.mode === 'navigate' ||
      (event.request.method === 'GET' && event.request.headers.get('accept').includes('text/html'))) {
    event.respondWith(navigationFallback(event.request));
    return;
  }

  // Cache-first strategy for assets
  event.respondWith(cacheFirst(event.request));
});

/**
 * Cache-first strategy
 * Try cache first, fallback to network, then cache the response
 */
async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);

    // Cache successful responses
    if (response.status === 200) {
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.error('[SW] Fetch failed:', error);

    // Return offline page if available
    const offlinePage = await cache.match('/offline.html');
    if (offlinePage) {
      return offlinePage;
    }

    throw error;
  }
}

/**
 * Network-first strategy
 * Try network first, fallback to cache
 */
async function networkFirst(request) {
  const cache = await caches.open(RUNTIME_CACHE);

  try {
    const response = await fetch(request);

    // Cache successful responses
    if (response.status === 200) {
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', error);

    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }

    throw error;
  }
}

/**
 * Navigation fallback strategy
 * For SPA routing: return index.html for all navigation requests
 * This ensures that refreshing on /explore, /settings, etc. works correctly
 */
async function navigationFallback(request) {
  const cache = await caches.open(CACHE_NAME);

  try {
    // Try to fetch the actual request first
    const response = await fetch(request);

    // If we get a valid response, return it
    if (response.status === 200) {
      return response;
    }

    // If we get a 404 or other error, return index.html
    // This allows the client-side router to handle the route
    console.log('[SW] Navigation request failed, returning index.html for:', request.url);
    const indexPage = await cache.match('/index.html');
    if (indexPage) {
      return indexPage;
    }

    return response;
  } catch (error) {
    // Network failed (offline), return index.html from cache
    console.log('[SW] Network unavailable, returning cached index.html for:', request.url);
    const indexPage = await cache.match('/index.html');

    if (indexPage) {
      return indexPage;
    }

    // If index.html is not in cache, try offline page
    const offlinePage = await cache.match('/offline.html');
    if (offlinePage) {
      return offlinePage;
    }

    throw error;
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  console.log('[SW] Syncing data...');
  // Implement your sync logic here
}

// Push notifications
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'PWA Notification';
  const options = {
    body: data.body || 'You have a new notification',
    icon: '/assets/icons/icon-192x192.png',
    badge: '/assets/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: data.data || {}
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});
