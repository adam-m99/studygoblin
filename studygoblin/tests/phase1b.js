// Fresh batch written after the phase 1 fixes, run ONCE before any further tuning. Today is Wed 2026-10-14.
module.exports=[
{id:'B01 talk length with a cue word',text:"Spanish 2 oral presentation Thurs 10/22, about 5 minutes",want:[{cls:'Spanish',kind:'project',due:'2026-10-22',est:null}]},
{id:'B02 two items, first has no keyword',text:"bio notebook check Monday + lab safety quiz Wednesday",want:[{cls:'Biology',due:'2026-10-19'},{kind:'exam',due:'2026-10-21'}]},
{id:'B03 draft and final dates',text:"english lit essay: rough draft fri, final version 11/6",want:[{cls:'English',kind:'project'}],q:1},
{id:'B04 algebra',text:"mark on the calendar: algebra test oct 29",want:[{cls:'Math',kind:'exam',due:'2026-10-29',inf:false}]},
{id:'B05 date header for a list',text:"Due tomorrow: history worksheet and english reading",want:[{cls:'History',due:'2026-10-15'},{cls:'English',due:'2026-10-15'}]},
{id:'B06 emoji',text:"chem lab due friday \ud83e\uddea\ud83e\uddea !!!",want:[{cls:'Chemistry',kind:'project',due:'2026-10-16'}]},
{id:'B07 comma date',text:"need to study for the history midterm, it's 10/27, and read the last 2 chapters of the book",want:[{cls:'History',kind:'exam',due:'2026-10-27',inf:false},{kind:'assignment',due:null}]},
{id:'B08 parenthetical estimate',text:"math hw (about 40 mins) due 10/16",want:[{cls:'Math',kind:'assignment',due:'2026-10-16',est:40}]},
{id:'B09 time with room number',text:"bio quiz thursday 8:30am in room 204",want:[{cls:'Biology',kind:'exam',due:'2026-10-15',time:'08:30'}]},
{id:'B10 own class + time + estimate',text:"AP lit essay due 10/21 11:59pm, ~2 hrs",classes:['AP Literature','AP Biology'],want:[{cls:'AP Literature',kind:'project',due:'2026-10-21',time:'23:59',est:120}]},
{id:'B11 finals schedule',text:"finals week schedule: bio 12/14, chem 12/15, hist 12/16",want:[{cls:'Biology',kind:'exam',due:'2026-12-14'},{cls:'Chemistry',kind:'exam',due:'2026-12-15'},{cls:'History',kind:'exam',due:'2026-12-16'}]},
{id:'B12 not Thursday',text:"Mr. Chen wants the lab write up by Fri., not Thursday",want:[{kind:'project',due:'2026-10-16'}]},
{id:'B13 work-on duration',text:"work on science project 30 min tonight",want:[{kind:'project',due:'2026-10-14',est:30}]},
{id:'B14 units list',text:"Test Friday!! (units 5-6)",want:[{kind:'exam',due:'2026-10-16',inf:true,est:null}]},
{id:'B15 ampersand split',text:"quiz tmrw & hw due fri",want:[{kind:'exam',due:'2026-10-15'},{kind:'assignment',due:'2026-10-16'}]},
{id:'B16 ordinals without month',text:"essay is due the 5th, quiz the 7th",want:[{kind:'project',due:'2026-11-05',inf:true},{kind:'exam',due:'2026-11-07',inf:true}]},
{id:'B17 not school',text:"lunch with mom tomorrow",want:[]},
{id:'B18 next weekday with date',text:"Ms. Rivera: Unit 6 test is next Thursday the 22nd",want:[{kind:'exam',due:'2026-10-22'}]},
{id:'B19 extra instructions',text:"calc: 2.1-2.4 practice problems, check answers in the back, due tues",want:[{cls:'Calculus',kind:'assignment',due:'2026-10-20'}]},
{id:'B20 two classes by sentence',text:"english: finish chapter 3 notes by thurs. history: map quiz fri",want:[{cls:'English',due:'2026-10-15'},{cls:'History',kind:'exam',due:'2026-10-16'}]}
];
