import {levelConfig} from './levels.js';
export const LANES={N:{axis:'NS',dx:0,dy:1,lane:-42},S:{axis:'NS',dx:0,dy:-1,lane:42},W:{axis:'EW',dx:1,dy:0,lane:42},E:{axis:'EW',dx:-1,dy:0,lane:-42}};
export const TYPES={car:{len:54,width:27,speed:145,patience:22,points:10},taxi:{len:56,width:28,speed:155,patience:20,points:15},van:{len:67,width:30,speed:130,patience:25,points:15},bus:{len:94,width:32,speed:113,patience:30,points:25},ambulance:{len:66,width:30,speed:165,patience:16,points:50}};
export const STOP=160,EDGE=700;
export const APPROACHES=['N','S','E','W'];
export const AMBER_HOLD=.65;
const freshLights=()=>Object.fromEntries(APPROACHES.map(app=>[app,{state:'red',remaining:0,hold:0}]));
export class Traffic{
 constructor(rng=null){this.externalRng=rng;this.reset();}
 reset(){this._config=null;Object.assign(this,{cars:[],lights:freshLights(),clearance:0,time:0,score:0,cleared:0,strikes:0,chain:0,bestChain:0,spawnIn:1,nextId:0,shift:1,shiftStart:0,shiftCleared:0,target:18,status:'ready',events:[],cooldown:0,mode:'campaign',rngState:1701,initialSeed:1701,waveIndex:-1,priorityIndex:0,pedIndex:0,pedCount:0,pedWait:0,walkTime:0,walkRequested:false,walkingCount:0,served:{bus:0,ambulance:0,walk:0},peakPressure:0,reason:'',switches:0,runId:'',assistUsed:false});}
 get config(){return this._config||(this._config=levelConfig(this.shift,this.mode));}
 random(){if(this.externalRng)return this.externalRng();this.rngState=(Math.imul(this.rngState,1664525)+1013904223)>>>0;return this.rngState/4294967296;}
 start({level=1,mode='campaign',seed}={}){this.reset();this.shift=Math.max(1,Math.min(Number.MAX_SAFE_INTEGER-1,Math.floor(Number(level)||1)));this.mode=['campaign','daily','endless'].includes(mode)?mode:'campaign';this.rngState=(seed??this.config.seed)>>>0;this.initialSeed=this.rngState;this.runId=`${this.mode}-${this.shift}-${Date.now()}-${this.rngState}`;this.target=this.config.target;this.status='playing';this.spawn('N','car');this.spawn('W','taxi');this.cars[0].d=this.cars[0].oldD=330;this.cars[1].d=this.cars[1].oldD=390;}
 emit(type,data={}){this.events.push({type,...data});}
 requestLight(app){
  if(this.status!=='playing'||!APPROACHES.includes(app))return false;
  const light=this.lights[app];
  if(light.state==='red'){light.state='green';light.hold=0;light.remaining=0;}
  else if(light.state==='green'){light.state='amber';light.remaining=AMBER_HOLD;}
  else {light.state='red';light.remaining=0;}
  this.switches++;this.emit(light.state==='green'?'green':'switch',{app,state:light.state});return true;
 }
 tickLights(dt){for(const app of APPROACHES){const l=this.lights[app];if(l.state!=='amber')continue;l.remaining=Math.max(0,l.remaining-dt);if(l.remaining<1e-8){l.state='red';l.remaining=0;this.emit('signalRed',{app,state:'red'});}}}
 waitingDeadline(app){const queue=this.cars.filter(c=>c.app===app&&!c.committed&&(c.wait>0||c.v<8));if(!queue.length)return null;const urgent=queue.reduce((a,b)=>a.patience-a.wait<b.patience-b.wait?a:b);return {seconds:Math.max(0,urgent.patience-urgent.wait),fraction:Math.max(0,1-urgent.wait/urgent.patience),emergency:urgent.type==='ambulance'};}
 detectCollision(){
  // Swept axis-aligned rectangles: detect contact anywhere within this physics step.
  const position=(c,d)=>({x:LANES[c.app].dx?-d*LANES[c.app].dx:LANES[c.app].lane,y:LANES[c.app].dy?-d*LANES[c.app].dy:LANES[c.app].lane});
  const active=this.cars.filter(c=>c.committed&&!c.scored);
  for(let i=0;i<active.length;i++)for(let j=i+1;j<active.length;j++){
   const a=active[i],b=active[j];if(a.axis===b.axis)continue;
   const a0=position(a,a.oldD),a1=position(a,a.d),b0=position(b,b.oldD),b1=position(b,b.d);
   const extent={x:((a.axis==='EW'?a.len:a.width)+(b.axis==='EW'?b.len:b.width))/2,y:((a.axis==='NS'?a.len:a.width)+(b.axis==='NS'?b.len:b.width))/2};
   let enter=0,leave=1;
   for(const axis of ['x','y']){const start=a0[axis]-b0[axis],v=a1[axis]-b1[axis]-start,h=extent[axis];if(Math.abs(v)<1e-9){if(Math.abs(start)>=h){enter=2;break;}}else{const t1=(-h-start)/v,t2=(h-start)/v;enter=Math.max(enter,Math.min(t1,t2));leave=Math.min(leave,Math.max(t1,t2));}}
   if(enter<=leave&&enter<=1&&leave>=0){for(const c of [a,b]){c.d=c.oldD+(c.d-c.oldD)*Math.max(0,enter);c.oldD=c.d;c.crashed=true;c.v=0;}this.status='failed';this.reason='collision';this.emit('crash',{apps:[a.app,b.app]});this.emit('failed');return true;}
  }return false;
 }
 pressureFor(app){return Math.min(1,Math.max(0,...this.cars.filter(c=>c.app===app&&!c.committed).map(c=>c.wait/c.patience)));}
 get occupiedAxis(){return this.cars.find(c=>c.committed&&c.d>-(STOP+c.len/2))?.axis||null;}
 requestWalk(){if(this.status!=='playing'||!this.pedCount||this.walkRequested||this.walkTime>0)return false;this.walkRequested=true;this.clearance=.65;this.emit('walkQueued');return true;}
 get wave(){if(this.mode==='endless'){const k=Math.floor(this.time/16);return {at:k*16,axis:k%2?'EW':'NS',rate:Math.min(1.9,.9+this.time*.004),label:k%2?'Cross-town surge':'North–south surge'};}return this.config.waves.reduce((a,b)=>this.time>=b.at?b:a,this.config.waves[0]);}
 spawn(app,type){
  if(!app){const axes=this.random()<.78?this.wave.axis:(this.wave.axis==='NS'?'EW':'NS');app=axes==='NS'?(this.random()<.5?'N':'S'):(this.random()<.5?'W':'E');}
  let lane=this.cars.filter(c=>c.app===app).sort((a,b)=>a.d-b.d);if(lane.length>=8)return false;
  type=type||this.config.fleet[Math.floor(this.random()*this.config.fleet.length)];
  const spec=TYPES[type];if(!spec||!LANES[app])return false;
  const last=lane[lane.length-1],d=Math.max(EDGE,last?last.d+(last.len+spec.len)/2+28:EDGE);
  this.cars.push({id:this.nextId++,app,axis:LANES[app].axis,type,...spec,speed:spec.speed*this.config.speed*(this.config.slowAxis===LANES[app].axis?.7:1),patience:spec.patience*this.config.patience,d,v:spec.speed*this.config.speed,wait:0,committed:false,paint:Math.floor(this.random()*6),brake:false,oldD:d});
  if(type==='ambulance')this.emit('ambulance',{app});return true;
 }
 nextShift(){if(this.status==='complete'&&this.mode==='campaign')this.start({level:this.shift+1});}
 tick(dt){
  if(this.status!=='playing'||!Number.isFinite(dt)||dt<=0)return;
  dt=Math.min(dt,.05);this.time+=dt;this.cooldown=Math.max(0,this.cooldown-dt);
  const cfg=this.config;
  const currentWave=this.mode==='endless'?Math.floor(this.time/16):cfg.waves.indexOf(this.wave);
  if(currentWave!==this.waveIndex){this.waveIndex=currentWave;this.emit('wave',{axis:this.wave.axis,label:this.wave.label});}
  this.tickLights(dt);
  const occupied=!!this.occupiedAxis;
  if(this.walkTime>0){this.walkTime=Math.max(0,this.walkTime-dt);if(this.walkTime===0){this.walkingCount=0;this.served.walk++;this.score+=40;this.emit('walkComplete');}}
  else if(this.walkRequested){this.clearance=Math.max(0,this.clearance-dt);if(this.clearance===0&&!occupied){this.walkRequested=false;if(this.pedCount){this.walkTime=4.5;this.walkingCount=this.pedCount;this.pedCount=0;this.pedWait=0;this.emit('walk');}}}
  while(this.priorityIndex<cfg.priority.length&&this.time>=cfg.priority[this.priorityIndex].at){const p=cfg.priority[this.priorityIndex];if(this.spawn(p.app,p.type))this.priorityIndex++;else break;}
  if(this.mode==='endless'&&this.time>=20+this.priorityIndex*24){if(this.spawn(['N','E','S','W'][this.priorityIndex%4],'ambulance'))this.priorityIndex++;}
  while(this.pedIndex<cfg.pedestrians.length&&this.time>=cfg.pedestrians[this.pedIndex].at){this.pedCount+=cfg.pedestrians[this.pedIndex].count;this.pedIndex++;this.emit('pedestrians');}
  if(this.mode==='endless'&&this.time>=30+this.pedIndex*35&&!this.pedCount){this.pedCount=5;this.pedIndex++;this.emit('pedestrians');}
  if(this.pedCount){this.pedWait+=dt;if(this.pedWait>=24){this.pedCount=0;this.pedWait=0;this.walkRequested=false;this.strikes++;this.chain=0;this.emit('pedLost');}}
  this.spawnIn-=dt;if(this.spawnIn<=0){this.spawnIn=(.8+this.random()*.4)/this.wave.rate;this.spawn();}
  const removed=new Set();
  for(const app of Object.keys(LANES)){
   const lane=this.cars.filter(c=>c.app===app).sort((a,b)=>a.d-b.d);let leader=null;
   for(const c of lane){c.oldD=c.d;const green=this.lights[app].state==='green'&&this.walkTime<=0&&!this.walkRequested;let boundary=-Infinity;
    if(!c.committed&&!green)boundary=STOP+c.len/2;
    if(leader)boundary=Math.max(boundary,leader.d+(leader.len+c.len)/2+20);
    const target=Math.min(c.speed,Math.sqrt(Math.max(0,2*230*(c.d-boundary))));c.brake=target<c.v-3||target<4;c.v=target<c.v?Math.max(target,c.v-380*dt):Math.min(target,c.v+110*dt);c.d=Math.max(boundary,c.d-c.v*dt);
    if(!c.committed&&green&&c.d<STOP+c.len/2)c.committed=true;
    if(!c.committed&&c.v<8){c.wait+=dt;if(c.wait>=c.patience){removed.add(c.id);this.strikes+=c.type==='ambulance'?2:1;this.chain=0;this.emit('lost',{app:c.app,vehicleType:c.type,x:c.d});}}
    if(c.committed&&c.d<-(STOP+c.len/2)){
     if(!c.scored){c.scored=true;this.cleared++;this.chain++;this.bestChain=Math.max(this.bestChain,this.chain);if(c.type in this.served)this.served[c.type]++;const points=c.points+(c.wait<2?5:0)+Math.min(20,Math.floor(this.chain/5)*5);this.score+=points;this.emit('clear',{app:c.app,points,emergency:c.type==='ambulance',vehicleType:c.type});if(this.chain%10===0)this.emit('streak',{count:this.chain});}
     if(c.d< -EDGE)removed.add(c.id);
    }
    if(!removed.has(c.id))leader=c;
   }
  }
  this.cars=this.cars.filter(c=>!removed.has(c.id));this.peakPressure=Math.max(this.peakPressure,this.pressure);
  if(this.detectCollision())return;
  if(this.strikes>=3){this.status='failed';this.reason='strikes';this.emit('failed');}
  else if(this.mode!=='endless'&&this.time>=cfg.duration){this.time=cfg.duration;this.status=this.progress>=this.target&&this.goalsMet?'complete':'failed';this.reason=this.progress<this.target?'throughput':!this.goalsMet?'dispatch':'';this.emit(this.status);}
 }
 get goalsMet(){return Object.entries(this.config.goals).every(([k,v])=>this.served[k]>=v);}
 get remaining(){return Math.max(0,this.config.duration-this.time);}
 get pressure(){return Math.max(this.pedCount?this.pedWait/24:0,...this.cars.map(c=>c.wait/c.patience));}
 get queue(){return this.cars.filter(c=>!c.committed&&c.v<10).length;}
 get progress(){return this.cleared-this.shiftCleared;}
 get stars(){if(this.status!=='complete')return 0;if(this.assistUsed)return 1;return this.strikes===0&&this.progress>=Math.ceil(this.target*1.18)?3:this.strikes<=1?2:1;}
 snapshot(){const keys=['clearance','time','score','cleared','strikes','chain','bestChain','spawnIn','nextId','shift','shiftStart','shiftCleared','target','status','cooldown','mode','rngState','initialSeed','waveIndex','priorityIndex','pedIndex','pedCount','pedWait','walkTime','walkRequested','walkingCount','peakPressure','reason','switches','runId','assistUsed'];const s={version:5,lights:Object.fromEntries(APPROACHES.map(app=>[app,{...this.lights[app]}])),cars:this.cars.map(c=>({...c})),served:{...this.served}};for(const k of keys)s[k]=this[k];return s;}
 restore(s){
  if(!s||![3,4,5].includes(s.version)||!['playing','complete','failed'].includes(s.status)||!['campaign','daily','endless'].includes(s.mode)||!Array.isArray(s.cars)||s.cars.length>40)return false;
  if(s.version===3&&(!['NS','EW'].includes(s.phase)||!['NS','EW'].includes(s.next)))return false;
  if(s.version>=4&&(!s.lights||APPROACHES.some(app=>{const l=s.lights[app];return !l||!['red','amber','green'].includes(l.state)||!Number.isFinite(l.remaining)||l.remaining<0||!Number.isFinite(l.hold)||l.hold<0||l.hold>60||(l.state==='green'&&s.version===4&&(l.hold===0||l.remaining>l.hold))||(l.state==='amber'&&l.remaining>AMBER_HOLD)||(l.state==='red'&&l.remaining!==0);})))return false;
  const integers=['cleared','strikes','chain','bestChain','nextId','shift','shiftCleared','target','rngState','priorityIndex','pedIndex','pedCount','walkingCount','switches'];if(integers.some(k=>!Number.isInteger(s[k])||s[k]<0)||s.shift<1||s.shift>Number.MAX_SAFE_INTEGER-1)return false;
  const finite=['clearance','time','score','spawnIn','shiftStart','cooldown','pedWait','walkTime','peakPressure'];if(finite.some(k=>!Number.isFinite(s[k]))||s.time<0||s.score<0||s.walkTime<0||s.walkTime>4.5)return false;
  if(!s.served||['bus','ambulance','walk'].some(k=>!Number.isInteger(s.served[k])||s.served[k]<0))return false;
  if(s.cars.some(c=>!LANES[c.app]||!TYPES[c.type]||!Number.isFinite(c.d)||Math.abs(c.d)>3000||!Number.isFinite(c.v)||c.v<0||!Number.isFinite(c.wait)||c.wait<0||!Number.isFinite(c.patience)||c.patience<=0||!Number.isFinite(c.speed)||c.speed<=0||c.len!==TYPES[c.type].len||c.width!==TYPES[c.type].width||c.axis!==LANES[c.app].axis))return false;
  this.reset();const allowed=Object.keys(this.snapshot());for(const k of allowed)if(k in s&&k!=='cars'&&k!=='served'&&k!=='version'&&k!=='lights')this[k]=s[k];this.served={...s.served};this.cars=s.cars.map(c=>({...c}));if(s.version>=4)this.lights=Object.fromEntries(APPROACHES.map(app=>[app,{...s.lights[app]}]));else if(!s.switching&&s.walkTime<=0&&!s.walkRequested)for(const app of APPROACHES)if(LANES[app].axis===s.phase)this.lights[app]={state:'green',hold:0,remaining:0};return true;
 }
}
