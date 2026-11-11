import {Capacitor} from '@capacitor/core';
import {Preferences} from '@capacitor/preferences';
import {Playgama} from './playgama.js';
export const SAVE_KEY='signal-sprint/mobile/v5';
const defaults=()=>({version:5,updatedAt:0,highestLevel:1,bestScore:0,levels:{},totals:{runs:0,cars:0,emergencies:0,walks:0},settings:{sfx:true,ambience:false,haptics:true,reducedMotion:false,highContrast:false},activeRun:null,recorded:[]});
export function sanitize(raw){let p;try{p=typeof raw==='string'?JSON.parse(raw):raw;}catch{return defaults();}const d=defaults();if(!p||typeof p!=='object')return d;
 for(const k of ['highestLevel','bestScore','updatedAt'])if(Number.isSafeInteger(p[k])&&p[k]>=0)d[k]=k==='highestLevel'?Math.max(1,p[k]):p[k];
 if(p.settings)for(const k of Object.keys(d.settings))if(typeof p.settings[k]==='boolean')d.settings[k]=p.settings[k];
 if(p.totals)for(const k of Object.keys(d.totals))if(Number.isSafeInteger(p.totals[k])&&p.totals[k]>=0)d.totals[k]=p.totals[k];
 if(p.levels&&typeof p.levels==='object')for(const [k,v]of Object.entries(p.levels).filter(([k])=>/^\d+$/.test(k)).sort((a,b)=>Number(b[0])-Number(a[0])).slice(0,150)){if(v&&Number.isInteger(v.stars)&&v.stars>=0&&v.stars<=3&&Number.isSafeInteger(v.best)&&v.best>=0)d.levels[k]={stars:v.stars,best:v.best};}
 if(p.activeRun&&[3,4,5].includes(p.activeRun.version))d.activeRun=p.activeRun;
 if(Array.isArray(p.recorded))d.recorded=p.recorded.filter(v=>typeof v==='string').slice(-40);
 return d;
}
export class Store{
 constructor(){this.profile=defaults();this.available=true;this.pending=Promise.resolve();this.native=Capacitor.isNativePlatform();this.bridge=false;}
 async load(){
  if(Playgama.active){
   this.bridge=true;
   try{
    const raw=await Playgama.loadSave();
    this.profile=sanitize(raw);
    this.available=true;
   }catch{this.available=false;this.profile=defaults();}
   return this.profile;
  }
  let local=null,native=null;
  try{local=sanitize(localStorage.getItem(SAVE_KEY));}catch{this.available=false;}
  if(this.native){try{native=sanitize((await Preferences.get({key:SAVE_KEY})).value);}catch{this.available=false;}}
  this.profile=(native?.updatedAt||0)>(local?.updatedAt||0)?native:local||native||defaults();
  return this.profile;
 }
 save(){
  this.profile.updatedAt=Date.now();
  const value=JSON.stringify(this.profile);
  if(this.bridge||Playgama.active){
   this.bridge=true;
   this.pending=this.pending.catch(()=>{}).then(()=>Playgama.save(value)).then(ok=>{this.available=!!ok;return ok;},()=>{this.available=false;return false;});
   return this.pending;
  }
  try{localStorage.setItem(SAVE_KEY,value);}catch{this.available=false;}
  if(this.native){this.pending=this.pending.catch(()=>{}).then(()=>Preferences.set({key:SAVE_KEY,value})).then(()=>{this.available=true;return true;},()=>{this.available=false;return false;});}
  return this.pending;
 }
 async reset(){
  this.profile=defaults();
  if(this.bridge||Playgama.active){
   this.bridge=true;
   await Playgama.clearSave().catch(()=>{});
   return this.save();
  }
  return this.save();
 }
}
