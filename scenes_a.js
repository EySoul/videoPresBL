'use strict';
/* ================= Камера по ключевым кадрам (Catmull-Rom) и переходы «проезд сквозь» ================= */
function kf(t, K) {
  let i = 0; while (i < K.length - 2 && K[i + 1][0] < t) i++;
  const p = clamp((t - K[i][0]) / (K[i + 1][0] - K[i][0]));
  const g = (k, j) => K[clamp(k, 0, K.length - 1)][j];
  const ch = j => { const p0 = g(i - 1, j), p1 = g(i, j), p2 = g(i + 1, j), p3 = g(i + 2, j); return .5 * ((2 * p1) + (-p0 + p2) * p + (2 * p0 - 5 * p1 + 4 * p2 - p3) * p * p + (-p0 + 3 * p1 - 3 * p2 + p3) * p * p * p); };
  return { x: ch(1), y: ch(2), z: ch(3), yaw: ch(4), pitch: ch(5), roll: ch(6) };
}
function camT(t, a, b, K) {
  const c = kf(t, K), qin = 1 - eo(P(t, a, .9)), qout = ei(P(t, b - .6, .6));
  c.z = c.z * .45 - 60; c.x *= .6; c.yaw *= .55; c.pitch *= .55;
  c.z += -qin * 700 + qout * 800; c.roll += qin * .05 - qout * .04; c.yaw += qin * .1 - qout * .08;
  setCam(c);
}
function sceneAlpha(t, a, b) { return Math.min(P(t, a, .45), 1 - P(t, b - .4, .4)); }
function tone2(a, b, y, z, o) {
  const wa = measure(a, o.size, 800), wb = measure(b, o.size, 800), gp = measure(' ', o.size, 800), tot = wa + gp + wb;
  word(a, -tot / 2 + wa / 2, y, z, Object.assign({}, o, { color: o.c1 }));
  word(b, tot / 2 - wb / 2, y, z, Object.assign({}, o, { color: o.c2, t0: o.t0 + .18 }));
}
function drawSorted(list) { list.sort((a, b) => b.z - a.z).forEach(o => o.f()); }

/* ================= СЦЕНА 1 · Хук 0–10 ================= */
function scene1(t) {
  const a = 0, b = 10;
  camT(t, a, b, [[0, 0, 0, -300, 0, 0, 0], [3.4, -100, -20, 250, .12, 0, .02], [6.4, 120, 10, 0, -.15, .04, -.03], [8.9, 0, -30, 450, 0, 0, 0], [10, 0, 0, 500, 0, 0, 0]]);
  bgWorld(t, { ghosts: [{ s: 'ЛИМИТ', y: -260, sp: 60, z: 900, size: 420 }, { s: 'КОМИССИЯ', y: 270, sp: -50, z: 1100, size: 420 }, { s: 'ТАРИФ', y: 0, sp: 35, z: 1700, size: 520, fill: 'rgba(169,196,174,.22)' }] });
  label('ОТ ПЕРЕВОДА — К РАСЧЁТУ', 0, -400, 0, { t, t0: .1, size: 30, color: C.ac, ls: 8 });
  word('Перевод.', 0, -30, 0, { t, t0: .3, size: 270, color: C.dk, mode: 'fly', out: 3.0, outMode: 'blast' });
  word('Лимит?', 0, -30, 0, { t, t0: 3.4, size: 320, color: C.ac, mode: 'drop', out: 6.0, outMode: 'up' });
  word('Комиссия?', 0, -30, 0, { t, t0: 6.4, size: 240, color: C.dk, mode: 'stretch', out: 8.6, outMode: 'sink' });
  word('Ответ — в расчёте.', 0, -20, 0, { t, t0: 8.9, size: 130, color: C.dk, mode: 'rise' });
  const w1 = clamp(t / 5);
  person(lerp(-1500, -820, eo(w1)), 430, -60, { ph: t * 7, walk: t < 5 ? 1 : 0, phone: true, wave: t > 5 ? 1 : 0, s: 1.15 });
  const w2 = P(t, 4, 2);
  person(lerp(1600, 880, eo(w2)), 430, -60, { ph: t * 7 + 2, walk: t > 4 && t < 6 ? 1 : 0, flip: true, shirt: C.sg, pants: C.dk2, s: 1.15 });
  const cp = P(t, 5.2, 2.4);
  if (cp > 0 && cp < 1) { const x = lerp(-760, 820, eo(cp)), y = 80 - Math.sin(cp * Math.PI) * 420; for (let k = 4; k >= 1; k--) { const q = Math.max(0, cp - k * .03); coin(lerp(-760, 820, eo(q)), 80 - Math.sin(q * Math.PI) * 420, -80, { r: 34, a: .18, spin: t * 9 }); } coin(x, y, -80, { r: 50, spin: t * 9 }); }
  shock(820, 90, -80, t, 7.6, C.ac, { r: 340 });
  bokeh(t, 4, 1);
}

