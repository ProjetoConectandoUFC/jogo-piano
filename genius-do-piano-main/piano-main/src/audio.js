// Sintetizador minimalista para a demonstração, ticks de countdown e jingles
// de vitória/derrota. O GarageBand toca o som do que o jogador pressiona.


//Criação do contexto de áudio, que será usado para gerar sons
let ctx = null;

function ensureCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}
// Conversão de nota MIDI para frequência em Hz
function midiToFreq(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}
// Inicialização do contexto de áudio, garantindo que ele esteja pronto para uso
export function primeAudio() {
  ensureCtx();
}
// Função para tocar uma nota MIDI por uma duração específica, com opções de pico e tipo de onda
export function playNote(midi, durationMs, opts = {}) {
  const ac = ensureCtx();
  const now = ac.currentTime;
  const dur = Math.max(0.05, durationMs / 1000);
  const peak = opts.peak ?? 0.18;
  const type = opts.type ?? 'triangle';

  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.value = midiToFreq(midi);

  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(peak, now + 0.012);
  gain.gain.setValueAtTime(peak, now + Math.max(0.05, dur - 0.1));
  gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

  osc.connect(gain).connect(ac.destination);
  osc.start(now);
  osc.stop(now + dur + 0.05);
}
// Função para tocar um "tick" de contagem regressiva, com opção de ênfase
export function playTick(emphasis = false) {
  const ac = ensureCtx();
  const now = ac.currentTime;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = 'sine';
  osc.frequency.value = emphasis ? 1320 : 880;
  const peak = emphasis ? 0.22 : 0.14;
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(peak, now + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
  osc.connect(gain).connect(ac.destination);
  osc.start(now);
  osc.stop(now + 0.22);
}
// Função para tocar um jingle de vitória, com arpejo ascendente e acorde sustentado
export function playWinJingle() {
  // Arpejo ascendente C E G C' e acorde sustentado
  const seq = [60, 64, 67, 72];
  seq.forEach((m, i) => {
    setTimeout(() => playNote(m, 220, { peak: 0.2 }), i * 110);
  });
  const chordDelay = seq.length * 110 + 60;
  setTimeout(() => {
    playNote(60, 1100, { peak: 0.14 });
    playNote(64, 1100, { peak: 0.12 });
    playNote(67, 1100, { peak: 0.12 });
    playNote(72, 1100, { peak: 0.14 });
  }, chordDelay);
}
// Função para tocar um jingle de derrota, com descida cromática dissonante
export function playLoseJingle() {
  // Descida cromática dissonante
  setTimeout(() => playNote(55, 320, { type: 'sawtooth', peak: 0.16 }), 0);
  setTimeout(() => playNote(52, 320, { type: 'sawtooth', peak: 0.16 }), 220);
  setTimeout(() => playNote(48, 720, { type: 'sawtooth', peak: 0.18 }), 440);
}

// ─── Vitória final (estágio 3): jingle triunfal + estouros de fogos ───
//
// Os sons agendados via setTimeout ficam rastreados para que ESC consiga
// cancelá-los a meio caminho.

let celebrationTimers = [];
function scheduleCelebration(fn, delay) {
  const id = setTimeout(() => {
    celebrationTimers = celebrationTimers.filter((x) => x !== id);
    fn();
  }, delay);
  celebrationTimers.push(id);
  return id;
}
// Cancela todos os sons de celebração agendados, útil para quando o jogador pressiona ESC
export function cancelCelebrationSounds() {
  for (const id of celebrationTimers) clearTimeout(id);
  celebrationTimers = [];
}
// Função para tocar o jingle de campeão, com arpejo rápido e acorde maior sustentado
export function playChampionJingle() {
  // Arpejo rápido subindo: C5 E5 G5 C6, voz dobrada uma oitava acima para brilho
  const seq = [72, 76, 79, 84];
  seq.forEach((m, i) => {
    scheduleCelebration(() => {
      playNote(m, 220, { peak: 0.2 });
      playNote(m + 12, 220, { peak: 0.07, type: 'sine' });
    }, i * 85);
  });
  // Acento agudo final no E6
  scheduleCelebration(() => {
    playNote(88, 420, { peak: 0.18 });
    playNote(76, 420, { peak: 0.1, type: 'sine' });
  }, seq.length * 85 + 60);
  // Acorde maior sustentado e brilhante
  scheduleCelebration(() => {
    playNote(72, 2200, { peak: 0.13 });
    playNote(76, 2200, { peak: 0.12 });
    playNote(79, 2200, { peak: 0.12 });
    playNote(84, 2200, { peak: 0.15 });
    playNote(88, 2200, { peak: 0.10 });
  }, seq.length * 85 + 460);
}
// Função para criar um buffer de ruído branco, usado para simular o som de fogos de artifício
function makeNoiseBuffer(durationSec) {
  const ac = ensureCtx();
  const size = Math.floor(ac.sampleRate * durationSec);
  const buf = ac.createBuffer(1, size, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < size; i++) data[i] = Math.random() * 2 - 1;
  return buf;
}
// Função para tocar um estouro de fogos de artifício, combinando um "boom" grave e um crepitar de faíscas
function playFireworkBurst() {
  const ac = ensureCtx();
  const now = ac.currentTime;

  // 1) "Boom" grave — sine descendo rápido
  const boom = ac.createOscillator();
  boom.type = 'sine';
  boom.frequency.setValueAtTime(160 + Math.random() * 90, now);
  boom.frequency.exponentialRampToValueAtTime(45, now + 0.18);
  const bGain = ac.createGain();
  const bPeak = 0.20 + Math.random() * 0.06;
  bGain.gain.setValueAtTime(0, now);
  bGain.gain.linearRampToValueAtTime(bPeak, now + 0.004);
  bGain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);
  boom.connect(bGain).connect(ac.destination);
  boom.start(now);
  boom.stop(now + 0.28);

  // 2) Crepitar/sparkle — ruído highpassado decaindo lento
  const noiseSrc = ac.createBufferSource();
  noiseSrc.buffer = makeNoiseBuffer(0.95);
  const hp = ac.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 2600 + Math.random() * 1400;
  const nGain = ac.createGain();
  const nPeak = 0.09 + Math.random() * 0.04;
  nGain.gain.setValueAtTime(0, now + 0.05);
  nGain.gain.linearRampToValueAtTime(nPeak, now + 0.09);
  nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.75);
  noiseSrc.connect(hp).connect(nGain).connect(ac.destination);
  noiseSrc.start(now);
  noiseSrc.stop(now + 0.8);
}
// Função para tocar uma sequência de estouros de fogos de artifício, com timing irregular para soar natural
export function playFireworks(burstCount = 7) {
  // Estouros espalhados ao longo de ~3s com timing irregular para soar natural
  for (let i = 0; i < burstCount; i++) {
    const base = 200 + i * 380;
    const jitter = (Math.random() - 0.5) * 220;
    scheduleCelebration(playFireworkBurst, base + jitter);
  }
}
