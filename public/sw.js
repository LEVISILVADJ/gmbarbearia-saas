// Service Worker for GM Barbearia PWA
const CACHE_NAME = 'gm-barbearia-v1';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/assets/index.css',
  '/assets/index.js',
  '/WhatsApp Image 2025-06-26 at 08.22.png',
  '/manifest.json'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing Service Worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[Service Worker] Successfully installed');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating Service Worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('[Service Worker] Removing old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[Service Worker] Successfully activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  // Skip Supabase API requests
  if (event.request.url.includes('supabase.co')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Return cached response if available
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // Otherwise fetch from network
        return fetch(event.request)
          .then((response) => {
            // Don't cache if not a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone the response to cache it and return it
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          })
          .catch((error) => {
            console.log('[Service Worker] Fetch failed:', error);
            
            // For navigation requests, return the offline page
            if (event.request.mode === 'navigate') {
              return caches.match('/');
            }
            
            return new Response('Network error', {
              status: 408,
              headers: { 'Content-Type': 'text/plain' }
            });
          });
      })
  );
});

// Push notification event
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push notification received:', event);
  
  const data = event.data.json();
  const options = {
    body: data.body || 'Nova notificação',
    icon: '/WhatsApp Image 2025-06-26 at 08.22.png',
    badge: '/WhatsApp Image 2025-06-26 at 08.22.png',
    data: {
      url: data.url || '/'
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'GM Barbearia', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked:', event);
  
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});

// Background sync for offline operations
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync:', event);
  
  if (event.tag === 'sync-bookings') {
    event.waitUntil(syncBookings());
  }
});

// Function to sync pending bookings
async function syncBookings() {
  try {
    const db = await openDB();
    const pendingBookings = await db.getAll('pending-bookings');
    
    console.log('[Service Worker] Syncing pending bookings:', pendingBookings);
    
    for (const booking of pendingBookings) {
      try {
        const response = await fetch('/api/bookings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(booking)
        });
        
        if (response.ok) {
          await db.delete('pending-bookings', booking.id);
          console.log('[Service Worker] Successfully synced booking:', booking.id);
          
          // Show notification
          self.registration.showNotification('Agendamento sincronizado', {
            body: 'Seu agendamento foi sincronizado com sucesso!',
            icon: '/WhatsApp Image 2025-06-26 at 08.22.png'
          });
        }
      } catch (error) {
        console.error('[Service Worker] Error syncing booking:', error);
      }
    }
  } catch (error) {
    console.error('[Service Worker] Error in syncBookings:', error);
  }
}

// IndexedDB helper
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('gm-barbearia-db', 1);
    
    request.onerror = (event) => {
      reject('Error opening IndexedDB');
    };
    
    request.onsuccess = (event) => {
      resolve(request.result);
    };
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains('pending-bookings')) {
        db.createObjectStore('pending-bookings', { keyPath: 'id' });
      }
    };
  });
}