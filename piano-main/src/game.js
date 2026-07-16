// Máquina de estados do jogo, com cadência humanizada:
//   IDLE → INTRO → COUNTDOWN(3,2,1) → DEMO → INPUT → WIN | LOSE
//
// Validação:
//   - Pitch: a primeira nota do jogador define o offset (semitons). Daí em
//     diante cada nota precisa bater com a esperada + esse offset.
//   - Ritmo: avaliado pela CONSISTÊNCIA da execução, não pelo tempo absoluto.
//     O jogador pode tocar mais rápido ou mais devagar — desde que mantenha
//     proporções entre os intervalos. A pontuação 0-100 reflete essa
//     consistência. Abaixo de 40 = derrota por ritmo inconsistente.

import { playNote, playTick } from './audio.js';
import { flash } from './piano.js';
import { dlog, midiName } from './debug.js';

export const States = {
  IDLE: 'idle',
  INTRO: 'intro',
  COUNTDOWN: 'countdown',
  DEMO: 'demo',
  INPUT: 'input',
  WIN: 'win',
  LOSE: 'lose',
};

const listeners = { state: [] };
export function on(event, handler) { listeners[event].push(handler); }
function emit(event, payload) { for (const h of listeners[event]) h(payload); }

let currentState = States.IDLE;
let currentMelody = null;
let currentLevel = 1;
let expectedOnsets = [];
let inputTimes = [];
let inputIndex = 0;
let generation = 0;
let watchdog = null;

