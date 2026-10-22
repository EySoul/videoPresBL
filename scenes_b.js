'use strict';
/* ================= СЦЕНА 5 · Отмена 48–60 (перемотка назад, dutch angle) ================= */
function scene5(t) {
  const a = 48, b = 60;
  camT(t, a, b, [[48, 0, 0, -200, 0, 0, .07], [51, 100, -20, 300, -.15, .05, -.08], [54, -150, 10, 450, .2, 0, .05], [57, 0, 0, 200, 0, .06, 0], [60, 0, 0, 300, 0, 0, 0]]);
  bgWorld(t, { fs: -260, ghosts: [{ s: 'ОТМЕНА', y: -280, sp: -90, z: 1200, size: 520, col: 'rgba(199,113,58,.3)' }, { s: '↶', y: 250, sp: 70, z: 1000, size: 600, fill: 'rgba(169,196,174,.25)' }] });
  word('Отмена.', 0, -330, 0, { t, t0: 48.2, size: 280, color: C.dk, mode: 'drop', out: 51.6, outMode: 'spin' });
  tone2('ЛИМИТ', 'ВОССТАНОВЛЕН', -380, 0, { t, t0: 52, size: 92, c1: C.dk, c2: C.ac, mode: 'fly', out: 59.2, outMode: 'up' });
  const lvl = lerp(.7, 1, eo(P(t, 52.4, 2.4))), flash = t > 54.6 ? Math.max(0, 1 - (t - 54.6) / .9) : 0;
  plane(0, 80, 0, () => { ctx.globalAlpha *= P(t, 48.4, .8); tank(250, lvl, t, { rim: flash > .1 ? C.ac : C.dk }); }, { ry: Math.sin(t * .7) * .25 });
  /* монета и шлейф летят ОБРАТНО: получатель → резервуар */
  const cp = P(t, 49, 2.6);
  if (cp > 0 && cp < 1) {
    const X = q => lerp(900, 0, eo(q)), Y = q => 80 - Math.sin(q * Math.PI) * 380;
    for (let k = 6; k >= 1; k--) { const q = Math.max(0, cp - k * .035); coin(X(q), Y(q), -60, { r: 30, a: .14 + (6 - k) * .03, spin: -t * 9 }); }
    coin(X(cp), Y(cp), -60, { r: 48, spin: -t * 9 });
  }
  shock(0, 80, -40, t, 51.6, C.ac2, { r: 560 });
  const col = [['1 500 ₽', 'ID 1024'], ['Проведён', 'Иван П.']];
  const cardP = P(t, 49.4, .9);
  plane(-780, 80, 120, s => { ctx.globalAlpha *= cardP; card(430, 300, s, C.cr, { border: t > 50.2 ? C.ac : C.sg }); txt('ПЕРЕВОД', 0, -90, 28, C.sg, 800, 'center', 5); txt('1 500 ₽', 0, -10, 76, C.dk, 900); txt(t > 50.4 ? 'Отменено' : 'Проведён', 0, 80, 44, t > 50.4 ? C.ac : C.sg, 800); }, { ry: .38, rz: -.04 });
  const bp = P(t, 50, .3), bpress = t > 50.3 && t < 50.5 ? .88 : 1;
  plane(-780, 280, 160, s => { ctx.globalAlpha *= cardP; ctx.scale(bpress, bpress); rr(-120, -34, 240, 68, 34); ctx.fillStyle = C.ac; ctx.fill(); txt('Отменить', 0, 2, 32, '#fff', 800); }, { ry: .38 });
  shock(-780, 280, 160, t, 50.3, C.ac, { r: 240 });
  person(1150, 430, -50, { ph: t * 7, walk: t < 52 ? 1 : 0, flip: true, shirt: C.sg, pants: C.dk2, s: 1.2, wave: t > 53 ? 1 : 0 });
  bokeh(t, 4, 11);
}

