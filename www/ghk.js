'use strict';
/* Sync-Schicht: speichert alle Daten lokal (localStorage) und gleicht sie mit einem privaten GitHub-Repo ab.
   Stellt dieselbe kleine Schnittstelle bereit wie die Datenbank der Web-Version (doc/collection/onSnapshot/set). */
(function(){
const LS_CFG='kb-gh';
const isNative=()=>!!(window.Capacitor&&window.Capacitor.isNativePlatform&&window.Capacitor.isNativePlatform());
const b64e=s=>{const b=new TextEncoder().encode(s);let bin='';for(let i=0;i<b.length;i+=0x8000)bin+=String.fromCharCode.apply(null,b.subarray(i,i+0x8000));return btoa(bin)};
const b64d=s=>new TextDecoder().decode(Uint8Array.from(atob(String(s).replace(/\s/g,'')),c=>c.charCodeAt(0)));
const clone=o=>JSON.parse(JSON.stringify(o));

/* ----- Zugangsdaten ----- */
function ghLoad(){try{const c=JSON.parse(localStorage.getItem(LS_CFG)||'null');return c&&c.owner&&c.repo&&c.token?c:null}catch(e){return null}}
function ghSave(c){localStorage.setItem(LS_CFG,JSON.stringify(c))}
function ghClear(){try{const keys=[];for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&(k.startsWith('kbd:')||k==='kbidx'||k===LS_CFG))keys.push(k)}keys.forEach(k=>localStorage.removeItem(k))}catch(e){}}
const makeCode=c=>'KB1.'+b64e(JSON.stringify({o:c.owner,r:c.repo,t:c.token}));
function parseCode(s){
  s=String(s||'').trim();if(s.startsWith('HB1.')){const h=JSON.parse(b64d(s.slice(4)));if(h.o&&h.t)return{owner:h.o,repo:'krypto-daten',token:h.t}}if(!s.startsWith('KB1.'))throw new Error('Das ist kein gültiger Kopplungscode.');
  const o=JSON.parse(b64d(s.slice(4)));if(!o.o||!o.r||!o.t)throw new Error('Der Kopplungscode ist unvollständig.');
  return{owner:o.o,repo:o.r,token:o.t};
}

/* ----- Schutz: Das Krypto-Buch darf nie in ein Repository schreiben, das Haushaltsbuch-Daten enthält ----- */
const BADP=/^data\/(monate|steuer|sprit)\//;
const OTHER_KEY='hb-gh';
const nameBad=(o,r)=>{if(/haushalt/i.test(String(r)))return true;try{const x=JSON.parse(localStorage.getItem(OTHER_KEY)||'null');if(x&&x.owner&&x.repo&&String(x.owner).toLowerCase()===String(o).toLowerCase()&&String(x.repo).toLowerCase()===String(r).toLowerCase())return true}catch(e){}return false};
const WRONG='Falsches Repository: Dieses Repository enthält Daten des Haushaltsbuchs. Es wurde nichts gespeichert. Das Krypto-Buch und Haushaltsbuch brauchen zwei getrennte Repositories.';
async function repoCheck(c,branch){
  const H={Authorization:'Bearer '+c.token,Accept:'application/vnd.github+json'},A='https://api.github.com/repos/'+encodeURIComponent(c.owner)+'/'+encodeURIComponent(c.repo);
  const r=await fetch(A+'/git/trees/'+encodeURIComponent(branch||'main')+'?recursive=1',{headers:H});
  if(r.status===409||r.status===404)return;                 /* leeres Repository: unbedenklich */
  if(!r.ok)throw Object.assign(new Error('HTTP '+r.status),{http:r.status});
  const t=await r.json(),paths=(t.tree||[]).map(x=>x.path);
  if(paths.some(p=>BADP.test(p)))throw Object.assign(new Error(WRONG),{wrong:true});
  if(paths.includes('data/config/main.json')){const j=await fetch(A+'/contents/data/config/main.json'+(branch?'?ref='+encodeURIComponent(branch):''),{headers:H});if(j.ok){const m=await j.json();let d={};try{d=JSON.parse(b64d(m.content))}catch(e){}if(d&&typeof d==='object'&&!Array.isArray(d.wallets))throw Object.assign(new Error(WRONG),{wrong:true})}}
}
async function ghConnect(c){
  if(nameBad(c.owner,c.repo))throw new Error(WRONG);
  const res=await fetch('https://api.github.com/repos/'+encodeURIComponent(c.owner)+'/'+encodeURIComponent(c.repo),{headers:{Authorization:'Bearer '+c.token,Accept:'application/vnd.github+json'}});
  if(res.status===401)throw new Error('Der Token ist ungültig oder abgelaufen.');
  if(res.status===404)throw new Error('Repository nicht gefunden. Name oder Token-Zugriff prüfen.');
  if(!res.ok)throw new Error('GitHub antwortet mit Fehler '+res.status+'.');
  const j=await res.json();
  if(!j.permissions||!j.permissions.push)throw new Error('Der Token darf in diesem Repository nicht schreiben („Contents: Read and write“ fehlt).');
  if(!j.private)throw new Error('Das Daten-Repository ist öffentlich. Bitte auf „Private“ stellen, sonst kann jeder deine Finanzdaten lesen.');
  await repoCheck(c,j.default_branch||'main');
  const out={owner:c.owner,repo:c.repo,token:c.token,branch:j.default_branch||'main'};
  ghSave(out);return out;
}

