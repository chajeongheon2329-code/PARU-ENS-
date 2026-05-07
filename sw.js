/* ☀ SOLARDESIGN — Service Worker v1.0 */
const CACHE = 'solardesign-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap'
];

/* 설치: 핵심 파일 캐시 */
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      return cache.addAll(ASSETS).catch(function(err) {
        console.warn('[SW] 일부 캐시 실패 (정상):', err);
      });
    })
  );
  self.skipWaiting();
});

/* 활성화: 이전 캐시 삭제 */
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE; })
            .map(function(k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

/* 요청 처리: 캐시 우선, 없으면 네트워크 */
self.addEventListener('fetch', function(e) {
  /* 지도 타일은 캐시하지 않음 (용량) */
  if (e.request.url.includes('google.com/vt') ||
      e.request.url.includes('dapi.kakao.com')) {
    return;
  }
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      if (cached) return cached;
      return fetch(e.request).then(function(response) {
        /* 성공 응답만 캐시 */
        if (!response || response.status !== 200 || response.type === 'opaque') {
          return response;
        }
        var clone = response.clone();
        caches.open(CACHE).then(function(cache) {
          cache.put(e.request, clone);
        });
        return response;
      }).catch(function() {
        /* 오프라인: index.html 반환 */
        if (e.request.destination === 'document') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