/* ================= СЦЕНА 6 · Опции — стопка слоёв 60–74 ================= */
function scene6(t) {
  const a = 60, b = 74;
  camT(t, a, b, [[60, 0, 0, -250, 0, 0, 0], [63, 380, -40, 350, -.3, .08, .03], [67, -220, 30, 300, .18, -.04, -.02], [70.5, 100, 0, 0, -.08, 0, 0], [74, 0, 0, 300, 0, 0, 0]]);
  bgWorld(t, { fs: 200, ghosts: [{ s: 'ПРИОРИТЕТ', y: 290, sp: 60, z: 1300, size: 460 }, { s: 'СРОК', y: -300, sp: -45, z: 1100, size: 460, fill: 'rgba(169,196,174,.25)' }] });
  label('03 · ОПЦИИ', 0, -440, 0, { t, t0: 60.1, size: 30, color: C.ac, ls: 8, out: 73.4 });
  tone2('Опции. Срок.', 'Приоритет.', -350, 0, { t, t0: 60.4, size: 88, c1: C.dk, c2: C.ac, mode: 'spin', out: 73.2, outMode: 'up' });
  const ops = [['Опция 1', 'до 31.12', 0], ['Опция 2', 'до 30.06', 1], ['Опция 3', 'бессрочно', 2], ['Опция 4', 'до 15.09', 3]];
  const lead = P(t, 66.5, 1.4);
  const list = ops.map((o, i) => {
    const base = P(t, 60.9 + i * .4, 1), fan = eo(P(t, 62.4, 1.6));
    const isP = i === 1;
    const x = lerp(0, -780 + i * 520, fan) + (isP ? lerp(0, 0, lead) : 0);
    const z = lerp(i * 90, 0, fan) + (isP ? -lead * 380 : lead * i * 40);
    const y = lerp(-i * 18, 0, fan) + (isP ? -lead * 30 : 0) + Math.sin(t * 1.3 + i) * 10 + 110;
    return { z, f: () => plane(x, y + (1 - eo(base)) * 700, z, s => {
      ctx.globalAlpha *= base;
      const dark = isP && lead > .5;
      card(440, 400, s, dark ? dkGrad(440, 400) : C.cr, { border: dark ? null : C.sg });
      txt(o[0].toUpperCase(), 0, -120, 28, dark ? C.ac2 : C.sg, 800, 'center', 5);
      txt(o[1], 0, -20, 66, dark ? C.cr : C.dk, 900);
      if (isP && lead > .3) { ctx.save(); ctx.scale(Math.max(.001, eb(P(t, 67.2, .7))), Math.max(.001, eb(P(t, 67.2, .7)))); rr(-120, 70, 240, 64, 32); ctx.strokeStyle = C.ac2; ctx.lineWidth = 4; ctx.stroke(); txt('приоритет', 0, 104, 32, C.ac2, 800); ctx.restore(); }
    }, { ry: lerp(0, .3 - i * .06, fan) * (isP ? 1 - lead : 1), rz: lerp(.05 * (i - 1.5), 0, fan) }) };
  });
  drawSorted(list);
  shock(-260, 30, -380, t, 67.4, C.ac, { r: 560 });
  word('Приоритет задаёт условия лимита.', 0, 390, 0, { t, t0: 68.5, size: 66, color: C.dk, mode: 'rise', out: 73.2, outMode: 'down' });
  person(-1280, 430, -50, { ph: t * 2, walk: 0, wave: 1, s: 1.15 });
  person(1300, 430, -50, { ph: t * 2, walk: 0, flip: true, shirt: C.ac, s: 1.15 });
  bokeh(t, 4, 14);
}

