/* Design: System/Hell/Dunkel und Farbschemata – gemeinsam für Haushaltsbuch und Krypto-Buch (gleicher Speicher: hb-theme) */
(function(){
const KEY='hb-theme';
const ld=()=>{try{const j=JSON.parse(localStorage.getItem(KEY)||'null');return j&&typeof j==='object'?j:{}}catch(e){return{}}};
const sv=o=>{try{localStorage.setItem(KEY,JSON.stringify(o))}catch(e){}};
/* Je Schema: [Hintergrund, Karte, Text, gedämpft, Linie, Akzent, Akzent-Text, weiche Fläche] für hell und dunkel */
const P={
 standard:{n:'Standard',sw:['#0E6B5B','#F2F4F3']},
 ozean:{n:'Ozean',l:['#EDF3F9','#FFFFFF','#13202E','#586878','#D3DEE9','#1F5FA8','#FFFFFF','#E0EAF4'],d:['#0C1520','#142130','#E3ECF5','#92A4B8','#243649','#6AA8F0','#0A1420','#1B2D42']},
 wald:{n:'Wald',l:['#EFF3EC','#FBFDF9','#18241A','#5C6A5C','#D6DFD1','#2F6B2F','#FFFFFF','#E1EBDC'],d:['#0E140F','#162018','#E4ECE2','#98A596','#273428','#7CC77C','#0C140C','#1E2D20']},
 sonne:{n:'Sonnenuntergang',l:['#FAF2EC','#FFFFFF','#2A1A14','#76604F','#EBDCD0','#C4501B','#FFFFFF','#F6E4D8'],d:['#17100C','#221812','#F2E6DE','#B39C8B','#3A2A20','#F28A52','#1A0E08','#33241A']},
 lavendel:{n:'Lavendel',l:['#F3F0F8','#FFFFFF','#1F1830','#675F7C','#DDD6EA','#6B46C1','#FFFFFF','#E8E1F5'],d:['#120F1A','#1C1727','#E9E4F3','#A29AB8','#2E2740','#B397F0','#150F22','#272037']},
 rose:{n:'Rosé',l:['#FAF0F3','#FFFFFF','#2A1520','#7A5A68','#EBD6DE','#C2255C','#FFFFFF','#F7E1E9'],d:['#180F13','#231820','#F4E5EB','#B89AA8','#3B2630','#F06595','#1C0B13','#33202B']},
 graphit:{n:'Graphit',l:['#F1F2F4','#FFFFFF','#1B1E23','#5F6670','#D9DCE1','#3B4A63','#FFFFFF','#E4E7EC'],d:['#111316','#1A1D22','#E6E8EB','#9AA1AB','#2B3037','#8FA6C8','#0E131B','#232830']},
 sepia:{n:'Sepia',l:['#F4EEDF','#FBF7EC','#2E2618','#7A6C52','#E2D8C0','#8A5A1B','#FFFFFF','#EBE2CC'],d:['#16120A','#201A10','#EFE6D2','#B3A488','#352C1B','#D9A24E','#1A1206','#2D2516']},
 amoled:{n:'AMOLED-Schwarz',l:['#F2F4F3','#FFFFFF','#15201C','#5E6B66','#DCE2DF','#0E6B5B','#FFFFFF','#E4EEEB'],d:['#000000','#0B0D0C','#E8EEEB','#8C9893','#1D2421','#4DBFA3','#06100C','#131A17']}
};
const V=['--bg','--surface','--ink','--muted','--line','--accent','--accent-ink','--soft'];
const rule=a=>V.map((k,i)=>k+':'+a[i]).join(';')+';--c1:'+a[5];
function css(){let o='';for(const id in P){const p=P[id];if(!p.l)continue;
  o+=`:root[data-pal="${id}"]{${rule(p.l)}}`;
  o+=`@media (prefers-color-scheme: dark){:root[data-pal="${id}"]:not([data-theme="light"]){${rule(p.d)}}}`;
  o+=`:root[data-pal="${id}"][data-theme="dark"]{${rule(p.d)}}`}
  return o}
function apply(){const t=ld(),r=document.documentElement;
  if(t.m==='light'||t.m==='dark')r.setAttribute('data-theme',t.m);else r.removeAttribute('data-theme');
  if(t.p&&t.p!=='standard'&&P[t.p])r.setAttribute('data-pal',t.p);else r.removeAttribute('data-pal')}
const st=document.createElement('style');st.id='pal-css';st.textContent=css();(document.head||document.documentElement).appendChild(st);
apply();
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const dark=()=>{const t=ld();return t.m==='dark'||(t.m!=='light'&&window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches)};
const TH=window.THEME={apply,
 html(){const t=ld(),m=t.m||'system',p=t.p||'standard';
  const sw=id=>{const q=P[id],c=id==='standard'?P.standard.sw:null,l=q.l,d=q.d,a=id==='standard'?(dark()?['#4DBFA3','#0F1412']:c):(dark()?[d[5],d[0]]:[l[5],l[0]]);
    return`<button type="button" class="thsw ${p===id?'on':''}" data-th-p="${id}" aria-label="${esc(q.n)}" title="${esc(q.n)}"><span class="thc" style="background:${a[1]};border-color:${a[0]}"><i style="background:${a[0]}"></i></span><span class="thn">${esc(q.n)}</span></button>`};
  return`<div class="card" id="th-box"><h3>Design</h3><div class="field"><label>Hell oder dunkel</label><div class="seg">${[['system','System'],['light','Hell'],['dark','Dunkel']].map(([k,l])=>`<button type="button" class="${m===k?'on':''}" data-th-m="${k}">${l}</button>`).join('')}</div></div><div class="field"><label>Farbschema</label><div class="thgrid">${Object.keys(P).map(sw).join('')}</div></div></div>`},
 set(o){const t=Object.assign(ld(),o);sv(t);apply();const b=document.getElementById('th-box');if(b){const n=document.createElement('div');n.innerHTML=TH.html();b.replaceWith(n.firstChild)}}};
const cs=document.createElement('style');cs.textContent='.thgrid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.thsw{display:flex;flex-direction:column;align-items:center;gap:4px;background:transparent;border:0;padding:4px 0;color:var(--muted);font-size:11px;cursor:pointer}.thsw .thc{width:44px;height:44px;border-radius:50%;border:2px solid;display:flex;align-items:center;justify-content:center}.thsw .thc i{width:22px;height:22px;border-radius:50%;display:block}.thsw.on{color:var(--ink);font-weight:700}.thsw.on .thc{box-shadow:0 0 0 3px var(--surface),0 0 0 5px var(--accent)}.thn{text-align:center;line-height:1.15}';(document.head||document.documentElement).appendChild(cs);
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-th-m],[data-th-p]');if(!b)return;if(b.dataset.thM)TH.set({m:b.dataset.thM});else TH.set({p:b.dataset.thP})});
if(window.matchMedia)try{matchMedia('(prefers-color-scheme: dark)').addEventListener('change',()=>{const b=document.getElementById('th-box');if(b){const n=document.createElement('div');n.innerHTML=TH.html();b.replaceWith(n.firstChild)}})}catch(e){}
})();
