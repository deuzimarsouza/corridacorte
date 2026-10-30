const FrameStickers = (() => {
 const items = [
  {id:'bora-correr',label:'BORA CORRER!'},
  {id:'vai-ser-top',label:'VAI SER TOP!'},
  {id:'ansioso-demais',label:'ANSIOSO DEMAIS'},
  {id:'to-na-contagem',label:'TÔ NA CONTAGEM!'},
  {id:'bora-bora',label:'BORA BORA!'}
 ];
 const sides = {left:{id:null,size:250,position:50},right:{id:null,size:250,position:50}};
 let active='left', changed=()=>{};
 const images=new Map();
 function bounds(width,height,side,size,position) {
  // Reserve the header and footer, with a gap from the frame edges.
  const top=270,bottom=height-340;
  const actualSize=Math.min(size,bottom-top);
  return {x:side==='left'?48:width-48-actualSize,y:top+(bottom-top-actualSize)*position/100,size:actualSize};
 }
 function ready(){return Object.values(sides).every(s=>!s.id||images.get(s.id)?.status==='ready');}
 function draw(context,width,height){
  for(const [side,state] of Object.entries(sides)){
   const asset=images.get(state.id);if(asset?.status!=='ready')continue;
   const box=bounds(width,height,side,state.size,state.position);
   context.drawImage(asset.image,box.x,box.y,box.size,box.size);
  }
 }
 function sync(){
  const state=sides[active];
  document.querySelectorAll('[data-sticker-side]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.stickerSide===active)));
  document.querySelectorAll('[data-sticker]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.sticker===(state.id||''))));
  for(const prop of ['size','position']){const input=document.getElementById('sticker-'+prop);input.value=state[prop];input.disabled=!state.id;}
  document.getElementById('sticker-size-value').textContent=Math.round(state.size/250*100)+'%';
  document.getElementById('sticker-position-value').textContent=state.position+'%';
  const link=document.getElementById('sticker-download');link.hidden=!state.id;
  if(state.id){link.href='stickers/'+state.id+'.png';link.download=state.id+'.png';}
  const asset=images.get(state.id);
  document.getElementById('sticker-feedback').textContent=asset?.status==='loading'?'Carregando adesivo…':asset?.status==='error'?'Não foi possível carregar. Toque no adesivo para tentar novamente ou escolha Sem adesivo.':state.id?'Adesivo na lateral '+(active==='left'?'esquerda.':'direita.'):'Esta lateral está sem adesivo.';
 }
 function ensure(id){
  if(!id||['loading','ready'].includes(images.get(id)?.status))return;
  const image=new Image(),asset={image,status:'loading'};images.set(id,asset);
  image.onload=()=>{asset.status='ready';sync();changed();};
  image.onerror=()=>{asset.status='error';sync();changed();};
  image.src='stickers/'+id+'.png';
 }
 function init(onChange){
  changed=onChange;const grid=document.getElementById('sticker-grid');
  for(const item of [{id:'',label:'Sem adesivo'},...items]){
   const button=document.createElement('button');button.type='button';button.dataset.sticker=item.id;
   button.setAttribute('aria-label',item.label);button.setAttribute('aria-pressed','false');
   if(item.id){const image=document.createElement('img');image.src='stickers/'+item.id+'.png';image.alt='';image.loading='lazy';button.append(image);}else{const icon=document.createElement('span');icon.className='sticker-none';icon.textContent='−';button.append(icon);}
   const label=document.createElement('span');label.textContent=item.label;button.append(label);
   button.onclick=()=>{sides[active].id=item.id||null;ensure(item.id);sync();changed();};grid.append(button);
  }
  document.querySelectorAll('[data-sticker-side]').forEach(b=>b.onclick=()=>{active=b.dataset.stickerSide;sync();});
  for(const prop of ['size','position'])document.getElementById('sticker-'+prop).oninput=e=>{sides[active][prop]=Number(e.target.value);sync();changed();};
  sync();
 }
 return {init,draw,ready,bounds};
})();
if(typeof module!=='undefined')module.exports=FrameStickers;
