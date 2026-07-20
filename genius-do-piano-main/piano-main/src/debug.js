// Observador externo: painel de log em tempo real para diagnosticar
// problemas de avaliação MIDI/game.
// Mantém um histórico limitado de linhas, com timestamp e nível de severidade.
const MAX_LINES = 250;
// Nomes das notas em português, para exibir no log
const NOTE_NAMES_PT = ['Dó','Dó#','Ré','Ré#','Mi','Fá','Fá#','Sol','Sol#','Lá','Lá#','Si'];
// Elementos do DOM do painel de debug, inicializados sob demanda
let panel = null;
let logEl = null;
// Função auxiliar para garantir que os elementos do DOM estejam disponíveis
function ensure() {
  if (!panel) panel = document.getElementById('debug-panel');
  if (!logEl) logEl = document.getElementById('debug-log');
}
// Função para converter um número MIDI em nome de nota com oitava, ou retornar "??" se inválido
export function midiName(m) {
  if (m == null || Number.isNaN(m)) return `??(${m})`;
  const pc = ((m % 12) + 12) % 12;
  const oct = Math.floor(m / 12) - 1;
  return `${NOTE_NAMES_PT[pc]}${oct}`;
}
// Função para gerar um timestamp no formato mm:ss.mmm para exibir no log
function tstamp() {
  const d = new Date();
  const mm = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  const ms = String(d.getMilliseconds()).padStart(3, '0');
  return `${mm}:${ss}.${ms}`;
}
// Função para adicionar uma linha de log ao painel, com nível de severidade e mensagem
export function dlog(level, msg) {
  ensure();
  if (!logEl) return;
  const line = document.createElement('div');
  line.className = `debug-line ${level}`;
  line.textContent = `${tstamp()}  ${msg}`;
  logEl.appendChild(line);
  while (logEl.children.length > MAX_LINES) logEl.removeChild(logEl.firstChild);
  logEl.scrollTop = logEl.scrollHeight;
}
// Função para limpar o log, removendo todas as linhas exibidas
export function clearLog() {
  ensure();
  if (logEl) logEl.innerHTML = '';
}
// Função para alternar a visibilidade do painel de debug, mostrando ou escondendo-o
export function togglePanel() {
  ensure();
  if (panel) panel.classList.toggle('hidden');
}
// Função para configurar os botões de limpar e fechar no painel de debug, adicionando event listeners
export function setupDebugUi() {
  ensure();
  const clearBtn = document.getElementById('debug-clear');
  const closeBtn = document.getElementById('debug-close');
  if (clearBtn) clearBtn.addEventListener('click', clearLog);
  if (closeBtn) closeBtn.addEventListener('click', () => {
    // botão × fecha — o ajuste do toggle no menu de configurações
    // mantém o estado coerente. Aqui apenas escondemos visualmente.
    if (panel) panel.classList.add('hidden');
    // Mantém o checkbox sincronizado se existir
    const cb = document.getElementById('setting-console');
    if (cb) cb.checked = false;
  });
  // Já começa oculto via classe `hidden` no HTML; o log acumula em background.
  dlog('info', 'Observador iniciado. Ative no menu de configurações (≡).');
}
// Função para mostrar o painel de debug, removendo a classe `hidden`
export function showPanel() {
  ensure();
  if (panel) panel.classList.remove('hidden');
}
// Função para esconder o painel de debug, adicionando a classe `hidden`
export function hidePanel() {
  ensure();
  if (panel) panel.classList.add('hidden');
}
