'use strict';
/* ================= ДВИЖОК: 2D-слои в 3D-перспективе, всё — функция времени ================= */
const W = 1920, H = 980, F = 1400, TAU = Math.PI * 2;
const C = { bg: '#F5F2EA', dk: '#2C4536', dk2: '#3F5E4A', sg: '#6F8F76', lt: '#A9C4AE', ac: '#C7713A', ac2: '#E8A06E', cr: '#EFEBE1', ink: '#2A2F2B' };
const FONT = "'Adwaita Sans','Inter','DejaVu Sans',Arial,sans-serif";
const cv = document.getElementById('c');
const ctx = cv.getContext('2d');

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, p) => a + (b - a) * p;
const P = (t, a, d = 0.6) => clamp((t - a) / d);
const eo = p => 1 - Math.pow(1 - p, 3);
const ei = p => p * p * p;
const eio = p => p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
const eb = p => { const c = 2.2; return 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2); };
const sm = p => p * p * (3 - 2 * p);
const bounce = p => { const n = 7.5625, d = 2.75; if (p < 1 / d) return n * p * p; if (p < 2 / d) { p -= 1.5 / d; return n * p * p + .75; } if (p < 2.5 / d) { p -= 2.25 / d; return n * p * p + .9375; } p -= 2.625 / d; return n * p * p + .984375; };
const rnd = i => { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const rub = v => Math.round(v).toLocaleString('ru-RU').replace(/\u00A0|\u202F/g, ' ') + ' ₽';

/* ---------- камера ---------- */
let cam = { x: 0, y: 0, z: 0, yaw: 0, pitch: 0, roll: 0 };
function setCam(c) { cam = Object.assign({ x: 0, y: 0, z: 0, yaw: 0, pitch: 0, roll: 0 }, c); }
function proj(x, y, z) {
  const X = x - cam.x, Y = y - cam.y, Z = z - cam.z;
  const cy = Math.cos(cam.yaw), sy = Math.sin(cam.yaw);
  const X1 = X * cy + Z * sy, Z1 = -X * sy + Z * cy;
  const cp = Math.cos(cam.pitch), sp = Math.sin(cam.pitch);
  const Y1 = Y * cp - Z1 * sp, Z2 = Y * sp + Z1 * cp;
  const d = F + Z2;
  if (d < 80) return null;
  const s = F / d;
  return { x: W / 2 + X1 * s, y: H / 2 + Y1 * s, s, d };
}

/* плоский слой в мире: локальные оси проецируются аффинно (+ тень, туман) */
function plane(x, y, z, fn, o = {}) {
  const ry = o.ry || 0, rx = o.rx || 0, rz = o.rz || 0, sc = o.s || 1;
  const pt = (u, v) => {
    const a = u * Math.cos(rz) - v * Math.sin(rz), b = u * Math.sin(rz) + v * Math.cos(rz);
    const b2 = b * Math.cos(rx), c2 = b * Math.sin(rx);
    const a3 = a * Math.cos(ry) + c2 * Math.sin(ry), c3 = -a * Math.sin(ry) + c2 * Math.cos(ry);
    return proj(x + a3 * sc, y + b2 * sc, z + c3 * sc);
  };
  const O = pt(0, 0), X = pt(1, 0), Y = pt(0, 1);
  if (!O || !X || !Y) return;
  const fog = o.fog === false ? 1 : clamp(1 - (O.d - 2300) / 3500, 0.1, 1);
  ctx.save();
  ctx.globalAlpha *= fog * (o.a === undefined ? 1 : o.a);
  ctx.transform(X.x - O.x, X.y - O.y, Y.x - O.x, Y.y - O.y, O.x, O.y);
  fn(O.s);
  ctx.restore();
}

/* ---------- примитивы в локальных координатах ---------- */
function rr(x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
function txt(s, x, y, size, color, weight = 800, align = 'center', ls = 0) {
  ctx.font = `${weight} ${size}px ${FONT}`; ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = 'middle';
  ctx.letterSpacing = ls + 'px'; ctx.fillText(s, x, y); ctx.letterSpacing = '0px';
}
function outline(s, x, y, size, color, lw = 3, weight = 900) {
  ctx.font = `${weight} ${size}px ${FONT}`; ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.strokeText(s, x, y);
}
function shadowOn(s, k = 1, col = 'rgba(44,69,54,.32)') { ctx.shadowColor = col; ctx.shadowBlur = 50 * s * k; ctx.shadowOffsetY = 28 * s * k; }
function shadowOff() { ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0; }
function card(w, h, s, fill = C.cr, o = {}) {
  shadowOn(s, o.sh === undefined ? 1 : o.sh);
  rr(-w / 2, -h / 2, w, h, o.r || 34); ctx.fillStyle = fill; ctx.fill(); shadowOff();
  if (o.border) { ctx.lineWidth = o.bw || 4; ctx.strokeStyle = o.border; ctx.stroke(); }
}
function dkGrad(w, h) { const g = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2); g.addColorStop(0, C.dk2); g.addColorStop(1, C.dk); return g; }

/* ---------- кинетическая типографика: каждая буква — отдельный слой по глубине ---------- */
const _m = document.createElement('canvas').getContext('2d');
function measure(s, size, weight) { _m.font = `${weight} ${size}px ${FONT}`; return _m.measureText(s).width; }
function layout(s, size, wfn) {
  const arr = []; let x = 0;
  [...s].forEach((ch, i) => { const wt = typeof wfn === 'function' ? wfn(i, ch) : wfn; const w = measure(ch, size, wt); arr.push({ ch, x, w, wt }); x += w; });
  arr.forEach(a => a.x -= x / 2);
  return { arr, tot: x };
}
function letterState(i, n, t, o) {
  const u = t - o.t0, d = i * (o.st === undefined ? 0.05 : o.st);
  let st = { dx: 0, dy: 0, dz: 0, rot: 0, sx: 1, sy: 1, a: 1 };
  const p = P(u, d, o.dur || 0.8);
  switch (o.mode || 'fly') {
    case 'fly': st.dz = (1 - eo(p)) * 2400; st.a = P(u, d, .25); st.rot = (1 - eo(p)) * (i % 2 ? .5 : -.5); break;
    case 'drop': st.dy = -(1 - bounce(p)) * 650; st.a = P(u, d, .12); st.rot = (1 - p) * (i % 2 ? .45 : -.45); break;
    case 'stretch': st.sx = lerp(4, 1, eo(p)); st.a = P(u, d, .3); break;
    case 'rise': st.dy = (1 - eo(p)) * 160; st.a = p; st.sy = lerp(.2, 1, eo(p)); break;
    case 'flip': st.sy = Math.max(.001, eo(p)); st.dy = (1 - p) * 90; st.a = P(u, d, .2); break;
    case 'pop': { const q = eb(p); st.sx = st.sy = Math.max(.001, q); st.a = P(u, d, .15); break; }
    case 'spin': st.rot = (1 - eo(p)) * 3.2; st.sx = st.sy = Math.max(.001, eo(p)); st.a = P(u, d, .2); break;
    case 'back': st.dz = -(1 - eo(p)) * 1500; st.a = P(u, d, .25); break;
  }
  if (o.out !== undefined && t > o.out) {
    const q = P(t, o.out + i * 0.025, .55);
    switch (o.outMode || 'blast') {
      case 'blast': st.dz -= ei(q) * 1700; break;
      case 'sink': st.dz += ei(q) * 2200; break;
      case 'up': st.dy -= ei(q) * 520; break;
      case 'down': st.dy += ei(q) * 520; break;
      case 'spin': st.rot += q * 2.4; st.sx *= 1 - q * .9; st.sy *= 1 - q * .9; break;
    }
    st.a *= 1 - P(q, .55, .45);
  }
  return st;
}
function word(s, x, y, z, o) {
  if (o.t < o.t0 - .01) return;
  const sc = o.sc || 1, ry = o.ry || 0;
  const L = layout(s, o.size, o.weight || 800), n = L.arr.length;
  L.arr.forEach((a, i) => {
    const st = letterState(i, n, o.t, o);
    if (st.a <= .003) return;
    const off = (a.x + a.w / 2) * sc;
    plane(x + off * Math.cos(ry) + st.dx, y + st.dy, z - off * Math.sin(ry) + st.dz, () => {
      ctx.globalAlpha *= st.a; ctx.rotate(st.rot); ctx.scale(st.sx, st.sy);
      if (o.stroke) outline(a.ch, 0, 0, o.size, o.stroke, o.lw || 4, a.wt); else txt(a.ch, 0, 0, o.size, o.color, a.wt);
    }, { ry, s: sc, rx: o.rx || 0, rz: o.rz || 0 });
  });
  return L.tot * sc;
}
/* строка, открывающаяся диагональной маской */
function mword(s, x, y, z, o) {
  if (o.t < o.t0) return;
  const u = o.t - o.t0, p = eo(P(u, 0, o.dur || .8));
  let a = 1; if (o.out !== undefined) a = 1 - P(o.t, o.out, .4);
  if (a <= .003) return;
  const w = measure(s, o.size, o.weight || 800), sk = o.size * .5;
  plane(x, y, z, () => {
    ctx.globalAlpha *= a;
    ctx.beginPath();
    const r = -w / 2 - sk + (w + sk * 2) * p, h = o.size;
    ctx.moveTo(-w / 2 - sk, -h); ctx.lineTo(r + sk, -h); ctx.lineTo(r - sk, h); ctx.lineTo(-w / 2 - sk, h); ctx.closePath(); ctx.clip();
    txt(s, (1 - p) * -50, 0, o.size, o.color, o.weight || 800, 'center', o.ls || 0);
  }, { ry: o.ry || 0, rx: o.rx || 0, s: o.sc || 1 });
  return w;
}
/* простая надпись-слой с анимацией появления: up | pop | fade */
function label(s, x, y, z, o) {
  if (o.t < o.t0) return;
  const u = o.t - o.t0, p = eo(P(u, 0, .6));
  let a = p; if (o.out !== undefined) a *= 1 - P(o.t, o.out, .4);
  if (a <= .003) return;
  const q = o.mode === 'pop' ? Math.max(.001, eb(P(u, 0, .7))) : 1;
  plane(x, y + (o.mode === 'pop' ? 0 : (1 - p) * 60), z, () => { ctx.globalAlpha *= a; ctx.scale(q, q); txt(s, 0, 0, o.size, o.color, o.weight || 800, 'center', o.ls || 0); }, { ry: o.ry || 0, rx: o.rx || 0, s: o.sc || 1 });
}

/* ---------- мелкие объекты ---------- */
function coin(x, y, z, o = {}) {
  plane(x, y, z, s => {
    const sp = Math.cos(o.spin || 0), r = o.r || 46;
    ctx.scale(Math.max(.12, Math.abs(sp)), 1);
    shadowOn(s, .4, 'rgba(199,113,58,.45)');
    const g = ctx.createRadialGradient(-r * .3, -r * .35, 4, 0, 0, r);
    g.addColorStop(0, '#F0B084'); g.addColorStop(1, C.ac);
    ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fillStyle = g; ctx.fill(); shadowOff();
    ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.beginPath(); ctx.arc(0, 0, r * .78, 0, TAU); ctx.stroke();
    txt('₽', 0, 3, r * 1.1, '#fff', 800);
  }, { a: o.a === undefined ? 1 : o.a, s: o.s || 1 });
}
function ring(x, y, z, r, color, lw, a, o = {}) {
  plane(x, y, z, () => { ctx.globalAlpha *= a; ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.lineWidth = lw; ctx.strokeStyle = color; ctx.stroke(); }, { rx: o.rx || 0, fog: false });
}
function shock(x, y, z, t, t0, color = C.ac, o = {}) {
  const u = t - t0; if (u < 0 || u > 1.1) return;
  const p = eo(u / 1.1);
  ring(x, y, z, 40 + p * (o.r || 520), color, lerp(14, 2, p), 1 - p, o);
  if (u < .8) ring(x, y, z, 20 + eo(u / .8) * (o.r || 520) * .6, color, lerp(8, 1, u / .8), (1 - u / .8) * .8, o);
}
function person(x, y, z, o = {}) {
  const sw = Math.sin(o.ph || 0) * (o.walk || 0), bob = -Math.abs(Math.sin(o.ph || 0)) * 8 * (o.walk || 0);
  const wave = o.wave || 0, wv = Math.sin((o.ph || 0) * 1.5);
  plane(x, y, z, s => {
    if (o.flip) ctx.scale(-1, 1);
    ctx.fillStyle = 'rgba(42,47,43,.2)'; ctx.beginPath(); ctx.ellipse(0, 0, 70, 12, 0, 0, TAU); ctx.fill();
    ctx.translate(0, bob);
    const limb = (px, py, ang, w, len, col) => { ctx.save(); ctx.translate(px, py); ctx.rotate(ang); rr(-w / 2, 0, w, len, w / 2); ctx.fillStyle = col; ctx.fill(); ctx.restore(); };
    limb(-15, -150, sw * .55, 28, 150, o.pants || C.ink);
    limb(15, -150, -sw * .55, 28, 150, o.pants || C.ink);
    rr(-40, -255, 80, 120, 28); ctx.fillStyle = o.shirt || C.dk2; ctx.fill();
    ctx.strokeStyle = 'rgba(239,235,225,.45)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-14, -253); ctx.lineTo(0, -228); ctx.lineTo(14, -253); ctx.stroke();
    limb(-44, -238, -sw * .5, 24, 108, o.shirt || C.dk2);
    limb(44, -238, wave ? (-2.5 + wv * .35) * wave + sw * .5 * (1 - wave) : sw * .5, 24, 108, o.shirt || C.dk2);
    rr(-9, -282, 18, 30, 6); ctx.fillStyle = '#E8C4A0'; ctx.fill();
    ctx.beginPath(); ctx.arc(0, -296, 32, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-33, -296); ctx.quadraticCurveTo(-36, -334, 0, -334); ctx.quadraticCurveTo(36, -334, 33, -296); ctx.quadraticCurveTo(24, -316, 0, -316); ctx.quadraticCurveTo(-24, -316, -33, -296);
    ctx.fillStyle = o.hair || C.ink; ctx.fill();
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(-11, -292, 3, 0, TAU); ctx.arc(11, -292, 3, 0, TAU); ctx.fill();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-9, -280); ctx.quadraticCurveTo(0, -273, 9, -280); ctx.stroke();
    if (o.phone) { ctx.save(); ctx.translate(46, -135); rr(-11, -34, 22, 40, 5); ctx.fillStyle = C.ink; ctx.fill(); rr(-8, -30, 16, 30, 3); ctx.fillStyle = C.cr; ctx.fill(); ctx.restore(); }
  }, { s: o.s || 1, a: o.a === undefined ? 1 : o.a });
}

