
// Importa todos os módulos necessários: lógica do jogo, MIDI, áudio, efeitos visuais e interface de debug.
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
// Define os elementos da interface do usuário, incluindo status MIDI, indicadores de estágio, mensagens, nome da melodia, botão de início, piano, contagem regressiva, sobreposição e painel de configurações.
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
// Define o nível máximo do jogo e os rótulos de brinde correspondentes a cada nível, usados para exibir informações na interface.
const MAX_LEVEL = 3;
const TIER_LABELS = {
  0: 'Sem brinde',
  1: 'Brinde Nível 1',
  2: 'Brinde Nível 2',
  3: 'Brinde Premium',
};
// Mantém o estado de conexão MIDI, nível atual, ID da última melodia e ação a ser tomada após a rodada (continuar ou reiniciar).
let midiConnected = false;
let currentLevel = 1;
let lastMelodyId = null;
let nextAction = 'restart'; // 'continue' | 'restart'

// Modo de sorteio: por padrão, a mesma música é executada nos 3 níveis
// (apenas em comprimentos diferentes). Alternar via menu para randomizar.
let sameMelodyMode = true;
let currentBaseMelody = null;
// Inicializa a interface de debug, permitindo que os usuários vejam logs detalhados e mensagens de depuração.
buildPiano(ui.piano);

// Mostra a mensagem referente ao estado de conexão do MIDI e o nome da melodia atual, permitindo que os jogadores saibam se estão prontos para começar e qual música será tocada.
function setMessage(text) { ui.message.textContent = text; }
function setMelodyName(text) { ui.melodyName.textContent = text; }
// Funções auxiliares para mostrar e ocultar o indicador de estágio, atualizando o texto e a classe CSS correspondente ao nível atual.
function showStageIndicator(level) {
  ui.stageIndicator.textContent = `Estágio ${level} de ${MAX_LEVEL}`;
  ui.stageIndicator.classList.remove('hidden', 'lv1', 'lv2', 'lv3');
  ui.stageIndicator.classList.add(`lv${level}`);
}
// Função auxiliar para ocultar o indicador de estágio, adicionando a classe 'hidden' ao elemento correspondente.
function hideStageIndicator() {
  ui.stageIndicator.classList.add('hidden');
}
// Funções auxiliares para mostrar e ocultar a contagem regressiva, atualizando o conteúdo HTML e a classe CSS correspondente ao número atual.
function showCountdown(n) {
  ui.countdown.innerHTML = `<div class="countdown-num">${n}</div>`;
  ui.countdown.classList.remove('hidden');
}
// Função auxiliar para ocultar a contagem regressiva, adicionando a classe 'hidden' ao elemento correspondente e limpando seu conteúdo HTML.
function hideCountdown() {
  ui.countdown.classList.add('hidden');
  ui.countdown.innerHTML = '';
}
// Função auxiliar para ocultar a sobreposição de vitória/derrota, removendo as classes CSS correspondentes e parando o confete e os sons de celebração.
function hideOverlay() {
  ui.overlay.classList.add('hidden');
  ui.overlay.classList.remove('win', 'lose', 'champion');
  stopConfetti();
  cancelCelebrationSounds();
}
// Função auxiliar para definir o emblema de brinde na sobreposição, atualizando a classe CSS e o texto do elemento correspondente ao nível atual.
function setOverlayBadge(tier) {
  ui.overlayBadge.style.display = 'inline-block';
  ui.overlayBadge.className = `tier-badge t${tier}`;
  ui.overlayBadge.textContent = TIER_LABELS[tier];
}
// Função auxiliar para mostrar a sobreposição de vitória intermediária, atualizando o título, pontuação, estrelas, subtítulo e botão de ação com base no nível atual e na pontuação do jogador.
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
// Função auxiliar para mostrar a sobreposição de vitória final (nível máximo), atualizando o título, pontuação, estrelas, subtítulo e botão de ação com base na pontuação do jogador e no nível máximo.
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
// Função auxiliar para mostrar a sobreposição de derrota, atualizando o título, pontuação, estrelas, subtítulo e botão de ação com base no motivo da derrota e no nível atual.
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
// Função auxiliar para atualizar o estado do botão de início, habilitando-o apenas quando o MIDI está conectado e o jogo está no estado IDLE, e ajustando sua visibilidade com base no estado atual do jogo.
function updateButton() {
  const idle = Game.getState() === Game.States.IDLE;
  const enabled = midiConnected && idle;
  ui.startBtn.disabled = !enabled;
  ui.startBtn.style.display = idle ? '' : 'none';
}
// Função auxiliar para limpar o estado do jogo, removendo destaques de teclas, parando o confete e os sons de celebração, e ocultando a sobreposição.
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
// Inicializa o MIDI, configurando observadores para eventos de status e notas, e atualizando a interface de acordo com a conexão do dispositivo MIDI.
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
// Configura o observador para eventos de NoteOn, chamando a função handleNoteOn do módulo Game para processar a entrada do jogador.
onMidi('noteOn', (e) => Game.handleNoteOn(e));
// Configura o observador para eventos de NoteOff, chamando a função handleNoteOff do módulo Game para processar a liberação da tecla pelo jogador.
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
// Função auxiliar para iniciar uma nova rodada com uma melodia base específica e nível, configurando o áudio, ocultando a sobreposição e a contagem regressiva, limpando o estado do piano e resolvendo a melodia para o nível atual.
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
// Função auxiliar para mostrar o picker de melodia, atualizando o nível exibido, limpando a lista de melodias e criando botões para cada melodia disponível no nível atual, permitindo que o jogador escolha qual melodia deseja tocar.
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
// Função auxiliar para ocultar o picker de melodia, adicionando a classe 'hidden' ao elemento correspondente.
function hideMelodyPicker() {
  ui.picker.classList.add('hidden');
}
// Função auxiliar para verificar se o picker de melodia está aberto, retornando true se estiver visível e false caso contrário.
function isPickerOpen() {
  return !ui.picker.classList.contains('hidden');
}
// Configura os event listeners para o picker de melodia, permitindo que o jogador feche o picker clicando no botão de fechar ou clicando fora da lista de melodias.
ui.pickerClose.addEventListener('click', hideMelodyPicker);
ui.picker.addEventListener('click', (e) => {
  if (e.target === ui.picker) hideMelodyPicker();
});
// Função auxiliar para iniciar uma nova partida, reiniciando o nível atual para 1, garantindo que uma nova melodia seja sorteada e chamando a função startRoundAtLevel para iniciar a rodada.
function startNewGame() {
  currentLevel = 1;
  currentBaseMelody = null; // garante novo sorteio
  startRoundAtLevel(currentLevel);
}
// Configura o event listener para o botão de início, chamando a função startNewGame quando clicado.
ui.startBtn.addEventListener('click', startNewGame);
// Configura o event listener para o botão da sobreposição, permitindo que o jogador continue para o próximo estágio ou reinicie a partida com base na ação definida após a rodada.
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
// Inicializa a interface de debug, o MIDI e atualiza o botão de início com base no estado atual do jogo e na conexão do dispositivo MIDI.
setupDebugUi();
initMidi();
updateButton();
