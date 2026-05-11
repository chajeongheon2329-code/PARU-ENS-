/* SOLARDESIGN SW - Network First / 캐시 자동 갱신 */
const CACHE = 'solar-202605110221';
const STATIC = ['./app.html','./manifest.json','./icon-192.png','./icon-512.png',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'];

/* 설치: 정적 파일 캐시 */
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(STATIC).catch(() => {})));
  self.skipWaiting();
});

/* 활성화: 이전 버전 캐시 전부 삭제 */
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

/* fetch: app.html은 항상 네트워크 우선 (캐시 무효화) */
self.addEventListener('fetch', e => {
  /* 카카오/구글 타일은 캐시 안 함 */
  if (e.request.url.includes('google.com/vt') || e.request.url.includes('dapi.kakao')) return;

  const url = new URL(e.request.url);
  const isHtml = url.pathname.endsWith('.html') || url.pathname === '/' || url.pathname.endsWith('/');

  if (isHtml) {
    /* HTML: 항상 네트워크 우선, 실패시 캐시 */
    e.respondWith(
      fetch(e.request).then(res => {
        if (res && res.status === 200) {
          var c = res.clone();
          caches.open(CACHE).then(ca => ca.put(e.request, c));
        }
        return res;
      }).catch(() => caches.match(e.request))
    );
  } else {
    /* 기타: 캐시 우선, 없으면 네트워크 */
    e.respondWith(
      caches.match(e.request).then(r => r || fetch(e.request).then(res => {
        if (res && res.status === 200 && res.type !== 'opaque') {
          var c = res.clone();
          caches.open(CACHE).then(ca => ca.put(e.request, c));
        }
        return res;
      }).catch(() => caches.match('./app.html')))
    );
  }
});