/* ================= СЦЕНА 2 · Название 10–20 ================= */
function scene2(t) {
  const a = 10, b = 20;
  camT(t, a, b, [[10, 0, 0, -200, 0, 0, 0], [13, 200, -30, 300, -.22, .03, .02], [16.5, -250, 20, 100, .22, -.03, -.02], [20, 0, 0, 300, 0, 0, 0]]);
  bgWorld(t, { ghosts: [{ s: 'ППРБ', y: -300, sp: 55, z: 1400, size: 500, fill: 'rgba(169,196,174,.28)' }, { s: 'ТМ', y: 300, sp: -40, z: 1000, size: 500, col: 'rgba(111,143,118,.3)' }] });
  const pr = P(t, 10.1, 1.2);
  plane(0, -10, 220, s => { ctx.scale(eo(pr), eo(pr)); card(1700, 720, s, dkGrad(1700, 720), { r: 64 }); }, { ry: Math.sin(t * .5) * .16 });
  const orb = [['Лимиты', C.cr, C.dk], ['Комиссии', C.ac, '#fff'], ['Опции', C.cr, C.dk]];
  const list = orb.map((o, i) => {
    const an = t * .6 + i * 2.094, x = Math.cos(an) * 960, z = 250 + Math.sin(an) * 500, y = -300 + i * 270;
    return { z, f: () => plane(x, y, z, s => { ctx.globalAlpha *= P(t, 12 + i * .4, .6); card(380, 150, s, o[1], { r: 40 }); txt(o[0], 0, 4, 58, o[2], 800); }, { ry: -an * .2, rz: Math.sin(an) * .08 }) };
  });
  drawSorted(list);
  word('ППРБ ТМ', 0, -90, 0, { t, t0: 10.4, size: 270, color: C.cr, mode: 'fly', out: 19.3, outMode: 'blast' });
  mword('тарифный модуль', 0, 120, 0, { t, t0: 11.6, size: 96, color: C.ac2, out: 19.4 });
  mword('Платформа поддержки развития бизнеса', 0, 235, 0, { t, t0: 13, size: 46, color: '#C9D8C9', weight: 700, out: 19.4 });
  shock(0, -10, 0, t, 11.2, C.ac2, { r: 700 });
  person(-1250, 430, -80, { ph: t * 5, walk: 0, wave: 1, s: 1.15, shirt: C.dk2 });
  person(1250, 430, -80, { ph: t * 5 + 1, walk: 0, wave: 1, flip: true, s: 1.15, shirt: C.ac, pants: C.dk });
  bokeh(t, 4, 3);
}

