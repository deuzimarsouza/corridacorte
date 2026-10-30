const $=id=>document.getElementById(id), canvas=$('canvas'),ctx=canvas.getContext('2d');
const styles=[{title:'Eu estava lá!',phrase:'EU ESTAVA LÁ!',sub:'CADA PASSO, UMA CONQUISTA.',color:'#123da9',accent:'#84b8ff'},{title:'Meu pace',phrase:'MEU PACE',sub:'MEU RITMO. MINHA CONQUISTA.',color:'#0b243c',accent:'#bdf36c'},{title:'Mais uma conquista',phrase:'EU FUI ALÉM!',sub:'A MELHOR VERSÃO DE MIM.',color:'#36237a',accent:'#c5b4ff'},{title:'Paixão pelo corre',phrase:'VIVENDO O CORRE!',sub:'COLECIONANDO BOAS MEMÓRIAS.',color:'#b63728',accent:'#ffd0a3'},{title:'Eu estarei lá!',phrase:'EU ESTAREI LÁ!',sub:'PRESENÇA CONFIRMADA · 29/11/2026',color:'#086354',accent:'#c6f478'},{title:'Eu vou!',phrase:'EU VOU!',sub:'CONTAGEM REGRESSIVA PARA O MEU CORRE.',color:'#1249bd',accent:'#a4dcff'},{title:'Quem vai sou eu!',phrase:'QUEM VAI SOU EU!',sub:'ENCONTRO MARCADO · 29/11/2026',color:'#922957',accent:'#ffd095'}];
let format="1:1";
let selected=FrameSchedule.initial(),photo=null,zoom=1,dx=0,dy=0,drag=null,loading=0,logoReady=false,step=0,busy=false,lastPhase=null,noticeTimer=null;const logo=new Image();logo.src='logo.jpg';logo.onload=()=>{logoReady=true;render();thumbs();};logo.onerror=()=>{notify('Não foi possível carregar o logo. Atualize a página.');};
function path(c,points,fill){c.fillStyle=fill;c.beginPath();points.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.closePath();c.fill();}
function fitText(c,text,x,y,max,size,color){c.fillStyle=color;c.font=`900 ${size}px Arial`;while(c.measureText(text).width>max&&size>14)c.font=`900 ${--size}px Arial`;c.fillText(text,x,y);}
function draw(c,index,mini=false){const s=styles[index],W=1080,H=c.canvas.height/(c.canvas.width/W);c.clearRect(0,0,c.canvas.width,c.canvas.height);c.save();c.scale(c.canvas.width/W,c.canvas.width/W);c.fillStyle='#dce4ef';c.fillRect(0,0,W,H);
if(photo&&!mini){const crop=FrameLayout.crop(photo.width,photo.height,W,H,zoom,dx,dy);dx=crop.dx;dy=crop.dy;c.drawImage(photo,crop.x,crop.y,crop.width,crop.height);}else{let g=c.createLinearGradient(0,0,W,H);g.addColorStop(0,'#e7edf5');g.addColorStop(1,'#b7c8de');c.fillStyle=g;c.fillRect(0,0,W,H);c.strokeStyle='#ffffff55';c.lineWidth=3;for(let i=0;i<5;i++){c.beginPath();c.arc(1100,550,350+i*65,0,Math.PI*2);c.stroke();}}

c.fillStyle=s.color;c.fillRect(0,0,18,H);c.fillRect(W-18,0,18,H);c.fillRect(0,0,W,18);path(c,[[0,0],[420,0],[380,235],[0,235]],'#fff');if(logoReady)c.drawImage(logo,30,26,340,179);c.fillStyle=s.color;c.fillRect(810,38,232,50);c.fillStyle='white';c.font='bold 20px Arial';c.fillText('2ª EDIÇÃO · 2026',832,71);
if(index===1||index===5){c.strokeStyle=s.accent;c.lineWidth=index===1?6:8;c.strokeRect(34,258,1012,H-290);}
c.save();c.translate(0,H-1080);
let g=c.createLinearGradient(0,720,0,1080);g.addColorStop(0,s.color+'00');g.addColorStop(.62,s.color+'ee');g.addColorStop(1,s.color);c.fillStyle=g;c.fillRect(0,720,1080,360);
if(index===0){path(c,[[0,945],[1080,865],[1080,1080],[0,1080]],s.color);path(c,[[770,1080],[867,986],[922,986],[825,1080]],s.accent);path(c,[[860,1080],[957,986],[1012,986],[915,1080]],s.accent);}

if(index===2){path(c,[[0,1080],[0,900],[200,1080]],s.accent);path(c,[[1080,1080],[1080,820],[850,1080]],s.accent);}
if(index===3){c.strokeStyle=s.accent;c.lineWidth=4;for(let i=0;i<3;i++){c.beginPath();c.arc(1090,1110,160+i*28,Math.PI,1.5*Math.PI);c.stroke();}}
if(index===4){path(c,[[0,960],[1080,850],[1080,1080],[0,1080]],s.color);path(c,[[860,780],[920,780],[990,850],[920,920],[860,920],[930,850]],s.accent);}
if(index===5){path(c,[[880,1010],[960,930],[1010,930],[930,1010]],s.accent);}
if(index===6){c.fillStyle=s.accent;for(let j=0;j<3;j++)c.fillRect(870+j*55,800-j*35,28,55);path(c,[[0,1080],[0,1005],[75,1080]],s.accent);}
let phrase=s.phrase;if(index===1&&!mini&&$('pace').value.trim())phrase+=' '+$('pace').value.trim()+' /KM';fitText(c,phrase,58,921,960,index===1?78:82,'white');fitText(c,mini?'':$('name').value.trim().toUpperCase(),58,972,800,32,s.accent);c.fillStyle=s.accent;c.font='bold 20px Arial';c.fillText(s.sub,58,1024);c.restore();if(!mini)FrameStickers.draw(c,W,H);c.restore();}
const panels=['photoPanel','framePanel','detailsPanel'];
function notify(message){clearTimeout(noticeTimer);$('status').textContent=message;$('status').hidden=false;noticeTimer=setTimeout(()=>$('status').hidden=true,6000);}
function updateControls(){
 const ready=!!photo&&logoReady&&!busy&&FrameStickers.ready()&&FrameSchedule.allowed(selected);
 $('previewUpload').hidden=!!photo;$('changePhoto').hidden=!photo;
 ['zoom','zoomIn','zoomOut','reset'].forEach(id=>$(id).disabled=!photo);
 document.querySelectorAll('[data-format]').forEach(b=>b.disabled=busy);
 $('continue').disabled=!ready;$('download').disabled=!ready;
 $('continue').hidden=step===2;$('download').hidden=step!==2;$('back').hidden=step===0;
 $('continue').querySelector('span').textContent=step===0?'Escolher moldura':'Finalizar minha foto';
 $('stepCount').textContent=`PASSO ${step+1} DE 3`;
 $('actionHint').textContent=busy?'Preparando sua imagem…':!photo?'Adicione uma foto para continuar.':step===0?'Foto pronta. Vamos escolher sua moldura?':step===1?'Escolha um estilo e veja o resultado na prévia.':'Tudo pronto para salvar. O nome é opcional.';
 $('previewTip').textContent=photo?'Arraste para mover · use o zoom para aproximar.':'Sua foto aparece aqui, com a moldura escolhida.';
 document.querySelectorAll('.tab').forEach((b,i)=>b.classList.toggle('completed',!!photo&&i<step));
}
function render(){draw(ctx,selected);updateControls();}
function thumbs(){const size=FrameLayout.formats[format];document.querySelectorAll('.frame canvas').forEach(c=>{c.width=360;c.height=Math.round(360*size.height/size.width);c.style.aspectRatio=`${size.width} / ${size.height}`;draw(c.getContext('2d'),Number(c.closest('.frame').dataset.index),true);});}
function setFormat(value){
 if(!FrameLayout.formats[value]||busy)return;
 format=value;const size=FrameLayout.formats[value];canvas.width=size.width;canvas.height=size.height;
 document.querySelectorAll('[data-format]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.format===format)));
 document.querySelector('.preview-stage').classList.toggle('portrait',format==='9:16');
 $('previewDimensions').textContent=`${size.width} × ${size.height}`;
 $('exportSize').textContent=`PNG · ${size.width} × ${size.height} pixels · formato ${format}`;
 pointers.clear();startGesture();reset();thumbs();
}
document.querySelectorAll('[data-format]').forEach(b=>b.onclick=()=>{setFormat(b.dataset.format);if(photo)notify('Formato alterado. Confira o enquadramento da foto antes de salvar.');});

styles.forEach((s,i)=>{const b=document.createElement('button');b.className='frame';b.dataset.index=i;b.innerHTML=`<canvas width="360" height="360" aria-hidden="true"></canvas><span class="frame-title">${s.title}<span class="check">✓</span></span>`;b.addEventListener('click',()=>{syncAvailability();if(!FrameSchedule.allowed(i))return;selected=i;syncAvailability(true);render();});$('availableFrames').appendChild(b);});
function syncAvailability(force=false){
 const now=Date.now(),phase=FrameSchedule.phase(now),before=phase==='before',previous=selected;
 if(!FrameSchedule.allowed(selected,now))selected=FrameSchedule.initial(now);
 if(force||lastPhase!==phase){
  document.querySelectorAll('.frame').forEach(b=>{const i=Number(b.dataset.index),available=FrameSchedule.allowed(i,now);b.disabled=!available;b.classList.toggle('selected',i===selected);b.setAttribute('aria-pressed',String(i===selected));b.setAttribute('title',available?styles[i].title:i>=4?'Período de pré-evento encerrado':'Libera em 29/11/2026 às 00h, horário de Brasília');$(available?'availableFrames':'unavailableFrames').appendChild(b);});
  $('paceField').hidden=selected!==1;$('selectedName').textContent=styles[selected].title;
  $('phaseNotice').textContent=before?'3 molduras para confirmar sua presença. Disponíveis até 28/11 às 23h59.':'4 molduras para celebrar sua conquista. Escolha a sua!';
  $('eventPhase').textContent=before?'Molduras de pré-evento disponíveis':'Molduras de pós-evento disponíveis';
  $('lockedTitle').textContent=before?'Molduras de pós-evento':'Molduras de pré-evento';$('lockedCount').textContent=before?'4 bloqueadas':'3 encerradas';
  $('lockedNote').textContent=before?'Liberadas em 29/11/2026 às 00h, horário de Brasília.':'O uso dessas molduras foi encerrado em 29/11/2026 às 00h, horário de Brasília.';
  lastPhase=phase;
 }
 if(previous!==selected){notify('O período mudou. Uma moldura disponível foi selecionada.');render();}
}
function showPanel(id){step=panels.indexOf(id);if(step<0)step=0;document.querySelectorAll('.panel').forEach(p=>p.hidden=p.id!==panels[step]);document.querySelectorAll('.tab').forEach((b,i)=>{const active=i===step;b.classList.toggle('active',active);b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1;});updateControls();}
const tabs=[...document.querySelectorAll('.tab')];tabs.forEach((b,i)=>{b.onclick=()=>showPanel(b.dataset.panel);b.onkeydown=e=>{let next;if(e.key==='ArrowRight')next=(i+1)%3;else if(e.key==='ArrowLeft')next=(i+2)%3;else if(e.key==='Home')next=0;else if(e.key==='End')next=2;else return;e.preventDefault();showPanel(tabs[next].dataset.panel);tabs[next].focus();};});
$('continue').onclick=()=>{if(!photo)return;showPanel(panels[Math.min(2,step+1)]);document.querySelector('.tabs').scrollIntoView({block:'nearest',behavior:'smooth'});};$('back').onclick=()=>showPanel(panels[Math.max(0,step-1)]);
function choosePhoto(){showPanel('photoPanel');$('file').click();}$('previewUpload').onclick=choosePhoto;$('changePhoto').onclick=choosePhoto;
async function load(file){
 if(!file)return;
 if(!['image/jpeg','image/png','image/webp'].includes(file.type)){notify('Escolha uma imagem JPG, PNG ou WebP.');return;}
 if(file.size>20*1024*1024){notify('A foto deve ter no máximo 20 MB.');return;}
 const token=++loading,url=URL.createObjectURL(file),img=new Image();notify('Abrindo sua foto…');
 img.onload=()=>{URL.revokeObjectURL(url);if(token!==loading)return;
  const scale=Math.min(1,2400/Math.max(img.naturalWidth,img.naturalHeight));const decoded=document.createElement('canvas');decoded.width=Math.round(img.naturalWidth*scale);decoded.height=Math.round(img.naturalHeight*scale);decoded.getContext('2d').drawImage(img,0,0,decoded.width,decoded.height);photo=decoded;reset();$('uploadLabel').textContent='Trocar minha foto';showPanel('photoPanel');notify('Foto adicionada! Ajuste a posição e escolha sua moldura.');render();
 };
 img.onerror=()=>{URL.revokeObjectURL(url);if(token===loading)notify('Não foi possível abrir a foto. Tente outra imagem.');};img.src=url;
}
$('file').onchange=e=>{load(e.target.files[0]);e.target.value='';};const drop=$('drop');['dragenter','dragover'].forEach(event=>drop.addEventListener(event,e=>{e.preventDefault();drop.classList.add('over');}));['dragleave','drop'].forEach(event=>drop.addEventListener(event,e=>{e.preventDefault();drop.classList.remove('over');if(event==='drop')load(e.dataTransfer.files[0]);}));
function setZoom(value){zoom=Math.min(3,Math.max(1,Number(value)));$('zoom').value=zoom;$('zoomValue').textContent=Math.round(zoom*100)+'%';render();}
function reset(){dx=dy=0;setZoom(1);}$('reset').onclick=reset;$('zoom').oninput=e=>setZoom(e.target.value);$('zoomIn').onclick=()=>setZoom(zoom+.1);$('zoomOut').onclick=()=>setZoom(zoom-.1);['name','pace'].forEach(id=>$(id).oninput=render);
const pointers=new Map();let gesture=null;
function startGesture(){const list=[...pointers.values()];if(list.length===2){gesture={distance:Math.hypot(list[0].x-list[1].x,list[0].y-list[1].y),zoom};drag=null;}else if(list.length===1){drag={x:list[0].x,y:list[0].y,dx,dy};gesture=null;}else{drag=null;gesture=null;}}
canvas.onpointerdown=e=>{if(!photo||pointers.size>=2)return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});canvas.setPointerCapture(e.pointerId);startGesture();};canvas.onpointermove=e=>{if(!pointers.has(e.pointerId))return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(gesture){const list=[...pointers.values()];const distance=Math.hypot(list[0].x-list[1].x,list[0].y-list[1].y);if(gesture.distance>0)setZoom(gesture.zoom*distance/gesture.distance);}else if(drag){const ratio=1080/canvas.getBoundingClientRect().width;dx=drag.dx+(e.clientX-drag.x)*ratio;dy=drag.dy+(e.clientY-drag.y)*ratio;render();}};
canvas.onpointerup=canvas.onpointercancel=canvas.onlostpointercapture=e=>{pointers.delete(e.pointerId);startGesture();};canvas.onkeydown=e=>{if(!photo)return;const amount=e.shiftKey?40:10;if(e.key==='ArrowLeft')dx-=amount;else if(e.key==='ArrowRight')dx+=amount;else if(e.key==='ArrowUp')dy-=amount;else if(e.key==='ArrowDown')dy+=amount;else return;e.preventDefault();render();};
$('download').onclick=()=>{
 syncAvailability();if(!photo||!logoReady||busy||!FrameStickers.ready()||!FrameSchedule.allowed(selected))return;
 const exportIndex=selected,exportFormat=format;if(selected===1&&$('pace').value&&!/^\d{1,2}:[0-5]\d$/.test($('pace').value)){showPanel('detailsPanel');$('pace').focus();notify('Preencha o pace como 05:30 ou deixe o campo em branco.');return;}
 busy=true;render();const snapshot=document.createElement('canvas');snapshot.width=canvas.width;snapshot.height=canvas.height;snapshot.getContext('2d').drawImage(canvas,0,0);
 const done=()=>{busy=false;updateControls();};try{snapshot.toBlob(blob=>{done();if(!FrameSchedule.allowed(exportIndex)){syncAvailability();notify('O período mudou. Confira a nova moldura e salve novamente.');return;}if(!blob){notify('Não foi possível salvar a foto. Tente novamente.');return;}const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`meu-corre-2026-${exportIndex+1}-${exportFormat.replace(':','x')}.png`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);notify('Foto salva! Confira os downloads do seu dispositivo.');},'image/png');}catch{done();notify('Não foi possível salvar. Abra o site pelo link publicado e tente novamente.');}
};
FrameStickers.init(render);syncAvailability(true);render();thumbs();setInterval(syncAvailability,1000);window.addEventListener('focus',()=>syncAvailability());document.addEventListener('visibilitychange',()=>syncAvailability());
