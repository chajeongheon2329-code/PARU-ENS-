const CACHE='solar-v2';
const FILES=[
  './app.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];
self.addEventListener('install',e=>{
  e.waitUntil(
    caches.open(CACHE).then(c=>
      Promise.allSettled(FILES.map(f=>c.add(f)))
    )
  );
  self.skipWaiting();
});
self.addEventListener('activate',e=>{
  e.waitUntil(
    caches.keys().then(ks=>
      Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))
    )
  );
  self.clients.claim();
});
self.addEventListener('fetch',e=>{
  const url=e.request.url;
  if(url.includes('google.com/vt')||url.includes('dapi.kakao')||
     url.includes('unpkg.com')||url.includes('openstreetmap'))return;
  e.respondWith(
    caches.match(e.request).then(r=>{
      if(r)return r;
      return fetch(e.request).then(res=>{
        if(res&&res.status===200&&res.type!=='opaque'){
          var c=res.clone();
          caches.open(CACHE).then(ca=>ca.put(e.request,c));
        }
        return res;
      }).catch(()=>caches.match('./app.html'));
    })
  );
});
