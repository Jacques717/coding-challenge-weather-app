const CACHE_NAME = 'weather-app-v1';
const URLS_TO_CACHE = [
  '/',
  '/manifest.json',
  'https://bmcdn.nl/assets/weather-icons/v3.0/fill/svg/clear-day.svg',
  'https://bmcdn.nl/assets/weather-icons/v3.0/fill/svg/cloudy.svg',
  'https://bmcdn.nl/assets/weather-icons/v3.0/fill/svg/rain.svg',
  'https://bmcdn.nl/assets/weather-icons/v3.0/fill/svg/snow.svg',
  'https://bmcdn.nl/assets/weather-icons/v3.0/fill/svg/thunderstorms-rain.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(URLS_TO_CACHE))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request)
          .then((response) => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            return response;
          });
      })
  );
}); 