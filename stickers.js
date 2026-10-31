const FrameStickers = (() => {
 const items = [
  {id:'bora-correr',label:'BORA CORRER!'},
  {id:'vai-ser-top',label:'VAI SER TOP!'},
  {id:'ansioso-demais',label:'ANSIOSO DEMAIS'},
  {id:'to-na-contagem',label:'TÔ NA CONTAGEM!'},
  {id:'bora-bora',label:'BORA BORA!'},
  {id:'supere-seus-limites',label:'SUPERE SEUS LIMITES!'},
  {id:'melhor-evento',label:'MELHOR EVENTO!'},
  {id:'nosso-dia',label:'NOSSO DIA!'},
  {id:'meu-pace',label:'MEU PACE!'},
  {id:'meu-momento',label:'MEU MOMENTO!'}
 ];
 const sides = {left:{id:null,size:250,position:50},right:{id:null,size:250,position:50}};
 let active='left', changed=()=>{}, beginDrag=()=>{}, preview=null, dimensions={width:1080,height:1080}, dragging=null;
 const handles=new Map(),resizeHandles=new Map();
 const MIN_SIZE=120,MAX_SIZE=460;
 const images=new Map();
 function bounds(width,height,side,size,position) {
  // Reserve the header and footer, with a gap from the frame edges.
  const top=270,bottom=height-340;
  const actualSize=Math.min(size,bottom-top);
  return {x:side==='left'?48:width-48-actualSize,y:top+(bottom-top-actualSize)*position/100,size:actualSize};
 }
 function ready(){return Object.values(sides).every(s=>!s.id||images.get(s.id)?.status==='ready');}
 const clamp=value=>Math.min(1,Math.max(0,value));
 function placement(width,height,side,state){
  const box=bounds(width,height,side,state.size,state.position);
  if(state.free){box.x=clamp(state.free.x)*(width-box.size);box.y=clamp(state.free.y)*(height-box.size);}
  return box;
 }
 function move(side,x,y,width,height){
  const state=sides[side];if(!state?.id)return;
  const box=placement(width,height,side,state);
  state.free={x:clamp(x/(width-box.size)),y:clamp(y/(height-box.size))};
  active=side;sync();changed();
 }
 function resize(side,size,anchor){
  const state=sides[side];if(!state?.id||!Number.isFinite(size))return;
  const {width,height}=dimensions,box=anchor||placement(width,height,side,state);
  state.size=Math.round(Math.max(MIN_SIZE,Math.min(MAX_SIZE,size)));
  state.free={x:clamp(box.x/(width-state.size)),y:clamp(box.y/(height-state.size))};
  active=side;sync();changed();
 }
 function updateHandles(){
  const {width,height}=dimensions;
  for(const [side,button] of handles){
   const state=sides[side],box=placement(width,height,side,state);
   button.hidden=!state.id||images.get(state.id)?.status!=='ready';
   button.style.left=100*box.x/width+'%';button.style.top=100*box.y/height+'%';
   button.style.width=100*box.size/width+'%';button.style.height=100*box.size/height+'%';
   button.classList.toggle('is-selected',active===side);
   button.style.zIndex=active===side?'4':'3';
   button.setAttribute('aria-label',(items.find(item=>item.id===state.id)?.label||'Adesivo')+'. Arraste para mover ou use as setas do teclado.');
   const handle=resizeHandles.get(side);
   handle.hidden=button.hidden||active!==side;
   handle.style.left='clamp(22px, '+100*(box.x+box.size)/width+'%, calc(100% - 22px))';
   handle.style.top='clamp(22px, '+100*(box.y+box.size)/height+'%, calc(100% - 22px))';
   handle.setAttribute('aria-label','Redimensionar '+(items.find(item=>item.id===state.id)?.label||'adesivo')+'. Arraste ou use as setas do teclado.');
  }
 }
 function attachHandles(canvas){
  preview=canvas;
  for(const side of ['left','right']){
   const button=document.createElement('button');button.type='button';button.className='sticker-handle';button.hidden=true;
   button.setAttribute('aria-describedby','stickerMoveHelp');
   button.onpointerdown=e=>{
    if(dragging||e.button!==0)return;e.preventDefault();e.stopPropagation();
    const rect=preview.getBoundingClientRect(),box=placement(dimensions.width,dimensions.height,side,sides[side]);
    dragging={pointer:e.pointerId,side,clientX:e.clientX,clientY:e.clientY,x:box.x,y:box.y,scale:dimensions.width/rect.width};
    beginDrag();active=side;button.setPointerCapture(e.pointerId);button.focus({preventScroll:true});button.classList.add('is-dragging');sync();changed();
   };
   button.onpointermove=e=>{
    if(!dragging||dragging.mode==='resize'||dragging.pointer!==e.pointerId||dragging.side!==side)return;e.preventDefault();
    move(side,dragging.x+(e.clientX-dragging.clientX)*dragging.scale,dragging.y+(e.clientY-dragging.clientY)*dragging.scale,dimensions.width,dimensions.height);
   };
   const finish=e=>{if(dragging?.pointer===e.pointerId&&dragging.side===side){dragging=null;button.classList.remove('is-dragging');}};
   button.onpointerup=button.onpointercancel=button.onlostpointercapture=finish;
   button.onclick=()=>{active=side;sync();changed();};
   button.onkeydown=e=>{
    if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;
    e.preventDefault();e.stopPropagation();const box=placement(dimensions.width,dimensions.height,side,sides[side]),amount=e.shiftKey?40:10;
    move(side,box.x+(e.key==='ArrowRight'?amount:e.key==='ArrowLeft'?-amount:0),box.y+(e.key==='ArrowDown'?amount:e.key==='ArrowUp'?-amount:0),dimensions.width,dimensions.height);
   };
   canvas.parentElement.append(button);handles.set(side,button);
   const handle=document.createElement('button');handle.type='button';handle.className='sticker-resize-handle';handle.hidden=true;handle.textContent='↔';
   handle.title='Arraste para redimensionar';handle.setAttribute('aria-describedby','stickerMoveHelp');
   handle.onpointerdown=e=>{
    if(dragging||e.button!==0)return;e.preventDefault();e.stopPropagation();
    const box=placement(dimensions.width,dimensions.height,side,sides[side]);
    dragging={mode:'resize',pointer:e.pointerId,side,clientX:e.clientX,clientY:e.clientY,...box,scale:dimensions.width/preview.getBoundingClientRect().width};
    beginDrag();active=side;handle.setPointerCapture(e.pointerId);handle.focus({preventScroll:true});sync();changed();
   };
   handle.onpointermove=e=>{
    if(dragging?.mode!=='resize'||dragging.pointer!==e.pointerId||dragging.side!==side)return;e.preventDefault();
    const delta=((e.clientX-dragging.clientX)+(e.clientY-dragging.clientY))/2*dragging.scale;
    resize(side,dragging.size+delta,dragging);
   };
   handle.onpointerup=handle.onpointercancel=handle.onlostpointercapture=finish;
   handle.onkeydown=e=>{
    if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','-'].includes(e.key))return;
    e.preventDefault();e.stopPropagation();
    resize(side,sides[side].size+(['ArrowRight','ArrowDown','+'].includes(e.key)?1:-1)*(e.shiftKey?40:10));
   };
   canvas.parentElement.append(handle);resizeHandles.set(side,handle);
  }
 }
 function draw(context,width,height){
  dimensions={width,height};
  for(const side of [active==='left'?'right':'left',active]){
   const state=sides[side];
   const asset=images.get(state.id);if(asset?.status!=='ready')continue;
   const box=placement(width,height,side,state);
   context.drawImage(asset.image,box.x,box.y,box.size,box.size);
  }
  updateHandles();
 }
 function sync(){
  const state=sides[active];
  document.querySelectorAll('[data-sticker-side]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.stickerSide===active)));
  document.querySelectorAll('[data-sticker]').forEach(b=>{
   const inUse=!!b.dataset.sticker&&b.dataset.sticker===sides[active==='left'?'right':'left'].id;
   b.disabled=inUse;
   b.setAttribute('aria-pressed',String(b.dataset.sticker===(state.id||'')));
   b.title=inUse?'Já usado no outro adesivo':'';
   if(b.usageBadge)b.usageBadge.hidden=!inUse;
  });
  for(const prop of ['size','position']){const input=document.getElementById('sticker-'+prop);input.value=prop==='position'&&state.free?Math.round(state.free.y*100):state[prop];input.disabled=!state.id;}
  document.getElementById('sticker-size-value').textContent=Math.round(state.size/250*100)+'%';
  document.getElementById('sticker-position-value').textContent=(state.free?Math.round(state.free.y*100):state.position)+'%';
  document.getElementById('sticker-reset').disabled=!state.id;
  const link=document.getElementById('sticker-download');link.hidden=!state.id;
  if(state.id){link.href='stickers/'+state.id+'.png';link.download=state.id+'.png';}
  const asset=images.get(state.id);
  document.getElementById('sticker-feedback').textContent=asset?.status==='loading'?'Carregando adesivo…':asset?.status==='error'?'Não foi possível carregar. Toque no adesivo para tentar novamente ou escolha Sem adesivo.':state.id?'Arraste o adesivo para mover. Arraste o botão azul no canto para ajustar o tamanho.':'Escolha um adesivo diferente para cada espaço.';
 }
 function ensure(id){
  if(!id||['loading','ready'].includes(images.get(id)?.status))return;
  const image=new Image(),asset={image,status:'loading'};images.set(id,asset);
  image.onload=()=>{asset.status='ready';sync();changed();};
  image.onerror=()=>{asset.status='error';sync();changed();};
  image.src='stickers/'+id+'.png';
 }
 function init(onChange,canvas,onDragStart=()=>{}){
  beginDrag=onDragStart;
  changed=onChange;const grid=document.getElementById('sticker-grid');
  if(canvas)attachHandles(canvas);
  for(const item of [{id:'',label:'Sem adesivo'},...items]){
   const button=document.createElement('button');button.type='button';button.dataset.sticker=item.id;
   button.setAttribute('aria-label',item.label);button.setAttribute('aria-pressed','false');
   if(item.id){const image=document.createElement('img');image.src='stickers/'+item.id+'.png';image.alt='';image.loading='lazy';button.append(image);}else{const icon=document.createElement('span');icon.className='sticker-none';icon.textContent='−';button.append(icon);}
   const label=document.createElement('span');label.textContent=item.label;button.append(label);
   if(item.id){const badge=document.createElement('small');badge.className='sticker-used';badge.textContent='Já usado';badge.hidden=true;button.usageBadge=badge;button.append(badge);}
   button.onclick=()=>{
    if(item.id&&sides[active==='left'?'right':'left'].id===item.id)return;
    sides[active].id=item.id||null;ensure(item.id);sync();changed();
   };grid.append(button);
  }
  document.querySelectorAll('[data-sticker-side]').forEach(b=>b.onclick=()=>{active=b.dataset.stickerSide;sync();changed();});
  for(const prop of ['size','position'])document.getElementById('sticker-'+prop).oninput=e=>{
   const state=sides[active];if(!state.id)return;
   if(prop==='size'){resize(active,Number(e.target.value));return;}
   const box=placement(dimensions.width,dimensions.height,active,state);
   state.position=Number(e.target.value);
   state.free={x:clamp(box.x/(dimensions.width-box.size)),y:clamp(state.position/100)};sync();changed();
  };
  document.getElementById('sticker-reset').onclick=()=>{sides[active].free=null;sides[active].position=50;sync();changed();};
  sync();
 }
 return {init,draw,ready,bounds,placement,move,isDragging:()=>!!dragging};
})();
if(typeof module!=='undefined')module.exports=FrameStickers;
