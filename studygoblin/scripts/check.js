'use strict';
// Quick sanity checks before syncing to iOS: npm run check
const fs=require('fs'),path=require('path'),cp=require('child_process');
const root=path.join(__dirname,'..');let bad=0;const fail=m=>{console.error('FAIL',m);bad++};
for(const f of ['www/extract.js','www/app.js','www/platform.js','www/config.js','server/server.js'])
 try{cp.execFileSync(process.execPath,['--check',path.join(root,f)],{stdio:'pipe'})}catch(e){fail('syntax error in '+f)}
for(const f of ['www/index.html','www/app.css','capacitor.config.json'])if(!fs.existsSync(path.join(root,f)))fail('missing '+f);
for(const f of fs.readdirSync(path.join(root,'www')))
 if(/sk-ant-|ANTHROPIC_API_KEY/i.test(fs.readFileSync(path.join(root,'www',f),'utf8')))fail('possible API key or key name in www/'+f);
if(Number(process.versions.node.split('.')[0])<22)fail('Node 22+ required (found '+process.version+')');
console.log(bad?bad+' problem(s)':'OK: syntax valid, no secrets in www/, config present');process.exit(bad?1:0);
