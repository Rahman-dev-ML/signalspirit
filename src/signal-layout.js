// Canvas drawing and invisible DOM hit targets share these CSS-pixel bounds.
export const SIGNAL_NAMES={N:'NORTH',S:'SOUTH',E:'EAST',W:'WEST'};
export function signalLayout(width,height,insets={top:12,bottom:12}){
 const top=insets.top||12,bottom=height-(insets.bottom||12),available=Math.max(180,bottom-top);
 const cardW=84,cardH=78,gap=10,margin=7;
 const scale=Math.max(.1,Math.min(width/650,available/600,(width-2*(cardW+gap+margin))/240,(available-2*(cardH+gap+margin))/240));
 const cx=width/2,cy=(top+bottom)/2;
 const dx=120*scale+gap+cardW/2,dy=120*scale+gap+cardH/2;
 const corners={N:[-1,-1],E:[1,-1],S:[1,1],W:[-1,1]};
 const signals=Object.fromEntries(Object.entries(corners).map(([app,[sx,sy]])=>[app,{x:cx+sx*dx-cardW/2,y:cy+sy*dy-cardH/2,width:cardW,height:cardH}]));
 return {cx,cy,scale,signals};
}
