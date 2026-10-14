/* StudyGoblin on-device extractor. Rules only: no AI, no network, no guessing.
   SGX.parse(text,{today:Date,classes:[...]}) -> {tasks:[...],questions:[...]} */
(function(root){
'use strict';
const WDX={sun:0,sunday:0,mon:1,monday:1,tue:2,tues:2,tuesday:2,wed:3,weds:3,wednesday:3,thu:4,thur:4,thurs:4,thursday:4,fri:5,friday:5,sat:6,saturday:6};
const MO={jan:0,january:0,feb:1,february:1,mar:2,march:2,apr:3,april:3,may:4,jun:5,june:5,jul:6,july:6,aug:7,august:7,sep:8,sept:8,september:8,oct:9,october:9,nov:10,november:10,dec:11,december:11};
const NUM={a:1,an:1,one:1,two:2,three:3,four:4,five:5,six:6,seven:7};
const pad=n=>String(n).padStart(2,'0'),iso=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
const day0=d=>new Date(d.getFullYear(),d.getMonth(),d.getDate()),addDays=(d,n)=>{const x=day0(d);x.setDate(x.getDate()+n);return x};
const valid=(y,m,d)=>{const x=new Date(y,m,d);return x.getFullYear()==y&&x.getMonth()==m&&x.getDate()==d?x:null};
const CUE='(?:(?:either|due|by|on|before|until|for|at|is|are|was|will be|moved to|pushed to|from)\\s+){0,3}';
const MON='('+Object.keys(MO).join('|')+')';
const WDR='(sun(?:day)?|mon(?:day)?|tue(?:s|sday)?|wed(?:s|nesday)?|thu(?:r|rs|rsday)?|fri(?:day)?|sat(?:urday)?)';
const R={
 iso:new RegExp(CUE+'\\b(\\d{4})-(\\d{2})-(\\d{2})\\b','i'),
 mdy:new RegExp(CUE+'(?<![\\d/.])(0?[1-9]|1[0-2])/(0?[1-9]|[12]\\d|3[01])(?:/(\\d{4}|\\d{2}))?(?![\\d/])(?!\\s*(?:of\\b|cup|pages?|inch))','i'),
 mname:new RegExp(CUE+'\\b'+MON+'\\.?\\s+(\\d{1,2})(?:st|nd|rd|th)?\\b(?:,?\\s*(\\d{4}))?','i'),
 dname:new RegExp(CUE+'\\b(\\d{1,2})(?:st|nd|rd|th)?\\s+(?:of\\s+)?'+MON+'\\b','i'),
 dayafter:new RegExp(CUE+'\\bday after tomorrow\\b','i'),
 tmrw:new RegExp(CUE+'\\b(?:tomorrow|tmrw|tmr)\\b','i'),
 today:new RegExp(CUE+'\\b(?:today|tonight|this (?:morning|afternoon|evening))\\b','i'),
 yest:new RegExp(CUE+'\\byesterday\\b','i'),
 inN:new RegExp(CUE+'\\bin (\\d+|a|an|one|two|three|four|five|six|seven) (day|days|week|weeks)\\b','i'),
 amb:new RegExp(CUE+'\\b((?:the\\s+)?(?:sunday|monday|tuesday|wednesday|thursday|friday|saturday)\\s+(?:after|following)(?=\\s*(?:[,.;!?)]|$|that\\b|next\\b|this\\b))|(?:a|one|two|three)\\s+weeks?\\s+(?:from|after)\\s+(?:next\\s+)?(?:sun|mon|tue|wed|thu|fri|sat)\\w*|next week|next month|end of (?:the )?(?:week|month|semester|quarter|term)|this weekend|later this week|sometime)\\b','i'),
 fromNow:new RegExp(CUE+'\\b(\\d+|a|an|one|two|three|four|five|six|seven) (day|days|week|weeks) from (?:now|today)\\b','i'),
 mdd:new RegExp('\\b(?:due|by|on|before|until)\\s+(0?[1-9]|1[0-2])-(0?[1-9]|[12]\\d|3[01])(?![\\d-])','i'),
 wd:new RegExp(CUE+'\\b(?:(next|this|coming|upcoming)\\s+)?'+WDR+"(?:'s)?\\b",'i'),
 wdord:new RegExp(CUE+'\\b'+WDR+'\\.?,?\\s+(?:the\\s+)?(\\d{1,2})(?:st|nd|rd|th)\\b','i'),
 ord2:new RegExp('(?<=\\b(?:test|exam|quiz|essay|paper|project|report|lab|homework|hw|worksheet|assignment|presentation)\\s)(?:the\\s+)?(\\d{1,2})(?:st|nd|rd|th)\\b','i'),
 ord:new RegExp('\\b(?:due|by|on|before|until|for|is|are|was|will be|moved to)\\s+(?:the\\s+)?(\\d{1,2})(?:st|nd|rd|th)\\b','i')
};
const TIME=/(?:\b(?:at|by|before)\s+)?\b(\d{1,2})(?::(\d{2}))?\s*(am|pm|a\.m\.|p\.m\.)(?![a-z])|\b(?:(?:by|at)\s+)?(midnight|noon)\b/i;
// first date in text. {date,inf,amb,span}. inf=true when worked out from relative wording.
const bare=m=>m[0].replace(new RegExp('^'+CUE,'i'),'').trim();
const orAfter=(s,i)=>{const m=s.slice(i).match(new RegExp('^\\s*(?:or|/)\\s+(?:the\\s+)?(?:(?:next|this)\\s+)?(?:\\d{1,2}(?:st|nd|rd|th)?\\b|'+WDR+'\\b|tomorrow\\b)','i'));return m?{t:m[0].replace(/^\s*(?:or|\/)\s+/i,'').trim(),len:m[0].length}:null};
function findDate(s,today){let m;const T=day0(today),span=m=>[m.index,m.index+m[0].length];
 if(m=s.match(R.iso)){const d=valid(+m[1],+m[2]-1,+m[3]);if(d)return{date:d,inf:false,span:span(m)}}
 if(m=s.match(R.mdy)){const mo=+m[1]-1,dd=+m[2];let y=m[3]?(m[3].length==2?2000+ +m[3]:+m[3]):T.getFullYear(),d=valid(y,mo,dd),inf=false;
  if(d&&!m[3]&&(T-d)/864e5>60){d=valid(y+1,mo,dd);inf=true}if(d)return{date:d,inf,span:span(m)}}
 if(m=s.match(R.mdd)){const d=valid(T.getFullYear(),+m[1]-1,+m[2]);if(d){let dd=d,inf=false;if((T-d)/864e5>60){dd=valid(T.getFullYear()+1,+m[1]-1,+m[2]);inf=true}return{date:dd,inf,span:span(m)}}}
 if(m=s.match(R.mname)){const mo=MO[m[1].toLowerCase()],dd=+m[2];let y=m[3]?+m[3]:T.getFullYear(),d=valid(y,mo,dd),inf=false;
  if(d&&!m[3]&&(T-d)/864e5>60){d=valid(y+1,mo,dd);inf=true}if(d){const oa=orAfter(s,m.index+m[0].length);if(oa)return{date:null,amb:bare(m)+' or '+oa.t,span:[m.index,m.index+m[0].length+oa.len]};return{date:d,inf,span:span(m)}}}
 if(m=s.match(R.dname)){const mo=MO[m[2].toLowerCase()],dd=+m[1];let y=T.getFullYear(),d=valid(y,mo,dd),inf=false;
  if(d&&(T-d)/864e5>60){d=valid(y+1,mo,dd);inf=true}if(d)return{date:d,inf,span:span(m)}}
 if(m=s.match(R.dayafter))return{date:addDays(T,2),inf:true,span:span(m)};
 if(m=s.match(R.tmrw))return{date:addDays(T,1),inf:true,span:span(m)};
 if(m=s.match(R.today))return{date:T,inf:true,span:span(m)};
 if(m=s.match(R.yest))return{date:addDays(T,-1),inf:true,span:span(m)};
 if(m=s.match(R.fromNow)){const n=NUM[m[1].toLowerCase()]||+m[1];return{date:addDays(T,/week/i.test(m[2])?n*7:n),inf:true,span:span(m)}}
 if(m=s.match(R.inN)){const n=NUM[m[1].toLowerCase()]||+m[1];return{date:addDays(T,/week/i.test(m[2])?n*7:n),inf:true,span:span(m)}}
 if(m=s.match(R.wdord)){const dd=+m[2];let d=valid(T.getFullYear(),T.getMonth(),dd);if(!d||d<T)d=valid(T.getFullYear(),T.getMonth()+1,dd);
  if(d&&d.getDay()==WDX[m[1].toLowerCase()])return{date:d,inf:true,span:span(m)};return{date:null,amb:bare(m)+' (that weekday and date do not match)',span:span(m)}}
 if(m=s.match(R.amb))return{date:null,amb:m[1].trim(),span:span(m)};
 if(m=s.match(R.wd)){const mod=(m[1]||'').toLowerCase(),idx=WDX[m[2].toLowerCase()],ahead=(idx-T.getDay()+7)%7;
  const oa=mod?null:orAfter(s,m.index+m[0].length);if(oa)return{date:null,amb:bare(m)+' or '+oa.t,span:[m.index,m.index+m[0].length+oa.len]};
  if(mod=='next')return{date:null,amb:(mod+' '+m[2]).trim(),opts:[addDays(T,ahead||7),addDays(T,(ahead||7)+7)],span:span(m)};
  if(mod=='this'&&ahead==0&&false)return null;
  return{date:addDays(T,ahead||7),inf:true,span:span(m)}}
 if((m=s.match(R.ord))||(m=s.match(R.ord2))){const dd=+m[1];let d=valid(T.getFullYear(),T.getMonth(),dd);if(!d||d<T)d=valid(T.getFullYear(),T.getMonth()+1,dd);if(d)return{date:d,inf:true,span:span(m)}}
 return null}
function findTime(s){const m=s.match(TIME);if(!m)return null;
 if(m[4])return{t:/noon/i.test(m[4])?'12:00':'23:59',span:[m.index,m.index+m[0].length]};
 let h=+m[1],mi=m[2]?+m[2]:0;if(h<1||h>12||mi>59)return null;const pm=/p/i.test(m[3]);h=h%12+(pm?12:0);
 return{t:pad(h)+':'+pad(mi),span:[m.index,m.index+m[0].length]}}
const UNIT=m=>/^h/i.test(m)?60:1;
function findEst(s,bareOk){let m;const sp=m=>[m.index,m.index+m[0].length],ok=n=>n>=5&&n<=600;
 const C='(?:\\b(?:take[s]?|taking|about|around|roughly|approx\\w*|only|just|spend|budget|est\\w*|should be)\\s*(?:(?:like|maybe|probably)\\s+)*|~)';
 if(m=s.match(/\b(\d+(?:\.\d+)?)\s*(?:-|\u2013|to)\s*(\d+(?:\.\d+)?)\s*(hours?|hrs?|minutes?|mins?)\b/i))return{n:null,range:m[0].trim(),span:sp(m)};
 if(m=s.match(new RegExp(C+'\\s*(\\d+(?:\\.\\d+)?)\\s*(?:hours?|hrs?|h)\\s*(?:and\\s*)?(\\d+)\\s*(?:minutes?|mins?|m)\\b','i'))){const n=Math.round(+m[1]*60+ +m[2]);if(ok(n))return{n,span:sp(m)}}
 if(m=s.match(new RegExp(C+'\\s*(?:an?\\s+|one\\s+)?hour and a half\\b','i')))return{n:90,span:sp(m)};
 if(m=s.match(new RegExp(C+'\\s*(?:a\\s+)?half an? hour\\b','i')))return{n:30,span:sp(m)};
 if(m=s.match(new RegExp(C+'\\s*(?:an?|one)\\s+hour\\b','i')))return{n:60,span:sp(m)};
 if(m=s.match(new RegExp(C+'\\s*(?:an?\\s+|me\\s+)?(\\d+(?:\\.\\d+)?)\\s*-?\\s*(hours?|hrs?|h|minutes?|mins?|m)\\b','i'))||s.match(/\b(\d+(?:\.\d+)?)\s*-?\s*(hours?|hrs?|minutes?|mins?)\s+(?:of\s+)?(?:work|homework|reading|study(?:ing)?)\b/i)){
  const n=Math.round(+m[1]*UNIT(m[2]));if(ok(n))return{n,span:sp(m)}}
 if(bareOk&&(m=s.match(/\b(?:work(?:ing)? on|spend|study(?:ing)?|read(?:ing)?)\b[^.;,]{0,40}?\b(\d+(?:\.\d+)?)\s*(hours?|hrs?|minutes?|mins?)\b/i))){const n=Math.round(+m[1]*UNIT(m[2]));if(ok(n))return{n,span:sp(m)}}
 if(bareOk&&(m=s.match(/,\s*(?:about\s+|around\s+|roughly\s+)?(?:(an?\s+hour\s+and\s+a\s+half)|(an?\s+hour)|(half an? hour)|(\d+(?:\.\d+)?)\s*(hours?|hrs?|minutes?|mins?|h|m))\s*(?=,|$|\s+(?:due|by|on)\b)/i))){
  const n=m[1]?90:m[2]?60:m[3]?30:Math.round(+m[4]*UNIT(m[5]));if(ok(n))return{n,span:sp(m)}}
 return null}
const SUBJ=[['Calculus',/\b(calc(?:ulus)?)\b/],['Math',/\b(math\w*|algebra|geometry|trig\w*|stats?|statistics|precalc)\b/],['Chemistry',/\bchem\w*/],['Biology',/\bbio(?:logy)?\b/],['Physics',/\bphys\w*/],['History',/\b(hist\w*|apush|apwh)\b/],['Government',/\b(gov|government|civics)\b/],['English',/\b(english|lit|literature|ela)\b/],['Spanish',/\bspan\w*/],['French',/\bfrench\b/],['German',/\bgerman\b/],['Economics',/\becon\w*/],['Psychology',/\bpsych\w*/],['Computer Science',/\b(cs|comp sci|computer science|coding|programming)\b/],['Art',/\bart\b/],['Music',/\b(music|band|choir)\b/]];
const esc=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
function findClass(s,classes){const low=s.toLowerCase();let best=null,bs=0;
 for(const c of classes||[]){const toks=c.toLowerCase().split(/[^a-z0-9]+/).filter(t=>t.length>=3&&!/^(the|and|honors|advanced|intro|introduction)$/.test(t));
  let sc=0;const ws=low.match(/[a-z]+/g)||[];for(const t of toks)if(ws.some(w=>w.length>=3&&(w.startsWith(t.slice(0,4))||t.startsWith(w))))sc++;if(sc>bs){bs=sc;best=c}}
 if(best)return best;for(const[n,re]of SUBJ)if(re.test(low)){const k=n.toLowerCase().slice(0,4),u=(classes||[]).find(c=>c.toLowerCase().includes(k));return u||n}return''}
const SUBJF='(?:calc\\w*|math|algebra|geometry|stats?|chem\\w*|bio\\w*|phys\\w*|hist\\w*|english|lit|spanish|french|german|econ\\w*|psych\\w*|gov\\w*|cs|apush)',EXAMF=new RegExp('\\b'+SUBJF+'\\s+finals?\\b','i');
const NOUN0=/\b(test|exam|quiz|quizzes|midterm|midterms|final exam|final test|finals|(?:the|my|our)\s+final(?!\s+(?:draft|copy|version|paper|project|report|essay|presentation))|assessment|project|essay|paper|report|presentation|poster|dbq|workbook|textbook|research|portfolio|speech|lab|homework|hw|worksheet|assignment|problem set|pset|reading|packet|chapters?|ch\.?\s?\d+|questions|exercises|problems?|vocab|journal|slip|form|study guide)\b/i;
const NOUN=new RegExp(NOUN0.source+'|\\b'+SUBJF+'\\s+finals?\\b|\\bscience fair\\b|\\b(?:diorama|brochure|infographic|slideshow|tri-?fold)\\b','i');
const ITEM=new RegExp(NOUN.source+'|\\b(?:study|studying|review|read|finish|submit|turn in|hand in|complete|write|prepare|memorize)\\b','i');
const CUEI=/^(?:and\s+)?(?:(?:i|we|you)\s+(?:have|need|got)\b|(?:need|have|got) to\b|must\b|don'?t forget\b|remember to\b)/i;
const NEG=/\bno (?:homework|hw|quiz|test|class|school|assignments?)\b|\bcancel+ed\b|\bnothing due\b|\b(?:homework|hw|quiz|test|assignments?)s?\s*[:\-]?\s*(?:none|n\/a|nothing)\b|\b(?:is|are) optional\b/i,ACT=/\bwe(?:'ll| will| are|'re) (?:be )?(?:finish\w*|start\w*|cover\w*|go\w* over|discuss\w*|learn\w*|work\w*)\b/i;
const PREP=/(?:please\s+)?(?:remember to\s+)?\b(?:bring|print)\s+[^,.;]+/i;
function segment(text,ctx){
 let t=String(text).replace(/[\u2018\u2019]/g,"'").replace(/[\u201c\u201d]/g,'"').replace(/\r/g,'');
 t=t.replace(/\b(Ch|Chap|Pg|Pp|pp|p|Dr|Mr|Mrs|Ms|vs|No|Sec|Fig|approx|a\.m|p\.m|e\.g|i\.e)\./gi,m=>m.replace(/\./g,'\u0001')).replace(/(\d)\.(\d)/g,'$1\u0001$2');
 if((t.match(/(?:^|\s)\d{1,2}[.)]\s+[A-Za-z]/g)||[]).length>=2)t=t.replace(/\s+(\d{1,2}[.)])\s+(?=[A-Za-z])/g,'\n');
 t=t.replace(/\b([A-Z][a-z]+)\s+and\s+([A-Z][a-z]+)\b/g,'$1\u0002$2');
 const out=[],cont=/^(?:chapters?|ch\.?|pages?|pg|pp|units?|problems?|sections?|questions?|#)\s*\d/i,FRAG=/\b(?:test|exam|quiz|project|essay|paper|report|homework|hw|worksheet|assignment|lab|presentation|reading|midterm|dbq)\b/i;let sid=0,pre='',pd='';const NOTITEM=/\bclass(?:es)?\b|\bmeeting\b|\bpractice\b|\brehearsal\b|\bgame\b|\bclub\b|\btryouts?\b|\btrip\b|\bperiod\b/i;
 const add=(p,sep,dl)=>{dl=dl||' ';p=p.replace(/\u0001/g,'.').replace(/\u0002/g,' and ').trim();if(!p)return;const prev=out[out.length-1];
  const strict=NOUN.test(p)||CUEI.test(p)||/^(?:study|read|finish|submit|turn in|hand in|complete|write|prepare|review|memorize)\b/i.test(p);
  let item=sep=='in'?strict:(ITEM.test(p)||/\bdue\b/i.test(p));
  if(!item&&ctx&&!NOTITEM.test(p)){const dd=findDate(p,ctx.today);if(dd&&dd.date&&findClass(p,ctx.classes))item=true}
  if(prev&&cont.test(p)&&!FRAG.test(p)){prev.t+=dl+p;return}
  if(!item){if(prev)prev.t+=dl+p;return}
    if(sep=='in'&&prev&&/^\s*(?:and|plus|then|&)\s*$/i.test(dl)&&!NOUN.test(prev.t)&&!(ctx&&(findDate(prev.t,ctx.today)||{}).date)){prev.t+=dl+p;return}
  out.push({t:p,sid,pre,pd})};
 for(let ln of t.split('\n')){
  ln=ln.replace(/^\s*(?:[-*\u2022>]+|\d{1,2}[.)])\s+/,'').trim();if(!ln||/:\s*$/.test(ln)||/^(?:subject|from|to|cc|bcc|sent|date)\s*:/i.test(ln))continue;
  pre='';pd='';{const c2=ln.indexOf(':');if(c2>0&&c2<45){const px=ln.slice(0,c2);if(px.split(/\s+/).length<=5){if(NOUN.test(px)&&!/^(?:homework|hw|assignments?)$/i.test(px.trim()))pre=px;if(ctx&&!NOUN.test(px)){const dd=findDate(px,ctx.today);if(dd&&dd.date)pd=px}}}}
  const ci=ln.indexOf(':');if(ci>0&&ci<40&&ITEM.test(ln.slice(ci+1))&&/^(?:hi|hello|reminders?|fyi|notes?|heads up|announcements?|homework|hw|assignments?|to ?do|todo|due(?: this week)?|upcoming|this week|tonight|today|tomorrow|things? due|(?:i have )?\d+ things?|i have)$/i.test(ln.slice(0,ci).trim()))ln=ln.slice(ci+1).trim();
  ln=ln.replace(/^(?:hi|hello|hey|dear)\b[^,.!:]{0,30}[,!:]\s*/i,'');
  for(let sent of ln.split(/(?<=[.!?])\s+/)){sid++;
   sent=sent.replace(/^(?:so|well|ok|okay|anyway),?\s*(?:[A-Z][\w.\u0001]*\s+){0,3}(?:said|says|told us|mentioned|announced)\s+(?:that\s+)?/i,'').replace(/^(?:he|she|they)\s+(?:also\s+)?(?:said|says|mentioned)\s+(?:that\s+)?/i,'').replace(/^(?:also|plus|additionally|finally|lastly|btw|oh and),?\s+/i,'').replace(/^(?:just a |a )?(?:quick |friendly )?reminder(?: that| to)?[:,]?\s+/i,'');
   const parts=sent.split(/(,\s*|;\s*|\s+\+\s+|\s+&\s+|\s+(?:and|plus|then)\s+)/i);
   for(let i=0;i<parts.length;i+=2)add(parts[i],i?'in':'line',i?(/^\s*,/.test(parts[i-1])?', ':/^\s*;/.test(parts[i-1])?'; ':parts[i-1]):' ')}}
 return out}
function clean(s,spans){spans.sort((a,b)=>b[0]-a[0]);for(const[a,b]of spans)s=s.slice(0,a)+' '+s.slice(b);
 s=s.replace(/\(\s*\)/g,' ').replace(/[!?]+/g,'').replace(/\s+([.,;:])/g,'$1').replace(/\s+/g,' ').trim().replace(/[.!?\s,;:]+$/,'')
  .replace(/^(?:(?:and|also|plus|then|so|oh)\s+)*(?:(?:i|we)\s+(?:have|need|got)\s+(?:to\s+)?|(?:need|have|got) to\s+|must\s+|please\s+|don'?t forget\s+(?:to\s+)?|remember to\s+|there(?:'?s| is)\s+)?(?:(?:a|an|the|my|our|your)\s+)?/i,'')
  .replace(/[\s,;:\-\u2013]*(?:\b(?:due|by|on|before|until|for|at|is|are|will be|was|moved to|that|which|should|will|and|it'?ll|it will|it should|it'?s|it is)\b[\s,;:]*)*$/i,'').replace(/[.\s,;:]+$/,'').trim();
 return s?s[0].toUpperCase()+s.slice(1):''}
