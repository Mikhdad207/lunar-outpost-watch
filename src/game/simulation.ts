export const MOON = { gravity: 0.165, cycle: 29.5, night: 14, radiation: 1.3 };
export const LIFE_SUPPORT = { oxygen: 0.84, water: 3.5, food: 0.6, crew: 4 };
export type ModuleKind = 'habitat' | 'solar' | 'battery' | 'shelter' | 'extractor' | 'oxygen' | 'greenhouse' | 'comms' | 'reactor' | 'lab';
export const CATALOG: Record<ModuleKind, { name: string; cost: number; category: string; detail: string; power: number }> = {
 habitat: { name:'Habitat', cost:180, category:'Life support', detail:'Room for four · −12 kWh/day', power:-12 },
 solar: { name:'Solar array', cost:80, category:'Power', detail:'+60 kWh/day · daylight only', power:60 },
 battery: { name:'Battery bank', cost:100, category:'Power', detail:'+300 kWh storage', power:0 },
 shelter: { name:'Storm shelter', cost:160, category:'Life support', detail:'Regolith shielding · 95% dose reduction', power:-2 },
 extractor: { name:'Ice extractor', cost:140, category:'Life support', detail:'+18 kg water/day · −15 kWh', power:-15 },
 oxygen: { name:'O₂ processor', cost:120, category:'Life support', detail:'+4 kg oxygen/day · −10 kWh', power:-10 },
 greenhouse: { name:'Greenhouse', cost:160, category:'Life support', detail:'+3 kg food/day · −18 kWh', power:-18 },
 comms: { name:'Comms antenna', cost:90, category:'Science', detail:'+3 science/day · −5 kWh', power:-5 },
 reactor: { name:'Fission unit', cost:300, category:'Power', detail:'+100 kWh/day · works through night', power:100 },
 lab: { name:'Research lab', cost:180, category:'Science', detail:'+6 science/day · −12 kWh', power:-12 },
};
export const CREW = [ {name:'Amara Okafor',role:'Engineer',initials:'AO',story:'Those solar arrays remind me of the rooftop panels I built with my dad. A little sunlight goes a long way.'}, {name:'Leo Tanaka',role:'Botanist',initials:'LT',story:'The first leaf on the Moon. Tiny, but it means we can make a home here.'}, {name:'Sofia Reyes',role:'Medic',initials:'SR',story:'Water walls do more than store supplies. Every kilogram helps keep our crew safe from radiation.'}, {name:'Arjun Patel',role:'Geologist',initials:'AP',story:'This ice has waited in darkness for billions of years. Today it becomes our drinking water.'} ];
export const FACTS = [
 {title:'The long lunar night',text:'The Moon’s day/night cycle is about 29.5 Earth days, with roughly 14 days of darkness. Solar panels need stored energy or a second power source.',source:'NASA · Moon Facts'},
 {title:'Invisible, but not harmless',text:'Lunar surface radiation is about 1.3 mSv per day. With almost no atmosphere, the Moon needs shelters made from regolith or water to protect astronauts.',source:'NASA · Radiation & human exploration'},
 {title:'Ice in the shadows',text:'Permanently shadowed craters near the lunar south pole contain water ice. It can supply drinking water and be split into oxygen and hydrogen.',source:'NASA · Lunar water ice'},
 {title:'Four people, one life-support system',text:'Each astronaut needs about 0.84 kg oxygen, 3.5 kg drinking/food water and 0.6 kg dry food per Earth day. ISS water recycling recovers about 90% or more.',source:'NASA · Environmental control & life support'},
 {title:'A lighter step',text:'The Moon’s surface gravity is 0.165 g, about one-sixth of Earth’s. Our rover uses simplified arcade handling; the resource figures use Earth days.',source:'NASA · Moon Facts'},
];
export interface Building { id:number; kind:ModuleKind; x:number; z:number; rotation:number }
export interface Rover { x:number; z:number; yaw:number; speed:number }
export interface GameState { day:number; power:number; oxygen:number; water:number; food:number; radiation:number; health:number; morale:number; budget:number; science:number; buildings:Building[]; rover:Rover; sheltered:boolean; paused:boolean; speed:number; difficulty:'Explorer'|'Director'|'Commander'; samples:number[]; failure:string|null; message:string; stormSurvived:boolean }
export function initialState(): GameState { return { day:0, power:240, oxygen:60, water:220, food:80, radiation:0, health:100, morale:94, budget:1200, science:0, buildings:[{id:1,kind:'habitat',x:0,z:0,rotation:0},{id:2,kind:'solar',x:-7,z:1,rotation:0},{id:3,kind:'comms',x:4,z:-5,rotation:0}],rover:{x:4,z:7,yaw:Math.PI,speed:0},sheltered:false,paused:false,speed:1,difficulty:'Explorer',samples:[],failure:null,message:'South-pole landing confirmed. Welcome to Selene Outpost.',stormSurvived:false }; }
export function daylight(day:number) { return day % MOON.cycle < MOON.cycle - MOON.night; }
export function weather(day:number): 'quiet'|'warning'|'storm' { const phase=day%8; return phase>=3&&phase<4?'storm':phase>=1.5&&phase<3?'warning':'quiet'; }
export function capacity(s:GameState) { return 300+300*s.buildings.filter(b=>b.kind==='battery').length; }
export function powerBalance(s:GameState) { return s.buildings.reduce((sum,b)=>sum+(b.kind==='solar'&&!daylight(s.day)?0:CATALOG[b.kind].power),-8); }
export function advance(s:GameState,days:number):GameState {
 if(s.failure||s.paused) return s;
 const n={...s}; const multiplier=s.difficulty==='Commander'?1.25:s.difficulty==='Director'?1.1:1;
 n.day+=days; n.power=Math.max(0,Math.min(capacity(s),s.power+powerBalance(s)*days));
 const running=n.power>0; const count=(kind:ModuleKind)=>s.buildings.filter(b=>b.kind===kind).length;
 n.oxygen=Math.max(0,s.oxygen+((running?count('oxygen')*4:0)-LIFE_SUPPORT.oxygen*4*multiplier)*days);
 n.water=Math.max(0,s.water+((running?count('extractor')*18:0)-LIFE_SUPPORT.water*4*multiplier)*days);
 n.food=Math.max(0,s.food+((running?count('greenhouse')*3:0)-LIFE_SUPPORT.food*4*multiplier)*days);
 const dose=weather(s.day)==='storm'?30:MOON.radiation;
 n.radiation+=dose*(s.sheltered?0.05:1)*days;
 n.science+=running?(count('comms')*3+count('lab')*6)*days:0;
 if(!n.oxygen||!n.water||!n.food||!n.power)n.health=Math.max(0,n.health-25*days);
 if(n.radiation>50)n.health=Math.max(0,n.health-10*days);
 n.morale=Math.max(0,Math.min(100,s.morale+(running?0.1:-3)*days));
 if(weather(s.day)==='storm'&&weather(n.day)==='quiet'){n.stormSurvived=true;n.message='Particle event passed. The crew is safe. +20 science.';n.science+=20;}
 if(n.health<=0)n.failure='Life support or radiation exposure overwhelmed the crew. Oxygen, water, food and stored power must all remain available. Lunar radiation requires shielding.';
 if(n.radiation>=100)n.failure='Cumulative radiation exceeded the mission safety limit (100 mSv, a gameplay threshold). The Moon has almost no atmosphere; a shielded storm shelter reduces exposure.';
 if(n.budget<0)n.failure='Mission funds ran out. Construction must fit the available budget.';
 return n;
}
export function terrainHeight(x:number,z:number) { const d=Math.hypot(x,z); const base=Math.sin(x*.19)*Math.cos(z*.16)*.8+Math.sin(x*.41+z*.21)*.35; let h=base*Math.min(1,Math.max(0,(d-12)/15)); for(const [cx,cz,r] of [[-21,-13,9],[22,-22,12],[29,12,7],[-25,24,6]]) { const q=Math.hypot(x-cx,z-cz)/r; h+=2.8*Math.exp(-((q-1)*5)**2)-2.2*Math.exp(-(q*1.3)**4); } return h; }
export function placementError(s:GameState,kind:ModuleKind,x:number,z:number):string|null { if(s.failure)return 'Mission ended'; if(s.budget<CATALOG[kind].cost)return 'Insufficient budget'; if(Math.hypot(x,z)>28)return 'Outside construction zone'; if(Math.abs(terrainHeight(x,z))>1.2)return 'Terrain is too steep'; if(s.buildings.some(b=>Math.hypot(b.x-x,b.z-z)<5))return 'Too close to another module'; if(Math.hypot(s.rover.x-x,s.rover.z-z)<2.5)return 'Move rover away'; return null; }
export function place(s:GameState,kind:ModuleKind,x:number,z:number,rotation:number):GameState { const error=placementError(s,kind,x,z); if(error)return {...s,message:error}; return {...s,budget:s.budget-CATALOG[kind].cost,buildings:[...s.buildings,{id:Math.max(...s.buildings.map(b=>b.id),0)+1,kind,x,z,rotation}],message:`${CATALOG[kind].name} online.`}; }
export function shelter(s:GameState):GameState { if(!s.buildings.some(b=>b.kind==='shelter'))return {...s,message:'Build a storm shelter before moving the crew.'}; return {...s,sheltered:!s.sheltered,message:s.sheltered?'Crew returned to work.':'All four crew are inside the shielded shelter.'}; }
export const SAMPLES=[{x:-16,z:9,name:'Basalt sample'},{x:-20,z:-12,name:'Water ice'},{x:17,z:-13,name:'Regolith core'}];
export function collect(s:GameState):GameState { const i=SAMPLES.findIndex((p,i)=>!s.samples.includes(i)&&Math.hypot(p.x-s.rover.x,p.z-s.rover.z)<5); return i<0?{...s,message:'No sample within 5 m. Drive to a survey beacon.'}:{...s,samples:[...s.samples,i],science:s.science+25,message:`${SAMPLES[i]?.name} collected. +25 science. Arjun: “Every sample tells a story.”`}; }
export function drive(r:Rover,input:{forward:number;steer:number},dt:number,buildings:Building[]):Rover { const speed=Math.max(-3,Math.min(6,(r.speed+input.forward*7*dt)*Math.exp(-1.5*dt))); const yaw=r.yaw+input.steer*1.8*dt*Math.min(1,Math.abs(speed)/2); const x=Math.max(-34,Math.min(34,r.x+Math.sin(yaw)*speed*dt));const z=Math.max(-34,Math.min(34,r.z+Math.cos(yaw)*speed*dt)); if(buildings.some(b=>Math.hypot(b.x-x,b.z-z)<2.5))return {...r,speed:0};return {x,z,yaw,speed}; }
export function parseSave(raw:string):GameState|null { try { const s=JSON.parse(raw) as GameState; if(typeof s.day!=='number'||!Array.isArray(s.buildings)||!s.rover||!Number.isFinite(s.power)||!Array.isArray(s.samples))return null; return {...initialState(),...s,paused:true}; }catch{return null;} }