/* настоящий 3D-брусок: низ по y, вверх = −y, near = меньший z */
function quad(pts, fill, a = 1) {
  const q = pts.map(p => proj(p[0], p[1], p[2])); if (q.some(v => !v)) return;
  ctx.save(); ctx.globalAlpha *= a; ctx.beginPath(); q.forEach((v, i) => i ? ctx.lineTo(v.x, v.y) : ctx.moveTo(v.x, v.y)); ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); ctx.restore();
}
function box(x, y, z, w, h, d, col, a = 1) {
  const x0 = x - w / 2, x1 = x + w / 2, y0 = y, y1 = y - h, z0 = z - d / 2, z1 = z + d / 2;
  const sh = (hex, k) => { const n = parseInt(hex.slice(1), 16); const r = Math.round(clamp(((n >> 16) & 255) * k, 0, 255)), g = Math.round(clamp(((n >> 8) & 255) * k, 0, 255)), b = Math.round(clamp((n & 255) * k, 0, 255)); return `rgb(${r},${g},${b})`; };
  if (cam.x < x0) quad([[x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0]], sh(col, .78), a);
  else if (cam.x > x1) quad([[x1, y0, z0], [x1, y0, z1], [x1, y1, z1], [x1, y1, z0]], sh(col, .78), a);
  if (cam.y < y1) quad([[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]], sh(col, 1.18), a);
  quad([[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0]], col, a);
}

