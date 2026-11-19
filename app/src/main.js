// main.js — Vice Sunset Split editor.
// Wires the controls to the cover engine: layout, grade, per-panel pan/zoom,
// photo upload, same-photo mode, live caption editing and PNG export.

import { GRADES, LAYOUTS, EXPORT_SIZES, layoutPanels, panelCount, renderCoverCanvas, drawCover } from './cover.js';
import { SAMPLE_PHOTOS, paintSamplePhoto } from './sample.js';

const $ = (id) => document.getElementById(id);

const state = {
  layout: 'split',
  grade: 'vice',
  title: 'VICE SUNSET',
  subtitle: 'Neon nights on the boulevard',
  badge: 'LEONIDA',
  size: 'portrait',
  samePhoto: true,
  grain: true,
  vignette: true,
  sampleId: 'boulevard',
  panels: [],
  selected: 0,
};

let sampleCache = {};
function sampleImage(id) {
  if (!sampleCache[id]) sampleCache[id] = paintSamplePhoto(id, 1200, 900);
  return sampleCache[id];
}

function ensurePanels() {
  const n = panelCount(state.layout);
  while (state.panels.length < n) {
    state.panels.push({ img: null, sampleId: state.sampleId, zoom: 1, ox: 0, oy: 0 });
  }
  state.panels.length = n;
  if (state.selected >= n) state.selected = 0;
}

function panelImage(panel) {
  if (panel.img) return panel.img;
  return sampleImage(panel.sampleId || state.sampleId);
}

function currentPanels() {
  return state.panels.map((p) => ({ ...p, img: panelImage(p) }));
}

function renderState() {
  return {
    layout: state.layout,
    grade: state.grade,
    title: state.title,
    subtitle: state.subtitle,
    badge: state.badge,
    grain: state.grain,
    vignette: state.vignette,
    panels: currentPanels(),
  };
}

const preview = $('preview');
const pctx = preview.getContext('2d');

function renderPreview() {
  ensurePanels();
  const size = EXPORT_SIZES.find((s) => s.id === state.size) || EXPORT_SIZES[1];
  const maxW = 640;
  const scale = Math.min(1, maxW / size.w, 520 / size.h);
  preview.width = Math.round(size.w * scale);
  preview.height = Math.round(size.h * scale);
  drawCover(pctx, preview.width, preview.height, renderState());
  drawSelection();
}

function drawSelection() {
  const size = EXPORT_SIZES.find((s) => s.id === state.size) || EXPORT_SIZES[1];
  const sx = preview.width / size.w;
  const sy = preview.height / size.h;
  const rects = layoutPanels(state.layout, size.w / size.h);
  const r = rects[state.selected];
  if (!r) return;
  pctx.save();
  pctx.strokeStyle = '#22e6ff';
  pctx.lineWidth = 3;
  pctx.setLineDash([10, 6]);
  pctx.strokeRect(r.x * preview.width + 2, r.y * preview.height + 2, r.w * preview.width - 4, r.h * preview.height - 4);
  pctx.restore();
  $('panelLabel').textContent = `Panel ${state.selected + 1} of ${rects.length} — drag to pan, slider to zoom`;
}

function refreshPanelControls() {
  const p = state.panels[state.selected] || { zoom: 1 };
  $('zoom').value = String(Math.round((p.zoom || 1) * 100));
  $('zoomVal').textContent = `${Math.round((p.zoom || 1) * 100)}%`;
  $('samePhoto').checked = state.samePhoto;
  $('sampleSelect').value = state.sampleId;
}

function buildButtons(el, items, activeId, onPick) {
  el.innerHTML = '';
  for (const item of items) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip' + (item.id === activeId ? ' active' : '');
    b.textContent = item.name;
    b.addEventListener('click', () => {
      onPick(item.id);
      buildButtons(el, items, item.id, onPick);
      renderPreview();
      refreshPanelControls();
    });
    el.appendChild(b);
  }
}