/* ----- Datenbank-Adapter ----- */
function mergeMonth(local,remote,base){
  const m=new Map(),bs=base?new Set(base):null,lo=new Set((local&&local.e||[]).map(e=>e.i));
  /* Einträge, die es beim letzten Abgleich schon gab und die lokal fehlen, wurden hier gelöscht und kommen nicht zurück */
  (remote&&remote.e||[]).forEach(e=>{if(bs&&bs.has(e.i)&&!lo.has(e.i))return;m.set(e.i,e)});(local&&local.e||[]).forEach(e=>m.set(e.i,e));
  return{e:[...m.values()].sort((a,b)=>a.d<b.d?-1:a.d>b.d?1:0)};
}
function ghMake(cfg,onStatus){
  const API='https://api.github.com/repos/'+cfg.owner+'/'+cfg.repo;
  const H={Authorization:'Bearer '+cfg.token,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'};
  const docs=new Map(),subs=[];
  let synced=false,syncing=false,flushT=null,firstDone=false;let guarded=false,wrongRepo=false;
  try{JSON.parse(localStorage.getItem('kbidx')||'[]').forEach(p=>{const r=localStorage.getItem('kbd:'+p);if(r)docs.set(p,JSON.parse(r))})}catch(e){}
  const persist=p=>{try{localStorage.setItem('kbd:'+p,JSON.stringify(docs.get(p)));localStorage.setItem('kbidx',JSON.stringify([...docs.keys()]))}catch(e){onStatus({state:'error',msg:'Lokaler Speicher ist voll'})}};
  const pending=()=>[...docs.values()].filter(r=>r.x).length;
  const segs=p=>p.split('/');
  const mkDoc=p=>{const r=docs.get(p);return{id:segs(p).pop(),exists:!!r,data:()=>r?r.d:undefined,metadata:{fromCache:!synced,hasPendingWrites:!!(r&&r.x)}}};
  const colPaths=c=>[...docs.keys()].filter(k=>k.startsWith(c+'/')&&segs(k).length===2);
  const mkCol=(c,changed,type)=>{const ds=colPaths(c).map(mkDoc);const ch=(changed||ds.map(d=>c+'/'+d.id)).filter(p=>p.startsWith(c+'/')&&segs(p).length===2).map(p=>({type:type||'added',doc:mkDoc(p)}));
    return{docs:ds,size:ds.length,empty:!ds.length,metadata:{fromCache:!synced,hasPendingWrites:false},docChanges:()=>ch}};
  function notify(paths,type){
    subs.forEach(s=>{
      if(s.kind==='doc'){if(!paths||paths.includes(s.p))s.fn(mkDoc(s.p))}
      else{const ch=paths?paths.filter(p=>p.startsWith(s.c+'/')&&segs(p).length===2):null;if(!paths||ch.length)s.fn(mkCol(s.c,ch,type||'modified'))}
    });
  }
  const status=(state,msg)=>onStatus({state,msg,pending:pending()});

  async function remoteDoc(p,ref){
    const res=await fetch(API+'/contents/data/'+p+'.json'+(ref?'?ref='+encodeURIComponent(ref):''),{headers:H});
    if(res.status===404)return null;if(!res.ok)throw httpErr(res);
    const j=await res.json();return{d:JSON.parse(b64d(j.content)),s:j.sha};
  }
  function httpErr(res){const e=new Error('HTTP '+res.status);e.http=res.status;return e}
  const idsOf=d=>d&&d.e?d.e.map(e=>e.i):undefined;
  async function push(){
    let n=0;
    for(const p of [...docs.keys()]){
      let r=docs.get(p);if(!r||!r.x)continue;let v=r.v,merged=false;
      const put=()=>fetch(API+'/contents/data/'+p+'.json',{method:'PUT',headers:H,body:JSON.stringify(Object.assign({message:'Krypto: '+p,content:b64e(JSON.stringify(r.d))},r.s?{sha:r.s}:{}))});
      let res=await put();
      if(res.status===409||res.status===422){
        const rem=await remoteDoc(p);
        r=docs.get(p)||r;                       /* jüngster lokaler Stand, falls du zwischendurch etwas geändert hast */
        if(rem){if(p.startsWith('orders/')){r.d=mergeMonth(r.d,rem.d,r.b);merged=true}r.s=rem.s}else r.s=null;
        if(merged)r.v=(r.v||0)+1;v=r.v;
        res=await put();
      }
      if(!res.ok)throw httpErr(res);
      const j=await res.json(),cur=docs.get(p)||r;cur.s=j.content.sha;if(cur.v===v){cur.x=0;cur.pt=Date.now();cur.b=idsOf(cur.d)}persist(p);n++;
      if(merged)notify([p],'modified');
    }
    return n;
  }
  async function pull(){
    const res=await fetch(API+'/git/trees/'+encodeURIComponent(cfg.branch||'main')+'?recursive=1',{headers:H});
    if(res.status===409)return[];           // leeres Repository
    if(!res.ok)throw httpErr(res);
    const t=await res.json();
    const todo=(t.tree||[]).filter(x=>x.type==='blob'&&/^data\/.+\.json$/.test(x.path)).map(x=>({p:x.path.slice(5,-5),sha:x.sha})).filter(x=>{const l=docs.get(x.p);return !(l&&(l.x||l.s===x.sha||(l.pt&&Date.now()-l.pt<30000)))});
    const changed=[];
    for(let i=0;i<todo.length;i+=6){
      await Promise.all(todo.slice(i,i+6).map(async x=>{const rd=await remoteDoc(x.p,cfg.branch);if(!rd)return;const l=docs.get(x.p);if(l&&l.x)return;docs.set(x.p,{d:rd.d,s:rd.s,x:0,v:(l&&l.v||0),b:idsOf(rd.d)});persist(x.p);changed.push(x.p)}));
    }
    return changed;
  }
  async function sync(){
    if(syncing)return;syncing=true;status('busy','synchronisiere …');
    try{
      if(!guarded){await repoCheck(cfg,cfg.branch);guarded=true}
      const pushed=await push();const changed=pushed&&firstDone?[]:await pull();
      const first=!synced;synced=true;
      if(first||!firstDone){firstDone=true;subs.forEach(s=>{if(s.kind==='doc')s.fn(mkDoc(s.p));else s.fn(mkCol(s.c,changed.filter(p=>p.startsWith(s.c+'/')),'modified'))})}
      else if(changed.length)notify(changed,'modified');
      status('ok','synchron');
    }catch(e){
      if(!firstDone){firstDone=true;subs.forEach(s=>{s.kind==='doc'?s.fn(mkDoc(s.p)):s.fn(mkCol(s.c))})}
      if(e&&e.wrong){wrongRepo=true;status('error','Falsches Repository, nichts wird gespeichert')}
      else if(e&&(e.http===401||e.http===403))status('auth','Token ungültig oder ohne Rechte');
      else if(e&&e.http)status('error','GitHub-Fehler '+e.http);
      else status('offline',pending()?pending()+' Änderungen warten auf Internet':'offline');
    }finally{syncing=false}
  }
  function scheduleFlush(){if(wrongRepo)return;clearTimeout(flushT);flushT=setTimeout(sync,500)}
  const hasCache=docs.size>0;
  const db={
    doc:p=>({
      get:async()=>mkDoc(p),
      set:async d=>{const o=docs.get(p);docs.set(p,{d:clone(d),s:o?o.s:null,x:1,v:(o?o.v:0)+1,b:o?o.b:undefined,pt:o?o.pt:undefined});persist(p);notify([p],'modified');status('dirty','wird gespeichert …');scheduleFlush()},
      onSnapshot:fn=>{const s={kind:'doc',p,fn};subs.push(s);if(hasCache||firstDone)setTimeout(()=>fn(mkDoc(p)),0);return()=>{const i=subs.indexOf(s);if(i>=0)subs.splice(i,1)}}
    }),
    collection:c=>({
      onSnapshot:fn=>{const s={kind:'col',c,fn};subs.push(s);if(hasCache||firstDone)setTimeout(()=>fn(mkCol(c)),0);return()=>{const i=subs.indexOf(s);if(i>=0)subs.splice(i,1)}}
    }),
    sync,pending,
    startSync(){sync();setInterval(()=>{if(!document.hidden)sync()},60000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)sync()});window.addEventListener('online',sync)}
  };
  return db;
}

