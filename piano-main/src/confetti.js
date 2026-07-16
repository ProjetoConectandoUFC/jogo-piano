// Confete em puro DOM/CSS — só para a vitória final do estágio 3.
// Fica caindo indefinidamente até stopConfetti(). Peças são removidas
// quando completam a animação para não inchar o DOM.

const COLORS = [
  '#ffd166', '#ff6b9d', '#4ade80', '#60a5fa',
  '#a78bfa', '#fb923c', '#f87171', '#34d399',
];

let intervalHandle = null;

function spawnBatch(container, count) {
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'confetti-piece';
    p.style.left = `${Math.random() * 100}%`;
    p.style.background = COLORS[Math.floor(Math.random() * COLORS.length)];
    p.style.width = `${6 + Math.random() * 8}px`;
    p.style.height = `${10 + Math.random() * 10}px`;
    const dur = 3.2 + Math.random() * 2.6;
    p.style.animationDuration = `${dur}s`;
    p.style.setProperty('--rot-start', `${Math.random() * 360}deg`);
    p.style.setProperty('--rot-end', `${720 + Math.random() * 720}deg`);
    p.style.setProperty('--drift', `${(Math.random() - 0.5) * 220}px`);
    p.addEventListener('animationend', () => p.remove(), { once: true });
    container.appendChild(p);
  }
}

export function startConfetti() {
  const container = document.getElementById('confetti');
  if (!container) return;
  stopConfetti(); // reset se já estiver rodando
  container.innerHTML = '';
  container.classList.remove('hidden');
  // Rajada inicial densa
  spawnBatch(container, 90);
  // Reposição contínua, manténdo a chuva
  intervalHandle = setInterval(() => spawnBatch(container, 18), 280);
}

export function stopConfetti() {
  if (intervalHandle) {
    clearInterval(intervalHandle);
    intervalHandle = null;
  }
  const container = document.getElementById('confetti');
  if (container) {
    container.classList.add('hidden');
    container.innerHTML = '';
  }
}
