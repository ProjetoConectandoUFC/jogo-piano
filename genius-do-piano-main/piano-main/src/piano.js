// Renderiza um teclado de 25 teclas (estilo AKAI MPK Mini) — C3 (48) a C5 (72).
// API: build(container), flash(midi, durationMs, mode), clearAll().
// O modo 'demo' é usado para a demonstração da melodia, e o modo 'player' é usado para a entrada do jogador.
const FIRST_MIDI = 48;
const LAST_MIDI = 72;
const BLACK_OFFSETS = new Set([1, 3, 6, 8, 10]);
// Mapeia cada nota MIDI para o elemento DOM correspondente, permitindo que a interface reaja visualmente à entrada do jogador e à demonstração da melodia.
const keyEls = new Map(); // midi -> element
// Função auxiliar para determinar se uma nota MIDI é preta (sustenida) ou branca (natural), usada para renderizar o teclado corretamente
function isBlack(midi) {
  return BLACK_OFFSETS.has(((midi % 12) + 12) % 12);
}
// Função para construir o teclado dentro de um contêiner DOM, criando elementos para cada tecla e posicionando-os corretamente com base em sua cor (preta ou branca)
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
// Mantém o controle de timers para cada tecla, permitindo que a interface remova a classe de destaque após o tempo especificado
const timers = new Map();
// Função para destacar visualmente uma tecla correspondente a uma nota MIDI, por um período de tempo especificado, com diferentes modos para demonstração e entrada do jogador
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
// Função para definir o estado de pressionamento de uma tecla correspondente a uma nota MIDI, permitindo que a interface indique visualmente quando o jogador está pressionando uma tecla
export function setPressed(midi, on) {
  const el = visualKeyFor(midi);
  if (!el) return;
  el.classList.toggle('player-pressed', on);
}
// Função para limpar todos os destaques e timers, removendo qualquer indicação visual de teclas pressionadas ou destacadas
export function clearAll() {
  for (const el of keyEls.values()) {
    el.classList.remove('pressed', 'player-pressed');
  }
  for (const t of timers.values()) clearTimeout(t);
  timers.clear();
}
