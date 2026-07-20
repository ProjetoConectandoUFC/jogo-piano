// Banco de 20 melodias icônicas (games, filmes, séries, rock).
// Cada música tem 3 versões — uma por nível de dificuldade — com a mesma
// linha melódica em comprimentos crescentes.
//
// BPMs propositadamente lentos (55-80) para que a memorização visual e
// auditiva caiba no tempo de atenção de um visitante de feira sem
// formação musical.
// C4 = MIDI 60. Todas as notas dentro de C3-C5 (48-72), o range visível.
// Cada nota tem um valor de duração em "batidas" (beats), que é convertido
export const MELODIES = [
  {
    id: 'mario-bros',
    name: 'Super Mario Bros.',
    bpm: 75,
    versions: {
      1: [
        { midi: 64, beats: 1 }, { midi: 64, beats: 1 }, { midi: 64, beats: 2 },
      ],
      2: [
        { midi: 64, beats: 1 }, { midi: 64, beats: 1 }, { midi: 64, beats: 1 },
        { midi: 60, beats: 1 }, { midi: 64, beats: 2 },
      ],
      3: [
        { midi: 64, beats: 1 }, { midi: 64, beats: 1 }, { midi: 64, beats: 1 },
        { midi: 60, beats: 1 }, { midi: 64, beats: 1 },
        { midi: 67, beats: 2 }, { midi: 55, beats: 2 },
      ],
    },
  },
  {
    id: 'pokemon',
    name: 'Pokémon',
    bpm: 70,
    versions: {
      1: [
        { midi: 65, beats: 1 }, { midi: 69, beats: 1 }, { midi: 72, beats: 2 },
      ],
      2: [
        { midi: 65, beats: 1 }, { midi: 69, beats: 1 }, { midi: 72, beats: 1 },
        { midi: 65, beats: 1 }, { midi: 64, beats: 1 }, { midi: 62, beats: 2 },
      ],
      3: [
        { midi: 65, beats: 1 }, { midi: 69, beats: 1 }, { midi: 72, beats: 1 },
        { midi: 65, beats: 1 }, { midi: 64, beats: 1 }, { midi: 62, beats: 1 },
        { midi: 60, beats: 1 }, { midi: 60, beats: 2 },
      ],
    },
  },
  {
    id: 'tetris',
    name: 'Tetris (Korobeiniki)',
    bpm: 60,
    versions: {
      1: [
        { midi: 64, beats: 1 }, { midi: 59, beats: 0.5 }, { midi: 60, beats: 0.5 },
        { midi: 62, beats: 2 },
      ],
      2: [
        { midi: 64, beats: 1 }, { midi: 59, beats: 0.5 }, { midi: 60, beats: 0.5 },
        { midi: 62, beats: 1 }, { midi: 60, beats: 0.5 }, { midi: 59, beats: 0.5 },
        { midi: 57, beats: 2 },
      ],
      3: [
        { midi: 64, beats: 1 }, { midi: 59, beats: 0.5 }, { midi: 60, beats: 0.5 },
        { midi: 62, beats: 1 }, { midi: 60, beats: 0.5 }, { midi: 59, beats: 0.5 },
        { midi: 57, beats: 1 }, { midi: 57, beats: 0.5 }, { midi: 60, beats: 0.5 },
        { midi: 64, beats: 2 },
      ],
    },
  },
  {
    id: 'ff-fanfare',
    name: 'Final Fantasy Victory',
    bpm: 58,
    versions: {
      1: [
        { midi: 60, beats: 0.5 }, { midi: 60, beats: 0.5 },
        { midi: 60, beats: 0.5 }, { midi: 60, beats: 1.5 },
      ],
      2: [
        { midi: 60, beats: 0.5 }, { midi: 60, beats: 0.5 },
        { midi: 60, beats: 0.5 }, { midi: 60, beats: 1.5 },
        { midi: 63, beats: 0.5 }, { midi: 65, beats: 0.5 }, { midi: 67, beats: 2 },
      ],
      3: [
        { midi: 60, beats: 0.5 }, { midi: 60, beats: 0.5 },
        { midi: 60, beats: 0.5 }, { midi: 60, beats: 1.5 },
        { midi: 63, beats: 0.5 }, { midi: 65, beats: 0.5 }, { midi: 67, beats: 1 },
        { midi: 67, beats: 0.5 }, { midi: 65, beats: 0.5 }, { midi: 67, beats: 2 },
      ],
    },
  },
  {
    id: 'wii-sports',
    name: 'Wii Sports',
    bpm: 68,
    versions: {
      1: [
        { midi: 66, beats: 1 }, { midi: 69, beats: 1 }, { midi: 71, beats: 2 },
      ],
      2: [
        { midi: 66, beats: 1 }, { midi: 69, beats: 1 }, { midi: 71, beats: 1 },
        { midi: 69, beats: 1 }, { midi: 68, beats: 2 },
      ],
      3: [
        { midi: 66, beats: 1 }, { midi: 69, beats: 1 }, { midi: 71, beats: 1 },
        { midi: 69, beats: 1 }, { midi: 68, beats: 1 }, { midi: 66, beats: 1 },
        { midi: 69, beats: 2 },
      ],
    },
  },
  {
    id: 'star-wars',
    name: 'Star Wars',
    bpm: 72,
    versions: {
      1: [
        { midi: 55, beats: 1 }, { midi: 55, beats: 1 }, { midi: 55, beats: 1 },
      ],
      2: [
        { midi: 55, beats: 1 }, { midi: 55, beats: 1 }, { midi: 55, beats: 1 },
        { midi: 60, beats: 3 },
      ],
      3: [
        { midi: 55, beats: 1 }, { midi: 55, beats: 1 }, { midi: 55, beats: 1 },
        { midi: 60, beats: 3 },
        { midi: 67, beats: 1 }, { midi: 66, beats: 1 }, { midi: 64, beats: 1 },
        { midi: 62, beats: 2 },
      ],
    },
  },
  {
    id: 'imperial-march',
    name: 'Imperial March (Darth Vader)',
    bpm: 68,
    versions: {
      1: [
        { midi: 67, beats: 1 }, { midi: 67, beats: 1 }, { midi: 67, beats: 1 },
      ],
      2: [
        { midi: 67, beats: 1 }, { midi: 67, beats: 1 }, { midi: 67, beats: 1 },
        { midi: 63, beats: 0.75 }, { midi: 70, beats: 0.25 }, { midi: 67, beats: 1 },
      ],
      3: [
        { midi: 67, beats: 1 }, { midi: 67, beats: 1 }, { midi: 67, beats: 1 },
        { midi: 63, beats: 0.75 }, { midi: 70, beats: 0.25 },
        { midi: 67, beats: 1 }, { midi: 63, beats: 0.75 },
        { midi: 70, beats: 0.25 }, { midi: 67, beats: 2 },
      ],
    },
  },
  {
    id: 'pirates',
    name: 'Piratas do Caribe',
    bpm: 62,
    versions: {
      1: [
        { midi: 62, beats: 0.5 }, { midi: 65, beats: 0.5 },
        { midi: 67, beats: 1 }, { midi: 67, beats: 1 },
      ],
      2: [
        { midi: 62, beats: 0.5 }, { midi: 65, beats: 0.5 },
        { midi: 67, beats: 1 }, { midi: 67, beats: 1 },
        { midi: 67, beats: 0.5 }, { midi: 69, beats: 0.5 },
        { midi: 70, beats: 2 },
      ],
      3: [
        { midi: 62, beats: 0.5 }, { midi: 65, beats: 0.5 },
        { midi: 67, beats: 1 }, { midi: 67, beats: 1 },
        { midi: 67, beats: 0.5 }, { midi: 69, beats: 0.5 },
        { midi: 70, beats: 1 }, { midi: 70, beats: 1 },
        { midi: 70, beats: 0.5 }, { midi: 72, beats: 0.5 },
      ],
    },
  },
  {
    id: 'harry-potter',
    name: 'Harry Potter (Hedwig)',
    bpm: 62,
    versions: {
      1: [
        { midi: 59, beats: 1 }, { midi: 64, beats: 1.5 }, { midi: 67, beats: 0.5 },
      ],
      2: [
        { midi: 59, beats: 1 }, { midi: 64, beats: 1.5 }, { midi: 67, beats: 0.5 },
        { midi: 66, beats: 1 }, { midi: 64, beats: 2 },
      ],
      3: [
        { midi: 59, beats: 1 }, { midi: 64, beats: 1.5 }, { midi: 67, beats: 0.5 },
        { midi: 66, beats: 1 }, { midi: 64, beats: 2 },
        { midi: 71, beats: 2 }, { midi: 69, beats: 2 },
      ],
    },
  },
  {
    id: 'indiana-jones',
    name: 'Indiana Jones',
    bpm: 66,
    versions: {
      1: [
        { midi: 64, beats: 0.75 }, { midi: 65, beats: 0.25 },
        { midi: 67, beats: 2 },
      ],
      2: [
        { midi: 64, beats: 0.75 }, { midi: 65, beats: 0.25 },
        { midi: 67, beats: 2 },
        { midi: 72, beats: 3 },
      ],
      3: [
        { midi: 64, beats: 0.75 }, { midi: 65, beats: 0.25 },
        { midi: 67, beats: 2 },
        { midi: 72, beats: 3 },
        { midi: 65, beats: 0.75 }, { midi: 67, beats: 0.25 },
        { midi: 69, beats: 2 },
      ],
    },
  },
  {
    id: 'pink-panther',
    name: 'Pantera Cor-de-Rosa',
    bpm: 62,
    versions: {
      1: [
        { midi: 63, beats: 0.75 }, { midi: 64, beats: 0.25 },
        { midi: 67, beats: 2 },
      ],
      2: [
        { midi: 63, beats: 0.75 }, { midi: 64, beats: 0.25 },
        { midi: 67, beats: 1 },
        { midi: 63, beats: 0.75 }, { midi: 64, beats: 0.25 },
        { midi: 67, beats: 2 },
      ],
      3: [
        { midi: 63, beats: 0.75 }, { midi: 64, beats: 0.25 },
        { midi: 67, beats: 1 },
        { midi: 63, beats: 0.75 }, { midi: 64, beats: 0.25 },
        { midi: 67, beats: 1 },
        { midi: 72, beats: 1 }, { midi: 71, beats: 2 },
      ],
    },
  },
  {
    id: 'jaws',
    name: 'Tubarão',
    bpm: 56,
    versions: {
      1: [
        { midi: 64, beats: 1 }, { midi: 65, beats: 1 },
        { midi: 64, beats: 1 }, { midi: 65, beats: 1 },
      ],
      2: [
        { midi: 64, beats: 1 }, { midi: 65, beats: 1 },
        { midi: 64, beats: 0.75 }, { midi: 65, beats: 0.75 },
        { midi: 64, beats: 0.5 }, { midi: 65, beats: 0.5 },
      ],
      3: [
        { midi: 64, beats: 1 }, { midi: 65, beats: 1 },
        { midi: 64, beats: 0.75 }, { midi: 65, beats: 0.75 },
        { midi: 64, beats: 0.5 }, { midi: 65, beats: 0.5 },
        { midi: 64, beats: 0.5 }, { midi: 65, beats: 0.5 },
      ],
    },
  },
  {
    id: 'mission-impossible',
    name: 'Missão Impossível',
    bpm: 64,
    versions: {
      1: [
        { midi: 67, beats: 0.5 }, { midi: 67, beats: 0.5 },
        { midi: 67, beats: 1 },
      ],
      2: [
        { midi: 67, beats: 0.5 }, { midi: 67, beats: 0.5 },
        { midi: 67, beats: 1 }, { midi: 70, beats: 1 },
        { midi: 65, beats: 1 },
      ],
      3: [
        { midi: 67, beats: 0.5 }, { midi: 67, beats: 0.5 },
        { midi: 67, beats: 1 }, { midi: 70, beats: 1 },
        { midi: 65, beats: 1 }, { midi: 67, beats: 0.5 },
        { midi: 67, beats: 0.5 }, { midi: 70, beats: 1 },
      ],
    },
  },
  {
    id: 'james-bond',
    name: 'James Bond',
    bpm: 70,
    versions: {
      1: [
        { midi: 64, beats: 1 }, { midi: 67, beats: 1 }, { midi: 71, beats: 2 },
      ],
      2: [
        { midi: 64, beats: 1 }, { midi: 67, beats: 1 }, { midi: 71, beats: 1 },
        { midi: 67, beats: 1 }, { midi: 64, beats: 2 },
      ],
      3: [
        { midi: 64, beats: 1 }, { midi: 67, beats: 1 }, { midi: 71, beats: 1 },
        { midi: 67, beats: 1 }, { midi: 64, beats: 1 },
        { midi: 67, beats: 1 }, { midi: 66, beats: 1 }, { midi: 64, beats: 2 },
      ],
    },
  },
  {
    id: 'ghostbusters',
    name: 'Ghostbusters',
    bpm: 64,
    versions: {
      1: [
        { midi: 57, beats: 0.5 }, { midi: 59, beats: 0.5 },
        { midi: 57, beats: 0.5 }, { midi: 59, beats: 0.5 },
      ],
      2: [
        { midi: 57, beats: 0.5 }, { midi: 59, beats: 0.5 },
        { midi: 57, beats: 0.5 }, { midi: 59, beats: 0.5 },
        { midi: 64, beats: 1 }, { midi: 62, beats: 1 },
      ],
      3: [
        { midi: 57, beats: 0.5 }, { midi: 59, beats: 0.5 },
        { midi: 57, beats: 0.5 }, { midi: 59, beats: 0.5 },
        { midi: 64, beats: 1 }, { midi: 62, beats: 0.5 },
        { midi: 60, beats: 0.5 }, { midi: 59, beats: 0.5 },
        { midi: 57, beats: 1.5 },
      ],
    },
  },
  {
    id: 'stranger-things',
    name: 'Stranger Things',
    bpm: 64,
    versions: {
      1: [
        { midi: 60, beats: 1 }, { midi: 64, beats: 1 }, { midi: 67, beats: 2 },
      ],
      2: [
        { midi: 60, beats: 1 }, { midi: 64, beats: 1 },
        { midi: 67, beats: 1 }, { midi: 71, beats: 1 },
        { midi: 67, beats: 2 },
      ],
      3: [
        { midi: 60, beats: 1 }, { midi: 64, beats: 1 },
        { midi: 67, beats: 1 }, { midi: 71, beats: 1 },
        { midi: 67, beats: 1 }, { midi: 64, beats: 1 },
        { midi: 60, beats: 2 },
      ],
    },
  },
  {
    id: 'game-of-thrones',
    name: 'Game of Thrones',
    bpm: 70,
    versions: {
      1: [
        { midi: 55, beats: 1 }, { midi: 60, beats: 1 }, { midi: 63, beats: 2 },
      ],
      2: [
        { midi: 55, beats: 1 }, { midi: 60, beats: 1 },
        { midi: 63, beats: 1 }, { midi: 65, beats: 1 },
        { midi: 63, beats: 2 },
      ],
      3: [
        { midi: 55, beats: 1 }, { midi: 60, beats: 1 },
        { midi: 63, beats: 1 }, { midi: 65, beats: 1 },
        { midi: 55, beats: 1 }, { midi: 60, beats: 1 },
        { midi: 63, beats: 1 }, { midi: 65, beats: 1 },
      ],
    },
  },
  {
    id: 'simpsons',
    name: 'Os Simpsons',
    bpm: 72,
    versions: {
      1: [
        { midi: 60, beats: 1 }, { midi: 64, beats: 1 }, { midi: 66, beats: 1 },
        { midi: 69, beats: 2 },
      ],
      2: [
        { midi: 60, beats: 1 }, { midi: 64, beats: 1 }, { midi: 66, beats: 1 },
        { midi: 69, beats: 1 }, { midi: 67, beats: 1 }, { midi: 64, beats: 2 },
      ],
      3: [
        { midi: 60, beats: 1 }, { midi: 64, beats: 1 }, { midi: 66, beats: 1 },
        { midi: 69, beats: 1 }, { midi: 67, beats: 1 }, { midi: 64, beats: 1 },
        { midi: 60, beats: 1 }, { midi: 64, beats: 1 }, { midi: 67, beats: 2 },
      ],
    },
  },
  {
    id: 'smoke-on-the-water',
    name: 'Smoke on the Water',
    bpm: 68,
    versions: {
      1: [
        { midi: 55, beats: 1 }, { midi: 58, beats: 1 }, { midi: 60, beats: 2 },
      ],
      2: [
        { midi: 55, beats: 1 }, { midi: 58, beats: 1 }, { midi: 60, beats: 1 },
        { midi: 55, beats: 1 }, { midi: 58, beats: 1 }, { midi: 61, beats: 1 },
        { midi: 60, beats: 2 },
      ],
      3: [
        { midi: 55, beats: 1 }, { midi: 58, beats: 1 }, { midi: 60, beats: 1 },
        { midi: 55, beats: 1 }, { midi: 58, beats: 1 }, { midi: 61, beats: 1 },
        { midi: 60, beats: 1 }, { midi: 55, beats: 1 }, { midi: 58, beats: 2 },
      ],
    },
  },
  {
    id: 'seven-nation-army',
    name: 'Seven Nation Army',
    bpm: 70,
    versions: {
      1: [
        { midi: 64, beats: 1 }, { midi: 64, beats: 0.75 }, { midi: 67, beats: 0.25 },
        { midi: 64, beats: 2 },
      ],
      2: [
        { midi: 64, beats: 1 }, { midi: 64, beats: 0.75 }, { midi: 67, beats: 0.25 },
        { midi: 64, beats: 1 }, { midi: 62, beats: 1 }, { midi: 60, beats: 2 },
      ],
      3: [
        { midi: 64, beats: 1 }, { midi: 64, beats: 0.75 }, { midi: 67, beats: 0.25 },
        { midi: 64, beats: 1 }, { midi: 62, beats: 1 }, { midi: 60, beats: 1 },
        { midi: 59, beats: 2 },
      ],
    },
  },
];
// Retorna uma melodia aleatória do banco, excluindo a melodia com o ID fornecido (se houver)
export function pickRandomMelody(excludeId) {
  let pool = MELODIES.filter((m) => m.id !== excludeId);
  if (pool.length === 0) pool = MELODIES;
  return pool[Math.floor(Math.random() * pool.length)];
}
// Retorna a melodia resolvida para o nível de dificuldade especificado, incluindo apenas as notas correspondentes
export function resolveMelody(melody, level) {
  const notes = melody.versions[level] || melody.versions[1];
  return {
    id: melody.id,
    name: melody.name,
    bpm: melody.bpm,
    notes,
  };
}
