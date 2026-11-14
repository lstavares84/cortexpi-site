/* CortexPi · atalho de acesso remoto (gerado por propostas/terminal-anim/_build_terminal.py, não editar à mão)
   Segure C + P + I ao mesmo tempo (sem Ctrl/Alt/Win) para abrir a janela de terminal com a animação
   Favo girado + sessão: estágios até o gamma, firewall, criptografia e o túnel em Diagrama de Flamm.

   IMPORTANTE: este arquivo é público. O atalho e a animação são só conveniência visual, não segurança:
   o painel de login é animação (sem campos reais; senha e código aparecem como asteriscos) e nada é enviado.
   A proteção de verdade fica no destino (portal SSH com login forte e MFA). Nunca coloque senhas, tokens ou chaves aqui.
   O IP do visitante e a localização aproximada são consultados (ipwho.is; reserva api.ipify.org) só quando a janela abre. */
(function(){
'use strict';
const KEYS = ['c', 'p', 'i'];      // teclas que precisam estar pressionadas juntas
const GATEWAY_URL = 'https://gamma.cortexpi.com.br';   // portal real: Cloudflare Access (PIN por e-mail) → login, senha e código do dia no gamma
const WINDOW_MS = 400;             // intervalo máximo entre as três teclas
let win = null;
const C = {bg:'#030a04', bar:'#071007', panel:'#0a1a0b', line:'#234b23', fg:'#e6ffe1', dim:'#6eaa6e', com:'#3f7a3f',
           green:'#78ff5a', frost:'#beffaa', blue:'#78ff5a', deep:'#234b23', yellow:'#ffbe00', red:'#ff3c32', orange:'#ffbe00', cobre:'#78ff5a',
           amberBg:'#3c2c00', mesh:'#0a1a0b'};
const MONO = '"JetBrains Mono","DejaVu Sans Mono","Liberation Mono",Menlo,Consolas,monospace';
const MONO_I = MONO.replace(/"/g, "'");  // para atributos style escritos em HTML
const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
const wait = ms => new Promise(r => setTimeout(r, REDUCE ? 0 : ms));
/* desvanecimento controlado em JS (transições CSS podem ficar presas com renderização reduzida) */
async function fade(els, from, to, ms){ els = [].concat(els); const n = Math.max(1, Math.round(ms / 30));
  for (let i = 0; i <= n; i++){ const v = from + (to - from) * i / n; els.forEach(e => e.style.opacity = v); if (i < n) await wait(30); } }
const esc = s => String(s).replace(/[<>&"]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]));


let ipCache = null;
async function visitorIP(){
  if (ipCache) return ipCache;
  try {
    const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 2500);
    const r = await fetch('https://api.ipify.org?format=json', {signal: ctl.signal, cache: 'no-store'});
    clearTimeout(t); ipCache = {ip: (await r.json()).ip, real: true};
  } catch { ipCache = {ip: '203.0.113.42', real: false}; }  // faixa de documentação (RFC 5737)
  return ipCache;
}

/* ------------------------------------------------------------ janela */
const HEX = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='42' height='36' viewBox='0 0 42 36'%3E%3Cpath d='M10.5 0h21l10.5 18-10.5 18h-21L0 18z' fill='none' stroke='%230a1a0b' stroke-width='1.2'/%3E%3C/svg%3E")`;
const CSS = `
.ta-back{position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.72);display:flex;align-items:center;justify-content:center;padding:20px}
.ta{width:min(780px,100%);background:${C.bg};background-image:${HEX};border:1px solid ${C.line};box-shadow:0 0 0 1px #000,0 24px 60px -20px rgba(0,0,0,.9);overflow:hidden}
.ta.min{background-image:none;background:#020603}
.ta.brut{background:#000;background-image:none;border:3px solid ${C.fg};box-shadow:10px 10px 0 ${C.line}}
.ta-h{height:26px;background:#000;border-bottom:1px solid ${C.line};display:flex;align-items:center;justify-content:space-between;padding:0 10px;font:600 12px ${MONO};color:${C.fg};user-select:none}
.ta.brut .ta-h{height:34px;border-bottom:3px solid ${C.fg};font:800 14px ${MONO};letter-spacing:.06em;text-transform:uppercase}
.ta-h .bt{display:flex;gap:6px}
.ta-h button{border:0;background:transparent;color:${C.dim};font:600 12px ${MONO};cursor:pointer;padding:0 2px}
.ta-h button:hover{color:${C.fg};background:${C.panel}}
.ta-h button.x:hover{color:${C.red}}
.ta-tabs{display:flex;gap:4px;padding:4px 8px 0;background:${C.bar};border-bottom:1px solid ${C.line};font:12px ${MONO};color:${C.dim}}
.ta-tabs span{padding:2px 8px}.ta-tabs span.on{background:${C.bg};color:${C.fg};border:1px solid ${C.line};border-bottom-color:${C.bg};margin-bottom:-1px}
.ta-b{position:relative;min-height:400px;font:13px/1.55 ${MONO};color:${C.fg}}
.ta-txt{padding:10px 12px;white-space:pre-wrap}
.ta .u{color:${C.green};font-weight:700}.ta .p{color:${C.fg}}.ta .c{color:${C.com}}.ta .i{color:${C.frost}}
.ta .w{color:${C.yellow}}.ta .r{color:${C.red}}.ta .g{color:${C.green}}.ta .d{color:${C.dim}}.ta .o{color:${C.yellow}}
.ta .hl{background:#0f2a10}
.ta-cur{display:inline-block;width:8px;height:15px;background:${C.fg};vertical-align:-2px;animation:ta-bl 1s steps(1) infinite}
@keyframes ta-bl{50%{opacity:0}}
.ta-status{display:flex;justify-content:space-between;align-items:stretch;gap:12px;height:22px;background:${C.bar};border-top:1px solid ${C.line};font:11.5px ${MONO};color:${C.dim}}
.ta-status span{display:flex;align-items:center;padding:0 10px}
.ta-status b{color:${C.fg};font-weight:600}
.ta-status .blk{background:${C.yellow};color:#000;font-weight:700;padding:0 8px;margin-left:-10px;margin-right:8px;align-self:stretch;display:flex;align-items:center}
.ta-status .ok{background:${C.green};color:#000;font-weight:700;padding:0 8px;margin-left:-10px;margin-right:8px;align-self:stretch;display:flex;align-items:center}
.ta svg{display:block;width:100%;height:auto}
.ta svg text{font:12px ${MONO};fill:${C.fg}}
`;
let styled = false;
function frame(title, variant = ''){
  if (!styled){ const s = document.createElement('style'); s.textContent = CSS; document.head.appendChild(s); styled = true; }
  const back = document.createElement('div'); back.className = 'ta-back';
  back.innerHTML = `<div class="ta ${variant}" role="dialog" aria-modal="true" aria-label="${esc(title)}">
    <div class="ta-h"><span class="ttl">Terminal ${esc(title)}</span><span class="bt"><button type="button" aria-label="Minimize">[_]</button><button type="button" aria-label="Maximize">[□]</button><button type="button" class="x" aria-label="Close">[×]</button></span></div>
    <div class="ta-b"></div><div class="ta-status"><span class="st-l">connecting…</span><span class="st-r"></span></div></div>`;
  document.body.appendChild(back);
  let alive = true;
  const close = () => { alive = false; back.remove(); document.removeEventListener('keydown', onKey); };
  const onKey = e => { if (e.key === 'Escape') close(); };
  document.addEventListener('keydown', onKey);
  back.querySelectorAll('.ta-h button').forEach(b => b.addEventListener('click', close));
  back.addEventListener('mousedown', e => { if (e.target === back) close(); });
  return {back, body: back.querySelector('.ta-b'), title: s => { back.querySelector('.ttl').textContent = 'Terminal ' + s; back.querySelector('.ta').setAttribute('aria-label', s); }, status: (l, r) => { if (l != null) back.querySelector('.st-l').innerHTML = l; if (r != null) back.querySelector('.st-r').innerHTML = r; }, alive: () => alive, close};
}

/* digitação linha a linha num elemento de texto */
function typer(el, w){
  return async function(html, {speed = 14, pause = 120} = {}){
    if (!w.alive()) return;
    const span = document.createElement('span'); el.appendChild(span);
    // digita só o texto visível, preservando as tags
    const parts = html.split(/(<[^>]+>)/); let out = '';
    for (const p of parts){
      if (p.startsWith('<')) { out += p; span.innerHTML = out; continue; }
      for (const ch of p){ if (!w.alive()) return; out += ch; span.innerHTML = out; if (!REDUCE && speed) await wait(speed); }
    }
    el.appendChild(document.createTextNode('\n'));
    await wait(pause);
  };
}

/* ================================================================ FAVO GIRADO (sentido do Turzx)
   Hexágono de ponta para cima (reator.hexagon: início em -90°), estágios em sentido horário a partir do topo.
   Cada estágio desenha uma aresta; o 6º fecha o hexágono e o centro mostra ACESSO AUTORIZADO. */
let geoCache = null;
async function geo(){
  if (geoCache) return geoCache;
  const t0 = performance.now();
  try {
    const ctl = new AbortController(); const tm = setTimeout(() => ctl.abort(), 3000);
    const r = await fetch('https://ipwho.is/', {signal: ctl.signal, cache: 'no-store'}); clearTimeout(tm);
    const j = await r.json(); if (!j.success) throw 0;
    geoCache = {ip: j.ip, lat: j.latitude, lon: j.longitude, city: [j.city, j.region_code].filter(Boolean).join('/'),
                isp: (j.connection && (j.connection.isp || j.connection.org)) || 'ISP', asn: j.connection && j.connection.asn ? 'AS' + j.connection.asn : '',
                rtt: Math.round(performance.now() - t0), real: true};
  } catch {
    const v = await visitorIP();
    geoCache = {ip: v.ip, lat: null, lon: null, city: '', isp: 'source ISP', asn: '', rtt: Math.round(performance.now() - t0), real: v.real};
  }
  return geoCache;
}
const fmtLL = g => g.lat == null ? 'location unavailable' : `${g.lat.toFixed(2)}, ${g.lon.toFixed(2)}`;
const STG = g => [
  {n: 'Origin',              s: g.ip + (g.real ? '' : ' (sample)'), s2: fmtLL(g), log: `origin ${g.ip} · ${fmtLL(g)}${g.city ? ' · ' + g.city : ''}`},
  {n: 'Source ISP',          s: g.isp.length > 22 ? g.isp.slice(0, 21) + '…' : g.isp, s2: g.asn, log: `ISP ${g.isp}${g.asn ? ' · ' + g.asn : ''}`},
  {n: 'Internet access',     s: `rtt ${g.rtt} ms`, s2: 'public route', log: `internet reached · rtt ${g.rtt} ms`},
  {n: 'Gamma Network tunnel', s: 'tunnel up', s2: 'wireguard', log: 'tunnel to Gamma Network established'},
  {n: 'Firewall',            s: 'login · password · code', s2: '', log: 'firewall: authentication required'},
  {n: 'Encryption',          s: 'x25519 · aes-256-gcm', s2: '', log: 'end-to-end encrypted channel'}];
const LOGIN = 'lucas';   // usuário digitado no painel (animação); só aparece depois da autenticação

/* tela de autenticação do firewall: só animação, sem campos reais */
async function loginPanel(w, host){
  const chars = 'ABCDEF0123456789KXZQ#$%';
  let noise = ''; for (let i = 0; i < 1400; i++) noise += (Math.random() < .55 ? chars[Math.random() * chars.length | 0] : ' ') + (i % 70 === 69 ? '\n' : ' ');
  const ov = document.createElement('div');
  ov.style.cssText = `position:absolute;inset:0;z-index:5;background:rgba(2,6,3,.96);display:flex;align-items:center;justify-content:center;overflow:hidden`;
  ov.innerHTML = `<pre aria-hidden="true" style="position:absolute;inset:0;margin:0;font:11px/1.25 ${MONO_I};color:#0d250e;white-space:pre;overflow:hidden">${noise}</pre>
    <div style="position:relative;width:min(440px,90%);background:#000;border:1px solid ${C.line}">
      <div style="height:26px;border-bottom:1px solid ${C.line};display:flex;align-items:center;justify-content:space-between;padding:0 10px;font:600 12px ${MONO_I};color:${C.fg}"><span>cortexpi firewall · authentication</span><span style="color:${C.dim}">[×]</span></div>
      <div style="padding:20px 22px 18px;font:13px ${MONO_I}">
        ${['USERNAME', 'PASSWORD', 'DAILY CODE'].map((l, i) => `<div style="font:800 15px ${MONO_I};color:${C.green};letter-spacing:.04em;margin:${i ? 14 : 0}px 0 6px">${l}:</div>
          <div class="f" style="height:40px;border:1.5px solid ${C.line};background:${C.bar};display:flex;align-items:center;justify-content:center;font:700 18px ${MONO_I};letter-spacing:.12em;color:${C.fg}"></div>`).join('')}
        <div class="ok" style="margin-top:16px;min-height:20px;text-align:center;font:800 13px ${MONO_I};letter-spacing:.08em"></div></div></div>`;
  host.appendChild(ov);
  const [fu, fp, fc] = ov.querySelectorAll('.f'), ok = ov.querySelector('.ok');
  const type = async (el, txt, col, focusCol) => { el.style.borderColor = focusCol; el.style.color = col;
    for (const ch of txt){ if (!w.alive()) return; el.textContent += ch; await wait(150); } el.style.borderColor = C.line; await wait(350); };
  await wait(700);
  await type(fu, LOGIN, C.green, C.frost);          // usuário = verde (regra de cor)
  await type(fp, '**********', C.fg, C.frost);
  await type(fc, '******', C.fg, C.frost);
  ok.style.color = C.frost; ok.textContent = 'verifying…'; await wait(1300);
  ok.style.color = C.green; ok.textContent = '✓ CREDENTIALS APPROVED'; await wait(1600);
  await fade(ov, 1, 0, 350); ov.remove();
}

/* hexágono girado reutilizável */
function hexStage(svg, cx, cy, R, compact){
  const NS = 'http://www.w3.org/2000/svg', mk = (n, a) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); return e; };
  const V = [0, 1, 2, 3, 4, 5].map(i => { const a = (-90 + 60 * i) * Math.PI / 180; return [cx + R * Math.cos(a), cy + R * Math.sin(a)]; });
  svg.appendChild(mk('polygon', {points: V.map(v => v.join(',')).join(' '), fill: 'none', stroke: C.panel, 'stroke-width': 1.2, 'stroke-dasharray': '3 6'}));
  const c1 = mk('text', {x: cx, y: cy - 4, 'text-anchor': 'middle', style: `font-size:${compact ? 11 : 12}px;fill:${C.dim}`});
  const c2 = mk('text', {x: cx, y: cy + 16, 'text-anchor': 'middle', style: `font-size:${compact ? 10 : 11}px;fill:${C.line}`});
  svg.append(c1, c2);
  const dots = V.map(v => { const d = mk('circle', {cx: v[0], cy: v[1], r: 4.5, fill: '#020603', stroke: C.line, 'stroke-width': 1.5}); svg.appendChild(d); return d; });
  const nums = V.map(([x, y], i) => { const t = mk('text', {x, y: y + 3.5, 'text-anchor': 'middle', style: `font-size:8px;font-weight:700;fill:${C.bg}`}); t.textContent = i + 1; svg.appendChild(t); return t; });
  const edges = [];
  const labs = compact ? null : V.map(([x, y], i) => {
    const right = x > cx + 5, left = x < cx - 5, top = y < cy - R * .8, bot = y > cy + R * .8;
    const anchor = right ? 'start' : left ? 'end' : 'middle', dx = right ? 14 : left ? -14 : 0, dy = top ? -44 : bot ? 22 : -4;
    const a = mk('text', {x: x + dx, y: y + dy, 'text-anchor': anchor, style: `font-size:12px;font-weight:700;fill:${C.line}`});
    const b = mk('text', {x: x + dx, y: y + dy + 14, 'text-anchor': anchor, style: `font-size:10.5px;fill:${C.panel}`});
    const c = mk('text', {x: x + dx, y: y + dy + 27, 'text-anchor': anchor, style: `font-size:10px;fill:${C.panel}`});
    svg.append(a, b, c); return [a, b, c]; });
  return {
    V, cx, cy, R, dots, nums, c1, c2,
    label(i, st){ if (!labs) return; labs[i][0].textContent = `${i + 1} · ${st.n}`; labs[i][1].textContent = st.s; labs[i][2].textContent = st.s2 || ''; },
    active(i){ dots[i].setAttribute('stroke', C.frost); dots[i].setAttribute('r', 6); if (labs){ labs[i][0].style.fill = C.fg; labs[i][1].style.fill = C.dim; labs[i][2].style.fill = C.dim; } },
    approve(i){ dots[i].setAttribute('fill', C.green); dots[i].setAttribute('stroke', C.green); dots[i].setAttribute('r', 6); nums[i].style.fill = '#000'; if (labs) labs[i][0].style.fill = C.fg; },
    warn(i){ dots[i].setAttribute('fill', C.yellow); dots[i].setAttribute('stroke', C.yellow); },
    async edge(i, col, step = .03){ const a = V[i], b = V[(i + 1) % 6]; const e = mk('line', {x1: a[0], y1: a[1], x2: a[0], y2: a[1], stroke: col || C.frost, 'stroke-width': 2}); svg.insertBefore(e, dots[0]); edges.push(e);
      for (let s = 0; s <= 1.0001; s += REDUCE ? 1 : step){ e.setAttribute('x2', a[0] + (b[0] - a[0]) * s); e.setAttribute('y2', a[1] + (b[1] - a[1]) * s); await wait(16); } return e; },
    allGreen(){ edges.forEach(e => e.setAttribute('stroke', C.green)); },
    center(t1, t2, col1, col2, big){ c1.textContent = t1; c2.textContent = t2 || ''; c1.style.fill = col1 || C.dim; c2.style.fill = col2 || C.line;
      c1.style.fontSize = big ? (compact ? '15px' : '19px') : (compact ? '11px' : '12px'); c1.style.fontWeight = big ? 800 : 400;
      c2.style.fontSize = big ? (compact ? '15px' : '19px') : (compact ? '10px' : '11px'); c2.style.fontWeight = big ? 800 : 400; c1.setAttribute('y', big ? cy - 6 : cy - 4); c2.setAttribute('y', big ? cy + 18 : cy + 16); }
  };
}
async function authorized(w, el){
  const t = typer(el, w);
  await t('<span class="g">access granted · encrypted session with gamma</span>', {speed: 8});
  el.insertAdjacentHTML('beforeend', `<span class="u">${LOGIN}@gamma</span>:~$ <span class="ta-cur"></span>`);
  w.status('<span class="ok">GRANTED</span>secure session with gamma', GATEWAY_URL ? 'Enter to connect · Esc to close' : 'Esc to close');
  if (GATEWAY_URL) document.addEventListener('keydown', function go(e){ if (!w.alive()){ document.removeEventListener('keydown', go); return; }
    if (e.key === 'Enter' && !w.expired){ e.preventDefault(); location.assign(GATEWAY_URL); } });
}


/* ------------------------------------------------------------ efeitos do favo escolhido */
/* hexadecimais correndo dentro do favo enquanto a comunicação é criptografada */
async function hexCrypto(w, svg, hx, ms){
  const NS = 'http://www.w3.org/2000/svg', mk = (n, a) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); return e; };
  const id = 'hxclip' + Math.random().toString(36).slice(2, 7), r = hx.R - 14;
  const pts = [0, 1, 2, 3, 4, 5].map(i => { const a = (-90 + 60 * i) * Math.PI / 180; return `${hx.cx + r * Math.cos(a)},${hx.cy + r * Math.sin(a)}`; }).join(' ');
  const defs = mk('defs', {}), cp = mk('clipPath', {id}); cp.appendChild(mk('polygon', {points: pts})); defs.appendChild(cp); svg.appendChild(defs);
  const g = mk('g', {'clip-path': `url(#${id})`}); svg.appendChild(g);
  const rows = 15, lh = 14, y0 = hx.cy - (rows - 1) * lh / 2, H = '0123456789abcdef';
  const lines = Array.from({length: rows}, (_, k) => { const t = mk('text', {x: hx.cx, y: y0 + k * lh, 'text-anchor': 'middle', style: `font-size:10.5px;letter-spacing:.06em;fill:${C.frost}`}); g.appendChild(t); return t; });
  const grp = () => Array.from({length: 4}, () => H[Math.random() * 16 | 0]).join('');
  hx.c1.textContent = ''; hx.c2.textContent = '';
  const t0 = performance.now();
  while (performance.now() - t0 < ms && w.alive()){
    lines.forEach((t, k) => { t.textContent = `${grp()} ${grp()} ${grp()} ${grp()} ${grp()}`; t.style.opacity = (.25 + .75 * Math.random()).toFixed(2); });
    await wait(REDUCE ? ms : 90);
  }
  for (let o = 1; o >= 0; o -= .1){ g.style.opacity = o; await wait(30); }
  g.remove(); defs.remove();
}

