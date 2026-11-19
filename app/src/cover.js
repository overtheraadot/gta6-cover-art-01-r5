// drawCover — the Vice Sunset Split cover engine.
// Layouts, sunset/neon gradient-map grades, lettering and effects, all drawn
// on a 2D canvas. No external assets: lettering uses heavy system sans type.

export const GRADES = [
  {
    id: 'vice',
    name: 'Vice Sunset',
    top: 'rgba(255,94,120,0.34)',
    bottom: 'rgba(255,170,60,0.30)',
    tint: 'rgba(255,120,90,0.10)',
    saturate: 1.35,
    contrast: 1.08,
    band: ['#ff2e63', '#ff9a3d'],
  },
  {
    id: 'neon',
    name: 'Neon Nights',
    top: 'rgba(255,46,136,0.38)',
    bottom: 'rgba(34,230,255,0.32)',
    tint: 'rgba(120,60,255,0.12)',
    saturate: 1.45,
    contrast: 1.12,
    band: ['#ff2e88', '#22e6ff'],
  },
  {
    id: 'golden',
    name: 'Golden Hour',
    top: 'rgba(255,190,80,0.30)',
    bottom: 'rgba(255,120,40,0.26)',
    tint: 'rgba(255,200,110,0.12)',
    saturate: 1.3,
    contrast: 1.05,
    band: ['#ffb347', '#ff7b2f'],
  },
  {
    id: 'teal',
    name: 'Palm Teal',
    top: 'rgba(20,220,200,0.30)',
    bottom: 'rgba(255,140,80,0.28)',
    tint: 'rgba(0,180,170,0.10)',
    saturate: 1.35,
    contrast: 1.06,
    band: ['#0fd6c1', '#ff8c42'],
  },
  {
    id: 'noir',
    name: 'Mono Noir',
    top: 'rgba(0,0,0,0.22)',
    bottom: 'rgba(255,255,255,0.10)',
    tint: 'rgba(0,0,0,0.08)',
    saturate: 0.05,
    contrast: 1.18,
    band: ['#111111', '#555555'],
  },
];

export const LAYOUTS = [
  { id: 'split', name: 'Split Hero' },
  { id: 'triple', name: 'Triple Strip' },
  { id: 'quad', name: 'Quad Grid' },
  { id: 'full', name: 'Full Bleed' },
];

export const EXPORT_SIZES = [
  { id: 'square', name: 'Square · 1080 × 1080', w: 1080, h: 1080 },
  { id: 'portrait', name: 'Portrait · 1080 × 1350', w: 1080, h: 1350 },
  { id: 'landscape', name: 'Landscape · 1920 × 1080', w: 1920, h: 1080 },
];

// Panel rects as fractions of the cover, above the title band.
export function layoutPanels(layoutId, aspect) {
  const bandH = layoutId === 'full' ? 0.2 : 0.17;
  const top = 0;
  const bottom = 1 - bandH;
  const ph = bottom - top;
  if (layoutId === 'split') {
    return [
      { x: 0, y: top, w: 0.62, h: ph },
      { x: 0.62, y: top, w: 0.38, h: ph / 2 },
      { x: 0.62, y: top + ph / 2, w: 0.38, h: ph / 2 },
    ];
  }
  if (layoutId === 'triple') {
    return [
      { x: 0, y: top, w: 1 / 3, h: ph },
      { x: 1 / 3, y: top, w: 1 / 3, h: ph },
      { x: 2 / 3, y: top, w: 1 / 3, h: ph },
    ];
  }
  if (layoutId === 'quad') {
    return [
      { x: 0, y: top, w: 0.5, h: ph / 2 },
      { x: 0.5, y: top, w: 0.5, h: ph / 2 },
      { x: 0, y: top + ph / 2, w: 0.5, h: ph / 2 },
      { x: 0.5, y: top + ph / 2, w: 0.5, h: ph / 2 },
    ];
  }
  return [{ x: 0, y: top, w: 1, h: ph }];
}

export function panelCount(layoutId) {
  return layoutPanels(layoutId, 1).length;
}

export function gradeById(id) {
  return GRADES.find((g) => g.id === id) || GRADES[0];
}

function seededNoise(seed, w, h) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  const img = ctx.createImageData(w, h);
  let s = seed >>> 0;
  for (let i = 0; i < img.data.length; i += 4) {
    s = (s * 1664525 + 1013904223) >>> 0;
    const v = s % 256;
    img.data[i] = v;
    img.data[i + 1] = v;
    img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return canvas;
}

let noiseTile = null;
function getNoiseTile() {
  if (!noiseTile) noiseTile = seededNoise(4242, 128, 128);
  return noiseTile;
}

function drawPanelImage(ctx, img, rect, panel, grade) {
  const iw = img.width;
  const ih = img.height;
  const scale = Math.max(rect.w / iw, rect.h / ih) * (panel.zoom || 1);
  const dw = iw * scale;
  const dh = ih * scale;
  const dx = rect.x + (rect.w - dw) / 2 + (panel.ox || 0);
  const dy = rect.y + (rect.h - dh) / 2 + (panel.oy || 0);
  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
  ctx.clip();
  ctx.filter = `saturate(${grade.saturate}) contrast(${grade.contrast})`;
  ctx.drawImage(img, dx, dy, dw, dh);
  ctx.filter = 'none';
  // Gradient-map grade: warm sunset wash from the top, cool/neon from below.
  const g = ctx.createLinearGradient(0, rect.y, 0, rect.y + rect.h);
  g.addColorStop(0, grade.top);
  g.addColorStop(1, grade.bottom);
  ctx.globalCompositeOperation = 'overlay';
  ctx.fillStyle = g;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.globalCompositeOperation = 'soft-light';
  ctx.fillStyle = grade.tint;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.globalCompositeOperation = 'source-over';
  // Thin inner shade so panels read as separate poster frames.
  ctx.strokeStyle = 'rgba(0,0,0,0.35)';
  ctx.lineWidth = Math.max(2, rect.w * 0.004);
  ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
  ctx.restore();
}