function applySamePhoto() {
  if (!state.samePhoto) return;
  const first = state.panels[0];
  if (!first) return;
  for (const p of state.panels) {
    p.img = first.img;
    p.sampleId = first.sampleId;
  }
}

function exportOne(size) {
  const canvas = renderCoverCanvas(size.w, size.h, renderState());
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) return resolve(false);
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `vice-sunset-split-${size.id}-${size.w}x${size.h}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
      resolve(true);
    }, 'image/png');
  });
}

async function exportAll() {
  $('exportStatus').textContent = 'Exporting 3 PNGs…';
  for (const size of EXPORT_SIZES) {
    // eslint-disable-next-line no-await-in-loop
    await exportOne(size);
  }
  $('exportStatus').textContent = 'Exported 1080×1080, 1080×1350 and 1920×1080.';
}

// Drag to pan the selected panel; click a panel to select it.
let dragging = null;
function previewPoint(e) {
  const rect = preview.getBoundingClientRect();
  return { x: (e.clientX - rect.left) * (preview.width / rect.width), y: (e.clientY - rect.top) * (preview.height / rect.height) };
}
function panelAt(x, y) {
  const size = EXPORT_SIZES.find((s) => s.id === state.size) || EXPORT_SIZES[1];
  const rects = layoutPanels(state.layout, size.w / size.h);
  for (let i = 0; i < rects.length; i++) {
    const r = rects[i];
    if (x >= r.x * preview.width && x <= (r.x + r.w) * preview.width
      && y >= r.y * preview.height && y <= (r.y + r.h) * preview.height) return i;
  }
  return 0;
}
preview.addEventListener('pointerdown', (e) => {
  const pt = previewPoint(e);
  const i = panelAt(pt.x, pt.y);
  state.selected = i;
  const p = state.panels[i];
  dragging = { x: pt.x, y: pt.y, ox: p.ox, oy: p.oy, moved: false };
  preview.setPointerCapture(e.pointerId);
  refreshPanelControls();
  renderPreview();
});
preview.addEventListener('pointermove', (e) => {
  if (!dragging) return;
  const pt = previewPoint(e);
  const p = state.panels[state.selected];
  const dx = pt.x - dragging.x;
  const dy = pt.y - dragging.y;
  if (Math.abs(dx) + Math.abs(dy) > 2) dragging.moved = true;
  p.ox = dragging.ox + dx;
  p.oy = dragging.oy + dy;
  renderPreview();
});
preview.addEventListener('pointerup', () => { dragging = null; });

function bind() {
  buildButtons($('layoutBtns'), LAYOUTS, state.layout, (id) => { state.layout = id; state.selected = 0; });
  buildButtons($('gradeBtns'), GRADES, state.grade, (id) => { state.grade = id; });
  buildButtons($('sizeBtns'), EXPORT_SIZES, state.size, (id) => { state.size = id; });

  const sampleSel = $('sampleSelect');
  for (const s of SAMPLE_PHOTOS) {
    const o = document.createElement('option');
    o.value = s.id;
    o.textContent = `Sample: ${s.name}`;
    sampleSel.appendChild(o);
  }
  sampleSel.value = state.sampleId;
  sampleSel.addEventListener('change', () => {
    state.sampleId = sampleSel.value;
    for (const p of state.panels) { if (!p.img) p.sampleId = state.sampleId; }
    if (state.samePhoto) { const f = state.panels[0]; if (f) f.sampleId = state.sampleId; }
    applySamePhoto();
    renderPreview();
  });

  $('title').addEventListener('input', (e) => { state.title = e.target.value; renderPreview(); });
  $('subtitle').addEventListener('input', (e) => { state.subtitle = e.target.value; renderPreview(); });
  $('badge').addEventListener('input', (e) => { state.badge = e.target.value; renderPreview(); });

  $('zoom').addEventListener('input', (e) => {
    const z = Number(e.target.value) / 100;
    state.panels[state.selected].zoom = z;
    $('zoomVal').textContent = `${e.target.value}%`;
    renderPreview();
  });

  $('samePhoto').addEventListener('change', (e) => {
    state.samePhoto = e.target.checked;
    applySamePhoto();
    renderPreview();
  });

  $('grain').addEventListener('change', (e) => { state.grain = e.target.checked; renderPreview(); });
  $('vignette').addEventListener('change', (e) => { state.vignette = e.target.checked; renderPreview(); });

  $('photoFile').addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const p = state.panels[state.selected];
      p.img = img;
      p.zoom = 1;
      p.ox = 0;
      p.oy = 0;
      applySamePhoto();
      renderPreview();
      refreshPanelControls();
      $('exportStatus').textContent = `Loaded ${file.name} into panel ${state.selected + 1}.`;
    };
    img.src = url;
  });

  $('useSample').addEventListener('click', () => {
    const p = state.panels[state.selected];
    p.img = null;
    p.sampleId = state.sampleId;
    p.zoom = 1;
    p.ox = 0;
    p.oy = 0;
    applySamePhoto();
    renderPreview();
    refreshPanelControls();
  });

  $('exportOne').addEventListener('click', async () => {
    const size = EXPORT_SIZES.find((s) => s.id === state.size) || EXPORT_SIZES[1];
    $('exportStatus').textContent = `Exporting ${size.w}×${size.h} PNG…`;
    await exportOne(size);
    $('exportStatus').textContent = `Exported ${size.w}×${size.h} PNG.`;
  });
  $('exportAll').addEventListener('click', exportAll);

  $('shuffle').addEventListener('click', () => {
    const layouts = LAYOUTS.map((l) => l.id);
    const grades = GRADES.map((g) => g.id);
    state.layout = layouts[Math.floor(Math.random() * layouts.length)];
    state.grade = grades[Math.floor(Math.random() * grades.length)];
    state.sampleId = SAMPLE_PHOTOS[Math.floor(Math.random() * SAMPLE_PHOTOS.length)].id;
    state.selected = 0;
    buildButtons($('layoutBtns'), LAYOUTS, state.layout, (id) => { state.layout = id; state.selected = 0; });
    buildButtons($('gradeBtns'), GRADES, state.grade, (id) => { state.grade = id; });
    $('sampleSelect').value = state.sampleId;
    for (const p of state.panels) { p.img = null; p.sampleId = state.sampleId; }
    renderPreview();
    refreshPanelControls();
  });
}

// Shot mode for screenshots: ?shot=cover&size=landscape&layout=split&grade=vice
// renders one cover full-window; ?shot=editor shows the editor (default).
function shotMode() {
  const q = new URLSearchParams(window.location.search);
  const shot = q.get('shot');
  if (!shot) return false;
  if (q.get('layout')) state.layout = q.get('layout');
  if (q.get('grade')) state.grade = q.get('grade');
  if (q.get('size')) state.size = q.get('size');
  if (q.get('title')) state.title = q.get('title');
  if (q.get('subtitle') !== null) state.subtitle = q.get('subtitle') || '';
  if (q.get('badge') !== null) state.badge = q.get('badge') || '';
  if (q.get('sample')) state.sampleId = q.get('sample');
  ensurePanels();
  for (const p of state.panels) { if (!p.img) p.sampleId = state.sampleId; }
  if (shot === 'cover') {
    document.body.classList.add('shot-cover');
    const w = window.innerWidth;
    const h = window.innerHeight;
    const canvas = renderCoverCanvas(w, h, renderState());
    canvas.id = 'shotCanvas';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.display = 'block';
    document.body.appendChild(canvas);
    document.title = 'Vice Sunset Split — cover';
    return true;
  }
  return false;
}

ensurePanels();
if (!shotMode()) {
  bind();
  renderPreview();
  refreshPanelControls();
}
