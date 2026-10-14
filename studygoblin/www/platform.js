// Replaces the Claude artifact runtime: AI via your own server, durable storage, native export.
(()=>{
const cfg=window.SG_CONFIG||{},KEY='jarvis.v1',C=window.Capacitor;
const native=!!(C&&C.isNativePlatform&&C.isNativePlatform()),P=native?(C.Plugins||{}):{};
const api=(cfg.API_BASE||'').replace(/\/$/,'');
const hdr={'Content-Type':'application/json'};if(cfg.APP_TOKEN)hdr['x-app-token']=cfg.APP_TOKEN;
const timed=async(url,opt,ms)=>{const c=new AbortController(),id=setTimeout(()=>c.abort(),ms);try{return await fetch(url,{...opt,signal:c.signal})}finally{clearTimeout(id)}};

// Durable storage: iOS can evict WebView localStorage, so mirror the one app key to native Preferences.
if(P.Preferences){
 const set=Storage.prototype.setItem,rm=Storage.prototype.removeItem;
 Storage.prototype.setItem=function(k,v){set.call(this,k,v);if(this===localStorage&&k===KEY)P.Preferences.set({key:KEY,value:String(v)}).catch(()=>{})};
 Storage.prototype.removeItem=function(k){rm.call(this,k);if(this===localStorage&&k===KEY)P.Preferences.remove({key:KEY}).catch(()=>{})};
}

// Same interface the app already uses: claude.use('sample') and claude.use('downloads').
window.claude={use:async name=>{
 if(name==='sample'){
  if(!api)throw{code:'no_server'};
  let h;try{h=await (await timed(api+'/health',{headers:hdr},2500)).json()}catch(e){throw{code:'no_server'}}
  if(!h||!h.ai)throw{code:'no_key'};
  const f=async()=>{};
  f.json=async(prompt,o={})=>{
   let r,j={};
   try{r=await timed(api+'/api/ai',{method:'POST',headers:hdr,body:JSON.stringify({prompt,tier:o.modelTier==='quick'?'quick':'default'})},60000)}
   catch(e){throw{code:'network',message:'Could not reach the AI server.'}}
   try{j=await r.json()}catch(e){}
   if(!r.ok)throw{code:j.error||'failed',message:j.message||'HTTP '+r.status};
   return j.data};
  return f}
 if(name==='downloads')return{save:async({filename,data})=>{
  if(P.Filesystem&&P.Share){
   await P.Filesystem.writeFile({path:filename,data,directory:'CACHE',encoding:'utf8'});
   const {uri}=await P.Filesystem.getUri({path:filename,directory:'CACHE'});
   await P.Share.share({title:'StudyGoblin data',url:uri});return}
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([data],{type:'application/json'}));a.download=filename;document.body.appendChild(a);a.click();a.remove()}};
 throw{code:'unknown'}}};

// Restore from native storage if the WebView lost its copy, then start the app.
window.SG_READY=(async()=>{try{if(P.Preferences&&!localStorage.getItem(KEY)){const r=await P.Preferences.get({key:KEY});if(r&&r.value)localStorage.setItem(KEY,r.value)}}catch(e){}})()
 .then(()=>{const s=document.createElement('script');s.src='app.js';document.body.appendChild(s)});
})();