/* ---------- мир-фон: никогда не стоит на месте ---------- */
function bgWorld(t, o = {}) {
  const g = ctx.createRadialGradient(W / 2, H * .42, 80, W / 2, H / 2, 1300);
  g.addColorStop(0, o.c0 || '#FAF7EF'); g.addColorStop(1, o.c1 || '#E4DECE');
  ctx.fillStyle = g; ctx.fillRect(-600, -600, W + 1200, H + 1200);
  (o.ghosts || []).forEach((gh, i) => {
    const span = (gh.span || 4200), x = ((t * gh.sp + i * 1300) % span + span) % span - span / 2;
    plane(x, gh.y, gh.z || 1500, () => { if (gh.fill) txt(gh.s, 0, 0, gh.size || 380, gh.fill, 900); else outline(gh.s, 0, 0, gh.size || 380, gh.col || 'rgba(111,143,118,.32)', 4); }, { fog: false });
  });
  if (o.floor !== false) {
    const fy = o.fy === undefined ? 430 : o.fy, sp = 220, off = (t * (o.fs || 170)) % sp;
    ctx.save(); ctx.lineWidth = 2;
    for (let k = -14; k <= 14; k++) {
      const a = proj(k * sp + (o.fxs ? (t * o.fxs) % sp : 0), fy, -500), b = proj(k * sp + (o.fxs ? (t * o.fxs) % sp : 0), fy, 6000);
      if (a && b) { ctx.strokeStyle = 'rgba(111,143,118,.26)'; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
    }
    for (let k = 0; k < 28; k++) {
      const z = k * sp - off - 500, a = proj(-3200, fy, z), b = proj(3200, fy, z);
      if (a && b) { ctx.strokeStyle = `rgba(111,143,118,${(.3 * clamp(1 - k / 28, 0, 1)).toFixed(3)})`; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
    }
    ctx.restore();
  }
  const cols = [C.lt, C.sg, C.ac2, '#D2CFC6'];
  for (let i = 0; i < 20; i++) {
    const z = 200 + rnd(i + 1) * 2600, bx = (rnd(i + 7) - .5) * 3400, by = (rnd(i + 13) - .5) * 1300, r = 22 + rnd(i + 19) * 70;
    const x = bx + Math.sin(t * (.25 + rnd(i) * .3) + i) * 120, y = by + Math.cos(t * (.2 + rnd(i + 3) * .3) + i) * 80 - (t * 18 * rnd(i + 5)) % 0;
    plane(x, y, z, () => { ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.globalAlpha *= .16 + rnd(i + 2) * .14; ctx.fillStyle = cols[i % 4]; ctx.fill(); });
  }
}
function bokeh(t, n = 5, seed = 0) {
  for (let i = 0; i < n; i++) {
    const z = -900 + rnd(i + seed) * 450, x = (((t * (110 + rnd(i + seed + 4) * 120) + rnd(i + seed + 9) * 4000) % 4400) - 2200) * (i % 2 ? 1 : -1), y = (rnd(i + seed + 2) - .5) * 1100, r = 120 + rnd(i + seed + 6) * 200;
    plane(x, y, z, () => { const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r); const c = i % 3 === 0 ? '199,113,58' : '111,143,118'; g.addColorStop(0, `rgba(${c},.26)`); g.addColorStop(.7, `rgba(${c},.12)`); g.addColorStop(1, `rgba(${c},0)`); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill(); }, { fog: false });
  }
}
