import {Capacitor} from '@capacitor/core';
import {App} from '@capacitor/app';
import {Haptics,ImpactStyle} from '@capacitor/haptics';
export function installNative(onBackground,onBack){if(!Capacitor.isNativePlatform())return;App.addListener('appStateChange',({isActive})=>{if(!isActive)onBackground();}).catch(()=>{});App.addListener('backButton',()=>onBack(true)).catch(()=>{});}
export function tapHaptic(enabled){if(enabled&&Capacitor.isNativePlatform())Haptics.impact({style:ImpactStyle.Light}).catch(()=>{});}

export function exitNative(){if(Capacitor.getPlatform()==='android')App.exitApp().catch(()=>{});}
