import { describe,it,expect } from 'vitest';
import { MOON,LIFE_SUPPORT,initialState,advance,daylight,place,shelter,placementError } from './simulation';
describe('Moon science and game rules',()=>{
 it('uses Moon gravity of 0.165 g',()=>expect(MOON.gravity).toBe(.165));
 it('uses a 29.5-day lunar cycle',()=>expect(MOON.cycle).toBe(29.5));
 it('provides 14 days of night',()=>{expect(daylight(15.5)).toBe(false);expect(daylight(29.49)).toBe(false);expect(daylight(29.5)).toBe(true);});
 it('uses 1.3 mSv per day on the Moon',()=>expect(advance(initialState(),1).radiation).toBe(1.3));
 it('consumes 0.84 kg oxygen per astronaut daily',()=>expect(advance(initialState(),1).oxygen).toBeCloseTo(60-4*.84));
 it('consumes 3.5 kg water per astronaut daily',()=>expect(advance(initialState(),1).water).toBe(220-4*3.5));
 it('consumes 0.6 kg dry food per astronaut daily',()=>expect(advance(initialState(),1).food).toBeCloseTo(80-4*.6));
 it('has four crew',()=>expect(LIFE_SUPPORT.crew).toBe(4));
 it('prevents overlapping construction',()=>expect(placementError(initialState(),'solar',0,0)).toBeTruthy());
 it('charges 160 credits for a shelter',()=>expect(place(initialState(),'shelter',10,0,0).budget).toBe(1040));
 it('requires a shelter before crew can shelter',()=>expect(shelter(initialState()).sheltered).toBe(false));
 it('reduces storm dose with shelter',()=>{let s=place(initialState(),'shelter',10,0,0);s={...s,day:3};expect(advance(shelter(s),.5).radiation).toBeCloseTo(.75);expect(advance(s,.5).radiation).toBe(15);});
});