/* ================= СЦЕНА 3 · Реквизиты 20–34 ================= */
function scene3(t) {
  const a = 20, b = 34;
  camT(t, a, b, [[20, 0, 0, -250, 0, 0, 0], [22.5, -420, -20, 520, .26, .02, .02], [25.5, 0, -10, 480, 0, 0, 0], [28.5, 420, -20, 520, -.26, .02, -.02], [31, 0, 0, 100, 0, 0, 0], [34, 0, 0, 300, 0, 0, 0]]);
  bgWorld(t, { ghosts: [{ s: 'РЕКВИЗИТЫ', y: 280, sp: 80, z: 1300, size: 420 }] , fs: 260 });
  label('01 · ЗАПРОС', 0, -430, 0, { t, t0: 20.1, size: 30, color: C.ac, ls: 8, out: 33.3 });
  tone2('Вводим', 'реквизиты.', -340, 0, { t, t0: 20.3, size: 92, c1: C.dk, c2: C.ac, mode: 'flip', out: 26.4, outMode: 'up' });
  word('Всё нужно для расчёта.', 0, -330, 0, { t, t0: 27, size: 100, color: C.dk, mode: 'rise', out: 33.2, outMode: 'up' });
  const prog = (t0, d) => clamp((t - t0) / d);
  const cards = [
    { x: -600, z: 140, ry: .36, t0: 21.2, lbl: 'СУММА', val: () => rub(1500 * eo(prog(21.6, 1))), col: C.dk, size: 82 },
    { x: 0, z: 0, ry: 0, t0: 22.4, lbl: 'ПОЛУЧАТЕЛЬ', val: () => 'Иван П.'.slice(0, Math.ceil(7 * prog(23, .8))), col: C.dk, size: 82 },
    { x: 600, z: 140, ry: -.36, t0: 23.6, lbl: 'КАНАЛ', val: () => 'СБП'.slice(0, Math.ceil(3 * prog(24.2, .5))), col: C.ac, size: 100 }
  ];
  const list = cards.map((c, i) => ({ z: c.z, f: () => {
    const p = P(t, c.t0, 1), dz = (1 - eo(p)) * 1800, hl = Math.max(0, 1 - Math.abs(t - (23 + i * 3.1)) / 1.2);
    plane(c.x, -20 + Math.sin(t * 1.2 + i) * 10, c.z + dz, s => {
      ctx.globalAlpha *= p; const k = 1 + hl * .05; ctx.scale(k, k);
      card(480, 320, s, C.cr, { border: hl > .1 ? C.ac : C.sg, bw: 4 + hl * 4 });
      txt(c.lbl, 0, -88, 30, C.sg, 800, 'center', 5); txt(c.val(), 0, 22, c.size, c.col, 900);
    }, { ry: c.ry }); } }));
  drawSorted(list);
  const wk = P(t, 20.3, 3);
  person(lerp(-1500, -1050, eo(wk)), 430, -50, { ph: t * 7, walk: wk < 1 ? 1 : 0, phone: true, s: 1.2 });
  for (let i = 0; i < 3; i++) { const c0 = 24.4 + i * 1.6, cp = P(t, c0, 1.1); if (cp > 0 && cp < 1) coin(lerp(-1000, cards[i].x, eo(cp)), lerp(220, -20, eo(cp)) - Math.sin(cp * Math.PI) * 260, -60, { r: 38, spin: t * 10 }); shock(cards[i].x, -20, 0, t, c0 + 1.05, C.ac, { r: 340 }); }
  bokeh(t, 4, 5);
}