function build(piece,ctx,qs){
 let s=piece;if(NEG.test(s)||ACT.test(s))return null;
 let prep='';const pm=s.match(PREP);if(pm){prep=pm[0].replace(/^please\s+/i,'').replace(/^remember to\s+/i,'').trim();s=s.replace(pm[0],' ')}
 if(prep&&s.replace(/[\s,.;]/g,'').length<3){s=piece;prep=''}
 const low=s.toLowerCase(),spans=[];
 let fd=findDate(s,ctx.today),due=null,inf=false,q=null;
 if(fd){spans.push(fd.span);
  if(fd.date){due=iso(fd.date);inf=!!fd.inf;const rest=s.slice(0,fd.span[0])+' '.repeat(fd.span[1]-fd.span[0])+s.slice(fd.span[1]),f2=findDate(rest,ctx.today);if(f2&&f2.date&&iso(f2.date)!==due)q='two'}
  else q=fd}
 const ft=fd&&fd.date?findTime(s):null;if(ft)spans.push(ft.span);
 const bareOk=!/\b(test|exam|quiz|quizzes|midterms?|finals?)\b|presentation|speech|talk/i.test(low),fe0=findEst(s,bareOk),fe=(/\b(presentation|speech|talk|oral|recital|performance)\b/i.test(low)||(fe0&&fe0.range&&!bareOk))?null:fe0;if(fe)spans.push(fe.span);
 let title=clean(s,spans);if(title.length<3)title=clean(s,[])||s.trim();title=title.slice(0,160);
 const L=low.replace(/final(?=\s+(?:draft|copy|version|paper|project|report|essay|presentation))/g,'fin');
 const kind=EXAMF.test(L)||/\b(test|exam|quiz|quizzes|midterms?|finals|assessment|final (?:exam|test))\b|\b(?:the|my|our) final\b/.test(L)?'exam':/\b(project|essay|paper|report|presentation|poster|dbq|research|portfolio|speech|lab|science fair|diorama|brochure|infographic|slideshow|tri-?fold)\b/.test(L)?'project':NOUN.test(L)||/\b(read|reading)\b/.test(L)?'assignment':'task';
 const pri=/\b(optional|extra credit|bonus)\b/.test(L)?1:(kind=='exam'||/\b(important|urgent|big|major|huge)\b|worth\s+\d+%/.test(L))?3:2;
 let qm=null;if(q=='two')qm='Found two dates in \u201c'+title+'\u201d. Check which one is the deadline.';
 else if(q&&q.amb){const o=q.opts?' It could be '+q.opts.map(d=>d.toLocaleDateString('en-US',{month:'short',day:'numeric'})).join(' or ')+'.':'';qm='\u201c'+q.amb+'\u201d is not a clear date for \u201c'+title+'\u201d.'+o+' Please set one.'}
 const q2=fe&&fe.range?'Duration for \u201c'+title+'\u201d was a range ('+fe.range+'), so no estimate was set.':null;
 const t={_q:qm,_q2:q2,_blank:!due&&!qm,title,cls:findClass(s,ctx.classes),due,inf,est:fe?fe.n:null,estAI:false,pri,kind,prep};if(ft)t.dueTime=ft.t;return t}