/* ----- Dateien speichern (Handy: Teilen-Menü, PC: Download) ----- */
async function saveFile(name,data,toast){
  try{
    const mime=/\.pdf$/i.test(name)?'application/pdf':/\.csv$/i.test(name)?'text/csv':/\.json$/i.test(name)?'application/json':'application/octet-stream';
    let bytes=typeof data==='string'?new TextEncoder().encode(data):data instanceof ArrayBuffer?new Uint8Array(data):data;
    if(isNative()){
      let bin='';for(let i=0;i<bytes.length;i+=0x8000)bin+=String.fromCharCode.apply(null,bytes.subarray(i,i+0x8000));
      const FS=window.Capacitor.registerPlugin('Filesystem'),SH=window.Capacitor.registerPlugin('Share');
      const r=await FS.writeFile({path:name,data:btoa(bin),directory:'CACHE'});
      await SH.share({title:name,url:r.uri,dialogTitle:'Speichern, öffnen oder drucken'});
    }else{
      const url=URL.createObjectURL(new Blob([bytes],{type:mime}));const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),4000);
    }
  }catch(e){if(!(e&&/cancel/i.test(String(e.message||e))))toast&&toast('Speichern nicht möglich: '+((e&&e.message)||e))}
}
window.KBX={isNative,ghLoad,ghSave,ghClear,ghConnect,ghMake,makeCode,parseCode,saveFile,mergeMonth,b64e,b64d};
})();
