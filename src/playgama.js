const SAVE_KEY='signal_sprint_save';
const terminal=new Set(['closed','failed']);

function bridge(){return globalThis.bridge||null;}

function waitAd(kind,placement){
  const b=bridge();
  if(!b?.advertisement)return Promise.resolve(false);
  const supported=kind==='rewarded'?b.advertisement.isRewardedSupported:b.advertisement.isInterstitialSupported;
  if(!supported)return Promise.resolve(false);
  return new Promise(resolve=>{
    let earned=false,timer;
    const event=b.EVENT_NAME[kind==='rewarded'?'REWARDED_STATE_CHANGED':'INTERSTITIAL_STATE_CHANGED'];
    const done=state=>{
      if(state==='rewarded')earned=true;
      if(!terminal.has(state))return;
      clearTimeout(timer);
      b.advertisement.off(event,done);
      resolve(kind==='rewarded'?earned:state==='closed');
    };
    b.advertisement.on(event,done);
    timer=setTimeout(()=>{b.advertisement.off(event,done);resolve(false);},120000);
    try{
      if(kind==='rewarded')b.advertisement.showRewarded(placement||'dispatch_assist');
      else b.advertisement.showInterstitial(placement||'mission_break');
    }catch{
      clearTimeout(timer);
      b.advertisement.off(event,done);
      resolve(false);
    }
  });
}

export const Playgama={
  active:false,
  language:'en',
  async init({onPause,onAudio}={}){
    const b=bridge();
    if(!b)return false;
    await b.initialize();
    this.active=true;
    this.language=b.platform.language||'en';
    onAudio?.(!!b.platform.isAudioEnabled);
    onPause?.(!!b.platform.isPaused);
    b.platform.on(b.EVENT_NAME.AUDIO_STATE_CHANGED,enabled=>onAudio?.(!!enabled));
    b.platform.on(b.EVENT_NAME.PAUSE_STATE_CHANGED,paused=>onPause?.(!!paused));
    return true;
  },
  async loadSave(){
    const b=bridge();
    if(!b)return null;
    try{
      const [value]=await b.storage.get([SAVE_KEY]);
      return value??null;
    }catch{return null;}
  },
  async save(value){
    const b=bridge();
    if(!b)return false;
    try{
      await b.storage.set([SAVE_KEY],[value]);
      return true;
    }catch{return false;}
  },
  async clearSave(){
    const b=bridge();
    if(!b)return false;
    try{
      await b.storage.delete([SAVE_KEY]);
      return true;
    }catch{return false;}
  },
  ready(){
    const b=bridge();
    if(!b)return;
    try{b.platform.sendMessage('game_ready');}catch{}
  },
  event(type,level){
    const b=bridge();
    if(!b)return Promise.resolve();
    const names={start:'level_started',complete:'level_completed',fail:'level_failed',pause:'level_paused',resume:'level_resumed'};
    const message=names[type];
    if(!message)return Promise.resolve();
    try{return Promise.resolve(b.platform.sendMessage(message,{level:String(level)}));}catch{return Promise.resolve();}
  },
  score(n){
    const b=bridge();
    if(!b?.leaderboards)return;
    try{b.leaderboards.setScore('best_score',n);}catch{}
  },
  interstitial(placement='mission_break'){return waitAd('interstitial',placement);},
  canReward(){return !!bridge()?.advertisement?.isRewardedSupported;},
  reward(placement='dispatch_assist'){return waitAd('rewarded',placement);}
};
