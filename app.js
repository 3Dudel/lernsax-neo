const DEF={theme:'dark',accent:'#25d366',wall:'',font:'system-ui,sans-serif',radius:14,rail:'left',compact:false,name:'Ich'};
let S=Object.assign({},DEF,JSON.parse(localStorage.getItem('lsneo')||'{}'));
const save=()=>{localStorage.setItem('lsneo',JSON.stringify(S));apply()};
function apply(){const r=document.documentElement.style,b=document.body;r.setProperty('--accent',S.accent);r.setProperty('--radius',S.radius+'px');r.setProperty('--font',S.font);r.setProperty('--wall',S.wall?`url("${S.wall}")`:'none');b.classList.toggle('light',S.theme==='light');b.classList.toggle('rail-right',S.rail==='right');b.classList.toggle('compact',S.compact)}
const chats=JSON.parse(localStorage.getItem('lsneo-chats')||'null')||[
{id:1,name:'Klasse 10b',av:'🎓',msgs:[{f:'Frau Müller',t:'Morgen bitte Mathebuch mitbringen!',h:'08:12'},{f:'Lena',t:'Alles klar 👍',h:'08:15'}]},
{id:2,name:'Mathe – Herr Schmidt',av:'📐',msgs:[{f:'Herr Schmidt',t:'Hausaufgabe: S. 42 Nr. 3–5',h:'Gestern'}]},
{id:3,name:'Projektgruppe Bio',av:'🧬',msgs:[{f:'Tom',t:'Wer macht die Präsentation?',h:'Mo'},{f:'Ich',t:'Ich übernehme Folie 1–4',h:'Mo'}]},
{id:4,name:'Schulleitung',av:'🏫',msgs:[{f:'Schulleitung',t:'Info: Wandertag am Freitag 🥾',h:'So'}]}];
const saveChats=()=>localStorage.setItem('lsneo-chats',JSON.stringify(chats));
const files=[['📁','Mathe','12 Dateien'],['📁','Deutsch','8 Dateien'],['📁','Biologie','5 Dateien'],['📄','Referat.docx','220 KB'],['🖼️','Klassenfoto.jpg','3,1 MB'],['📊','Noten.xlsx','40 KB'],['📕','Arbeitsblatt.pdf','1,2 MB']];
let tasks=JSON.parse(localStorage.getItem('lsneo-tasks')||'null')||[{t:'Mathe S. 42',d:false},{t:'Bio-Präsentation',d:false},{t:'Deutsch Aufsatz',d:true}];
let cur=1;const main=document.getElementById('main');
const esc=s=>s.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const V={
chats(){main.innerHTML=`<section class="list"><header>Chats</header><input class="search" placeholder="🔍 Suchen…" oninput="filt(this.value)"><div id="cl"></div></section><section class="chat" id="ch"></section>`;renderList('');openChat(cur)},
cloud(){main.innerHTML=`<div class="page"><h1>☁️ Meine Cloud</h1><div class="drop" id="dr">Dateien hierher ziehen oder <label class="btn">hochladen<input type="file" hidden multiple onchange="addF(this.files)"></label></div><div class="grid" id="fg"></div></div>`;rf();const d=document.getElementById('dr');d.ondragover=e=>e.preventDefault();d.ondrop=e=>{e.preventDefault();addF(e.dataTransfer.files)}},
tasks(){main.innerHTML=`<div class="page"><h1>✅ Aufgaben</h1><div class="card" style="display:flex;gap:8px"><input type="text" id="nt" placeholder="Neue Aufgabe…" style="flex:1;padding:10px;border:0;border-radius:8px;background:var(--panel2);color:var(--text)"><button class="btn" onclick="addT()">+</button></div><div id="tl"></div></div>`;rt()},
calendar(){const n=new Date(),y=n.getFullYear(),mo=n.getMonth(),first=(new Date(y,mo,1).getDay()+6)%7,days=new Date(y,mo+1,0).getDate();let h='';['Mo','Di','Mi','Do','Fr','Sa','So'].forEach(d=>h+=`<b style="text-align:center">${d}</b>`);for(let i=0;i<first;i++)h+='<div></div>';for(let d=1;d<=days;d++){h+=`<div class="day ${d===n.getDate()?'today':''}">${d}${d%9===0?'<div class="ev">Klausur</div>':''}${d%7===3?'<div class="ev">Wandertag</div>':''}</div>`}main.innerHTML=`<div class="page"><h1>📅 ${n.toLocaleString('de',{month:'long',year:'numeric'})}</h1><div class="cal">${h}</div></div>`},
settings(){const cols=['#25d366','#0a84ff','#ff375f','#ff9f0a','#bf5af2','#30d158','#64d2ff','#ff6b6b','#ffd60a'];const walls=[['Keiner',''],['Berge','https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600'],['Meer','https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600'],['Wald','https://images.unsplash.com/photo-1448375240586-882707db888b?w=1600'],['Nacht','https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1600']];
main.innerHTML=`<div class="page"><h1>🎨 Personalisieren</h1>
<div class="card"><label>Design</label><select onchange="S.theme=this.value;save()"><option value="dark" ${S.theme==='dark'?'selected':''}>Dunkel</option><option value="light" ${S.theme==='light'?'selected':''}>Hell</option></select>
<label>Akzentfarbe</label><div class="swatches">${cols.map(c=>`<div class="sw" style="background:${c}" onclick="S.accent='${c}';save()"></div>`).join('')}<input type="color" value="${S.accent}" oninput="S.accent=this.value;save()"></div></div>
<div class="card"><label>Chat-Hintergrund</label><select onchange="S.wall=this.value;save()">${walls.map(w=>`<option value="${w[1]}" ${S.wall===w[1]?'selected':''}>${w[0]}</option>`).join('')}</select><label>Eigene Bild-URL</label><input type="text" value="${esc(S.wall)}" onchange="S.wall=this.value;save()"><label>…oder eigenes Bild hochladen</label><input type="file" accept="image/*" onchange="upW(this.files[0])"></div>
<div class="card"><label>Schriftart</label><select onchange="S.font=this.value;save()">${[['System','system-ui,sans-serif'],['Serif','Georgia,serif'],['Mono','ui-monospace,monospace'],['Rund','\'Comic Sans MS\',cursive']].map(f=>`<option value="${f[1]}" ${S.font===f[1]?'selected':''}>${f[0]}</option>`).join('')}</select>
<label>Eckenradius: ${S.radius}px</label><input type="range" min="0" max="28" value="${S.radius}" onchange="S.radius=+this.value;save();V.settings()" style="width:100%"></div>
<div class="card"><label>Anordnung der Seitenleiste</label><select onchange="S.rail=this.value;save()"><option value="left" ${S.rail==='left'?'selected':''}>Links</option><option value="right" ${S.rail==='right'?'selected':''}>Rechts</option></select>
<label><input type="checkbox" ${S.compact?'checked':''} onchange="S.compact=this.checked;save()"> Kompakte Liste</label>
<label>Dein Name</label><input type="text" value="${esc(S.name)}" onchange="S.name=this.value;save()"></div>
<button class="btn" onclick="if(confirm('Alles zurücksetzen?')){localStorage.clear();location.reload()}">Zurücksetzen</button></div>`}};
function renderList(q){document.getElementById('cl').innerHTML=chats.filter(c=>c.name.toLowerCase().includes(q.toLowerCase())).map(c=>{const l=c.msgs[c.msgs.length-1];return`<div class="item ${c.id===cur?'sel':''}" onclick="openChat(${c.id})"><div class="av">${c.av}</div><div class="t"><b>${c.name}</b><small>${esc(l.f)}: ${esc(l.t)}</small></div><small>${l.h}</small></div>`}).join('')}
window.filt=q=>renderList(q);
window.openChat=id=>{cur=id;const c=chats.find(x=>x.id===id);renderList(document.querySelector('.search')?.value||'');document.getElementById('ch').innerHTML=`<header>${c.av} ${c.name}</header><div class="msgs" id="ms">${c.msgs.map(m=>`<div class="m ${m.f==='Ich'?'me':''}">${m.f!=='Ich'?`<b style="color:var(--accent);font-size:13px">${esc(m.f)}</b><br>`:''}${esc(m.t)}<small>${m.h}</small></div>`).join('')}</div><form class="composer" onsubmit="send(event)"><input id="mi" placeholder="Nachricht schreiben…" autocomplete="off"><button class="btn">➤</button></form>`;const ms=document.getElementById('ms');ms.scrollTop=ms.scrollHeight};
window.send=e=>{e.preventDefault();const i=document.getElementById('mi');if(!i.value.trim())return;chats.find(x=>x.id===cur).msgs.push({f:'Ich',t:i.value,h:new Date().toTimeString().slice(0,5)});saveChats();openChat(cur)};
function rf(){document.getElementById('fg').innerHTML=files.map(f=>`<div class="file"><div class="ic">${f[0]}</div><b>${esc(f[1])}</b><br><small>${f[2]}</small></div>`).join('')}
window.addF=fl=>{[...fl].forEach(f=>files.push(['📄',f.name,(f.size/1024).toFixed(0)+' KB']));rf()};
function rt(){document.getElementById('tl').innerHTML=tasks.map((t,i)=>`<div class="card task ${t.d?'done':''}"><input type="checkbox" ${t.d?'checked':''} onchange="tasks[${i}].d=this.checked;st()"><span>${esc(t.t)}</span></div>`).join('')}
window.st=()=>{localStorage.setItem('lsneo-tasks',JSON.stringify(tasks));rt()};
window.addT=()=>{const v=document.getElementById('nt').value.trim();if(v){tasks.unshift({t:v,d:false});st()}};
window.upW=f=>{if(!f)return;const r=new FileReader();r.onload=()=>{S.wall=r.result;try{save()}catch(e){alert('Bild zu groß')}};r.readAsDataURL(f)};
window.V=V;window.S=S;window.save=save;window.tasks=tasks;
document.querySelectorAll('#rail button').forEach(b=>b.onclick=()=>{document.querySelectorAll('#rail button').forEach(x=>x.classList.remove('active'));b.classList.add('active');V[b.dataset.view]()});
apply();V.chats();