/* ================= СЦЕНА 7 · Сверка со сканером 74–88 ================= */
function scene7(t) {
  const a = 74, b = 88;
  camT(t, a, b, [[74, 0, 0, -250, 0, 0, 0], [77, 0, -380, 420, 0, -.35, 0], [80.5, -200, -60, 350, .2, -.08, .02], [84, 200, 0, 480, -.2, .05, -.03], [88, 0, 0, 300, 0, 0, 0]]);
  bgWorld(t, { fs: 240, ghosts: [{ s: '≠', y: 0, sp: 40, z: 1400, size: 900, col: 'rgba(199,113,58,.28)' }] });
  tone2('Два сервиса.', 'Два расхождения.', -390, 0, { t, t0: 74.3, size: 76, c1: C.dk, c2: C.ac, mode: 'flip', out: 87.2, outMode: 'up' });
  const A = [['ID 1024', 1500, 1500], ['ID 2317', 800, 950], ['ID 4451', 2300, 2300], ['ID 5098', 450, 600], ['ID 6120', 1100, 1100]];
  const scan = P(t, 78.4, 4.6), scanY = lerp(-250, 250, scan);
  const list = [];
  [[-560, 0, .42, 'Сервис 1'], [560, 1, -.42, 'Сервис 2']].forEach(([x, side, ry, name]) => {
    list.push({ z: 60, f: () => plane(x, 10, 60, s => {
      ctx.globalAlpha *= P(t, 74.6 + side * .3, .9); card(600, 640, s, C.cr, { border: C.sg });
      txt(name.toUpperCase(), 0, -270, 30, C.sg, 800, 'center', 6);
      A.forEach((r, i) => {
        const y = -190 + i * 100, hit = r[1] !== r[2], seen = scanY > y - 250 + 250 && scan > 0;
        const done = hit && t > 78.4 + (i / 4.6) * 4.6 * .0 + (y + 250) / 500 * 4.6;
        if (done) { ctx.save(); rr(-270, y - 38, 540, 80, 18); ctx.fillStyle = 'rgba(199,113,58,.22)'; ctx.fill(); ctx.restore(); }
        txt(r[0], -250, y, 40, C.dk, 700, 'left'); txt(rub(r[1 + side]), 250, y, 44, done ? C.ac : C.dk, 900, 'right');
      });
    }, { ry }) });
  });
  A.forEach((r, i) => {
    if (r[1] === r[2]) return;
    const y = -190 + i * 100 + 10, hitT = 78.4 + (y + 250 - 10) / 500 * 4.6, p = P(t, hitT, .7);
    [-560, 560].forEach((x, sd) => list.push({ z: 20, f: () => { if (p <= 0) return; plane(x, 10, 60, s => { ctx.globalAlpha *= p; const k = 1 + (1 - p) * .08; ctx.translate(0, y - 10); ctx.scale(k, k); rr(-285, -42, 570, 88, 20); ctx.strokeStyle = C.ac; ctx.lineWidth = 6; ctx.stroke(); }, { ry: sd ? -.42 : .42 }); } }));
    shock(0, y, -60, t, hitT, C.ac, { r: 260 });
  });
  drawSorted(list);
  if (scan > 0 && scan < 1) plane(0, 10 + scanY, 40, s => { const g = ctx.createLinearGradient(-900, 0, 900, 0); g.addColorStop(0, 'rgba(199,113,58,0)'); g.addColorStop(.5, 'rgba(199,113,58,.95)'); g.addColorStop(1, 'rgba(199,113,58,0)'); ctx.fillStyle = g; ctx.fillRect(-900, -5, 1800, 10); const gg = ctx.createLinearGradient(0, -100, 0, 0); gg.addColorStop(0, 'rgba(199,113,58,0)'); gg.addColorStop(1, 'rgba(199,113,58,.22)'); ctx.fillStyle = gg; ctx.fillRect(-900, -100, 1800, 100); });
  plane(0, 10, 0, () => { const k = Math.max(.001, eb(P(t, 83.3, .8))); ctx.scale(k, k); ctx.globalAlpha *= P(t, 83.3, .2); txt('≠', 0, 0, 280, C.ac, 900); });
  plane(0, 400, 0, () => { ctx.globalAlpha *= P(t, 83.8, .6); const n = Math.round(2 * eo(P(t, 83.8, .8))); txt('Расхождений: ' + n, 0, 0, 80, C.dk, 900); });
  person(-1300, 430, -50, { ph: t * 2, walk: 0, wave: 1, s: 1.15 });
  bokeh(t, 3, 17);
}

/* ================= СЦЕНА 8 · История: 3D-столбики 88–104 ================= */
function scene8(t) {
  const a = 88, b = 104;
  camT(t, a, b, [[88, -700, -200, -300, .45, .1, .04], [92, -300, -200, -100, .3, .1, .02], [96, 200, -200, -100, -.1, .1, 0], [100, 500, -180, -100, -.3, .08, -.02], [104, 0, -80, 100, 0, 0, 0]]);
  bgWorld(t, { fy: 330, fs: 180, ghosts: [{ s: 'ИСТОРИЯ', y: -300, sp: 50, z: 2200, size: 600, fill: 'rgba(169,196,174,.28)' }] });
  const H5 = [180, 240, 210, 300, 360], X0 = -800, GAP = 400;
  const items = H5.map((h, i) => ({ z: 0, f: () => {
    const p = eo(P(t, 89 + i * .6, 1.2)), far = i >= 2, fa = far ? lerp(1, .38, eo(P(t, 96.2, 1))) : 1;
    box(X0 + i * GAP, 330, 200 - i * 0, 190, h * p * 1.5, 200, far ? C.sg : C.dk2, fa);
    plane(X0 + i * GAP, 375, 200, () => { ctx.globalAlpha *= p * fa; txt('мес ' + (i + 1), 0, 0, 40, C.dk, 800); });
    if (p > .9) plane(X0 + i * GAP, 330 - h * 1.5 - 50, 200, () => { ctx.globalAlpha *= fa; txt(String(h), 0, 0, 44, far ? C.sg : C.ac, 900); });
  } }));
  items.forEach(o => o.f());
  plane(-700, -250, 80, () => { ctx.globalAlpha *= P(t, 91.5, .8); rr(-290, -50, 580, 100, 50); ctx.fillStyle = C.ac; ctx.fill(); txt('данные ППРБ ТМ: 2 месяца', 0, 4, 38, '#fff', 800); });
  word('Два месяца данных.', 0, -390, 0, { t, t0: 88.3, size: 100, color: C.dk, mode: 'fly', out: 95.2, outMode: 'blast', ry: 0 });
  tone2('Пять —', 'по согласованию.', -390, 0, { t, t0: 96, size: 84, c1: C.dk, c2: C.ac, mode: 'drop', out: 103.2, outMode: 'up' });
  const cur = P(t, 96.6, 3);
  plane(lerp(-800, 1200, cur) + 400, 140, -300, () => { ctx.globalAlpha *= (cur > 0 && cur < 1 ? 1 : 0) * .5; ctx.fillStyle = C.ac; ctx.fillRect(-4, -520, 8, 560); });
  person(1500, 430, -150, { ph: t * 6, walk: t > 96 ? 1 : 0, flip: true, shirt: C.sg, s: 1.3 });
  bokeh(t, 3, 21);
}

