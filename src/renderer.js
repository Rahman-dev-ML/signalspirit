import { LANES, STOP, APPROACHES, AMBER_HOLD } from './simulation.js';
import {signalLayout,SIGNAL_NAMES} from './signal-layout.js';
const BODY=['#c9e0d6','#63a8bd','#e5bd80','#cd7d71','#8eb8a0','#e2e8dd'];
const THEMES={civic:{ground:'#456263',pavement:'#a0b8a7',road:'#304953'},garden:{ground:'#4e7568',pavement:'#acc6ad',road:'#354c53'},sunset:{ground:'#736a60',pavement:'#c3b79b',road:'#414c56'},harbour:{ground:'#3c6976',pavement:'#9fbec0',road:'#2d4859'},neon:{ground:'#4b576c',pavement:'#9aacc0',road:'#304459'},rain:{ground:'#4b6975',pavement:'#9cb3ba',road:'#2d4857'}};
function rr(c,x,y,w,h,r,fill,stroke){c.beginPath();r=Math.min(r,w/2,h/2);c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=1;c.stroke();}}
function seeded(n){return()=>{n=(Math.imul(n,1664525)+1013904223)|0;return(n>>>0)/4294967296;};}
export class Renderer{
 constructor(canvas){this.settings={reducedMotion:false,highContrast:false};this.scene={};this.effects=[];this.canvas=canvas;this.ctx=canvas.getContext('2d',{alpha:false});this.resize();window.addEventListener('resize',()=>this.resize());if(typeof ResizeObserver!=='undefined')new ResizeObserver(()=>{this.resize();if(this.lastSim)this.render(this.lastSim);}).observe(canvas);}
 resize(){if(this.suspended){this.resizePending=true;return;}this.resizePending=false;this.w=this.canvas.clientWidth||innerWidth;this.h=this.canvas.clientHeight||innerHeight;this.dpr=Math.min(devicePixelRatio||1,2);this.canvas.width=Math.round(this.w*this.dpr);this.canvas.height=Math.round(this.h*this.dpr);this.landscape=(innerWidth>innerHeight&&innerHeight<600)||this.w/this.h>1.15;const layout=signalLayout(this.w,this.h,this.uiInsets||{top:80,bottom:80});this.scale=layout.scale;this.cx=layout.cx;this.cy=layout.cy;this.signalRects=layout.signals;this.bg=document.createElement('canvas');this.bg.width=this.canvas.width;this.bg.height=this.canvas.height;const c=this.bg.getContext('2d');c.scale(this.dpr,this.dpr);c.fillStyle='#293638';c.fillRect(0,0,this.w,this.h);c.translate(this.cx,this.cy);c.scale(this.scale,this.scale);this.paintCity(c);}
 paintCity(c){const r=seeded(7129+(this.scene.id||1)*61),lx=-this.cx/this.scale,ly=-this.cy/this.scale,rw=this.w/this.scale,rh=this.h/this.scale;
  const theme=THEMES[this.scene.theme]||THEMES.civic;c.fillStyle=theme.ground;c.fillRect(lx,ly,rw,rh);
  // Pavement joints define city blocks, seen directly from above.
  for(let y=Math.floor(ly/170)*170;y<ly+rh;y+=170)for(let x=Math.floor(lx/170)*170;x<lx+rw;x+=170){if(x<145&&x+150>-145||y<145&&y+150>-145)continue;
   rr(c,x+5,y+5,150,150,3,'#4c5650');
   const bw=103+r()*21,bh=104+r()*20,bx=x+13,by=y+13;
   rr(c,bx+14,by+18,bw+5,bh+5,2,'#1c292a88');rr(c,bx,by,bw,bh,2,['#566066','#626860','#65645b','#4f5e64'][Math.floor(r()*4)],'#778078');
   rr(c,bx+5,by+5,bw-10,bh-10,1,'#414e51','#798077');
   // Roof seams, ventilation units and skylights.
   c.strokeStyle='#73807833';for(let q=20;q<bh-10;q+=22){c.beginPath();c.moveTo(bx+7,by+q);c.lineTo(bx+bw-7,by+q);c.stroke();}
   rr(c,bx+14,by+18,31,42,2,'#273a40','#819297');rr(c,bx+17,by+21,25,35,1,'#4e6468');c.fillStyle='#9aaca322';c.fillRect(bx+19,by+22,8,33);
   for(let a=0;a<2;a++){const ax=bx+bw-42,ay=by+18+a*38;rr(c,ax+3,ay+4,25,27,2,'#263336');rr(c,ax,ay,25,27,2,'#899087');c.strokeStyle='#394b4b';c.beginPath();c.arc(ax+12,ay+13,8,0,Math.PI*2);c.stroke();c.beginPath();c.moveTo(ax+5,ay+13);c.lineTo(ax+19,ay+13);c.moveTo(ax+12,ay+6);c.lineTo(ax+12,ay+20);c.stroke();}
   c.fillStyle='#d2b480';for(let q=12;q<bw-10;q+=20)c.fillRect(bx+q,by+bh-2,9,2);
   this.tree(c,x+140,y+135,12+r()*5,r);
  }
  // Wide raised sidewalks and dark carriageways.
  c.fillStyle=theme.pavement;c.fillRect(-148,ly,296,rh);c.fillRect(lx,-148,rw,296);
  c.fillStyle='#465451';c.fillRect(-138,ly,276,rh);c.fillRect(lx,-138,rw,276);
  c.fillStyle=theme.road;c.fillRect(-120,ly,240,rh);c.fillRect(lx,-120,rw,240);
  c.strokeStyle='#a1a18a66';c.lineWidth=2;c.setLineDash([11,8]);c.beginPath();c.moveTo(0,ly);c.lineTo(0,-122);c.moveTo(0,122);c.lineTo(0,ly+rh);c.moveTo(lx,0);c.lineTo(-122,0);c.moveTo(122,0);c.lineTo(lx+rw,0);c.stroke();c.setLineDash([]);
  // Asphalt grain stays static: the road is not a conveyor belt.
  for(let i=0;i<1700;i++){let x=lx+r()*rw,y=ly+r()*rh;if(Math.abs(x)>120&&Math.abs(y)>120)continue;c.fillStyle=r()>.5?'#b4bba409':'#040f1b18';c.fillRect(x,y,r()*2+.4,r()*2+.4);}
  // Crossing stripes lie outside the conflict box; stop lines precede them.
  c.fillStyle='#c2c5af66';for(let i=-106;i<110;i+=22){c.fillRect(i,-148,12,22);c.fillRect(i,126,12,22);c.fillRect(-148,i,22,12);c.fillRect(126,i,22,12);}
  c.fillStyle='#d4d4bf';c.fillRect(-112,-163,108,4);c.fillRect(4,159,108,4);c.fillRect(-163,4,4,108);c.fillRect(159,-112,4,108);
  // Painted directional arrows reinforce the active lane geometry.
  for(const [app,cfg] of Object.entries(LANES)){c.save();c.rotate(Math.atan2(cfg.dy,cfg.dx));c.translate(-228,cfg.lane*(cfg.dx||-cfg.dy));c.strokeStyle='#bdc8b355';c.lineWidth=3;c.beginPath();c.moveTo(-16,0);c.lineTo(12,0);c.moveTo(4,-8);c.lineTo(12,0);c.lineTo(4,8);c.stroke();c.restore();}
  // Corner planting beds, bollards and street furnishings.
  for(const sx of [-1,1])for(const sy of [-1,1]){rr(c,sx<0?-220:153,sy<0?-231:158,66,73,7,'#354f43','#607a60');this.tree(c,sx*187,sy*192,23,r);rr(c,sx*144-3,sy*184-14,6,28,2,'#a0a48b');for(let p=0;p<3;p++){c.fillStyle='#d6c9a3';c.beginPath();c.arc(sx*(164+p*18),sy*150,2,0,Math.PI*2);c.fill();}}
 }
 tree(c,x,y,size,r){c.fillStyle='#071c2860';c.beginPath();c.ellipse(x+9,y+12,size,size*.85,0,0,Math.PI*2);c.fill();for(let j=0;j<9;j++){c.fillStyle=['#385c4b','#476c50','#527356'][j%3];c.beginPath();const a=r()*6.28,s=r()*size*.55;c.arc(x+Math.cos(a)*s,y+Math.sin(a)*s,size*(.35+r()*.25),0,6.28);c.fill();}}
 point(c,d=c.d){const cfg=LANES[c.app];return{x:cfg.dx?-d*cfg.dx:cfg.lane,y:cfg.dy?-d*cfg.dy:cfg.lane};}
 render(sim,alpha=1){this.lastSim=sim;const c=this.ctx;c.setTransform(1,0,0,1,0,0);c.drawImage(this.bg,0,0);c.setTransform(this.dpr,0,0,this.dpr,0,0);c.save();c.translate(this.cx,this.cy);c.scale(this.scale,this.scale);this.drawLanes(c,sim);
  const t=this.settings.reducedMotion?0:sim.time;
  // Soft streetlight pools, never a full-road red/green wash.
  for(const [x,y] of [[-155,-155],[155,155]]){const g=c.createRadialGradient(x,y,3,x,y,180);g.addColorStop(0,'#f6c9870c');g.addColorStop(1,'#f6c98700');c.fillStyle=g;c.fillRect(x-180,y-180,360,360);}
  // Quiet sidewalk activity brings scale without distracting from lane decisions.
  for(let i=0;i<8;i++){const x=(i%2?1:-1)*(153+i%3*8),y=Math.sin(t*.055+i*1.6)*390;if(Math.abs(y)<180)continue;c.fillStyle='#10232a70';c.beginPath();c.ellipse(x+3,y+4,3,5,0,0,6.28);c.fill();c.fillStyle=['#bca680','#879e97','#b1aaa3'][i%3];c.beginPath();c.arc(x,y,3,0,6.28);c.fill();}
  this.drawStreetEvents(c,sim,t);
  for(const car of sim.cars)this.car(c,car,t,alpha);
  // Incoming emergency marker is visible even while the vehicle is offscreen.
  for(const car of sim.cars.filter(v=>v.type==='ambulance'&&!v.scored)){
   const p=this.point(car),ex=(this.w/2/this.scale)-25,ey=Math.max(180,Math.min(this.cy/this.scale-160,(this.h-this.cy)/this.scale-150));if(Math.abs(p.x)>ex||Math.abs(p.y)>ey){const x=Math.max(-ex,Math.min(ex,p.x)),y=Math.max(-ey,Math.min(ey,p.y));rr(c,x-15,y-15,30,30,5,'#e6e3d4');c.fillStyle='#b96355';c.fillRect(x-3,y-9,6,18);c.fillRect(x-9,y-3,18,6);}
  }
  // Subtle junction number is environmental, rather than another floating HUD.
  c.font='10px monospace';c.textAlign='center';c.fillStyle='#c6ccac33';c.fillText('SIGNAL SPRINT',0,8);
  this.drawEffects(c,sim.time);c.restore();
  if(sim.config.weather==='rain')this.rain(c,t);
  const shade=c.createLinearGradient(0,0,0,this.h);shade.addColorStop(0,'#102b3b77');shade.addColorStop(.23,'#10202b00');shade.addColorStop(.70,'#10202b00');shade.addColorStop(1,'#102b3b77');c.fillStyle=shade;c.fillRect(0,0,this.w,this.h);
  this.drawSignals(c,sim);
  if(sim.reason==='collision'){for(const car of sim.cars.filter(v=>v.crashed)){const p=this.point(car);c.save();c.translate(this.cx+p.x*this.scale,this.cy+p.y*this.scale);c.strokeStyle='#ffb56b';c.lineWidth=3;for(let i=0;i<8;i++){const a=i*Math.PI/4;c.beginPath();c.moveTo(Math.cos(a)*9,Math.sin(a)*9);c.lineTo(Math.cos(a)*23,Math.sin(a)*23);c.stroke();}c.restore();}}
 }
 drawSignals(c,sim){
  for(const app of APPROACHES){
   const r=this.signalRects[app],l=sim.lights[app],green=l.state==='green',amber=l.state==='amber',deadline=sim.waitingDeadline(app);
   const danger=deadline&&deadline.seconds<5,pulse=danger&&!this.settings.reducedMotion?.65+.35*Math.abs(Math.sin(sim.time*7)):1;
   c.save();rr(c,r.x,r.y,r.width,r.height,9,'#081923',danger?'#ff7866':'#91b7bf');
   // Recognizable vertical red / amber / green traffic-light housing.
   rr(c,r.x+5,r.y+5,23,51,8,'#01090d','#5b7680');
   for(const [i,state]of ['red','amber','green'].entries()){c.beginPath();c.fillStyle=state===l.state?{red:'#ff6257',amber:'#ffc344',green:'#69f6a3'}[state]:'#29343d';c.shadowBlur=state===l.state?9:0;c.shadowColor=c.fillStyle;c.arc(r.x+16.5,r.y+14+i*16,6.5,0,Math.PI*2);c.fill();}c.shadowBlur=0;
   c.textAlign='center';c.fillStyle='#eef8fa';c.font='bold 11px system-ui';c.fillText({N:'N ↓',S:'S ↑',E:'E ←',W:'W →'}[app],r.x+56,r.y+16);
   c.font='bold 17px system-ui';c.fillStyle=danger?'#ff8674':green?'#78f5b1':'#fff1d6';c.fillText(deadline?Math.ceil(deadline.seconds)+'s':green?'GO':amber?'WAIT':'STOP',r.x+56,r.y+36);
   c.font='8px system-ui';c.fillStyle='#c7dce0';c.fillText(deadline?'TO STRIKE':green?'TAP: STOP':'TAP: GO',r.x+56,r.y+49);
   rr(c,r.x+6,r.y+60,r.width-12,12,3,'#02090e','#b8d4dc');c.globalAlpha=pulse;
   const fraction=deadline?deadline.fraction:1,color=danger?'#ff6b57':deadline&&deadline.seconds<10?'#ffd06d':green?'#6bf0aa':'#89b5c7';
   rr(c,r.x+8,r.y+62,(r.width-16)*Math.max(.001,fraction),8,2,color);c.globalAlpha=1;
   if(this.tapApp===app&&sim.time-(this.tapPulse??-99)<.3)rr(c,r.x-2,r.y-2,r.width+4,r.height+4,11,null,'#ffffff');c.restore();
  }
 }
 drawLanes(c,sim){
  c.save();for(const [app,lane]of Object.entries(LANES)){const open=sim.lights[app].state==='green',amber=sim.lights[app].state==='amber';
   const pulse=this.tapApp===app&&!this.settings.reducedMotion?Math.max(0,1-(sim.time-(this.tapPulse??-99))/.5):0;
   const x=lane.dx?-242*lane.dx:lane.lane,y=lane.dy?-242*lane.dy:lane.lane;
   c.save();c.translate(x,y);c.rotate(Math.atan2(lane.dy,lane.dx));c.strokeStyle=open?'#b0f5ce':amber?'#ffd17b':'#9cb0b566';c.lineWidth=open?5:3;c.lineCap='round';c.beginPath();c.moveTo(-18,0);c.lineTo(15,0);c.moveTo(3,-11);c.lineTo(15,0);c.lineTo(3,11);c.stroke();c.restore();
   if(open||amber){const x=lane.dx?-STOP*lane.dx:0,y=lane.dy?-STOP*lane.dy:0;c.strokeStyle=amber?'#ffd17b':'#a2f2c8';c.lineWidth=3+pulse*5;c.beginPath();if(lane.dx){c.moveTo(x,lane.lane-35);c.lineTo(x,lane.lane+35);}else{c.moveTo(lane.lane-35,y);c.lineTo(lane.lane+35,y);}c.stroke();}
  }c.restore();
 }
 setScene(config){this.scene=config;this.effects=[];this.resize();}
 addEffect(event,time){if(this.settings.reducedMotion)return;if(event.type==='clear'){const cfg=LANES[event.app];this.effects.push({x:cfg.dx?cfg.dx*205:cfg.lane,y:cfg.dy?cfg.dy*205:cfg.lane,text:'+'+event.points,start:time,color:event.emergency?'#efc98c':'#c2dfc1'});}if(this.effects.length>16)this.effects.shift();}
 drawEffects(c,time){this.effects=this.effects.filter(f=>time-f.start<1.2);for(const f of this.effects){const age=time-f.start;c.globalAlpha=Math.max(0,1-age/1.2);c.textAlign='center';c.font='bold 17px sans-serif';c.fillStyle=f.color;c.fillText(f.text,f.x,f.y-age*27);}c.globalAlpha=1;}
 rain(c,t){c.save();c.strokeStyle='#c6d7d822';c.lineWidth=.7;for(let i=0;i<65;i++){const x=(i*83+t*36)%this.w,y=(i*127+t*210)%this.h;c.beginPath();c.moveTo(x,y);c.lineTo(x-4,y+12);c.stroke();}c.restore();}
 drawStreetEvents(c,sim,t){
  if(sim.config.slowAxis){for(let i=0;i<5;i++){const x=-295+i*30,y=-105;c.fillStyle='#c99861';c.beginPath();c.moveTo(x,y-8);c.lineTo(x-5,y+5);c.lineTo(x+5,y+5);c.fill();c.fillStyle='#e8d4ad';c.fillRect(x-3,y,6,2);}rr(c,-280,-127,80,17,2,'#263c40');c.fillStyle='#e0bd86';c.font='8px sans-serif';c.fillText('ROAD WORKS',-240,-115);}
  if(sim.pedCount){for(let i=0;i<Math.min(8,sim.pedCount);i++){const x=-166-i%3*9,y=-139-Math.floor(i/3)*10;c.fillStyle=['#dfc69c','#97b8b5','#c98b77'][i%3];c.beginPath();c.arc(x,y,3.5,0,6.28);c.fill();}rr(c,-194,-180,50,4,2,'#14252b');rr(c,-194,-180,50*(1-sim.pedWait/24),4,2,sim.pedWait>17?'#ed9680':'#c1d5b9');}
  if(sim.walkTime>0){const p=(4.5-sim.walkTime)/4.5;for(let i=0;i<Math.min(8,sim.walkingCount);i++){const x=-150+p*300-i*4,y=-136+(i%2)*7;c.fillStyle=['#dfc69c','#97b8b5','#c98b77'][i%3];c.beginPath();c.arc(x,y,3.5,0,6.28);c.fill();}c.fillStyle='#c3dbb7';c.font='bold 11px sans-serif';c.textAlign='center';c.fillText('PEDESTRIANS CROSSING',0,-180);}
 }
 car(c,car,t,alpha){const d=car.oldD+(car.d-car.oldD)*alpha,p=this.point(car,d);if(Math.abs(p.x)>this.w/2/this.scale+110||Math.abs(p.y)>this.h/this.scale+110)return;
  const cfg=LANES[car.app],L=car.len,V=car.width;
  c.save();c.translate(p.x+5,p.y+7);c.rotate(Math.atan2(cfg.dy,cfg.dx));rr(c,-L/2,-V/2,L+3,V+2,5,'#08131b77');c.restore();
  c.save();c.translate(p.x,p.y);c.rotate(Math.atan2(cfg.dy,cfg.dx));
  // Headlight cones are low contrast, with distinct brake lights behind.
  const g=c.createLinearGradient(L/2,0,L/2+70,0);g.addColorStop(0,'#e5e9c31b');g.addColorStop(1,'#e5e9c300');c.fillStyle=g;c.beginPath();c.moveTo(L/2,-V/2+3);c.lineTo(L/2+70,-25);c.lineTo(L/2+70,25);c.lineTo(L/2,V/2-3);c.fill();
  rr(c,-L/2+8,-V/2-2,12,V+4,2,'#101d23');rr(c,L/2-20,-V/2-2,12,V+4,2,'#101d23');
  const paint=car.type==='taxi'?'#c5a45d':car.type==='ambulance'?'#d5d9cd':car.type==='bus'?'#608c87':BODY[car.paint];rr(c,-L/2,-V/2,L,V,5,paint,this.settings.highContrast?'#fff7dc':'#d6dfca33');
  const gloss=c.createLinearGradient(0,-V/2,0,V/2);gloss.addColorStop(0,'#ffffff26');gloss.addColorStop(.45,'#ffffff00');gloss.addColorStop(1,'#07172155');rr(c,-L/2,-V/2,L,V,5,gloss);
  rr(c,L/2-19,-V/2+3,8,V-6,2,'#1b343c','#93afb044');rr(c,-L/2+8,-V/2+4,6,V-8,2,'#28434b');rr(c,-L/2+17,-V/2+4,L-40,V-8,3,paint);
  if(car.type==='bus'){for(let x=-L/2+20;x<L/2-20;x+=13){c.fillStyle='#263d43';c.fillRect(x,-V/2+1,9,3);c.fillRect(x,V/2-4,9,3);}rr(c,-15,-8,20,16,2,'#b2c2af');}
  if(car.type==='van'){c.strokeStyle='#d2d7c077';c.strokeRect(-L/2+9,-V/2+4,L-33,V-8);}
  if(car.type==='taxi')rr(c,-4,-6,10,12,2,'#eee4bf');
  if(car.type==='ambulance'){c.fillStyle='#ad665b';c.fillRect(-8,-3,17,6);c.fillRect(-2,-9,6,18);const on=this.settings.reducedMotion||Math.sin(t*5)>0;c.fillStyle=on?'#8ac0eb':'#ce7066';c.fillRect(13,-V/2+2,5,V-4);c.shadowColor=c.fillStyle;c.shadowBlur=on?12:0;c.fillRect(13,-V/2+2,5,5);c.shadowBlur=0;}
  c.fillStyle='#eee9c7';c.fillRect(L/2-2,-V/2+3,2,5);c.fillRect(L/2-2,V/2-8,2,5);c.fillStyle=car.brake?'#f29e82':'#8a5149';c.fillRect(-L/2,-V/2+3,2,5);c.fillRect(-L/2,V/2-8,2,5);
  c.restore();
  if(car.wait>.5&&!car.committed){const q=1-car.wait/car.patience,col=q>.5?'#b4cdb0':q>.25?'#ddb478':'#ed9680';rr(c,p.x-18,p.y-car.len/2-12,36,4,2,'#0e2029');rr(c,p.x-18,p.y-car.len/2-12,36*Math.max(0,q),4,2,col);}
 }
}
