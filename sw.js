/* 항상 최신본 우선 (Network First) */
const CACHE='solar-v20';
const STATIC=['./icon-192.png','./icon-512.png','./icon-1024.png',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(STATIC).catch(()=>{})));
  self.skipWaiting();
});
self.addEventListener('activate',e=>{
  /* 이전 캐시 전부 삭제 */
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch',e=>{
  if(e.request.url.includes('google.com/vt')||e.request.url.includes('dapi.kakao'))return;
  /* index.html / manifest.json → 항상 네트워크 우선 */
  if(e.request.url.endsWith('/')||e.request.url.includes('index.html')||e.request.url.includes('manifest.json')){
    e.respondWith(fetch(e.request,{cache:'no-store'}).then(res=>{
      var c=res.clone();
      caches.open(CACHE).then(ca=>ca.put(e.request,c));
      return res;
    }).catch(()=>caches.match(e.request)));
    return;
  }
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{
    if(res&&res.status===200){var c=res.clone();caches.open(CACHE).then(ca=>ca.put(e.request,c));}
    return res;
  })));
});
