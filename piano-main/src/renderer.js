import { buildPiano, clearAll } from './piano.js';
import { initMidi, on as onMidi } from './midi.js';
import { pickRandomMelody, resolveMelody, MELODIES } from './melodies.js';
import * as Game from './game.js';
import {
  primeAudio,
  playWinJingle,
  playLoseJingle,
  playChampionJingle,
  playFireworks,
  cancelCelebrationSounds,
} from './audio.js';
import { startConfetti, stopConfetti } from './confetti.js';
import { setupDebugUi, showPanel as showDebugPanel, hidePanel as hideDebugPanel } from './debug.js';

const ui = {
  midiStatus: document.getElementById('midi-status'),
  stageIndicator: document.getElementById('stage-indicator'),
  message: document.getElementById('message'),
  melodyName: document.getElementById('melody-name'),
  startBtn: document.getElementById('start-btn'),
  piano: document.getElementById('piano'),
  countdown: document.getElementById('countdown'),
  overlay: document.getElementById('overlay'),
  overlayTitle: document.getElementById('overlay-title'),
  overlayBadge: document.getElementById('overlay-badge'),
  overlayScore: document.getElementById('overlay-score'),
  overlayStars: document.getElementById('overlay-stars'),
  overlaySub: document.getElementById('overlay-sub'),
  overlayBtn: document.getElementById('overlay-btn'),
  picker: document.getElementById('melody-picker'),
  pickerLevel: document.getElementById('picker-level'),
  pickerList: document.getElementById('picker-list'),
  pickerClose: document.getElementById('picker-close'),
  settingsBtn: document.getElementById('settings-btn'),
  settingsPanel: document.getElementById('settings-panel'),
  settingSameMelody: document.getElementById('setting-same-melody'),
  settingConsole: document.getElementById('setting-console'),
};

const MAX_LEVEL = 3;
const TIER_LABELS = {
  0: 'Sem brinde',
  1: 'Brinde Nível 1',
  2: 'Brinde Nível 2',
  3: 'Brinde Premium',
};

let midiConnected = false;
let currentLevel = 1;
let lastMelodyId = null;
let nextAction = 'restart'; // 'continue' | 'restart'

// Modo de sorteio: por padrão, a mesma música é executada nos 3 níveis
// (apenas em comprimentos diferentes). Alternar via menu para randomizar.
let sameMelodyMode = true;
let currentBaseMelody = null;

buildPiano(ui.piano);

function setMessage(text) { ui.message.textContent = text; }
function setMelodyName(text) { ui.melodyName.textContent = text; }

function showStageIndicator(level) {
  ui.stageIndicator.textContent = `Estágio ${level} de ${MAX_LEVEL}`;
  ui.stageIndicator.classList.remove('hidden', 'lv1', 'lv2', 'lv3');
  ui.stageIndicator.classList.add(`lv${level}`);
}
function hideStageIndicator() {
  ui.stageIndicator.classList.add('hidden');
}

function showCountdown(n) {
  ui.countdown.innerHTML = `<div class="countdown-num">${n}</div>`;
  ui.countdown.classList.remove('hidden');
}
function hideCountdown() {
  ui.countdown.classList.add('hidden');
  ui.countdown.innerHTML = '';
}

function hideOverlay() {
  ui.overlay.classList.add('hidden');
  ui.overlay.classList.remove('win', 'lose', 'champion');
  stopConfetti();
  cancelCelebrationSounds();
}

function setOverlayBadge(tier) {
  ui.overlayBadge.style.display = 'inline-block';
  ui.overlayBadge.className = `tier-badge t${tier}`;
  ui.overlayBadge.textContent = TIER_LABELS[tier];
}

function showInterimWin({ score, label, stars, sub, level }) {
  ui.overlay.classList.remove('hidden', 'lose', 'champion');
  ui.overlay.classList.add('win');
  ui.overlayTitle.textContent = `Estágio ${level} conquistado!`;
  ui.overlayTitle.className = 'overlay-title win';
  setOverlayBadge(level);
  ui.overlayScore.textContent = String(score);
  ui.overlayScore.style.display = 'block';
  ui.overlayStars.textContent = '★'.repeat(stars) + '☆'.repeat(3 - stars);
  ui.overlayStars.style.display = 'block';
  ui.overlaySub.textContent = `${label} · ${sub}`;
  ui.overlayBtn.textContent = 'Próximo estágio →';
  nextAction = 'continue';
}

