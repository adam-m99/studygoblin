// Second fresh batch, written after the first round of fixes. Run once before any further tuning. Today is Wed 2026-10-14.
module.exports=[
{id:'G01 plus sign',text:"HW: pp. 33-40 + #2,4,6 due Fri 10/16",want:[{kind:'assignment',due:'2026-10-16',inf:false}]},
{id:'G02 at-sign time',text:"problem set 5 due thursday @ 5pm",want:[{kind:'assignment',due:'2026-10-15',inf:true,time:'17:00'}]},
{id:'G03 caps',text:"BIO QUIZ TOMORROW!!!",want:[{cls:'Biology',kind:'exam',due:'2026-10-15',inf:true}]},
{id:'G04 end of day',text:"lab 4 writeup due by end of day friday",want:[{kind:'project',due:'2026-10-16',inf:true}]},
{id:'G05 two items one prefix',text:"english: read act 2 of macbeth by tues, journal entry wed",want:[{cls:'English',kind:'assignment',due:'2026-10-20'},{due:'2026-10-21'}]},
{id:'G06 day after tomorrow first',text:"the day after tomorrow: history quiz",want:[{cls:'History',kind:'exam',due:'2026-10-16',inf:true}]},
{id:'G07 recent past',text:"history essay due Sept 30",want:[{cls:'History',kind:'project',due:'2026-09-30',inf:false}]},
{id:'G08 december',text:"math midterm 12/10",want:[{cls:'Math',kind:'exam',due:'2026-12-10',inf:false}]},
{id:'G09 numbered quiz',text:"Quiz #3 on Monday (sections 4.1-4.3)",want:[{kind:'exam',due:'2026-10-19',inf:true}]},
{id:'G10 noon',text:"write 2 page reflection for English, due tomorrow at noon",want:[{cls:'English',due:'2026-10-15',inf:true,time:'12:00'}]},
{id:'G11 abbreviated month with ordinal',text:"science project: build a model volcano, due Nov. 3rd",want:[{kind:'project',due:'2026-11-03',inf:false}]},
{id:'G12 oral exam',text:"I've got a French oral exam next Thursday and I haven't started studying",want:[{cls:'French',kind:'exam',due:null}],q:1},
{id:'G13 prep before then',text:"lit circle meeting wed, read chapters 10-12 before then",want:[{kind:'assignment',due:null}],q:1},
{id:'G14 teacher prefix',text:"Ms. Park: Chem test 10/23. Study guide due 10/21.",want:[{cls:'Chemistry',kind:'exam',due:'2026-10-23',inf:false},{kind:'assignment',due:'2026-10-21',inf:false}]},
{id:'G15 date-first lines',text:"10/16 - bio lab report\n10/19 - history reading\n10/21 - math test",want:[{cls:'Biology',kind:'project',due:'2026-10-16',inf:false},{cls:'History',kind:'assignment',due:'2026-10-19',inf:false},{cls:'Math',kind:'exam',due:'2026-10-21',inf:false}]},
{id:'G16 next Monday',text:"turn in signed syllabus by next Monday",want:[{due:null}],q:1},
{id:'G17 maybe estimate',text:"Do the odd problems on page 77 for math (should take maybe 20 min), due Tuesday",want:[{cls:'Math',kind:'assignment',due:'2026-10-20',inf:true,est:20}]},
{id:'G18 not a task',text:"pe: bring running shoes tomorrow",want:[]},
{id:'G19 final exam with time',text:"Final exam for spanish is dec 14th 8am",want:[{cls:'Spanish',kind:'exam',due:'2026-12-14',inf:false,time:'08:00'}]},
{id:'G20 two dates one task',text:"physics test 10/20 or 10/22 not sure which",want:[{cls:'Physics',kind:'exam'}],q:1}
];
