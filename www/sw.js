const C='hb-v33';
const FILES=['./','index.html','krypto.html','gh.js','ghk.js','manifest.webmanifest','icon-192.png','icon-512.png','vendor/jspdf.umd.min.js','vendor/jspdf.plugin.autotable.min.js'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET'||u.origin!==location.origin)return;
  e.respondWith(caches.open(C).then(async c=>{
    try{const r=await Promise.race([fetch(e.request,{cache:'no-cache'}),new Promise((_,j)=>setTimeout(j,4000))]);if(r&&r.ok)c.put(e.request,r.clone());return r}
    catch(err){const hit=await c.match(e.request,{ignoreSearch:true});return hit||Response.error()}}));
});