function fitFont(ctx, text, maxWidth, startPx, family, weight) {
  let px = startPx;
  ctx.font = `${weight} ${px}px ${family}`;
  while (px > 12 && ctx.measureText(text).width > maxWidth) {
    px -= 2;
    ctx.font = `${weight} ${px}px ${family}`;
  }
  return px;
}

const HEAVY = '"Arial Black", "Archivo Black", Impact, "Helvetica Neue", Arial, sans-serif';
const SCRIPT = '"Segoe Script", "Brush Script MT", "Comic Sans MS", cursive';

export function drawCover(ctx, W, H, state) {
  const grade = gradeById(state.grade);
  const rects = layoutPanels(state.layout, W / H);
  const gutter = Math.max(4, Math.round(Math.min(W, H) * 0.008));
  const bandH = (state.layout === 'full' ? 0.2 : 0.17) * H;
  const bandY = H - bandH;

  // White panel gutters, GTA poster style.
  ctx.fillStyle = '#f5efe6';
  ctx.fillRect(0, 0, W, H);

  const panels = state.panels || [];
  rects.forEach((r, i) => {
    const rect = {
      x: r.x * W + gutter,
      y: r.y * H + gutter,
      w: r.w * W - gutter * 2,
      h: r.h * H - gutter * 2,
    };
    const panel = panels[i] || { zoom: 1, ox: 0, oy: 0 };
    if (panel.img) drawPanelImage(ctx, panel.img, rect, panel, grade);
    else {
      ctx.fillStyle = '#241a33';
      ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    }
  });

  // Badge ribbon on the top-right panel.
  if (state.badge) {
    const pad = Math.round(W * 0.02);
    const fs = Math.round(Math.min(W, H) * 0.032);
    ctx.font = `900 ${fs}px ${HEAVY}`;
    const tw = ctx.measureText(state.badge).width;
    const bw = tw + pad * 1.6;
    const bh = fs * 1.7;
    const bx = W - bw - gutter - pad * 0.5;
    const by = gutter + pad * 0.5;
    ctx.save();
    ctx.fillStyle = grade.band[0];
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(bx + bw, by);
    ctx.lineTo(bx + bw - bh * 0.4, by + bh);
    ctx.lineTo(bx, by + bh);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(state.badge, bx + bw / 2, by + bh / 2 + 1);
    ctx.restore();
  }

  // Title band: sunset gradient with heavy lettering.
  const band = ctx.createLinearGradient(0, bandY, W, bandY);
  band.addColorStop(0, grade.band[0]);
  band.addColorStop(1, grade.band[1]);
  ctx.fillStyle = band;
  ctx.fillRect(0, bandY, W, bandH);
  ctx.fillStyle = 'rgba(255,255,255,0.16)';
  ctx.fillRect(0, bandY, W, Math.max(2, H * 0.004));

  const padX = W * 0.045;
  const title = (state.title || 'VICE SUNSET').toUpperCase();
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  const titlePx = fitFont(
    ctx,
    title,
    W - padX * 2,
    Math.round(bandH * 0.52),
    HEAVY,
    900,
  );
  const titleY = bandY + bandH * 0.56;
  ctx.font = `900 ${titlePx}px ${HEAVY}`;
  ctx.lineJoin = 'round';
  ctx.strokeStyle = 'rgba(20,8,30,0.85)';
  ctx.lineWidth = Math.max(3, titlePx * 0.07);
  ctx.strokeText(title, padX, titleY);
  ctx.fillStyle = '#ffffff';
  ctx.fillText(title, padX, titleY);

  if (state.subtitle) {
    const subPx = Math.round(bandH * 0.2);
    ctx.font = `italic 700 ${subPx}px ${SCRIPT}`;
    ctx.fillStyle = '#fff6d8';
    ctx.shadowColor = 'rgba(255,46,136,0.9)';
    ctx.shadowBlur = Math.round(subPx * 0.5);
    ctx.fillText(state.subtitle, padX + 2, bandY + bandH * 0.88);
    ctx.shadowBlur = 0;
  }

  if (state.grain) {
    ctx.save();
    ctx.globalAlpha = 0.07;
    const tile = getNoiseTile();
    const pattern = ctx.createPattern(tile, 'repeat');
    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  if (state.vignette) {
    const v = ctx.createRadialGradient(
      W / 2, H / 2, Math.min(W, H) * 0.42,
      W / 2, H / 2, Math.max(W, H) * 0.72,
    );
    v.addColorStop(0, 'rgba(0,0,0,0)');
    v.addColorStop(1, 'rgba(10,4,20,0.42)');
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, W, H);
  }
}

// Render a cover into a fresh canvas at the requested export size.
export function renderCoverCanvas(w, h, state) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  drawCover(canvas.getContext('2d'), w, h, state);
  return canvas;
}
