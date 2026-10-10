import { useSyncExternalStore } from 'react';
import { initialState, advance, drive, type GameState } from './simulation';
let live=initialState();let snapshot=live;let elapsed=0;const listeners=new Set<()=>void>();
export const input={forward:0,steer:0};
function notify(){snapshot={...live};listeners.forEach(fn=>fn());}
export const game={get:()=>live, update:(fn:(s:GameState)=>GameState)=>{live=fn(live);notify();}, reset:()=>{live=initialState();notify();}, tick:(raw:number,driving:boolean)=>{const dt=Math.min(raw,.05);if(live.paused||live.failure)return;live=advance(live,dt*live.speed/60);if(driving)live={...live,rover:drive(live.rover,input,dt,live.buildings)};elapsed+=dt;if(elapsed>.2){elapsed=0;notify();}},subscribe:(fn:()=>void)=>{listeners.add(fn);return ()=>{listeners.delete(fn);};},snapshot:()=>snapshot};
export function useGame(){return useSyncExternalStore(game.subscribe,game.snapshot,game.snapshot);}
