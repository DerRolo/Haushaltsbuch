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
async function ghConnect(c){
  const res=await fetch('https://api.github.com/repos/'+encodeURIComponent(c.owner)+'/'+encodeURIComponent(c.repo),{headers:{Authorization:'Bearer '+c.token,Accept:'application/vnd.github+json'}});
  if(res.status===401)throw new Error('Der Token ist ungültig oder abgelaufen.');
  if(res.status===404)throw new Error('Repository nicht gefunden. Name oder Token-Zugriff prüfen.');
  if(!res.ok)throw new Error('GitHub antwortet mit Fehler '+res.status+'.');
  const j=await res.json();
  if(!j.permissions||!j.permissions.push)throw new Error('Der Token darf in diesem Repository nicht schreiben („Contents: Read and write“ fehlt).');
  if(!j.private)throw new Error('Das Daten-Repository ist öffentlich. Bitte auf „Private“ stellen, sonst kann jeder deine Finanzdaten lesen.');
  const out={owner:c.owner,repo:c.repo,token:c.token,branch:j.default_branch||'main'};
  ghSave(out);return out;
}

/* ----- Datenbank-Adapter ----- */
function mergeMonth(local,remote){
  const m=new Map();(remote&&remote.e||[]).forEach(e=>m.set(e.i,e));(local&&local.e||[]).forEach(e=>m.set(e.i,e));
  return{e:[...m.values()].sort((a,b)=>a.d<b.d?-1:a.d>b.d?1:0)};
}
function ghMake(cfg,onStatus){
  const API='https://api.github.com/repos/'+cfg.owner+'/'+cfg.repo;
  const H={Authorization:'Bearer '+cfg.token,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'};
  const docs=new Map(),subs=[];
  let synced=false,syncing=false,flushT=null,firstDone=false;
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
  async function push(){
    for(const [p,r] of [...docs]){
      if(!r.x)continue;const v=r.v;let merged=false;
      const put=()=>fetch(API+'/contents/data/'+p+'.json',{method:'PUT',headers:H,body:JSON.stringify(Object.assign({message:'Krypto: '+p,content:b64e(JSON.stringify(r.d))},r.s?{sha:r.s}:{}))});
      let res=await put();
      if(res.status===409||res.status===422){
        const rem=await remoteDoc(p);
        if(rem){if(p.startsWith('orders/')){r.d=mergeMonth(r.d,rem.d);merged=true}r.s=rem.s}else r.s=null;
        res=await put();
      }
      if(!res.ok)throw httpErr(res);
      const j=await res.json();r.s=j.content.sha;if(r.v===v)r.x=0;persist(p);
      if(merged)notify([p],'modified');
    }
  }
  async function pull(){
    const res=await fetch(API+'/git/trees/'+encodeURIComponent(cfg.branch||'main')+'?recursive=1',{headers:H});
    if(res.status===409)return[];           // leeres Repository
    if(!res.ok)throw httpErr(res);
    const t=await res.json();
    const todo=(t.tree||[]).filter(x=>x.type==='blob'&&/^data\/.+\.json$/.test(x.path)).map(x=>({p:x.path.slice(5,-5),sha:x.sha})).filter(x=>{const l=docs.get(x.p);return !(l&&(l.x||l.s===x.sha))});
    const changed=[];
    for(let i=0;i<todo.length;i+=6){
      await Promise.all(todo.slice(i,i+6).map(async x=>{const rd=await remoteDoc(x.p,cfg.branch);if(!rd)return;const l=docs.get(x.p);if(l&&l.x)return;docs.set(x.p,{d:rd.d,s:rd.s,x:0,v:(l&&l.v||0)});persist(x.p);changed.push(x.p)}));
    }
    return changed;
  }
  async function sync(){
    if(syncing)return;syncing=true;status('busy','synchronisiere …');
    try{
      await push();const changed=await pull();
      const first=!synced;synced=true;
      if(first||!firstDone){firstDone=true;subs.forEach(s=>{if(s.kind==='doc')s.fn(mkDoc(s.p));else s.fn(mkCol(s.c,changed.filter(p=>p.startsWith(s.c+'/')),'modified'))})}
      else if(changed.length)notify(changed,'modified');
      status('ok','synchron');
    }catch(e){
      if(!firstDone){firstDone=true;subs.forEach(s=>{s.kind==='doc'?s.fn(mkDoc(s.p)):s.fn(mkCol(s.c))})}
      if(e&&(e.http===401||e.http===403))status('auth','Token ungültig oder ohne Rechte');
      else if(e&&e.http)status('error','GitHub-Fehler '+e.http);
      else status('offline',pending()?pending()+' Änderungen warten auf Internet':'offline');
    }finally{syncing=false}
  }
  function scheduleFlush(){clearTimeout(flushT);flushT=setTimeout(sync,900)}
  const hasCache=docs.size>0;
  const db={
    doc:p=>({
      get:async()=>mkDoc(p),
      set:async d=>{const o=docs.get(p);docs.set(p,{d:clone(d),s:o?o.s:null,x:1,v:(o?o.v:0)+1});persist(p);notify([p],'modified');status('dirty',pending()+' Änderungen noch nicht hochgeladen');scheduleFlush()},
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
