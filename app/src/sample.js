// paintSamplePhoto — built-in procedural sample photos, painted in code.
// No Rockstar assets, no copyrighted images, no real people: every pixel is
// drawn here with canvas shapes. Two scenes: a Vice City sunset boulevard
// and a neon night street. Used when the user has not loaded their own photo.

export function makeSeededRandom(seed) {
  let s = seed >>> 0;
  return function random() {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function paintPalm(ctx, x, y, scale, lean, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(lean);
  ctx.scale(scale, scale);
  ctx.strokeStyle = color;
  ctx.lineWidth = 9;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(14, -70, 4, -150);
  ctx.stroke();
  ctx.lineWidth = 6;
  for (let i = 0; i < 7; i++) {
    const a = -Math.PI * (0.08 + i * 0.13);
    const len = 62 - Math.abs(i - 3) * 7;
    ctx.beginPath();
    ctx.moveTo(4, -150);
    ctx.quadraticCurveTo(
      4 + Math.cos(a) * len * 0.6,
      -150 + Math.sin(a) * len * 0.45,
      4 + Math.cos(a) * len,
      -150 + Math.sin(a) * len + 26,
    );
    ctx.stroke();
  }
  ctx.restore();
}

function paintSun(ctx, cx, cy, r, core, glow) {
  const g = ctx.createRadialGradient(cx, cy, r * 0.1, cx, cy, r * 2.6);
  g.addColorStop(0, glow);
  g.addColorStop(1, 'rgba(255,120,80,0)');
  ctx.fillStyle = g;
  ctx.fillRect(cx - r * 3, cy - r * 3, r * 6, r * 6);
  ctx.fillStyle = core;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
}

function paintBuildings(ctx, w, h, horizon, palette, random) {
  let x = -10;
  while (x < w + 10) {
    const bw = 46 + random() * 90;
    const bh = 60 + random() * 150;
    ctx.fillStyle = palette[Math.floor(random() * palette.length)];
    ctx.fillRect(x, horizon - bh, bw, bh);
    ctx.fillStyle = 'rgba(255,214,120,0.85)';
    for (let wy = horizon - bh + 12; wy < horizon - 14; wy += 22) {
      for (let wx = x + 8; wx < x + bw - 10; wx += 18) {
        if (random() > 0.45) ctx.fillRect(wx, wy, 8, 11);
      }
    }
    x += bw + 6 + random() * 14;
  }
}

function paintRoad(ctx, w, h, horizon, top, bottom) {
  const g = ctx.createLinearGradient(0, horizon, 0, h);
  g.addColorStop(0, top);
  g.addColorStop(1, bottom);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(0, h);
  ctx.lineTo(w, h);
  ctx.lineTo(w * 0.62, horizon);
  ctx.lineTo(w * 0.38, horizon);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.75)';
  ctx.lineWidth = 4;
  ctx.setLineDash([26, 22]);
  ctx.beginPath();
  ctx.moveTo(w / 2, h);
  ctx.lineTo(w / 2, horizon);
  ctx.stroke();
  ctx.setLineDash([]);
}

// Scene 1: sunset boulevard with a vintage convertible and palms.
export function paintBoulevardSunset(w, h) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  const random = makeSeededRandom(20261119);
  const horizon = h * 0.62;

  const sky = ctx.createLinearGradient(0, 0, 0, horizon);
  sky.addColorStop(0, '#2b1055');
  sky.addColorStop(0.35, '#7597de');
  sky.addColorStop(0.62, '#ff7e5f');
  sky.addColorStop(0.85, '#feb47b');
  sky.addColorStop(1, '#ffd194');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, horizon + 1);

  paintSun(ctx, w * 0.68, horizon - h * 0.1, h * 0.11, '#fff3c4', 'rgba(255,170,90,0.55)');

  ctx.fillStyle = 'rgba(255,255,255,0.28)';
  for (let i = 0; i < 9; i++) {
    const cx = random() * w;
    const cy = random() * horizon * 0.5;
    const cw = 90 + random() * 160;
    ctx.beginPath();
    ctx.ellipse(cx, cy, cw, 10 + random() * 8, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  paintBuildings(ctx, w, h, horizon, ['#1d1140', '#2c1a52', '#3a2060', '#241343'], random);

  const sea = ctx.createLinearGradient(0, horizon, 0, h);
  sea.addColorStop(0, '#ff9a5c');
  sea.addColorStop(0.25, '#e85d75');
  sea.addColorStop(1, '#3a1c5c');
  ctx.fillStyle = sea;
  ctx.fillRect(0, horizon, w, h - horizon);
  ctx.fillStyle = 'rgba(255,220,150,0.35)';
  for (let i = 0; i < 26; i++) {
    const y = horizon + 8 + random() * (h - horizon - 16);
    const x = random() * w;
    ctx.fillRect(x, y, 30 + random() * 90, 2);
  }

  paintRoad(ctx, w, h, horizon, '#4a2b52', '#1c0f2e');

  // Vintage convertible silhouette, low in the frame.
  ctx.save();
  ctx.translate(w * 0.5, h * 0.86);
  ctx.scale(w / 900, w / 900);
  ctx.fillStyle = '#c1123a';
  ctx.beginPath();
  ctx.moveTo(-190, 0);
  ctx.lineTo(-180, -34);
  ctx.quadraticCurveTo(-120, -52, -60, -50);
  ctx.lineTo(30, -48);
  ctx.quadraticCurveTo(120, -46, 175, -18);
  ctx.lineTo(195, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#1b0f24';
  ctx.beginPath();
  ctx.moveTo(-110, -48);
  ctx.lineTo(-40, -48);
  ctx.lineTo(-30, -78);
  ctx.lineTo(-96, -78);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-18, -48);
  ctx.lineTo(48, -48);
  ctx.lineTo(38, -76);
  ctx.lineTo(-8, -76);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#120a1c';
  ctx.beginPath();
  ctx.arc(-110, 2, 30, 0, Math.PI * 2);
  ctx.arc(115, 2, 30, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#e8e8e8';
  ctx.beginPath();
  ctx.arc(-110, 2, 13, 0, Math.PI * 2);
  ctx.arc(115, 2, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  paintPalm(ctx, w * 0.06, h * 0.98, h / 420, -0.12, '#160a26');
  paintPalm(ctx, w * 0.94, h * 0.98, h / 380, 0.14, '#160a26');
  paintPalm(ctx, w * 0.2, h * 0.7, h / 700, -0.06, '#1d0d33');
  return canvas;
}

// Scene 2: neon night street, wet pavement, diner glow.
export function paintNeonStreet(w, h) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  const random = makeSeededRandom(777);
  const horizon = h * 0.58;

  const sky = ctx.createLinearGradient(0, 0, 0, horizon);
  sky.addColorStop(0, '#05021a');
  sky.addColorStop(0.6, '#1b0b3a');
  sky.addColorStop(1, '#3d1157');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, horizon + 1);

  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  for (let i = 0; i < 60; i++) ctx.fillRect(random() * w, random() * horizon * 0.6, 2, 2);

  paintBuildings(ctx, w, h, horizon, ['#0d0620', '#150a2e', '#1c0d38'], random);

  // Neon signs.
  const signs = [
    { x: 0.12, y: 0.3, c: '#ff2e88', label: 'DINER' },
    { x: 0.55, y: 0.22, c: '#22e6ff', label: 'HOTEL' },
    { x: 0.82, y: 0.36, c: '#ffe14d', label: 'BAR' },
  ];
  for (const s of signs) {
    ctx.save();
    ctx.shadowColor = s.c;
    ctx.shadowBlur = 34;
    ctx.fillStyle = s.c;
    ctx.font = `900 ${Math.round(h * 0.07)}px "Arial Black", Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(s.label, w * s.x, h * s.y);
    ctx.restore();
  }

  const street = ctx.createLinearGradient(0, horizon, 0, h);
  street.addColorStop(0, '#241238');
  street.addColorStop(1, '#070312');
  ctx.fillStyle = street;
  ctx.fillRect(0, horizon, w, h - horizon);

  // Wet-pavement neon reflections.
  for (const s of signs) {
    const g = ctx.createLinearGradient(0, horizon, 0, h);
    g.addColorStop(0, s.c);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.globalAlpha = 0.4;
    ctx.fillStyle = g;
    ctx.fillRect(w * s.x - 46, horizon, 92, h - horizon);
    ctx.globalAlpha = 1;
  }
  ctx.fillStyle = 'rgba(255,255,255,0.16)';
  for (let i = 0; i < 40; i++) {
    ctx.fillRect(random() * w, horizon + random() * (h - horizon), 20 + random() * 70, 2);
  }

  paintPalm(ctx, w * 0.04, h * 0.99, h / 430, -0.1, '#05010d');
  paintPalm(ctx, w * 0.97, h * 0.99, h / 400, 0.12, '#05010d');

  // Two friends silhouetted, laughing on the street.
  ctx.fillStyle = '#0a0416';
  for (const [fx, fh] of [[0.42, 0.3], [0.58, 0.27]]) {
    const x = w * fx;
    const y = h * 0.97;
    const s = h * fh;
    ctx.beginPath();
    ctx.arc(x, y - s * 0.92, s * 0.09, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x - s * 0.11, y);
    ctx.lineTo(x - s * 0.13, y - s * 0.62);
    ctx.quadraticCurveTo(x, y - s * 0.86, x + s * 0.13, y - s * 0.62);
    ctx.lineTo(x + s * 0.11, y);
    ctx.closePath();
    ctx.fill();
  }
  return canvas;
}

export const SAMPLE_PHOTOS = [
  { id: 'boulevard', name: 'Boulevard Sunset', paint: paintBoulevardSunset },
  { id: 'neon', name: 'Neon Street', paint: paintNeonStreet },
];

export function paintSamplePhoto(id, w, h) {
  const found = SAMPLE_PHOTOS.find((s) => s.id === id) || SAMPLE_PHOTOS[0];
  return found.paint(w, h);
}
