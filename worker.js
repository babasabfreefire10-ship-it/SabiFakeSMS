
const APP_NAME = "SABI FakeSMS";
const MAX_MESSAGE_LENGTH = 500;
const MAX_SENDS_PER_DAY = 20;

const HTML = String.raw`<!doctype html>
<html lang="sq">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#080b09">
<title>SABI FakeSMS</title>
<style>
*{box-sizing:border-box}
body{margin:0;background:#080b09;color:#f2fff7;font:15px system-ui,sans-serif}
main{max-width:720px;margin:auto;padding:22px}
.brand{color:#00ff88;font-weight:900;font-size:25px;letter-spacing:1px}
.sub{color:#9aa9a0;margin-top:4px}
.card{background:#111713;border:1px solid #26362c;border-radius:18px;padding:18px;margin-top:18px}
label{display:block;margin:14px 0 7px;color:#b6c9bc}
input,textarea{width:100%;padding:14px;border-radius:11px;border:1px solid #34463a;background:#080d0a;color:white;font:inherit}
textarea{min-height:125px;resize:vertical}
button{background:#00ff88;color:#06130b;border:0;border-radius:11px;padding:14px;font-weight:800;font-size:15px;width:100%;margin-top:14px;cursor:pointer}
button:disabled{opacity:.5}
.secondary{background:#26362c;color:white}
.status{padding:12px;border-radius:10px;margin-top:14px;overflow-wrap:anywhere}
.ok{background:#103b25;color:#a8ffca}.err{background:#431b20;color:#ffc2c7}
.small{font-size:12px;color:#9aa9a0;line-height:1.5}
.item{padding:12px 0;border-bottom:1px solid #29372e;overflow-wrap:anywhere}
.pill{font-size:12px;color:#00ff88}
.top{display:flex;align-items:center;justify-content:space-between;gap:12px}
#logout{width:auto;margin:0;padding:10px}
</style>
</head>
<body><main>
<div class="top"><div><div class="brand">SABI FakeSMS</div><div class="sub">SMS control panel</div></div><button id="logout" class="secondary">Dil</button></div>
<div class="card">
<h2>Dërgo SMS</h2>
<div class="small">Dërgo vetëm te persona që presin mesazhin tënd ose kanë dhënë pëlqimin. Numri i dërguesit caktohet nga ofruesi.</div>
<label for="phone">Numri i telefonit</label>
<input id="phone" type="tel" placeholder="+3556XXXXXXXX" autocomplete="tel">
<label for="message">Mesazhi</label>
<textarea id="message" maxlength="500" placeholder="Shkruaj mesazhin..."></textarea>
<div class="small"><span id="count">0</span>/500 karaktere</div>
<button id="send">Dërgo SMS</button>
<div id="result" aria-live="polite"></div>
</div>
<div class="card"><div class="top"><h2>Historiku</h2><button id="refresh" class="secondary" style="width:auto">Rifresko</button></div><div id="history" class="small">Po ngarkohet...</div></div>
<p class="small">SABI FakeSMS · Dërgimi real varet nga API-ja, krediti dhe operatori celular.</p>
</main>
<script>
const $=id=>document.getElementById(id);
const token=localStorage.getItem("sabi_token");
if(!token) location.replace("/login");
$("logout").onclick=()=>{localStorage.removeItem("sabi_token");location.replace("/login")};
$("message").oninput=()=>$("count").textContent=$("message").value.length;
async function api(path,options={}){
 const r=await fetch(path,{...options,headers:{"Content-Type":"application/json","Authorization":"Bearer "+token,...options.headers}});
 const d=await r.json().catch(()=>({error:"Përgjigje e pavlefshme nga serveri"}));
 if(r.status===401){localStorage.removeItem("sabi_token");location.replace("/login");throw Error("Hyr përsëri.");}
 if(!r.ok)throw Error(d.error||"Gabim.");
 return d;
}
$("send").onclick=async()=>{
 const phone=$("phone").value.trim(),message=$("message").value.trim();
 if(!phone||!message){show("Plotëso numrin dhe mesazhin.",false);return}
 if(!confirm("Dëshiron ta dërgosh këtë SMS realisht te "+phone+"?"))return;
 $("send").disabled=true;$("send").textContent="Duke dërguar...";
 try{
  const d=await api("/api/send",{method:"POST",body:JSON.stringify({phone,message})});
  show(d.message||"Kërkesa u pranua nga ofruesi.",true);
  $("message").value="";$("count").textContent="0";await history();
 }catch(e){show(e.message,false)}
 finally{$("send").disabled=false;$("send").textContent="Dërgo SMS"}
};
function show(msg,ok){const el=$("result");el.className="status "+(ok?"ok":"err");el.textContent=msg}
async function history(){
 try{
  const d=await api("/api/history");
  const root=$("history");root.replaceChildren();
  if(!d.items.length){root.textContent="Nuk ka mesazhe ende.";return}
  d.items.forEach(x=>{
   const div=document.createElement("div");div.className="item";
   const line=document.createElement("div");line.textContent=x.phone+" · "+x.status;
   const msg=document.createElement("div");msg.textContent=x.message;
   const date=document.createElement("div");date.className="small";date.textContent=x.date;
   div.append(line,msg,date);root.append(div);
  });
 }catch(e){$("history").textContent=e.message}
}
$("refresh").onclick=history;history();
</script>
</body></html>`;

