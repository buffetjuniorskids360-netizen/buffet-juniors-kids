// Service Worker for Buffet Junior's Kids Financial System
const CACHE_NAME = 'buffet-juniors-v1.0.0';
const STATIC_CACHE_NAME = 'buffet-juniors-static-v1.0.0';

// Files to cache for offline functionality
const STATIC_FILES = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
];

// API routes that should be cached
const API_CACHE_PATTERNS = [
  /^\/api\/clients\?.*$/,
  /^\/api\/events\?.*$/,
  /^\/api\/payments\/analytics.*$/,
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    Promise.all([
      // Cache static files
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        return cache.addAll(STATIC_FILES);
      }),
      // Skip waiting to activate immediately
      self.skipWaiting(),
    ])
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE_NAME;
            })
            .map((cacheName) => caches.delete(cacheName))
        );
      }),
      // Claim all clients
      self.clients.claim(),
    ])
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip Chrome extension requests
  if (url.protocol === 'chrome-extension:') {
    return;
  }

  // Handle different types of requests
  if (url.pathname.startsWith('/api/')) {
    // API requests - Network First strategy
    event.respondWith(handleApiRequest(request));
  } else if (STATIC_FILES.includes(url.pathname)) {
    // Static files - Cache First strategy
    event.respondWith(handleStaticRequest(request));
  } else {
    // Other requests - Stale While Revalidate strategy
    event.respondWith(handleGenericRequest(request));
  }
});

// Network First strategy for API requests
async function handleApiRequest(request) {
  const cache = await caches.open(CACHE_NAME);
  
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    // Cache successful responses for analytics and read-only endpoints
    if (networkResponse.ok && shouldCacheApiResponse(request)) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Network failed, try cache
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('Serving API request from cache:', request.url);
      return cachedResponse;
    }
    
    // No cache available, return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/offline.html');
    }
    
    throw error;
  }
}

// Cache First strategy for static files
async function handleStaticRequest(request) {
  const cache = await caches.open(STATIC_CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Not in cache, fetch from network
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // Network failed, return offline page for navigation
    if (request.mode === 'navigate') {
      return caches.match('/offline.html');
    }
    throw error;
  }
}

// Stale While Revalidate strategy
async function handleGenericRequest(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  // Start fetch request in background
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  });
  
  // Return cached version immediately if available
  if (cachedResponse) {
    // Update cache in background
    fetchPromise.catch(() => {
      // Ignore network errors when updating cache
    });
    return cachedResponse;
  }
  
  // No cache, wait for network
  try {
    return await fetchPromise;
  } catch (error) {
    // Network failed and no cache
    if (request.mode === 'navigate') {
      return caches.match('/offline.html');
    }
    throw error;
  }
}

// Determine if API response should be cached
function shouldCacheApiResponse(request) {
  const url = new URL(request.url);
  
  // Cache read-only endpoints
  return API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname));
}

// Handle background sync (if needed)
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Implement background sync logic here
  // For example, sync offline form submissions
  console.log('Performing background sync...');
}

// Handle push notifications (if needed)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data?.text() || 'Nova notificação do Buffet Junior\'s Kids',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    tag: 'buffet-notification',
    vibrate: [100, 50, 100],
  };
  
  event.waitUntil(
    self.registration.showNotification('Buffet Junior\'s Kids', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/')
  );
});

// Log service worker version
console.log('Buffet Junior\'s Kids Service Worker v1.0.0 loaded');