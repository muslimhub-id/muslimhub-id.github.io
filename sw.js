const V="mh2",SHELL=["./","index.html","manifest.webmanifest","icon.svg","icon-192.png","icon-512.png"];
const KEEP=[V,"mh-f","mh-q"]; // mh-q = cache Quran dari halaman, jangan dihapus

self.addEventListener("install",e=>{
  e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()));
});
self.addEventListener("activate",e=>{
  e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(n=>!KEEP.includes(n)).map(n=>caches.delete(n)))).then(()=>self.clients.claim()));
});

const simpanOk=r=>r&&(r.ok||r.type==="opaque");

self.addEventListener("fetch",e=>{
  const q=e.request;
  if(q.method!=="GET")return;
  const u=new URL(q.url);

  // Font Google: stale-while-revalidate, agar huruf Arab tetap tampil offline
  if(u.hostname==="fonts.googleapis.com"||u.hostname==="fonts.gstatic.com"){
    e.respondWith(caches.open("mh-f").then(async c=>{
      const m=await c.match(q);
      const net=fetch(q).then(r=>{if(simpanOk(r))c.put(q,r.clone());return r;}).catch(()=>m);
      return m||net;
    }));
    return;
  }

  if(u.origin!==location.origin)return;

  // Berkas aplikasi: jaringan dulu, cadangan dari cache
  e.respondWith(fetch(q).then(r=>{
    if(r.ok){const c=r.clone();caches.open(V).then(x=>x.put(q,c));}
    return r;
  }).catch(()=>caches.match(q).then(m=>m||(q.mode==="navigate"?caches.match("index.html"):Response.error()))));
});

self.addEventListener("notificationclick",e=>{
  e.notification.close();
  e.waitUntil(self.clients.matchAll({type:"window",includeUncontrolled:true}).then(l=>{
    for(const c of l){if("focus" in c)return c.focus();}
    return self.clients.openWindow("./");
  }));
});
