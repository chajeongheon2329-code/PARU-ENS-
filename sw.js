const CACHE='solar-v1';
const FILES=['./','./app.html','./manifest.json','./icon-192.png','./icon-512.png',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css','https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES).catch(()=>{})));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim();});
self.addEventListener('fetch',e=>{if(e.request.url.includes('google.com/vt')||e.request.url.includes('dapi.kakao'))return;
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{if(res&&res.status===200&&res.type!=='opaque'){var c=res.clone();caches.open(CACHE).then(ca=>ca.put(e.request,c));}return res;}).catch(()=>caches.match('./app.html'))));});