const LOGIN = String.raw`<!doctype html><html lang="sq"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#080b09"><title>Hyr · SABI FakeSMS</title>
<style>
*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;background:#080b09;color:#f2fff7;font:16px system-ui}
main{width:min(420px,92vw);padding:25px;background:#111713;border:1px solid #26362c;border-radius:20px}
h1{color:#00ff88}label{display:block;margin:15px 0 7px}input,button{width:100%;padding:14px;border-radius:10px;font:inherit}input{background:#080d0a;color:white;border:1px solid #34463a}button{margin-top:18px;background:#00ff88;color:#06130b;border:0;font-weight:800}#err{color:#ff9aa4}
</style></head><body><main><h1>SABI FakeSMS</h1><p>Panel privat i dërgimit SMS</p>
<form id="f"><label>Fjalëkalimi</label><input id="p" type="password" required autocomplete="current-password"><button>Hyr në panel</button><p id="err"></p></form>
</main><script>
document.getElementById("f").onsubmit=async e=>{
 e.preventDefault();const b=e.target.querySelector("button");b.disabled=true;
 try{
  const r=await fetch("/api/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({password:document.getElementById("p").value})});
  const d=await r.json();if(!r.ok)throw Error(d.error||"Hyrja dështoi");
  localStorage.setItem("sabi_token",d.token);location.replace("/");
 }catch(x){document.getElementById("err").textContent=x.message}
 finally{b.disabled=false}
};
</script></body></html>`;