// Classe de pitch (0=C, 1=C#, 2=D, …, 11=B), ignorando oitava.
function pitchClass(midi) {
  return ((midi % 12) + 12) % 12;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export function getState() { return currentState; }

function setState(state, payload) {
  currentState = state;
  let extra = '';
  if (payload?.melodyName) extra += ` "${payload.melodyName}"`;
  if (payload?.level) extra += ` [nível ${payload.level}]`;
  if (payload?.n != null) extra += ` n=${payload.n}`;
  if (payload?.score != null) extra += ` score=${payload.score}`;
  if (payload?.reason) extra += ` motivo="${payload.reason}"`;
  dlog('state', `[estado] ${state}${extra}`);
  emit('state', { state, payload });
}

function clearWatchdog() {
  if (watchdog) { clearTimeout(watchdog); watchdog = null; }
}

function armWatchdog(ms) {
  clearWatchdog();
  watchdog = setTimeout(() => finishLose('Tempo esgotado.'), ms);
}

function computeOnsets(melody) {
  const beatMs = 60000 / melody.bpm;
  const onsets = [];
  let t = 0;
  for (const n of melody.notes) {
    onsets.push(t);
    t += n.beats * beatMs;
  }
  return onsets;
}

async function playDemo(melody, gen) {
  const beatMs = 60000 / melody.bpm;
  const startTime = performance.now();
  for (let i = 0; i < melody.notes.length; i++) {
    if (gen !== generation) return;
    const note = melody.notes[i];
    // 75% nota + 25% silêncio: deixa cada nota com respiro nítido para
    // memorização visual e auditiva.
    const noteMs = note.beats * beatMs * 0.75;
    const delay = expectedOnsets[i] - (performance.now() - startTime);
    if (delay > 0) await sleep(delay);
    if (gen !== generation) return;
    playNote(note.midi, noteMs);
    flash(note.midi, noteMs, 'demo');
  }
  const last = melody.notes[melody.notes.length - 1];
  await sleep(last.beats * beatMs);
}

export async function startRound(melody, level = 1) {
  const gen = ++generation;
  clearWatchdog();
  currentMelody = melody;
  currentLevel = level;
  expectedOnsets = computeOnsets(melody);
  inputTimes = [];
  inputIndex = 0;
  dlog('info', `── nova rodada: "${melody.name}" (nível ${level}, ${melody.notes.length} notas, ${melody.bpm} BPM) ──`);
  const seq = melody.notes.map(n => midiName(n.midi)).join(' ');
  dlog('info', `sequência esperada: ${seq}`);

  setState(States.INTRO, { melodyName: melody.name, level });
  await sleep(2600);
  if (gen !== generation) return;

  for (let n = 3; n >= 1; n--) {
    setState(States.COUNTDOWN, { n, level });
    playTick(n === 1);
    await sleep(750);
    if (gen !== generation) return;
  }

  setState(States.DEMO, { melodyName: melody.name, level });
  // Pausa um pouco maior antes da primeira nota — dá tempo do jogador se
  // posicionar mentalmente.
  await sleep(700);
  await playDemo(melody, gen);
  if (gen !== generation) return;

  // Sem gap entre demo e input — a sustentação da última nota já cumpre
  // a função de pausa. Se a gente esperar aqui, notas tocadas pelo jogador
  // nesse intervalo são descartadas e ele "perde" a primeira nota.
  setState(States.INPUT, { melodyName: melody.name, level });
  armWatchdog(9000);
}

function computeRhythmScore() {
  const n = inputTimes.length;
  if (n < 3) return 100; // poucas notas — assume perfeito

  const expIntervals = [];
  const actIntervals = [];
  for (let i = 1; i < n; i++) {
    expIntervals.push(expectedOnsets[i] - expectedOnsets[i - 1]);
    actIntervals.push(inputTimes[i] - inputTimes[i - 1]);
  }

  // Razão entre o que o jogador tocou e o esperado, intervalo por intervalo.
  // Se o jogador tocar tudo k vezes mais rápido/devagar, todas as razões
  // serão ≈ k. A consistência é medida pela dispersão em torno da mediana.
  const ratios = actIntervals.map((a, i) => a / expIntervals[i]);
  const sorted = [...ratios].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  if (!isFinite(median) || median <= 0) return 0;

  const devs = ratios.map((r) => Math.abs(r / median - 1));
  const meanDev = devs.reduce((s, d) => s + d, 0) / devs.length;

  // Tolerância: desvio médio de 33% → ~50 pontos. 0% → 100 pontos.
  const score = Math.round(100 * (1 - 1.5 * meanDev));
  return Math.max(0, Math.min(100, score));
}

function rankFor(score) {
  if (score >= 95) return { label: 'Maestro!', stars: 3, sub: 'Ritmo impecável. Aplausos!' };
  if (score >= 85) return { label: 'Brilhante!', stars: 3, sub: 'Quase perfeito — você tem ouvido afiado.' };
  if (score >= 70) return { label: 'Muito bom!', stars: 2, sub: 'Belo controle de tempo.' };
  if (score >= 55) return { label: 'No ritmo', stars: 2, sub: 'Funcionou! Dá pra refinar a regularidade.' };
  return { label: 'Passou!', stars: 1, sub: 'Você acertou as notas. Foque na regularidade do ritmo.' };
}

function finishWin() {
  clearWatchdog();
  const score = computeRhythmScore();
  if (score < 40) {
    return finishLose('Ritmo inconsistente demais.');
  }
  const r = rankFor(score);
  setState(States.WIN, { score, ...r, level: currentLevel });
}

function finishLose(reason) {
  clearWatchdog();
  setState(States.LOSE, { reason, level: currentLevel });
}

export function handleNoteOn({ midi, time }) {
  if (currentState !== States.INPUT) {
    dlog('ignored', `noteOn ignorado: estado=${currentState} (nota ${midiName(midi)})`);
    return;
  }
  const expected = currentMelody.notes[inputIndex];
  const wantPc = pitchClass(expected.midi);
  const gotPc = pitchClass(midi);

  dlog('info',
    `Pos ${inputIndex + 1}/${currentMelody.notes.length}: ` +
    `esperava ${midiName(expected.midi)} (pc=${wantPc}) · ` +
    `recebi ${midiName(midi)} (pc=${gotPc})`);

  if (gotPc !== wantPc) {
    dlog('err', `→ REJEITADO (classes ${wantPc} ≠ ${gotPc})`);
    return finishLose(`Nota errada na posição ${inputIndex + 1}.`);
  }
  dlog('ok', `→ ACEITO`);

  const beatMs = 60000 / currentMelody.bpm;
  flash(midi, beatMs * expected.beats * 0.8, 'player');
  inputTimes.push(time);
  inputIndex++;

  if (inputIndex >= currentMelody.notes.length) {
    return finishWin();
  }

  // Espera generosa para a próxima nota
  const nextInterval = expectedOnsets[inputIndex] - expectedOnsets[inputIndex - 1];
  armWatchdog(Math.max(2500, nextInterval * 4 + 1500));
}

export function abort() {
  generation++; // cancela qualquer fluxo async em curso
  clearWatchdog();
  setState(States.IDLE, null);
}
