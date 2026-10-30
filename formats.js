const FrameLayout = Object.freeze({
 formats: Object.freeze({
  '1:1': {width:1080,height:1080,label:'Quadrado'},
  '3:4': {width:1080,height:1440,label:'Retrato'},
  '9:16': {width:1080,height:1920,label:'Vertical'}
 }),
 crop(photoWidth,photoHeight,width,height,zoom,dx,dy){
  const scale=Math.max(width/photoWidth,height/photoHeight)*zoom;
  const w=photoWidth*scale,h=photoHeight*scale;
  const x=Math.max(-(w-width)/2,Math.min((w-width)/2,dx));
  const y=Math.max(-(h-height)/2,Math.min((h-height)/2,dy));
  return {width:w,height:h,x:(width-w)/2+x,y:(height-h)/2+y,dx:x,dy:y};
 }
});
