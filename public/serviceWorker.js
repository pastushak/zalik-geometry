const CACHE_NAME = 'zalik-geometry-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/static/js/main.chunk.js',
  '/static/js/0.chunk.js',
  '/static/js/bundle.js',
  '/static/css/main.chunk.css',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png'
];

// Інсталяція service worker'а
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Кешування відкрито');
        return cache.addAll(urlsToCache);
      })
  );
});

// Активація service worker'а
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Перехоплення запитів для кешування
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Повертаємо кешований ресурс, якщо він є
        if (response) {
          return response;
        }
        
        // Інакше, запитуємо у мережі
        return fetch(event.request)
          .then(response => {
            // Перевірка валідності відповіді
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Клонуємо відповідь - один для кешу, інший для браузера
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          });
      })
  );
});