function showChampion({ score, label, stars, sub }) {
  ui.overlay.classList.remove('hidden', 'lose', 'win');
  ui.overlay.classList.add('win', 'champion');
  ui.overlayTitle.textContent = 'Mestre do Piano!';
  ui.overlayTitle.className = 'overlay-title win';
  setOverlayBadge(3);
  ui.overlayScore.textContent = String(score);
  ui.overlayScore.style.display = 'block';
  ui.overlayStars.textContent = '★'.repeat(stars) + '☆'.repeat(3 - stars);
  ui.overlayStars.style.display = 'block';
  ui.overlaySub.textContent = `${label} · Procure nossa equipe no stand pra retirar o Brinde Premium!`;
  ui.overlayBtn.textContent = 'Nova partida';
  nextAction = 'restart';
}

function showFinalLose({ reason, level }) {
  const tier = Math.max(0, level - 1);
  ui.overlay.classList.remove('hidden', 'win', 'champion');
  ui.overlay.classList.add(tier === 0 ? 'lose' : 'win');
  ui.overlayScore.style.display = 'none';
  ui.overlayStars.style.display = 'none';

  if (tier === 0) {
    ui.overlayTitle.textContent = 'Quase lá!';
    ui.overlayTitle.className = 'overlay-title lose';
    setOverlayBadge(0);
    ui.overlaySub.textContent = `${reason || ''} Respire fundo e tente outra vez — você consegue!`;
  } else {
    ui.overlayTitle.textContent = `Brinde Nível ${tier} conquistado!`;
    ui.overlayTitle.className = 'overlay-title win';
    setOverlayBadge(tier);
    const congrats = tier === 2
      ? 'Mandou muito bem! Procure nossa equipe pra retirar seu brinde.'
      : 'Parabéns! Procure nossa equipe pra retirar seu brinde.';
    ui.overlaySub.textContent = congrats;
  }
  ui.overlayBtn.textContent = 'Nova partida';
  nextAction = 'restart';
}

function updateButton() {
  const idle = Game.getState() === Game.States.IDLE;
  const enabled = midiConnected && idle;
  ui.startBtn.disabled = !enabled;
  ui.startBtn.style.display = idle ? '' : 'none';
}

Game.on('state', ({ state, payload }) => {
  switch (state) {
    case Game.States.IDLE:
      hideCountdown();
      hideStageIndicator();
      hideOverlay();
      setMelodyName('');
      ui.message.classList.remove('pulse');
      setMessage(midiConnected
        ? 'Pronto! Clique em "Iniciar partida" para começar.'
        : 'Conecte um teclado MIDI compatível com MPK Mini.');
      break;
    case Game.States.INTRO:
      hideCountdown();
      hideOverlay();
      showStageIndicator(payload.level);
      setMessage('Prepare-se!');
      setMelodyName(`Sua música: ${payload.melodyName}`);
      break;
    case Game.States.COUNTDOWN:
      showCountdown(payload.n);
      break;
    case Game.States.DEMO:
      hideCountdown();
      setMessage('Ouça e veja a melodia…');
      break;
    case Game.States.INPUT:
      setMessage('Sua vez! Toque a melodia.');
      // Reinicia animação para dar sinal visual claro de "input aberto"
      ui.message.classList.remove('pulse');
      void ui.message.offsetWidth;
      ui.message.classList.add('pulse');
      break;
    case Game.States.WIN:
      if (payload.level < MAX_LEVEL) {
        showInterimWin(payload);
        playWinJingle();
      } else {
        showChampion(payload);
        playChampionJingle();
        startConfetti();
        // Estouros de fogos entram depois do arpejo inicial
        setTimeout(() => playFireworks(7), 700);
      }
      break;
    case Game.States.LOSE:
      showFinalLose(payload);
      playLoseJingle();
      break;
  }
  updateButton();
});

onMidi('status', ({ connected, deviceName, error }) => {
  midiConnected = connected;
  if (connected) {
    ui.midiStatus.textContent = `Conectado: ${deviceName ?? 'dispositivo MIDI'}`;
    ui.midiStatus.classList.add('connected');
    ui.midiStatus.classList.remove('disconnected');
    if (Game.getState() === Game.States.IDLE) {
      setMessage('Pronto! Clique em "Iniciar partida" para começar.');
    }
  } else {
    ui.midiStatus.textContent = error
      ? 'Web MIDI indisponível'
      : 'Nenhum dispositivo MIDI detectado';
    ui.midiStatus.classList.add('disconnected');
    ui.midiStatus.classList.remove('connected');
    if (Game.getState() === Game.States.IDLE) {
      setMessage('Conecte um teclado MIDI compatível com MPK Mini.');
    }
  }
  updateButton();
});

