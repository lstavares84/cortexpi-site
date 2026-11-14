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
const PROMPT = 'ssh lucas@estacao';

const WINDOW_MS = 400;             // intervalo máximo entre as três teclas
const down = new Set();
const stamp = {};
let box = null, lastFocus = null;

const isTyping = el => el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));

function css(){
  const s = document.createElement('style');
  s.textContent = `
.cxt-back{position:fixed;inset:0;z-index:9999;background:rgba(10,17,30,.55);display:flex;align-items:center;justify-content:center;padding:20px}
.cxt{width:min(560px,100%);background:#0F1A2E;border:1px solid rgba(199,205,211,.28);box-shadow:0 30px 80px -20px rgba(0,0,0,.7);font:14px/1.6 ui-monospace,SFMono-Regular,Menlo,Consolas,"Liberation Mono",monospace;color:#C7CDD3}
.cxt-h{display:flex;justify-content:space-between;align-items:center;padding:10px 14px;border-bottom:1px solid rgba(199,205,211,.14);font-size:12px;letter-spacing:.08em;color:#8E97A3}
.cxt-h b{color:#F4F1EC;font-weight:600}
.cxt-h i{display:inline-block;width:8px;height:8px;background:#B26E3B;margin-right:10px}
.cxt-b{padding:16px 16px 12px;min-height:120px}
.cxt-out{white-space:pre-wrap;margin-bottom:6px}
.cxt-out .ok{color:#F4F1EC}.cxt-out .warn{color:#B26E3B}
.cxt-l{display:flex;gap:10px;align-items:center}
.cxt-l span{color:#B26E3B}
.cxt-l input{flex:1;background:transparent;border:0;outline:0;color:#F4F1EC;font:inherit;caret-color:#B26E3B;padding:0}
.cxt-f{padding:8px 14px;border-top:1px solid rgba(199,205,211,.14);font-size:12px;color:#6F7987}
.cxt-f kbd{font:inherit;color:#C7CDD3;border:1px solid rgba(199,205,211,.28);padding:0 5px;margin-right:4px}`;
  document.head.appendChild(s);
}

function print(html){ const o = box.querySelector('.cxt-out'); o.innerHTML += html + '\n'; }

function open(){
  if (box) return;
  lastFocus = document.activeElement;
  box = document.createElement('div');
  box.className = 'cxt-back';
  box.innerHTML = `<div class="cxt" role="dialog" aria-modal="true" aria-labelledby="cxt-t">
    <div class="cxt-h"><span id="cxt-t"><i></i><b>cortexpi</b> ~ acesso remoto</span><span>tty</span></div>
    <div class="cxt-b"><div class="cxt-out" aria-live="polite"></div>
      <label class="cxt-l"><span>$</span><input type="text" spellcheck="false" autocomplete="off" aria-label="Comando" value="${PROMPT}"></label></div>
    <div class="cxt-f"><kbd>Enter</kbd>conectar · <kbd>Esc</kbd>fechar</div></div>`;
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
}

function close(){
  if (!box) return;
  box.remove(); box = null; down.clear();
  if (lastFocus && lastFocus.focus) lastFocus.focus();
}

function connect(cmd){
  print('<span class="ok">$ ' + cmd.replace(/[<>&]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;'}[c])) + '</span>');
  if (!GATEWAY_URL) { print('<span class="warn">destino ainda não configurado.</span>'); return; }
  print('conectando ao portal seguro…');
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
