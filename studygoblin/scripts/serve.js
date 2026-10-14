'use strict';
// Static server for previewing www/ in a desktop browser: npm run web
const http=require('http'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..','www'),T={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.json':'application/json'};
http.createServer((q,r)=>{let p=path.normalize(decodeURIComponent(q.url.split('?')[0])).replace(/^(\.\.[\/\\])+/,'');if(p.endsWith('/'))p+='index.html';
 const f=path.join(root,p);if(!f.startsWith(root))return r.writeHead(403).end();
 fs.readFile(f,(e,d)=>e?r.writeHead(404).end('Not found'):(r.writeHead(200,{'Content-Type':T[path.extname(f)]||'application/octet-stream'}),r.end(d)))
}).listen(8080,'127.0.0.1',()=>console.log('Preview: http://localhost:8080'));
