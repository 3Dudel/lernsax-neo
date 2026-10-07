const $=s=>document.querySelector(s);
const API='https://www.lernsax.de/jsonrpc.php';
let sess=JSON.parse(sessionStorage.getItem('ls_sess')||'null');
let cur=null;

function endpoint(){const p=localStorage.getItem('ls_proxy');return p?p+(p.includes('?')?'&':'?')+'url='+encodeURIComponent(API):API}

async function rpc(calls){
  const body=calls.map((c,i)=>({id:i+1,jsonrpc:'2.0',method:c[0],params:c[1]||{}}));
  const r=await fetch(endpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  return r.json();
}
async function call(method,params){
  const res=await rpc([['login',{}].slice(0,0).length?[]:[method,params]]);
  return res[0];
}

async function login(user,pass){
  const res=await rpc([['login',{login:user,password:pass,get_properties:['name']}]]);
  const r=res[0];
  if(r.error||!r.result||r.result.return!=='OK')throw new Error('Login fehlgeschlagen. Daten prüfen.');
  sess={user,sid:r.result.session_id};
  sessionStorage.setItem('ls_sess',JSON.stringify(sess));
}

async function sCall(method,params){
  const res=await rpc([['set_focus',{object:'messenger'}],[method,params||{}]]);
  return res.find(x=>x.id===2)?.result;
}

async function loadChats(){
  const list=$('#chatList');list.innerHTML='';
  try{
    const r=await sCall('get_state');
    const msgr=await rpc([['set_session',{session_id:sess.sid}],['set_focus',{object:'messenger'}],['get_conversations',{}]]);
    const convs=(msgr[2]?.result?.conversations)||[];
    if(!convs.length)list.innerHTML='<div>Keine Chats gefunden</div>';
    convs.forEach(c=>{const d=document.createElement('div');d.textContent=c.title||c.name||c.id;d.onclick=()=>openChat(c);list.append(d)});
  }catch(e){list.innerHTML='<div>Chats konnten nicht geladen werden (CORS? Proxy in „Erweitert“ eintragen).</div>'}
}

async function openChat(c){
  cur=c;$('#chatHead').textContent=c.title||c.name||c.id;$('.chat').classList.add('open');
  const m=$('#msgs');m.innerHTML='';
  try{
    const r=await rpc([['set_session',{session_id:sess.sid}],['set_focus',{object:'messenger'}],['get_messages',{conversation_id:c.id}]]);
    (r[2]?.result?.messages||[]).forEach(x=>addMsg(x.text||x.message||'',x.from===sess.user))
  }catch(e){addMsg('Fehler beim Laden.',false)}
}
function addMsg(t,me){const d=document.createElement('div');d.className='msg'+(me?' me':'');d.textContent=t;$('#msgs').append(d);d.scrollIntoView()}

async function loadFiles(){
  const f=$('#files');f.innerHTML='';
  try{
    const r=await rpc([['set_session',{session_id:sess.sid}],['set_focus',{object:'files'}],['get_entries',{folder_id:''}]]);
    (r[2]?.result?.entries||[]).forEach(e=>{const d=document.createElement('div');d.textContent=(e.type==='folder'?'📁 ':'📄 ')+e.name;f.append(d)});
    if(!f.children.length)f.innerHTML='<div>Keine Dateien</div>';
  }catch(e){f.innerHTML='<div>Dateien konnten nicht geladen werden.</div>'}
}

// Personalisierung
const defaults={theme:'dark',accent:'#25d366',bg:'#0b141a',bgImg:'',font:'system-ui',radius:14,side:'left'};
let S={...defaults,...JSON.parse(localStorage.getItem('ls_settings')||'{}')};
function applyS(){
  const r=document.documentElement;
  r.dataset.theme=S.theme;r.style.setProperty('--accent',S.accent);r.style.setProperty('--chatbg',S.bg);
  r.style.setProperty('--font',S.font);r.style.setProperty('--radius',S.radius+'px');
  $('.chat').style.backgroundImage=S.bgImg?`url("${S.bgImg}")`:'none';
  $('#app').dataset.side=S.side;
  $('#sTheme').value=S.theme;$('#sAccent').value=S.accent;$('#sBg').value=S.bg;$('#sBgImg').value=S.bgImg.startsWith('data:')?'':S.bgImg;
  $('#sFont').value=S.font;$('#sRadius').value=S.radius;$('#sSide').value=S.side;
  try{localStorage.setItem('ls_settings',JSON.stringify(S))}catch(e){}
}
[['sTheme','theme'],['sAccent','accent'],['sBg','bg'],['sBgImg','bgImg'],['sFont','font'],['sRadius','radius'],['sSide','side']].forEach(([id,k])=>$('#'+id).addEventListener('input',e=>{S[k]=e.target.value;applyS()}));
$('#sBgFile').onchange=e=>{const f=e.target.files[0];if(!f)return;const fr=new FileReader();fr.onload=()=>{S.bgImg=fr.result;applyS()};fr.readAsDataURL(f)};
$('#sReset').onclick=()=>{S={...defaults};applyS()};

document.querySelectorAll('.side [data-tab]').forEach(b=>b.onclick=()=>{
  document.querySelectorAll('.side button').forEach(x=>x.classList.remove('active'));b.classList.add('active');
  document.querySelectorAll('.tab').forEach(t=>t.classList.add('hidden'));$('#tab-'+b.dataset.tab).classList.remove('hidden');
  if(b.dataset.tab==='cloud')loadFiles();
});

$('#sendForm').onsubmit=async e=>{
  e.preventDefault();const t=$('#msgIn').value.trim();if(!t||!cur)return;
  addMsg(t,true);$('#msgIn').value='';
  try{await rpc([['set_session',{session_id:sess.sid}],['set_focus',{object:'messenger'}],['send_message',{conversation_id:cur.id,text:t}]])}catch(e){}
};

$('#loginForm').onsubmit=async e=>{
  e.preventDefault();$('#err').textContent='';
  const p=$('#proxy').value.trim();if(p)localStorage.setItem('ls_proxy',p);
  try{await login($('#user').value.trim(),$('#pass').value);showApp()}
  catch(err){$('#err').textContent=(err.message==='Failed to fetch'?'Verbindung blockiert (CORS). Trage unter „Erweitert“ eine Proxy-URL ein.':err.message)}
};
$('#logout').onclick=()=>{sessionStorage.removeItem('ls_sess');location.reload()};

function showApp(){$('#login').classList.add('hidden');$('#app').classList.remove('hidden');applyS();loadChats()}
applyS();
if(sess)showApp();