/* ================================================================ FAVO 3D · DIAGRAMA DE FLAMM (forma D aprovada)
   Superfície de revolução (catenoide) ladrilhada por hexágonos encaixados; garganta 0,17 do aro.
   Transição aprovada (transicoes-flamm.html): os pontos somem → o favo se preenche → as arestas se ramificam
   e fecham novos hexágonos, de frente → o favo enrola em 3D e gira. Câmera pré-calculada e suavizada (sem saltos).
   Estudos anteriores em arquivo/2026-11-14-favo3d/. */
const FL_T = {A: .7, B: 1.5, W: 3.6, W2: 7.6, D: 8.6, END: 11}, FL_BUD = .11;
const FL_S3D = .22, FL_PAN = .075;   // escala final do Flamm (fração da altura) e subida final, para caber IPs e status
const flClamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), flLerp = (a, b, t) => a + (b - a) * t;
const flSmooth = t => t * t * (3 - 2 * t), flEase = t => t < .5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3) / 2;
let FL = null;
function flammPrep(){
  if (FL) return FL;
  // malha: cada célula guarda o 3D, as coordenadas (ângulo, meridiano) e linha/coluna para achar vizinhas
  const RT = .17, HH = 1.5, M = 20, P = [], cc = HH / Math.acosh(1 / RT);
  for (let i = 0; i <= 160; i++){ const y = HH - i / 160 * 2 * HH; P.push([RT * Math.cosh(y / cc), y]); }
  const vs = [0];
  for (let i = 1; i < P.length; i++){ const ds = Math.hypot(P[i][0] - P[i-1][0], P[i][1] - P[i-1][1]); vs.push(vs[i-1] + ds / Math.pow((P[i][0] + P[i-1][0]) / 2, .6)); }
  const V = vs[vs.length - 1], w = 2 * Math.PI / M, a = w / Math.sqrt(3), hs = 1.5 * a;
  const at = v => { let lo = 0, hi = vs.length - 1; while (hi - lo > 1){ const m = (lo + hi) >> 1; if (vs[m] < v) lo = m; else hi = m; }
    const f = (v - vs[lo]) / ((vs[hi] - vs[lo]) || 1); return [P[lo][0] + (P[hi][0] - P[lo][0]) * f, P[lo][1] + (P[hi][1] - P[lo][1]) * f]; };
  const cells = [];
  for (let row = 0; row * hs <= V + a; row++){ const off = (row & 1) ? w / 2 : 0;
    for (let c = 0; c < M; c++){ const cth = c * w + off, cv = row * hs;
      const vx = [0, 1, 2, 3, 4, 5].map(k => { const ang = (-90 + 60 * k) * Math.PI / 180; return [cth + a * Math.cos(ang), cv + a * Math.sin(ang)]; });
      if (vx.some(q => q[1] < 0 || q[1] > V)) continue;
      const poly = []; for (let k = 0; k < 6; k++){ const p0 = vx[k], p1 = vx[(k + 1) % 6]; for (let j = 0; j < 3; j++){ const u = j / 3; poly.push([p0[0] + (p1[0] - p0[0]) * u, p0[1] + (p1[1] - p0[1]) * u]); } }
      const xyz = poly.map(([th, v]) => { const [r, y] = at(v); return [r * Math.cos(th), y, r * Math.sin(th)]; });
      const [cr, cy] = at(cv);
      cells.push({row, col: c, pts: xyz, par: poly, th: cth, v: cv, r: cr, y: cy, c: [cr * Math.cos(cth), cy, cr * Math.sin(cth)]});
    } }
  const key = (r, c) => r + ':' + (((c % M) + M) % M), byKey = new Map(cells.map((cl, i) => [key(cl.row, cl.col), i]));
  cells.forEach(cl => { const r = cl.row, c = cl.col, odd = r & 1;
    const cand = [[r, c - 1], [r, c + 1], [r - 1, odd ? c : c - 1], [r - 1, odd ? c + 1 : c], [r + 1, odd ? c : c - 1], [r + 1, odd ? c + 1 : c]];
    cl.nb = cand.map(([rr, c2]) => byKey.get(key(rr, c2))).filter(i => i !== undefined); });
  // semente: célula de frente, na metade de cima, perto da garganta; as outras nascem em ordem de vizinhança
  const SEED = cells.reduce((b, cl, i) => { const front = Math.abs(Math.atan2(Math.sin(cl.th - Math.PI / 2), Math.cos(cl.th - Math.PI / 2)));
    const s = (cl.y < 0 ? 9 : 0) + Math.abs(cl.y - .45) + front * 3; return s < b.s ? {s, i} : b; }, {s: 1e9, i: 0}).i;
  const dist = new Array(cells.length).fill(-1), parent = new Array(cells.length).fill(-1); dist[SEED] = 0;
  for (let q = [SEED], h = 0; h < q.length; h++){ const i = q[h]; for (const j of cells[i].nb) if (dist[j] < 0){ dist[j] = dist[i] + 1; parent[j] = i; q.push(j); } }
  const MAXD = Math.max(...dist);
  // favo plano: a mesma grade, regular, no plano tangente à semente
  const S = cells[SEED], thS = S.th, rs = S.r, et = [-Math.sin(thS), 0, Math.cos(thS)];
  cells.forEach(cl => { const dth = Math.atan2(Math.sin(cl.th - thS), Math.cos(cl.th - thS)) - cl.th;
    cl.flat = cl.par.map(([th, v]) => { const u = (th + dth) * rs, h = -(v - S.v) * rs; return [S.c[0] + et[0] * u, S.c[1] + h, S.c[2] + et[2] * u]; }); });
  // aresta que cada célula divide com a mãe: é dela que as novas arestas se ramificam
  const mean = Q => [0, 1, 2].map(k => Q.reduce((s, q) => s + q[k], 0) / Q.length);
  cells.forEach((cl, i) => { if (parent[i] < 0){ cl.shared = 0; return; } const pc = mean(cells[parent[i]].flat); let best = 0, bd = 1e9;
    for (let e = 0; e < 6; e++){ const p0 = cl.flat[3 * e], p1 = cl.flat[(3 * e + 3) % 18], d = Math.hypot((p0[0] + p1[0]) / 2 - pc[0], (p0[1] + p1[1]) / 2 - pc[1], (p0[2] + p1[2]) / 2 - pc[2]); if (d < bd){ bd = d; best = e; } }
    cl.shared = best; });
  // proporções fixas do palco (largura = 1): viewBox 420×330, favo 2D com raio 115
  const UH = 330 / 420, U2D = 115 / 420, U3D = UH * FL_S3D, T = FL_T;
  const yawBase = t => { const spinT = Math.max(0, t - T.W); return (Math.PI / 2 - thS) + .11 * (spinT < 1 ? spinT * spinT / 2 : spinT - .5); };
  function scene(t, extraYaw = 0){
    const wrap = flEase(flClamp((t - T.W) / (T.W2 - T.W)));
    const pitch = flLerp(0, .26, wrap), yaw = yawBase(t) + extraYaw;
    const cy_ = Math.cos(yaw), sy_ = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
    const raw = (x, y, z) => { const x1 = x*cy_ - z*sy_, z1 = x*sy_ + z*cy_, sy = -y*cp + z1*sp, dz = y*sp + z1*cp, kk = 7 / (7 - dz * .45); return [x1*kk, sy*kk, dz]; };
    const mult = flClamp((t - T.B) / (T.D - T.B)), items = [];
    cells.forEach((cl, i) => {
      const g = i === SEED ? 1 : flClamp((mult - dist[i] / MAXD * (1 - FL_BUD)) / FL_BUD);
      if (g <= 0) return;
      const pr = cl.pts.map((q, j) => { const f = cl.flat[j]; return raw(flLerp(f[0], q[0], wrap), flLerp(f[1], q[1], wrap), flLerp(f[2], q[2], wrap)); });
      items.push({i, g, pts: pr, z: pr.reduce((m, q) => m + q[2], 0) / pr.length});
    });
    const fl = S.flat.map(q => raw(q[0], q[1], q[2])), sh = Math.max(...fl.map(q => q[1])) - Math.min(...fl.map(q => q[1]));
    return {items, raw, wrap, done: t >= T.D, Z0: Math.max(1, 2 * U2D / (sh * U3D))};
  }
  // enquadramento ideal: caixa do que já foi desenhado
  function camTarget(t){
    const {items, Z0} = scene(t); let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
    for (const it of items){ const e0 = cells[it.i].shared, A0 = it.pts[3 * e0], B0 = it.pts[(3 * e0 + 3) % 18], mx = (A0[0] + B0[0]) / 2, my = (A0[1] + B0[1]) / 2, gg = flSmooth(it.g);
      for (const p0 of it.pts){ const qx = flLerp(mx, p0[0], gg), qy = flLerp(my, p0[1], gg); x0 = Math.min(x0, qx); x1 = Math.max(x1, qx); y0 = Math.min(y0, qy); y1 = Math.max(y1, qy); } }
    const Z = flClamp(Math.min(Z0, .8 * UH / ((y1 - y0) * U3D), .86 / ((x1 - x0) * U3D)), 1, Z0);
    return [Math.log(Z), (x0 + x1) / 2, (y0 + y1) / 2];
  }
  // câmera sem saltos e sem atraso: o zoom antecipa 0,4 s e tudo passa por um filtro gaussiano
  const CDT = .02, n = Math.ceil((T.END + 2 - T.B) / CDT) + 1, G = [];
  for (let i = 0; i < n; i++) G.push(camTarget(T.B + i * CDT));
  const lead = Math.round(.4 / CDT), A = G.map((g, i) => { let m = g[0]; for (let j = i; j <= Math.min(n - 1, i + lead); j++) m = Math.min(m, G[j][0]); return [m, g[1], g[2]]; });
  const sig = .22 / CDT, R = Math.ceil(sig * 3), wts = []; for (let d = -R; d <= R; d++) wts.push(Math.exp(-d * d / (2 * sig * sig)));
  const CAM = A.map((_, i) => { const acc = [0, 0, 0]; let ws = 0; for (let d = -R; d <= R; d++){ const j = flClamp(i + d, 0, n - 1), wt = wts[d + R]; for (let k = 0; k < 3; k++) acc[k] += A[j][k] * wt; ws += wt; } return acc.map(v => v / ws); })
    .map((c, i) => { const u = flSmooth(flClamp(i * CDT / .6)); return c.map((v, k) => flLerp(G[0][k], v, u)); });
  const camAt = t => { const f = flClamp((t - T.B) / CDT, 0, CAM.length - 1), i = Math.floor(f), j = Math.min(i + 1, CAM.length - 1), u = f - i;
    const c = CAM[i].map((v, k) => flLerp(v, CAM[j][k], u)); return {Z: Math.exp(c[0]), ux: c[1], vy: c[2]}; };
  return (FL = {cells, scene, camAt, yawBase});
}

