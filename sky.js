// Fondo: linternas flotando sobre un cielo nocturno.
const canvas = document.getElementById('sky');
const ctx = canvas.getContext('2d');
let w, h, stars = [], lanterns = [];
let mx = 0.5, my = 0.5;

function makeLantern(startBelow){
  return {
    x: Math.random()*w,
    y: startBelow ? h + Math.random()*h*0.6 : Math.random()*h,
    size: Math.random()*10 + 8,
    speed: Math.random()*0.25 + 0.12,
    drift: (Math.random()-0.5)*0.22,
    flick: Math.random()*Math.PI*2,
    alpha: Math.random()*0.35 + 0.55
  };
}

function resize(){
  w = canvas.width = window.innerWidth;
  h = canvas.height = window.innerHeight;
  stars = Array.from({length: 70}, () => ({
    x: Math.random()*w, y: Math.random()*h*0.8,
    r: Math.random()*1.2 + 0.3,
    tw: Math.random()*Math.PI*2,
    speed: Math.random()*0.02 + 0.004
  }));
  const count = w < 600 ? 16 : 26;
  lanterns = Array.from({length: count}, () => makeLantern(false));
}
window.addEventListener('resize', resize);
window.addEventListener('mousemove', e => { mx = e.clientX / w; my = e.clientY / h; });
window.addEventListener('touchmove', e => {
  if(e.touches[0]){ mx = e.touches[0].clientX / w; my = e.touches[0].clientY / h; }
}, {passive:true});

// tocar / hacer clic suelta una linterna nueva desde ese punto
window.addEventListener('click', e => {
  const l = makeLantern(false);
  l.x = e.clientX; l.y = h + 20; l.size = 14; l.alpha = 1;
  lanterns.push(l);
  if(lanterns.length > 60) lanterns.shift();
});

function drawLantern(l, t){
  const glow = 0.75 + Math.sin(t*0.004 + l.flick)*0.25;
  const px = l.x + (mx-0.5)*14;
  const py = l.y + (my-0.5)*10;

  // halo
  const g = ctx.createRadialGradient(px, py, 0, px, py, l.size*3.4);
  g.addColorStop(0, `rgba(255,196,92,${0.30*glow*l.alpha})`);
  g.addColorStop(1, 'rgba(255,196,92,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(px, py, l.size*3.4, 0, Math.PI*2);
  ctx.fill();

  // cuerpo de la linterna
  const wLan = l.size*0.62, hLan = l.size;
  ctx.fillStyle = `rgba(255,205,120,${0.9*l.alpha})`;
  ctx.beginPath();
  ctx.moveTo(px - wLan*0.38, py - hLan*0.5);
  ctx.lineTo(px + wLan*0.38, py - hLan*0.5);
  ctx.lineTo(px + wLan*0.5,  py + hLan*0.32);
  ctx.quadraticCurveTo(px, py + hLan*0.62, px - wLan*0.5, py + hLan*0.32);
  ctx.closePath();
  ctx.fill();

  // núcleo brillante
  ctx.fillStyle = `rgba(255,240,200,${0.85*glow*l.alpha})`;
  ctx.beginPath();
  ctx.ellipse(px, py + hLan*0.1, wLan*0.22, hLan*0.24, 0, 0, Math.PI*2);
  ctx.fill();

  // tapa superior
  ctx.strokeStyle = `rgba(214,160,80,${0.8*l.alpha})`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(px - wLan*0.42, py - hLan*0.5);
  ctx.lineTo(px + wLan*0.42, py - hLan*0.5);
  ctx.stroke();
}

function draw(t){
  // cielo degradado
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, '#1b1233');
  sky.addColorStop(0.55, '#241a3d');
  sky.addColorStop(1, '#33245a');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  // estrellas
  const offX = (mx-0.5)*16, offY = (my-0.5)*12;
  stars.forEach(s=>{
    const alpha = 0.3 + Math.sin(t*s.speed + s.tw)*0.35;
    ctx.fillStyle = `rgba(253,246,230,${Math.max(0,alpha)})`;
    ctx.beginPath();
    ctx.arc(s.x + offX*0.3, s.y + offY*0.3, s.r, 0, Math.PI*2);
    ctx.fill();
  });

  // reflejo de agua abajo
  const water = ctx.createLinearGradient(0, h*0.82, 0, h);
  water.addColorStop(0, 'rgba(60,44,104,0)');
  water.addColorStop(1, 'rgba(90,66,150,0.55)');
  ctx.fillStyle = water;
  ctx.fillRect(0, h*0.82, w, h*0.18);

  // linternas
  lanterns.forEach(l=>{
    l.y -= l.speed;
    l.x += l.drift + Math.sin(t*0.0008 + l.flick)*0.16;
    if(l.y < -60){
      Object.assign(l, makeLantern(true));
      l.y = h + 40;
    }
    drawLantern(l, t);
  });

  requestAnimationFrame(draw);
}
resize();
requestAnimationFrame(draw);
