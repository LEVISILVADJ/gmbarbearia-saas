// PWA utilities for GM Barbearia

// Register service worker
export const registerSW = () => {
  if ('serviceWorker' in navigator) {
    // Check if we're in a development environment that doesn't support Service Workers
    const isStackBlitz = window.location.hostname.includes('stackblitz') || 
                        window.location.hostname.includes('webcontainer');
    
    if (isStackBlitz) {
      console.log('Service Worker registration skipped: Not supported in this environment');
      return;
    }
    
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch(error => {
          console.warn('Service Worker registration failed:', error.message);
          // Don't throw error, just log it as PWA features are optional
        });
    });
  }
};

// Request notification permission
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }
  
  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

// Send notification
export const sendNotification = (title: string, options: NotificationOptions) => {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return;
  }
  
  if (Notification.permission === 'granted') {
    try {
      const notification = new Notification(title, {
        icon: '/WhatsApp Image 2025-06-26 at 08.22.png',
        badge: '/WhatsApp Image 2025-06-26 at 08.22.png',
        ...options
      });
      
      return notification;
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }
};

// Check if app is installed
export const isAppInstalled = () => {
  return window.matchMedia('(display-mode: standalone)').matches || 
         (window.navigator as any).standalone === true;
};

// Save data to IndexedDB for offline use
export const saveToIndexedDB = async (storeName: string, data: any) => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('gm-barbearia-db', 1);
    
    request.onerror = (event) => {
      reject('Error opening IndexedDB');
    };
    
    request.onsuccess = (event) => {
      const db = request.result;
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      
      const addRequest = store.add(data);
      
      addRequest.onsuccess = () => {
        resolve(true);
      };
      
      addRequest.onerror = () => {
        reject('Error adding data to IndexedDB');
      };
    };
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: 'id' });
      }
    };
  });
};

// Get data from IndexedDB
export const getFromIndexedDB = async (storeName: string, id?: string) => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('gm-barbearia-db', 1);
    
    request.onerror = (event) => {
      reject('Error opening IndexedDB');
    };
    
    request.onsuccess = (event) => {
      const db = request.result;
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      
      let getRequest;
      
      if (id) {
        getRequest = store.get(id);
      } else {
        getRequest = store.getAll();
      }
      
      getRequest.onsuccess = () => {
        resolve(getRequest.result);
      };
      
      getRequest.onerror = () => {
        reject('Error getting data from IndexedDB');
      };
    };
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: 'id' });
      }
    };
  });
};

// Register for background sync
export const registerBackgroundSync = async (tag: string) => {
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register(tag);
      return true;
    } catch (error) {
      console.error('Error registering background sync:', error);
      return false;
    }
  }
  return false;
};

// Check if device is online
export const isOnline = () => {
  return navigator.onLine;
};

// Add event listeners for online/offline events
export const addConnectivityListeners = (
  onlineCallback: () => void, 
  offlineCallback: () => void
) => {
  window.addEventListener('online', onlineCallback);
  window.addEventListener('offline', offlineCallback);
  
  return () => {
    window.removeEventListener('online', onlineCallback);
    window.removeEventListener('offline', offlineCallback);
  };
};