function json(data,status=200){
 return new Response(JSON.stringify(data),{status,headers:{
  "Content-Type":"application/json; charset=utf-8",
  "Cache-Control":"no-store",
  "X-Content-Type-Options":"nosniff"
 }});
}
function randomToken(){
 const a=new Uint8Array(32);crypto.getRandomValues(a);
 return btoa(String.fromCharCode(...a)).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
}
async function sign(value,secret){
 const key=await crypto.subtle.importKey("raw",new TextEncoder().encode(secret),{name:"HMAC",hash:"SHA-256"},false,["sign"]);
 const sig=await crypto.subtle.sign("HMAC",key,new TextEncoder().encode(value));
 return btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
}
async function makeToken(secret){
 const payload=btoa(JSON.stringify({exp:Date.now()+8*60*60*1000,n:randomToken()})).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
 return payload+"."+await sign(payload,secret);
}
async function authorized(request,env){
 const h=request.headers.get("Authorization")||"";
 const token=h.startsWith("Bearer ")?h.slice(7):"";
 const parts=token.split(".");
 if(parts.length!==2||!env.SESSION_SECRET)return false;
 const expected=await sign(parts[0],env.SESSION_SECRET);
 if(expected!==parts[1])return false;
 try{
  const payload=JSON.parse(atob(parts[0].replace(/-/g,"+").replace(/_/g,"/")));
  return payload.exp>Date.now();
 }catch{return false}
}
async function readBody(request){
 const len=Number(request.headers.get("Content-Length")||0);
 if(len>10000)throw Error("Kërkesa është shumë e madhe.");
 return request.json();
}
async function handleSend(request,env){
 if(!await authorized(request,env))return json({error:"Hyrja ka skaduar. Hyr përsëri."},401);
 if(!env.SMS_HISTORY)return json({error:"Mungon KV binding SMS_HISTORY."},500);
 if(!env.TEXTBELT_API_KEY)return json({error:"Konfiguro secret TEXTBELT_API_KEY."},500);
 let body;try{body=await readBody(request)}catch{return json({error:"Të dhënat nuk janë JSON të vlefshme."},400)}
 const phone=String(body.phone||"").trim();
 const message=String(body.message||"").trim();
 if(!/^\+[1-9]\d{7,14}$/.test(phone))return json({error:"Përdor numër ndërkombëtar, p.sh. +3556XXXXXXXX."},400);
 if(!message||message.length>MAX_MESSAGE_LENGTH)return json({error:"Mesazhi duhet të ketë 1–500 karaktere."},400);
 if(/[\r\n]/.test(phone))return json({error:"Numri nuk është i vlefshëm."},400);
 const day=new Date().toISOString().slice(0,10);
 const key="count:"+day;
 const count=Number(await env.SMS_HISTORY.get(key)||0);
 if(count>=MAX_SENDS_PER_DAY)return json({error:"Është arritur kufiri ditor i aplikacionit."},429);
 let result;
 try{
  const form=new URLSearchParams({phone,message,key:env.TEXTBELT_API_KEY});
  const res=await fetch("https://textbelt.com/text",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:form.toString()});
  result=await res.json();
  if(!res.ok)throw Error("Ofruesi SMS ktheu gabim.");
 }catch{return json({error:"Nuk u lidhëm dot me ofruesin SMS."},502)}
 const success=result.success===true;
 if(success)await env.SMS_HISTORY.put(key,String(count+1),{expirationTtl:3*86400});
 const id=Date.now().toString()+"-"+randomToken().slice(0,8);
 const item={id,phone,message,status:success?"Kërkesa u pranua":"Dështoi",date:new Date().toISOString(),textId:result.textId||null,error:success?null:String(result.error||"Dërgimi dështoi").slice(0,200)};
 await env.SMS_HISTORY.put("sms:"+id,JSON.stringify(item),{expirationTtl:30*86400});
 return json({success,message:success?"SMS iu dorëzua ofruesit. Kontrollo statusin e dorëzimit nëse ofrohet.":("Dërgimi dështoi: "+(result.error||"Gabim nga ofruesi")),quotaRemaining:result.quotaRemaining??null});
}
async function handleHistory(request,env){
 if(!await authorized(request,env))return json({error:"Hyrja ka skaduar."},401);
 if(!env.SMS_HISTORY)return json({error:"Mungon KV binding SMS_HISTORY."},500);
 const list=await env.SMS_HISTORY.list({prefix:"sms:",limit:100});
 const items=[];
 for(const k of list.keys){
  const raw=await env.SMS_HISTORY.get(k.name);
  if(raw)try{items.push(JSON.parse(raw))}catch{}
 }
 items.sort((a,b)=>b.date.localeCompare(a.date));
 return json({items});
}
export default {
 async fetch(request,env){
  const url=new URL(request.url);
  if(request.method==="GET"&&url.pathname==="/login")return new Response(LOGIN,{headers:{"Content-Type":"text/html;charset=utf-8","Cache-Control":"no-store"}});
  if(request.method==="GET"&&url.pathname==="/")return new Response(HTML,{headers:{"Content-Type":"text/html;charset=utf-8","Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}});
  if(request.method==="POST"&&url.pathname==="/api/login"){
   if(!env.APP_PASSWORD||!env.SESSION_SECRET)return json({error:"Konfiguro APP_PASSWORD dhe SESSION_SECRET te Secrets."},500);
   let body;try{body=await readBody(request)}catch{return json({error:"Kërkesë e pavlefshme."},400)}
   if(typeof body.password!=="string"||body.password!==env.APP_PASSWORD)return json({error:"Fjalëkalim i gabuar."},401);
   return json({token:await makeToken(env.SESSION_SECRET)});
  }
  if(request.method==="POST"&&url.pathname==="/api/send")return handleSend(request,env);
  if(request.method==="GET"&&url.pathname==="/api/history")return handleHistory(request,env);
  if(url.pathname.startsWith("/api/"))return json({error:"Endpoint nuk u gjet."},404);
  return new Response("404 - Nuk u gjet",{status:404});
 }
};
