/* CortexPi · atalho de acesso remoto
   Segure C + P + I ao mesmo tempo (sem Ctrl/Alt/Win) para abrir a janela de terminal.
   Enter leva ao portal de SSH na mesma aba.

   IMPORTANTE: este arquivo é público. O atalho é só conveniência, não segurança.
   A proteção precisa estar no destino (portal com login forte e MFA).
   Nunca coloque senhas, tokens ou chaves aqui. */
(function(){
'use strict';
const KEYS = ['c', 'p', 'i'];      // teclas que precisam estar pressionadas juntas
const GATEWAY_URL = '';            // ex.: 'https://login.tailscale.com/admin/machines' (definir depois)
const PROMPT = 'ssh lucas@gamma';
const HOST = 'gamma', USER = 'lucas';

const WINDOW_MS = 400;             // intervalo máximo entre as três teclas
const down = new Set();
const stamp = {};
let box = null, lastFocus = null;

const isTyping = el => el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));

function css(){
  const s = document.createElement('style');
  s.textContent = `
/* Janela no tema do desktop gamma: XFCE + Nordic-darker (paleta Nord), fonte Inter / Monospace */
.cxt-back{position:fixed;inset:0;z-index:9999;background:rgba(15,18,24,.55);display:flex;align-items:center;justify-content:center;padding:20px}
.cxt{width:min(640px,100%);background:#2e3440;border:1px solid #1f232b;border-radius:4px;box-shadow:0 24px 70px -18px rgba(0,0,0,.75);overflow:hidden;transition:width .2s}
.cxt.max{width:min(1100px,100%)}
.cxt-h{position:relative;height:32px;background:#2b303c;display:flex;align-items:center;justify-content:center;font:13px Inter,system-ui,sans-serif;color:#d8dee9;user-select:none}
.cxt-h .bt{position:absolute;right:2px;top:2px;display:flex}
.cxt-h button{width:28px;height:28px;border:0;background:transparent;color:#d8dee9;font:15px/28px Inter,system-ui,sans-serif;cursor:pointer;padding:0;border-radius:3px}
.cxt-h button:hover{background:#3b4252}
.cxt-h button.x:hover{background:#bf616a;color:#2e3440}
.cxt-b{padding:10px 12px 14px;min-height:190px;font:13.3px/1.45 "DejaVu Sans Mono","Liberation Mono",Menlo,Consolas,monospace;color:#d8dee9}
.cxt-b ::selection{background:#4c566a}
.cxt-out{white-space:pre-wrap}
.cxt-out .c{color:#616e88}.cxt-out .i{color:#88c0d0}.cxt-out .w{color:#ebcb8b}.cxt-out .ok{color:#d8dee9}
.cxt-l{display:flex;align-items:center;white-space:pre}
.cxt-l .u{color:#a3be8c;font-weight:700}.cxt-l .p{color:#81a1c1;font-weight:700}
.cxt-l input{flex:1;min-width:0;background:transparent;border:0;outline:0;color:#d8dee9;font:inherit;caret-color:#d8dee9;padding:0}`;
  document.head.appendChild(s);
}

function print(html){ const o = box.querySelector('.cxt-out'); o.innerHTML += html + '\n'; }

function open(){
  if (box) return;
  lastFocus = document.activeElement;
  box = document.createElement('div');
  box.className = 'cxt-back';
  box.innerHTML = `<div class="cxt" role="dialog" aria-modal="true" aria-labelledby="cxt-t">
    <div class="cxt-h"><span id="cxt-t">${USER}@${HOST}: ~</span>
      <span class="bt"><button type="button" class="mn" aria-label="Minimizar">&#8211;</button><button type="button" class="mx" aria-label="Maximizar">&#9633;</button><button type="button" class="x" aria-label="Fechar">&#215;</button></span></div>
    <div class="cxt-b"><div class="cxt-out" aria-live="polite"><span class="c"># acesso remoto ao desktop ${HOST} · Enter conecta · Esc fecha</span>
</div>
      <label class="cxt-l"><span class="u">${USER}@cortexpi</span>:<span class="p">~</span>$ <input type="text" spellcheck="false" autocomplete="off" aria-label="Comando" value="${PROMPT}"></label></div></div>`;
  document.body.appendChild(box);
  const input = box.querySelector('input');
  const openedAt = performance.now();
  // a tecla que disparou o atalho não pode vazar para o campo
  input.addEventListener('beforeinput', e => { if (performance.now() - openedAt < 250) e.preventDefault(); });
  input.focus(); input.setSelectionRange(input.value.length, input.value.length);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); connect(input.value.trim()); }
  });
  box.addEventListener('mousedown', e => { if (e.target === box) close(); });
  box.querySelector('.x').addEventListener('click', close);
  box.querySelector('.mn').addEventListener('click', close);
  box.querySelector('.mx').addEventListener('click', () => { box.querySelector('.cxt').classList.toggle('max'); input.focus(); });
}

function close(){
  if (!box) return;
  box.remove(); box = null; down.clear();
  if (lastFocus && lastFocus.focus) lastFocus.focus();
}

function connect(cmd){
  print('<span class="ok"><span style="color:#a3be8c;font-weight:700">' + USER + '@cortexpi</span>:<span style="color:#81a1c1;font-weight:700">~</span>$ ' + cmd.replace(/[<>&]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;'}[c])) + '</span>');
  if (!GATEWAY_URL) { print('<span class="w">ssh: portal de acesso ao ' + HOST + ' ainda não configurado.</span>'); return; }
  print('<span class="i">conectando ao ' + HOST + ' pelo portal seguro…</span>');
  location.assign(GATEWAY_URL);
}

document.addEventListener('keydown', e => {
  if (box) { if (e.key === 'Escape') { e.preventDefault(); close(); } return; }
  if (e.repeat || e.ctrlKey || e.altKey || e.metaKey || isTyping(e.target)) return;
  const key = (e.key || '').toLowerCase();
  down.add(key); stamp[key] = performance.now();
  const held = down.size === KEYS.length && KEYS.every(k => down.has(k));
  // tolerância: as três teclas com até WINDOW_MS de diferença (teclados sem rollover de 3 teclas)
  const quick = KEYS.includes(key) && KEYS.every(k => performance.now() - (stamp[k] || -1e9) < WINDOW_MS);
  if (held || quick) { e.preventDefault(); KEYS.forEach(k => delete stamp[k]); open(); }
});
document.addEventListener('keyup', e => down.delete((e.key || '').toLowerCase()));
addEventListener('blur', () => down.clear());
document.addEventListener('visibilitychange', () => down.clear());

css();
})();