/* ================= СЦЕНА 4 · Резервуар лимита 34–48 ================= */
function tank(R, level, t, o = {}) {
  ctx.save(); card(R * 2, R * 2, 1, C.cr, { r: R }); ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.arc(0, 0, R - 20, 0, TAU); ctx.clip();
  const lvl = R - 20 - (R * 2 - 40) * level;
  const wave = (ph, amp, col) => { ctx.beginPath(); ctx.moveTo(-R, R); for (let x = -R; x <= R; x += 10) ctx.lineTo(x, lvl + Math.sin(x * .02 + t * 3 + ph) * amp); ctx.lineTo(R, R); ctx.closePath(); ctx.fillStyle = col; ctx.fill(); };
  const ag = ctx.createLinearGradient(0, lvl, 0, R); ag.addColorStop(0, C.sg); ag.addColorStop(1, C.dk);
  wave(1.6, 12, 'rgba(169,196,174,.7)'); wave(0, 10, ag);
  for (let i = 0; i < 8; i++) { const by = R - ((t * 60 * (.6 + rnd(i) * .6) + rnd(i + 3) * 500) % (R * 2)), bx = (rnd(i + 9) - .5) * R * 1.3; if (by > lvl + 10) { ctx.beginPath(); ctx.arc(bx, by, 4 + rnd(i + 2) * 6, 0, TAU); ctx.fillStyle = 'rgba(239,235,225,.45)'; ctx.fill(); } }
  ctx.restore();
  ctx.beginPath(); ctx.arc(0, 0, R - 10, 0, TAU); ctx.lineWidth = 14; ctx.strokeStyle = o.rim || C.dk; ctx.stroke();
  txt(Math.round(level * 100) + '%', 0, -8, R * .5, C.cr, 900);
}
function dust(x, y, z, t, t0, n = 36) {
  const u = t - t0; if (u < 0 || u > 1.4) return; const p = eo(u / 1.4);
  for (let i = 0; i < n; i++) { const an = rnd(i) * TAU, sp = 80 + rnd(i + 5) * 320; plane(x + Math.cos(an) * sp * p, y + Math.sin(an) * sp * p + p * p * 160, z, () => { ctx.globalAlpha *= 1 - p; ctx.rotate(p * 4 * (rnd(i + 2) - .5)); ctx.fillStyle = i % 3 ? C.ac : C.ac2; const s = 8 + rnd(i + 7) * 14; ctx.fillRect(-s / 2, -s / 2, s, s); }); }
}
function scene4(t) {
  const a = 34, b = 48;
  camT(t, a, b, [[34, 0, 0, -200, 0, 0, 0], [37, -150, 0, 320, .2, .05, 0], [40.5, 300, 0, 380, -.25, -.03, .02], [44, 0, -60, 150, .1, .1, 0], [48, 0, 0, 300, 0, 0, 0]]);
  bgWorld(t, { ghosts: [{ s: 'ЛИМИТ', y: 0, sp: 28, z: 1300, size: 700, fill: 'rgba(169,196,174,.30)' }], fs: 220 });
  label('02 · РАСЧЁТ', 0, -440, 0, { t, t0: 34.1, size: 30, color: C.ac, ls: 8, out: 47.4 });
  tone2('В пределах', 'лимита', -350, 0, { t, t0: 34.5, size: 96, c1: C.dk, c2: C.ac, mode: 'pop', out: 47.2, outMode: 'up' });
  const lvl = lerp(1, .7, eo(P(t, 36.2, 2.2))), tp = P(t, 34.3, 1);
  plane(0, 30, 0, () => { const k = Math.max(.001, eb(tp)); ctx.scale(k, k); tank(270, lvl, t); }, { ry: Math.sin(t * .6) * .22 });
  label('Лимит 5 000 ₽', 0, 400, 0, { t, t0: 35, size: 46, color: C.sg, weight: 700 });
  label('ОСТАТОК', -770, -90, 0, { t, t0: 35.2, size: 32, color: C.sg, ls: 6 });
  plane(-770, 30, 0, () => { ctx.globalAlpha *= P(t, 35.2, .6); txt(rub(lerp(5000, 3500, eo(P(t, 36.2, 2.2)))), 0, 0, 120, C.dk, 900); });
  label('КОМИССИЯ', 770, -90, 0, { t, t0: 35.6, size: 32, color: C.sg, ls: 6 });
  const cp = P(t, 36.6, 1.8);
  if (t >= 36.6 && t < 40) coin(lerp(0, 770, eo(cp)), lerp(30, 40, eo(cp)) - Math.sin(cp * Math.PI) * 280, -40, { r: 54, spin: t * 8 });
  dust(770, 40, -40, t, 40);
  shock(770, 40, -40, t, 40, C.ac, { r: 420 });
  if (t > 40.4) plane(770, 60, 0, () => { const k = Math.max(.001, eb(P(t, 40.4, .7))); ctx.scale(k, k); ctx.globalAlpha *= P(t, 40.4, .2); txt('0 ₽', 0, 0, 170, C.ac, 900); });
  person(-1200, 430, -50, { ph: t * 3, walk: 0, wave: t > 40 ? 1 : 0, s: 1.15 });
  person(1250, 430, -50, { ph: t * 3, walk: 0, flip: true, shirt: C.ac, s: 1.15 });
  bokeh(t, 4, 8);
}