/* desenha o quadro t (s) num canvas W×H com o mesmo enquadramento do palco 420×330 */
/* opções: yaw (giro extra, rad) · rgb (cor das arestas; verde neon por padrão) · close (0→1: o favo único se desfaz)
   · labels {top, bottom: [[texto, cor, negrito]], alpha} */
function flammDraw(ctx, W, H, t, o = {}){
  const F = flammPrep(), T = FL_T, k = W / 420, s2D = 115 * k, s3D = H * FL_S3D, rgb = o.rgb || [120, 255, 90];
  const cx = 210 * k, cy = 165 * k - FL_PAN * H * flEase(flClamp((t - T.W) / (T.D - T.W)));
  ctx.clearRect(0, 0, W, H);
  const FILL = c => `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`, tileFront = [12 * 1.6 * .95, 46 * 1.6 * .95, 16 * 1.6 * .95];
  const poly = (pts, fill, stroke, lw) => { ctx.beginPath(); pts.forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); ctx.closePath();
    if (fill){ ctx.fillStyle = fill; ctx.fill(); } if (stroke){ ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); } };
  if (t < T.B){   // os pontos e o texto somem; o favo ganha preenchimento
    const big = []; for (let i = 0; i < 6; i++){ const a0 = (-90 + 60 * i) * Math.PI / 180, a1 = (-90 + 60 * (i + 1)) * Math.PI / 180;
      for (let j = 0; j < 3; j++){ const u = j / 3; big.push([cx + s2D * flLerp(Math.cos(a0), Math.cos(a1), u), cy + s2D * flLerp(Math.sin(a0), Math.sin(a1), u)]); } }
    if (o.close != null){   // rede se fechando: o preenchimento some e o contorno se apaga a partir do topo
      const c = flClamp(o.close); ctx.globalAlpha = 1 - flSmooth(flClamp(c / .6)); poly(big, FILL(tileFront)); ctx.globalAlpha = 1;
      const left = (1 - flSmooth(c)) * 18; if (left > 0){ ctx.beginPath(); ctx.moveTo(big[0][0], big[0][1]);
        for (let j = 1; j <= Math.floor(left); j++){ const q = big[j % 18]; ctx.lineTo(q[0], q[1]); }
        const j0 = Math.floor(left), fr = left - j0; if (j0 < 18 && fr > 0){ const a = big[j0 % 18], b = big[(j0 + 1) % 18]; ctx.lineTo(flLerp(a[0], b[0], fr), flLerp(a[1], b[1], fr)); }
        ctx.strokeStyle = `rgb(${rgb})`; ctx.lineWidth = 2; ctx.stroke(); }
      return; }
    ctx.globalAlpha = flSmooth(flClamp((t - T.A) / (T.B - T.A))); poly(big, FILL(tileFront)); ctx.globalAlpha = 1;
    poly(big, null, '#78ff5a', 2);
    const dotA = 1 - flSmooth(flClamp(t / T.A));
    if (dotA > 0){
      for (let i = 0; i < 6; i++){ const q = big[i * 3];
        ctx.globalAlpha = dotA; ctx.fillStyle = '#78ff5a'; ctx.beginPath(); ctx.arc(q[0], q[1], 6 * k * dotA, 0, Math.PI * 2); ctx.fill();
        if (dotA > .5){ ctx.fillStyle = '#000'; ctx.font = `700 ${8 * k}px ${MONO}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(i + 1, q[0], q[1] + .5); } }
      ctx.globalAlpha = dotA; ctx.fillStyle = '#78ff5a'; ctx.font = `${11 * k}px ${MONO}`; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
      ctx.fillText('encryption', cx, cy - 4 * k); ctx.font = `${10 * k}px ${MONO}`; ctx.fillText('complete', cx, cy + 16 * k); }
    ctx.globalAlpha = 1; return;
  }
  const sc = F.scene(t, o.yaw || 0), {items, raw, wrap} = sc, cam = F.camAt(t), Z = cam.Z, Z0 = sc.Z0;
  for (const it of items) it.pts = it.pts.map(q => [cx + (q[0] - cam.ux) * s3D * Z, cy + (q[1] - cam.vy) * s3D * Z, q[2]]);
  items.sort((a, b) => a.z - b.z);
  const allZ = F.cells.map(cl => raw(cl.c[0], cl.c[1], cl.c[2])[2]), zmin = Math.min(...allZ), zmax = Math.max(...allZ);
  const lw = 1.1 + .9 * Math.sqrt(Z0 > 1 ? flClamp((Z - 1) / (Z0 - 1)) : 0);
  for (const it of items){ const A = it.pts[0], B = it.pts[6], C = it.pts[12], front = ((B[0]-A[0])*(C[1]-A[1]) - (B[1]-A[1])*(C[0]-A[0])) < 0;
    const depth = flClamp((it.z - zmin) / ((zmax - zmin) || 1)), lum = flLerp((front ? .62 : .38) + .45 * depth, .95, 1 - wrap);
    const fill = FILL([12 * lum * 1.6, 46 * lum * 1.6, 16 * lum * 1.6]);
    const st = `rgba(${rgb},${flLerp((front ? .8 : .28) * (.45 + .55 * depth), 1, 1 - wrap)})`;   // arestas verde neon (âmbar quando a rede se fecha)
    if (it.g >= 1){ poly(it.pts, fill, st, lw); continue; }
    // em formação: das pontas da aresta compartilhada saem duas arestas de cada lado, que se encontram na oposta
    const fa = flSmooth(flClamp((it.g - .82) / .18)), e0 = F.cells[it.i].shared, grow = flClamp(it.g / .82) * 3;
    if (fa > 0){ ctx.globalAlpha = fa; poly(it.pts, fill); ctx.globalAlpha = 1; }
    ctx.strokeStyle = st; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.beginPath();
    const seg = (e, from, f) => { if (f <= 0) return; const Q = [0, 1, 2, 3].map(j => it.pts[(3 * e + j) % 18]); if (from) Q.reverse();
      const nn = f * 3, wh = Math.floor(nn); ctx.moveTo(Q[0][0], Q[0][1]); for (let j = 1; j <= wh; j++) ctx.lineTo(Q[j][0], Q[j][1]);
      if (wh < 3){ const fr = nn - wh; ctx.lineTo(flLerp(Q[wh][0], Q[wh + 1][0], fr), flLerp(Q[wh][1], Q[wh + 1][1], fr)); } };
    seg(e0, 0, 1);
    seg((e0 + 1) % 6, 0, flClamp(grow)); seg((e0 + 5) % 6, 1, flClamp(grow));
    seg((e0 + 2) % 6, 0, flClamp(grow - 1)); seg((e0 + 4) % 6, 1, flClamp(grow - 1));
    seg((e0 + 3) % 6, 0, flClamp(grow - 2) / 2); seg((e0 + 3) % 6, 1, flClamp(grow - 2) / 2);
    ctx.stroke(); }
  // rótulos: IP de origem no topo do túnel; IP do gamma e status no rodapé
  const L = o.labels; if (L && L.alpha > 0 && items.length){
    let y0 = 1e9, y1 = -1e9; for (const it of items) for (const q of it.pts){ if (q[1] < y0) y0 = q[1]; if (q[1] > y1) y1 = q[1]; }
    ctx.globalAlpha = L.alpha; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    if (L.top){ ctx.font = `600 ${10.5 * k}px ${MONO}`; ctx.fillStyle = '#beffaa'; ctx.fillText(L.top, cx, Math.max(12 * k, y0 - 8 * k)); }
    let y = y1 + 15 * k;
    for (const [txt, col, bold] of L.bottom || []){ ctx.font = `${bold ? 800 : 600} ${(bold ? 12.5 : 10.5) * k}px ${MONO}`; ctx.fillStyle = col; ctx.fillText(txt, cx, y); y += (bold ? 16 : 15) * k; }
    ctx.globalAlpha = 1; }
}

/* sobre o palco do p8: o canvas assume o favo 2D no mesmo lugar e segue girando até a janela fechar.
   Devolve {ready (Promise, túnel formado), labels(def), collapse(ms) (Promise: túnel se desfaz e a rede se fecha)} */
function favo3D(w, stage, svg){
  const F = flammPrep(), T = FL_T;
  const cv = document.createElement('canvas'); cv.style.cssText = 'position:absolute;left:0;top:0;pointer-events:none';
  stage.appendChild(cv);
  const ctx = cv.getContext('2d'), box = svg.getBoundingClientRect(), DPR = Math.min(devicePixelRatio || 1, 2), W = box.width, H = box.height;
  cv.style.width = W + 'px'; cv.style.height = H + 'px'; cv.width = W * DPR; cv.height = H * DPR; ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  const t0 = performance.now(); let labels = null, labelsAt = 0, col = null, mode = 'run', stopped = false;
  const fx = {
    ready: wait(T.D * 1000),
    labels(def){ labels = def; labelsAt = performance.now(); },
    collapse(ms = 6500){ col = {at: performance.now(), tc: (performance.now() - t0) / 1000, ms, closeMs: 1400}; mode = 'collapse';
      return new Promise(r => col.done = r); },
    stop(){ stopped = true; }
  };
  function loop(now){
    if (!w.alive() || stopped) return;
    let t = REDUCE ? T.D + 1 : (now - t0) / 1000, o = {};
    if (labels) o.labels = {...labels, alpha: REDUCE ? 1 : flSmooth(flClamp((now - labelsAt) / 700))};
    if (mode === 'collapse'){
      const e = (now - col.at) / 1000, D = col.ms / 1000;
      if (labels) o.labels.alpha = 1 - flSmooth(flClamp(e / .6));
      o.rgb = [255, 190, 0];
      if (e < D){   // o túnel volta pelo mesmo caminho: desenrola, as células se desfazem até restar o primeiro hexágono
        const p = flEase(flClamp(e / D)), tr = T.D - (T.D - T.B) * p, Y0 = F.yawBase(col.tc);
        const E0 = (((Y0 - F.yawBase(T.D)) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
        const pa = flClamp((T.D - tr) / (T.D - T.W));   // o giro extra termina alinhado antes do favo voltar ao plano
        t = tr; o.yaw = E0 + (2 * Math.PI - E0) * flSmooth(pa);
      } else {
        const c = (e - D) / (col.closeMs / 1000); t = T.B - 1e-6; o.close = c;
        if (c >= 1){ flammDraw(ctx, W, H, t, o); mode = 'closed'; col.done(); return; }
      }
    }
    flammDraw(ctx, W, H, t, o);
    if (svg.style.visibility !== 'hidden') svg.style.visibility = 'hidden';   // o canvas já desenhou o mesmo favo por cima
    if (!REDUCE || mode === 'collapse') requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
  return fx;
}

/* ------------------------------------------------------------ 8 · Favo girado + sessão com estágios (escolhido)
   Toda a comunicação em inglês. Antes do login o terminal é anônimo (qualquer um pode estar tentando);
   só depois da autenticação aparece login@gamma. Inatividade de 5 min: o túnel se desfaz e a rede se fecha. */
const IDLE_MS = 5 * 60 * 1000;
const GAMMA_ADDR = '••.•••.•••.•••';   // o IP real do gamma nunca vai para o código público
async function p8(){
  const w = frame('ssh gamma', 'min'); win = w;
  w.body.innerHTML = `<div style="display:grid;grid-template-columns:1fr 330px;min-height:430px">
    <div style="display:flex;flex-direction:column"><div class="ta-txt hd" style="padding:14px 16px 0"></div>
      <div class="stage" style="position:relative"><svg viewBox="0 0 420 330" aria-hidden="true"></svg></div></div>
    <div style="border-left:1px solid ${C.panel};display:flex;flex-direction:column">
      <div class="lst" style="padding:12px 16px 6px"></div>
      <div class="ta-txt lg" style="flex:1;max-height:120px;overflow:hidden;font-size:11.5px;color:${C.dim};border-top:1px solid ${C.panel}"></div>
      <div class="ta-txt fin" style="border-top:1px solid ${C.panel};padding:10px 16px"></div></div></div>`;
  const svg = w.body.querySelector('svg'), stage = w.body.querySelector('.stage'), fin = w.body.querySelector('.fin');
  const lst = w.body.querySelector('.lst'), lg = w.body.querySelector('.lg'), t = typer(w.body.querySelector('.hd'), w);
  await t('<span class="d">$</span> ssh gamma', {speed: 55, pause: 400});
  const hx = hexStage(svg, 210, 165, 115, true);
  hx.center('locating…', '', C.dim);
  setTimeout(flammPrep, 300);   // pré-calcula o Flamm e a câmera enquanto os estágios rodam
  const g = await geo(), S = STG(g);
  lst.innerHTML = S.map((st, i) => `<div class="r" style="display:grid;grid-template-columns:18px 1fr;gap:8px;padding:6px 0;border-bottom:1px solid ${C.panel};color:${C.line}">
    <span class="m">○</span><div><div style="display:flex;justify-content:space-between;gap:8px"><span>${i + 1} · ${esc(st.n)}</span><span class="v" style="font-size:11px"></span></div>
    <div style="font-size:11px;color:${C.line}" class="sd">${esc(st.s)}${st.s2 ? ' · ' + esc(st.s2) : ''}</div></div></div>`).join('');
  const rows = [...lst.children];
  const log = s => { lg.insertAdjacentHTML('beforeend', `${new Date().toISOString().slice(11, 19)} ${esc(s)}\n`); while (lg.scrollHeight > lg.clientHeight && lg.firstChild) lg.removeChild(lg.firstChild); };
  const ok = (i, r) => { hx.approve(i); r.querySelector('.m').textContent = '●'; r.querySelector('.m').style.color = C.green; r.querySelector('.v').innerHTML = '<span class="g">approved</span>'; };
  await wait(600);
  for (let i = 0; i < 6; i++){ if (!w.alive()) return;
    if (i > 0) await hx.edge(i - 1, null, .014);     // ~1,2 s por aresta
    const r = rows[i]; r.style.color = C.fg; r.querySelector('.sd').style.color = C.dim; r.querySelector('.m').textContent = '◌'; r.querySelector('.m').style.color = C.frost;
    hx.active(i); hx.center(`${i + 1}/6`, S[i].n, C.fg, C.dim); w.status(`stage ${i + 1}/6 · <b>${esc(S[i].n)}</b>`);
    log(S[i].log); await wait(1400);                  // tempo de leitura
    if (i === 4){ hx.warn(i); r.querySelector('.v').innerHTML = '<span class="w">authenticating</span>'; await loginPanel(w, w.body); if (!w.alive()) return;
      log('credentials and daily code approved'); w.title(`${LOGIN}@gamma: ~`); await wait(500); }
    if (i === 5){
      r.querySelector('.v').innerHTML = '<span class="i">encrypting</span>';
      log('x25519 key exchange'); await hexCrypto(w, svg, hx, 2200); log('aes-256-gcm cipher active'); await hexCrypto(w, svg, hx, 1600); if (!w.alive()) return;
    }
    ok(i, r); await wait(500);
  }
  await hx.edge(5, C.green, .02); hx.allGreen();
  hx.center('encryption', 'complete', C.green, C.green); log('encryption complete');
  w.status('<span class="ok">ENCRYPTED</span>opening tunnel to gamma…'); log('opening tunnel to gamma…');
  const fx = favo3D(w, stage, svg); await fx.ready; if (!w.alive()) return;
  fx.labels({top: `ORIGIN ${g.ip}`, bottom: [[`GAMMA ${GAMMA_ADDR} · private network`, C.frost], ['ACCESS GRANTED', C.green, true], ['TUNNEL STABILIZED', C.green, true]]});
  log('access granted · tunnel stabilized');
  await authorized(w, fin);

  /* inatividade: 5 min sem mexer no mouse/teclado e a sessão expira */
  let last = performance.now();
  const poke = () => { last = performance.now(); };
  const evs = ['mousemove', 'mousedown', 'keydown', 'wheel', 'touchstart'];
  evs.forEach(e => document.addEventListener(e, poke, {passive: true}));
  const idle = (window.CXT_IDLE_MS || IDLE_MS);
  const mmss = ms => { const s = Math.max(0, Math.ceil(ms / 1000)); return `${String(s / 60 | 0).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; };
  while (w.alive()){
    const left = idle - (performance.now() - last);
    w.status(null, `${GATEWAY_URL ? 'Enter to connect · ' : ''}idle timeout <b>${mmss(left)}</b> · Esc to close`);
    if (left <= 0) break;
    await wait(250);
  }
  evs.forEach(e => document.removeEventListener(e, poke));
  if (!w.alive()) return;

  /* o túnel se desfaz e a rede se fecha, do último estágio ao primeiro */
  w.expired = true; w.status('<span class="blk">EXPIRED</span>idle timeout · closing tunnel…', ''); log('idle timeout · closing session'); log('tunnel collapsing…');
  const closing = fx.collapse(6500);
  for (let i = 5; i >= 0; i--){ if (!w.alive()) return; await wait(1050);
    const r = rows[i]; r.style.color = C.line; r.querySelector('.sd').style.color = C.line; r.querySelector('.m').textContent = '×'; r.querySelector('.m').style.color = C.red;
    r.querySelector('.v').innerHTML = '<span class="r">closed</span>'; log(`${S[i].n.toLowerCase()} closed`); }
  await closing; if (!w.alive()) return;
  log('network closed');
  w.title('ssh gamma');
  fin.innerHTML = '';
  const tf = typer(fin, w);
  await tf('<span class="w">Connection to gamma closed (idle 5 min).</span>', {speed: 8});
  fin.insertAdjacentHTML('beforeend', '<span class="d">$</span> <span class="ta-cur"></span>');
  w.status('<span class="blk">CLOSED</span>session expired · tunnel and network closed', 'Esc to close');
}


/* ------------------------------------------------------------ atalho */
const down = new Set(), stamp = {};
// fonte do tema gamma, carregada só quando a janela abre pela primeira vez
const font = () => { if (document.getElementById('cxt-font')) return; const l = document.createElement('link'); l.id = 'cxt-font'; l.rel = 'stylesheet';
  l.href = 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700;800&display=swap'; document.head.appendChild(l); };
const isTyping = el => el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));
document.addEventListener('keydown', e => {
  if (win && win.alive()) return;
  if (e.repeat || e.ctrlKey || e.altKey || e.metaKey || isTyping(e.target)) return;
  const key = (e.key || '').toLowerCase();
  down.add(key); stamp[key] = performance.now();
  const held = down.size === KEYS.length && KEYS.every(k => down.has(k));
  // tolerância: as três teclas com até WINDOW_MS de diferença (teclados sem rollover de 3 teclas)
  const quick = KEYS.includes(key) && KEYS.every(k => performance.now() - (stamp[k] || -1e9) < WINDOW_MS);
  if (held || quick){ e.preventDefault(); KEYS.forEach(k => delete stamp[k]); down.clear(); font(); p8(); }
});
document.addEventListener('keyup', e => down.delete((e.key || '').toLowerCase()));
addEventListener('blur', () => down.clear());
document.addEventListener('visibilitychange', () => down.clear());
})();