/* ================= СЦЕНА 9 · Финал 104–120 ================= */
function scene9(t) {
  const a = 104, b = 120;
  const K = [[104, 0, 0, -400, 0, 0, 0], [108, -150, -40, 200, .18, 0, .02], [112, 150, 0, 350, -.18, .03, -.02], [116, 0, -30, 500, 0, 0, 0], [120, 0, 0, 600, 0, 0, 0]];
  setCam(kf(t, K));
  const qin = 1 - eo(P(t, a, 1)); cam.z -= qin * 800; cam.roll += qin * .06;
  bgWorld(t, { fs: 240, ghosts: [{ s: 'РАССЧИТАТЬ', y: -300, sp: 70, z: 1500, size: 440 }, { s: 'ПРОВЕРИТЬ', y: 310, sp: -60, z: 1300, size: 440, fill: 'rgba(169,196,174,.24)' }] });
  word('ППРБ ТМ', 0, -170, 0, { t, t0: 104.5, size: 250, color: C.dk, mode: 'fly', st: .08 });
  word('тарифный модуль', 0, 110, 0, { t, t0: 106, size: 100, color: C.ac, mode: 'rise' });
  ['рассчитать', 'учесть', 'проверить'].forEach((s, i) => {
    const t0 = 109 + i * 1.1, p = P(t, t0, .8), x = -520 + i * 520;
    plane(x, 290 + Math.sin(t * 1.4 + i) * 8, 0, sp => { const k = Math.max(.001, eb(p)); ctx.scale(k, k); ctx.globalAlpha *= P(t, t0, .2); card(440, 110, sp, C.cr, { r: 55, border: C.ac, bw: 5 }); txt(s, 0, 4, 52, C.ac, 800); }, { ry: (i - 1) * -.2 });
    shock(x, 290, 0, t, t0 + .1, C.ac, { r: 300 });
  });
  label('Единая логика тарифов', 0, 440, 0, { t, t0: 112.5, size: 54, color: C.sg, weight: 700 });
  const wk = P(t, 104.3, 3);
  person(lerp(-1500, -900, eo(wk)), 430, -80, { ph: t * 7, walk: wk < 1 ? 1 : 0, phone: true, wave: wk >= 1 ? 1 : 0, s: 1.2 });
  person(lerp(1600, 900, eo(wk)), 430, -80, { ph: t * 7 + 1, walk: wk < 1 ? 1 : 0, flip: true, shirt: C.sg, pants: C.dk2, wave: wk >= 1 ? 1 : 0, s: 1.2 });
  const em = P(t, 106, 6);
  if (t > 108) for (let i = 0; i < 14; i++) { const ph = (t * .5 + rnd(i)) % 1, x = (rnd(i + 3) - .5) * 1800; coin(x, 520 - ph * 1100, -300 - rnd(i) * 300, { r: 22 + rnd(i + 5) * 16, a: Math.sin(ph * Math.PI) * .55, spin: t * 6 + i }); }
  bokeh(t, 4, 24);
}

const SCENES = [[0, 10, scene1], [10, 20, scene2], [20, 34, scene3], [34, 48, scene4], [48, 60, scene5], [60, 74, scene6], [74, 88, scene7], [88, 104, scene8], [104, 120, scene9]];
function renderAt(t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
  let s = SCENES.find(x => t >= x[0] && t < x[1]) || SCENES[SCENES.length - 1];
  const fade = Math.min(P(t, s[0], .35), 1 - P(t, s[1] - .3, .3));
  ctx.save();
  ctx.globalAlpha = s === SCENES[0] ? 1 : Math.max(fade, .001);
  s[2](t);
  ctx.restore();
}