function parse(text,opt){opt=opt||{};const ctx={today:opt.today||new Date(),classes:opt.classes||[]},tasks=[],sids=[];
 for(const e of segment(text,ctx)){const p=e.t;
  if(tasks.length&&/(?:\bfirst|\bbeforehand)[.!]?\s*$/i.test(p)&&!NOUN.test(p.replace(/\b(?:read|study|review)\b.*/i,''))){const pr=p.replace(/[.!]+$/,'').trim(),last=tasks[tasks.length-1];last.prep=last.prep?last.prep+'; '+pr:pr;continue}
  const t=build(p,ctx,[]);if(t&&t.title){
   if(!t.due&&!t._q&&e.pd){const dd=findDate(e.pd,ctx.today);if(dd&&dd.date){t.due=iso(dd.date);t.inf=!!dd.inf;t._blank=false}}
   if(t.kind=='task'&&e.pre){if(/\b(test|exam|quiz|quizzes|midterms?|finals)\b/i.test(e.pre)){t.kind='exam';t.pri=3}else if(/\b(project|essay|paper|report|presentation)\b/i.test(e.pre))t.kind='project'}
   tasks.push(t);sids.push(e.sid)}}
 const qs=[];tasks.forEach((t,i)=>{if(t._q)qs.push(t._q);else if(t._blank){
  const o2=tasks[i+1],sib=o2&&sids[i+1]==sids[i]&&o2.due&&o2.inf?o2:null;
  qs.push('No date found for \u201c'+t.title+'\u201d. Please set one'+(sib?' (the date in \u201c'+sib.title+'\u201d may not apply to it).':'.'))}
  if(t._q2)qs.push(t._q2);delete t._q;delete t._q2;delete t._blank});
 return{tasks,questions:qs.slice(0,8)}}
const api={parse,findDate,segment};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.SGX=api;
})(typeof window!=='undefined'?window:globalThis);
