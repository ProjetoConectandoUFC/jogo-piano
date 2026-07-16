// Renderiza um teclado de 25 teclas (estilo AKAI MPK Mini) — C3 (48) a C5 (72).
// API: build(container), flash(midi, durationMs, mode), clearAll().

const FIRST_MIDI = 48;
const LAST_MIDI = 72;
const BLACK_OFFSETS = new Set([1, 3, 6, 8, 10]);

const keyEls = new Map(); // midi -> element

function isBlack(midi) {
  return BLACK_OFFSETS.has(((midi % 12) + 12) % 12);
}

export function buildPiano(container) {
  container.innerHTML = '';
  keyEls.clear();

  const keys = [];
  for (let m = FIRST_MIDI; m <= LAST_MIDI; m++) {
    keys.push({ midi: m, black: isBlack(m) });
  }
  const whiteCount = keys.filter((k) => !k.black).length;
  const whiteW = 100 / whiteCount;
  const blackW = whiteW * 0.6;

  let whiteIdx = 0;
  for (const k of keys) {
    const el = document.createElement('div');
    el.classList.add('key', k.black ? 'black' : 'white');
    el.dataset.midi = String(k.midi);
    if (k.black) {
      el.style.left = `${whiteIdx * whiteW - blackW / 2}%`;
      el.style.width = `${blackW}%`;
    } else {
      el.style.left = `${whiteIdx * whiteW}%`;
      el.style.width = `${whiteW}%`;
      whiteIdx++;
    }
    container.appendChild(el);
    keyEls.set(k.midi, el);
  }
}

// Mapeia uma nota MIDI qualquer para a tecla visível (transpõe oitavas se sair do range).
function visualKeyFor(midi) {
  let m = midi;
  while (m < FIRST_MIDI) m += 12;
  while (m > LAST_MIDI) m -= 12;
  return keyEls.get(m);
}

const timers = new Map();

export function flash(midi, durationMs, mode = 'demo') {
  const el = visualKeyFor(midi);
  if (!el) return;
  const cls = mode === 'player' ? 'player-pressed' : 'pressed';

  el.classList.add(cls);
  if (timers.has(el)) clearTimeout(timers.get(el));
  const t = setTimeout(() => {
    el.classList.remove(cls);
    timers.delete(el);
  }, Math.max(80, durationMs));
  timers.set(el, t);
}

export function setPressed(midi, on) {
  const el = visualKeyFor(midi);
  if (!el) return;
  el.classList.toggle('player-pressed', on);
}

export function clearAll() {
  for (const el of keyEls.values()) {
    el.classList.remove('pressed', 'player-pressed');
  }
  for (const t of timers.values()) clearTimeout(t);
  timers.clear();
}