onMidi('noteOn', (e) => Game.handleNoteOn(e));

function startRoundAtLevel(level) {
  primeAudio();
  hideOverlay();
  hideCountdown();
  clearAll();

  // No nível 1, ou se o modo é random, sorteamos uma melodia nova.
  // Caso contrário, mantemos a melodia base e tocamos a versão do nível atual.
  if (level === 1 || !sameMelodyMode || !currentBaseMelody) {
    currentBaseMelody = pickRandomMelody(lastMelodyId);
    lastMelodyId = currentBaseMelody.id;
  }

  const resolved = resolveMelody(currentBaseMelody, level);
  Game.startRound(resolved, level);
}

function startRoundWithBase(baseMelody, level) {
  primeAudio();
  hideOverlay();
  hideCountdown();
  clearAll();
  currentBaseMelody = baseMelody;
  lastMelodyId = baseMelody.id;
  currentLevel = level;
  const resolved = resolveMelody(baseMelody, level);
  Game.startRound(resolved, level);
}

function showMelodyPicker(level) {
  ui.pickerLevel.textContent = String(level);
  ui.pickerList.innerHTML = '';
  for (const m of MELODIES) {
    const noteCount = (m.versions[level] || m.versions[1]).length;
    const btn = document.createElement('button');
    btn.className = 'picker-item';
    btn.innerHTML =
      `${m.name}<span class="picker-meta">${noteCount} notas · ${m.bpm} BPM</span>`;
    btn.addEventListener('click', () => {
      hideMelodyPicker();
      Game.abort();
      startRoundWithBase(m, level);
    });
    ui.pickerList.appendChild(btn);
  }
  ui.picker.classList.remove('hidden');
}

function hideMelodyPicker() {
  ui.picker.classList.add('hidden');
}

function isPickerOpen() {
  return !ui.picker.classList.contains('hidden');
}

ui.pickerClose.addEventListener('click', hideMelodyPicker);
ui.picker.addEventListener('click', (e) => {
  if (e.target === ui.picker) hideMelodyPicker();
});

function startNewGame() {
  currentLevel = 1;
  currentBaseMelody = null; // garante novo sorteio
  startRoundAtLevel(currentLevel);
}

ui.startBtn.addEventListener('click', startNewGame);

ui.overlayBtn.addEventListener('click', () => {
  Game.abort();
  if (nextAction === 'continue') {
    currentLevel = Math.min(MAX_LEVEL, currentLevel + 1);
    startRoundAtLevel(currentLevel);
  } else {
    startNewGame();
  }
});

// Atalhos de teclado:
//   ESC — fecha o picker; senão aborta a rodada atual
//   D   — abre/fecha o picker de melodia (apenas antes da demo começar)
window.addEventListener('keydown', (e) => {
  if (e.metaKey || e.ctrlKey || e.altKey) return;

  if (e.key === 'Escape') {
    if (isPickerOpen()) { hideMelodyPicker(); return; }
    if (Game.getState() === Game.States.IDLE) return;
    Game.abort();
    return;
  }

  if (e.key === 'd' || e.key === 'D') {
    if (isPickerOpen()) { hideMelodyPicker(); return; }
    const state = Game.getState();
    // D só faz sentido antes da melodia ser demonstrada
    const okStates = [Game.States.IDLE, Game.States.INTRO, Game.States.COUNTDOWN];
    if (!okStates.includes(state)) return;
    const level = state === Game.States.IDLE ? 1 : currentLevel;
    showMelodyPicker(level);
  }
});

// ─── Menu de configurações (≡) ───
function toggleSettings() {
  ui.settingsPanel.classList.toggle('hidden');
}
function closeSettings() {
  ui.settingsPanel.classList.add('hidden');
}
ui.settingsBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  toggleSettings();
});
document.addEventListener('click', (e) => {
  if (ui.settingsPanel.classList.contains('hidden')) return;
  if (ui.settingsPanel.contains(e.target)) return;
  if (e.target === ui.settingsBtn) return;
  closeSettings();
});
ui.settingSameMelody.addEventListener('change', (e) => {
  sameMelodyMode = e.target.checked;
});
ui.settingConsole.addEventListener('change', (e) => {
  if (e.target.checked) showDebugPanel();
  else hideDebugPanel();
});

setupDebugUi();
initMidi();
updateButton();
