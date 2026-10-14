'use strict';
const test=require('node:test'),assert=require('node:assert'),X=require('../www/extract.js');
module.exports=function(cases,label){
 const today=new Date(2026,9,14),stat={fields:0,ok:0,tasks:0,tasksOk:0,extra:0,invented:0,titleBad:0,bad:[],areas:{}};
 for(const c of cases)test(c.id,()=>{
  const r=X.parse(c.text,{today,classes:c.classes||[]}),miss=[];
  if(r.tasks.length!==c.want.length){miss.push(`count ${r.tasks.length} != ${c.want.length}: ${JSON.stringify(r.tasks.map(t=>t.title))}`);stat.extra+=Math.max(0,r.tasks.length-c.want.length)}
  c.want.forEach((w,i)=>{const t=r.tasks[i];if(!t){miss.push(`task ${i} missing`);stat.tasks++;return}let tOk=true;
   for(const k of Object.keys(w)){stat.fields++;const exp=w[k];
    let got=k=='time'?t.dueTime:k=='has'?(t.title.toLowerCase().includes(exp)?exp:t.title):k=='prep'?((t.prep||'').toLowerCase().includes(exp)?exp:t.prep):t[k];
    if(k=='est'&&exp!==null)got=+got;
    if(got===exp||(exp===null&&got==null))stat.ok++;else{tOk=false;miss.push(`task ${i} ${k}: got ${JSON.stringify(got)} want ${JSON.stringify(exp)} ("${t.title}")`);if(k=='due'&&exp===null&&got)stat.invented++}}
   stat.tasks++;if(tOk)stat.tasksOk++});
  r.tasks.forEach((t,i)=>{if(/^(also|so|and|then|plus|quick reminder|reminder|just a)\b/i.test(t.title)||/\s[.,;:!?]/.test(t.title)||/(?<!\b(?:Mr|Ms|Mrs|Dr|Ch|Pg|No))[.,;]\s+(?![$\d])\S+$/.test(t.title)||t.title.length>90){stat.titleBad++;miss.push(`title quality: "${t.title}"`)}});
  if(c.q&&r.questions.length<c.q)miss.push(`expected a clarifying question, got ${r.questions.length}`);
  if(miss.length)stat.bad.push(c.id+': '+miss.join(' | '));
  const ar=c.id[0];stat.areas[ar]=stat.areas[ar]||{ok:0,n:0};stat.areas[ar].n++;if(!miss.length)stat.areas[ar].ok++;
  assert.deepStrictEqual(miss,[])});
 test(label+' summary',()=>{console.log(`\n# [${label}] field accuracy ${stat.ok}/${stat.fields} = ${(100*stat.ok/stat.fields).toFixed(1)}% | fully-correct tasks ${stat.tasksOk}/${stat.tasks} = ${(100*stat.tasksOk/stat.tasks).toFixed(1)}% | extra (junk) tasks ${stat.extra} | invented dates ${stat.invented} | messy titles ${stat.titleBad}`);console.log('# by area (cases fully correct): '+Object.entries(stat.areas).map(([k,v])=>k+' '+v.ok+'/'+v.n).join(', '));stat.bad.forEach(b=>console.log('#  FAIL '+b));assert.strictEqual(stat.invented,0,'must never invent a date')})};
