/* =========================================================
   Mundo Aprendiz — lógica da app (MVP)
   Sem dependências externas. Guarda tudo em localStorage.
========================================================= */

const STORAGE_KEY = 'mundo-aprendiz:v1';
const AVATARS = ['🦊','🐸','🐼','🦁','🐰','🐨','🦄','🐢','🐙','🐯'];

const state = {
  data: loadData(),
  currentProfileId: null,
  currentArea: null,
  currentActivity: null,
  activityIndex: 0,
  activityScore: 0,
};

function loadData(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(raw) return JSON.parse(raw);
  }catch(e){ console.warn('Não foi possível ler dados guardados', e); }
  return { profiles: [], parentPin: null, screenTimeMinutes: 30 };
}

function saveData(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.data));
}

/* ---------------------------------------------------------
   Navegação entre ecrãs
--------------------------------------------------------- */
function showScreen(id){
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

document.querySelectorAll('.btn-back').forEach(btn => {
  btn.addEventListener('click', () => showScreen(btn.dataset.target));
});

/* ---------------------------------------------------------
   Áudio: narração simples com Web Speech API
--------------------------------------------------------- */
function speak(text){
  if(!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'pt-PT';
  utter.rate = 0.95;
  utter.pitch = 1.15;
  window.speechSynthesis.speak(utter);
}

/* ---------------------------------------------------------
   Conteúdo das atividades — 4 áreas x 25 atividades = 100 jogos
--------------------------------------------------------- */
const LETTERS_LIST = ['A','B','C','D','E','F','G','H','I','J','L','M','N','O','P','Q','R','S','T','U','V','X','Z','Y'];

function generateLetrasActivities(){
  const acts = LETTERS_LIST.map(letter => ({
    id: 'letra-' + letter.toLowerCase(),
    emoji: '🔤',
    label: `Encontra a letra ${letter}`,
    build: () => buildLetterQuiz(letter)
  }));
  acts.push({
    id: 'letra-inicial-cao',
    emoji: '🐶',
    label: 'Qual é a primeira letra?',
    build: () => buildWordInitialQuiz('Cão', '🐶', 'C')
  });
  return acts; // 24 + 1 = 25
}

function buildWordInitialQuiz(wordLabel, emoji, correctLetter){
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVXZ'.split('');
  const distractors = shuffle(alphabet.filter(l => l !== correctLetter)).slice(0, 3);
  const options = shuffle([correctLetter, ...distractors]);
  return {
    question: `${emoji} ${wordLabel} — qual é a primeira letra?`,
    audio: `Qual é a primeira letra da palavra ${wordLabel}?`,
    options: options.map(letter => ({ display: letter, correct: letter === correctLetter }))
  };
}

function generateNumerosActivities(){
  const acts = [];
  for(let n = 1; n <= 10; n++){
    acts.push({ id: `contar-${n}`, emoji: '🔢', label: `Conta até ${n}`, build: () => buildCountingQuiz(n) });
  }
  for(let i = 1; i <= 5; i++){
    acts.push({ id: `maior-${i}`, emoji: '📊', label: `Qual é o número maior? (nível ${i})`, build: () => buildBiggerNumberQuiz() });
  }
  for(let i = 1; i <= 5; i++){
    const maxSum = 4 + i;
    acts.push({ id: `soma-${i}`, emoji: '➕', label: `Somas até ${maxSum}`, build: () => buildAdditionQuiz(maxSum) });
  }
  for(let i = 1; i <= 5; i++){
    const maxVal = 4 + i;
    acts.push({ id: `subtracao-${i}`, emoji: '➖', label: `Subtrações até ${maxVal}`, build: () => buildSubtractionQuiz(maxVal) });
  }
  return acts; // 10 + 5 + 5 + 5 = 25
}

function buildAdditionQuiz(maxSum){
  const a = 1 + Math.floor(Math.random() * (maxSum - 1));
  const b = 1 + Math.floor(Math.random() * (maxSum - a));
  const correct = a + b;
  const opts = new Set([correct]);
  while(opts.size < 4){
    const c = Math.max(1, correct + Math.floor(Math.random() * 5) - 2);
    opts.add(c);
  }
  return {
    question: `${a} + ${b} = ?`,
    audio: `Quanto é ${a} mais ${b}?`,
    options: shuffle([...opts]).map(n => ({ display: String(n), correct: n === correct }))
  };
}

function buildSubtractionQuiz(maxVal){
  const a = 2 + Math.floor(Math.random() * (maxVal - 1));
  const b = 1 + Math.floor(Math.random() * Math.max(1, a - 1));
  const correct = a - b;
  const opts = new Set([correct]);
  while(opts.size < 4){
    const c = Math.max(0, correct + Math.floor(Math.random() * 5) - 2);
    opts.add(c);
  }
  return {
    question: `${a} - ${b} = ?`,
    audio: `Quanto é ${a} menos ${b}?`,
    options: shuffle([...opts]).map(n => ({ display: String(n), correct: n === correct }))
  };
}

const SEQUENCE_POOL = ['🔴','🔵','🟡','🟢','🟣','🟠','⭐','🌙','🐝','🐞','🔺','🔻','🟦','🟥'];

function buildSequenceQuizFromData(sequenceParts, correct){
  const distractors = shuffle(SEQUENCE_POOL.filter(p => p !== correct)).slice(0, 3);
  const options = shuffle([correct, ...distractors]);
  return {
    question: sequenceParts.join('  '),
    audio: 'O que vem a seguir na sequência?',
    options: options.map(o => ({ display: o, correct: o === correct }))
  };
}

const SHAPES_POOL = [
  { name: 'Círculo', emoji: '⚪' },
  { name: 'Quadrado', emoji: '⬛' },
  { name: 'Triângulo', emoji: '🔺' },
  { name: 'Estrela', emoji: '⭐' },
  { name: 'Coração', emoji: '❤️' },
  { name: 'Diamante', emoji: '🔷' },
  { name: 'Retângulo', emoji: '🟦' },
  { name: 'Cruz', emoji: '➕' },
  { name: 'Círculo verde', emoji: '🟢' },
];

function buildShapeMatchQuiz(target){
  const distractors = shuffle(SHAPES_POOL.filter(s => s.emoji !== target.emoji)).slice(0, 3);
  const options = shuffle([target, ...distractors]);
  return {
    question: `Toca na forma: ${target.name}`,
    audio: `Onde está o ${target.name}?`,
    options: options.map(s => ({ display: s.emoji, correct: s.emoji === target.emoji }))
  };
}

function generateLogicaActivities(){
  const acts = [];

  const oddCategories = [
    { items: ['🍎','🍌','🍇','🚗'], odd: '🚗' },
    { items: ['🐶','🐱','🐭','🌳'], odd: '🌳' },
    { items: ['⚽','🏀','🎾','📕'], odd: '📕' },
    { items: ['🚗','🚕','🚙','🐦'], odd: '🐦' },
    { items: ['🌞','🌝','⭐','🍕'], odd: '🍕' },
    { items: ['👕','👖','🧦','🍔'], odd: '🍔' },
    { items: ['🐟','🐠','🐬','🦋'], odd: '🦋' },
    { items: ['🍰','🍪','🍩','🚲'], odd: '🚲' },
  ];
  oddCategories.forEach((cat, i) => {
    acts.push({
      id: `odd-${i + 1}`,
      emoji: '🧩',
      label: `Qual não pertence ao grupo? (${i + 1})`,
      build: () => ({
        question: 'Qual destes é diferente?',
        audio: 'Qual destes não pertence ao grupo?',
        options: shuffle(cat.items).map(it => ({ display: it, correct: it === cat.odd }))
      })
    });
  });

  const sequences = [
    { parts: ['🔴','🔵','🔴','🔵','❓'], answer: '🔴' },
    { parts: ['🟡','🟡','🟢','🟡','🟡','❓'], answer: '🟢' },
    { parts: ['⭐','⭐','🌙','⭐','⭐','❓'], answer: '🌙' },
    { parts: ['🟦','🟥','🟦','🟥','❓'], answer: '🟦' },
    { parts: ['🔺','🔺','🔻','🔺','🔺','❓'], answer: '🔻' },
    { parts: ['🟣','🟢','🟣','🟢','❓'], answer: '🟣' },
    { parts: ['🐝','🐝','🐞','🐝','🐝','❓'], answer: '🐞' },
    { parts: ['🟠','🟠','🟠','🔵','❓'], answer: '🟠' },
  ];
  sequences.forEach((seq, i) => {
    acts.push({
      id: `sequencia-${i + 1}`,
      emoji: '🔁',
      label: `Sequências (nível ${i + 1})`,
      build: () => buildSequenceQuizFromData(seq.parts, seq.answer)
    });
  });

  SHAPES_POOL.forEach((shape, i) => {
    acts.push({
      id: `forma-${i + 1}`,
      emoji: shape.emoji,
      label: `Formas: ${shape.name}`,
      build: () => buildShapeMatchQuiz(shape)
    });
  });

  return acts; // 8 + 8 + 9 = 25
}

const ANIMAL_SOUNDS = [
  { animal: 'Cão', emoji: '🐶', sound: 'Au au' },
  { animal: 'Gato', emoji: '🐱', sound: 'Miau' },
  { animal: 'Vaca', emoji: '🐮', sound: 'Muu' },
  { animal: 'Pato', emoji: '🦆', sound: 'Quá quá' },
  { animal: 'Leão', emoji: '🦁', sound: 'Rrrrr' },
  { animal: 'Ovelha', emoji: '🐑', sound: 'Béé' },
  { animal: 'Cavalo', emoji: '🐴', sound: 'Rincho' },
  { animal: 'Porco', emoji: '🐷', sound: 'Óinc' },
  { animal: 'Galo', emoji: '🐓', sound: 'Cocorocó' },
  { animal: 'Abelha', emoji: '🐝', sound: 'Zzzz' },
];

function buildAnimalSoundQuiz(item){
  const distractors = shuffle(ANIMAL_SOUNDS.filter(a => a.animal !== item.animal)).slice(0, 3);
  const options = shuffle([item, ...distractors]);
  return {
    question: `Quem faz "${item.sound}"?`,
    audio: `Qual animal faz ${item.sound}?`,
    options: options.map(a => ({ display: a.emoji, correct: a.animal === item.animal }))
  };
}

const COLOR_LIST = [
  { name: 'Vermelho', emoji: '🔴' },
  { name: 'Laranja', emoji: '🟠' },
  { name: 'Amarelo', emoji: '🟡' },
  { name: 'Verde', emoji: '🟢' },
  { name: 'Azul', emoji: '🔵' },
  { name: 'Roxo', emoji: '🟣' },
];

function buildColorQuiz(target){
  const distractors = shuffle(COLOR_LIST.filter(c => c.name !== target.name)).slice(0, 3);
  const options = shuffle([target, ...distractors]);
  return {
    question: `Toca na cor: ${target.name}`,
    audio: `Onde está a cor ${target.name}?`,
    options: options.map(c => ({ display: c.emoji, correct: c.name === target.name }))
  };
}

const EMOTION_LIST = [
  { name: 'Feliz', emoji: '😄' },
  { name: 'Triste', emoji: '😢' },
  { name: 'Zangado', emoji: '😠' },
  { name: 'Surpreendido', emoji: '😲' },
  { name: 'Com sono', emoji: '😴' },
];

function buildEmotionQuiz(target){
  const distractors = shuffle(EMOTION_LIST.filter(e => e.name !== target.name)).slice(0, 3);
  const options = shuffle([target, ...distractors]);
  return {
    question: `Toca em quem está: ${target.name}`,
    audio: `Quem está ${target.name.toLowerCase()}?`,
    options: options.map(e => ({ display: e.emoji, correct: e.name === target.name }))
  };
}

const WORLD_EXTRA = [
  { q: '☀️ Quando vemos o sol, é...', audio: 'Quando vemos o sol no céu, que altura do dia é?', opts: ['Dia','Noite'], correct: 0 },
  { q: '🌙 Quando vemos a lua, é...', audio: 'Quando vemos a lua no céu, que altura do dia é?', opts: ['Noite','Dia'], correct: 0 },
  { q: '❄️ Nesta estação faz muito frio', audio: 'Em que estação do ano faz muito frio e por vezes neva?', opts: ['Inverno','Verão'], correct: 0 },
  { q: '☀️ Nesta estação faz muito calor', audio: 'Em que estação do ano faz muito calor?', opts: ['Verão','Inverno'], correct: 0 },
];

function buildWorldExtraQuiz(item){
  const pool = ['Dia','Noite','Verão','Inverno','Primavera','Outono'];
  const optsSet = new Set(item.opts);
  while(optsSet.size < 4){
    optsSet.add(pool[Math.floor(Math.random() * pool.length)]);
  }
  const correctValue = item.opts[item.correct];
  const options = shuffle([...optsSet]).map(o => ({ display: o, correct: o === correctValue }));
  return { question: item.q, audio: item.audio, options };
}

function generateMundoActivities(){
  const acts = [];

  ANIMAL_SOUNDS.forEach((item, i) => {
    acts.push({
      id: `animal-${i + 1}`,
      emoji: item.emoji,
      label: `Sons dos animais: ${item.animal}`,
      build: () => buildAnimalSoundQuiz(item)
    });
  });

  COLOR_LIST.forEach((c, i) => {
    acts.push({
      id: `cor-${i + 1}`,
      emoji: c.emoji,
      label: `Cores: ${c.name}`,
      build: () => buildColorQuiz(c)
    });
  });

  EMOTION_LIST.forEach((e, i) => {
    acts.push({
      id: `emocao-${i + 1}`,
      emoji: e.emoji,
      label: `Emoções: ${e.name}`,
      build: () => buildEmotionQuiz(e)
    });
  });

  WORLD_EXTRA.forEach((item, i) => {
    acts.push({
      id: `mundo-extra-${i + 1}`,
      emoji: '🌍',
      label: `Sabias que...? (${i + 1})`,
      build: () => buildWorldExtraQuiz(item)
    });
  });

  return acts; // 10 + 6 + 5 + 4 = 25
}

const AREAS = {
  letras: { title: 'Letras e Leitura', activities: generateLetrasActivities() },
  numeros: { title: 'Números e Matemática', activities: generateNumerosActivities() },
  logica: { title: 'Lógica e Resolução de Problemas', activities: generateLogicaActivities() },
  mundo: { title: 'O Mundo à Nossa Volta', activities: generateMundoActivities() },
};

function buildLetterQuiz(targetLetter){
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVXZ'.split('');
  const distractors = shuffle(alphabet.filter(l => l !== targetLetter)).slice(0, 3);
  const options = shuffle([targetLetter, ...distractors]);
  return {
    question: `Toca na letra ${targetLetter}`,
    audio: `Onde está a letra ${targetLetter}?`,
    options: options.map(letter => ({
      display: letter,
      correct: letter === targetLetter
    }))
  };
}

const COUNTING_EMOJI = ['🍎','⭐','🐝','🎈','🐟'];
function buildCountingQuiz(maxN){
  const emoji = COUNTING_EMOJI[Math.floor(Math.random() * COUNTING_EMOJI.length)];
  const correctCount = Math.max(1, Math.floor(Math.random() * maxN) + 1);
  const display = emoji.repeat(correctCount);
  const numberOptions = new Set([correctCount]);
  while(numberOptions.size < 4){
    const candidate = Math.max(1, correctCount + Math.floor(Math.random() * 5) - 2);
    if(candidate !== correctCount) numberOptions.add(candidate);
  }
  const options = shuffle([...numberOptions]);
  return {
    question: display,
    audio: `Quantos ${emoji} vês? Conta com calma.`,
    options: options.map(n => ({ display: String(n), correct: n === correctCount }))
  };
}

function buildBiggerNumberQuiz(){
  const a = Math.floor(Math.random() * 9) + 1;
  let b = Math.floor(Math.random() * 9) + 1;
  while(b === a) b = Math.floor(Math.random() * 9) + 1;
  const bigger = Math.max(a, b);
  return {
    question: 'Qual é o número maior?',
    audio: `Qual número é maior, ${a} ou ${b}?`,
    options: shuffle([a, b]).map(n => ({ display: String(n), correct: n === bigger }))
  };
}

function shuffle(arr){
  const copy = [...arr];
  for(let i = copy.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/* ---------------------------------------------------------
   Perfis
--------------------------------------------------------- */
function getProfile(id){
  return state.data.profiles.find(p => p.id === id);
}

function renderProfileGrid(){
  const grid = document.getElementById('profile-grid');
  grid.innerHTML = '';
  state.data.profiles.forEach(profile => {
    const card = document.createElement('button');
    card.className = 'profile-card';
    card.innerHTML = `
      <span class="avatar-badge">${profile.avatar}</span>
      <span class="profile-name">${profile.name}</span>
    `;
    card.addEventListener('click', () => openMap(profile.id));
    grid.appendChild(card);
  });
}

function renderAvatarGrid(){
  const grid = document.getElementById('avatar-grid');
  grid.innerHTML = '';
  let selected = AVATARS[0];
  AVATARS.forEach((avatar, i) => {
    const btn = document.createElement('button');
    btn.className = 'avatar-option' + (i === 0 ? ' selected' : '');
    btn.textContent = avatar;
    btn.addEventListener('click', () => {
      grid.querySelectorAll('.avatar-option').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selected = avatar;
      grid.dataset.selected = selected;
    });
    grid.appendChild(btn);
  });
  grid.dataset.selected = selected;
}

document.getElementById('btn-add-profile').addEventListener('click', () => {
  document.getElementById('input-name').value = '';
  renderAvatarGrid();
  showScreen('screen-create-profile');
});

document.getElementById('btn-save-profile').addEventListener('click', () => {
  const name = document.getElementById('input-name').value.trim();
  if(!name){
    document.getElementById('input-name').focus();
    return;
  }
  const avatar = document.getElementById('avatar-grid').dataset.selected || AVATARS[0];
  const age = document.getElementById('input-age').value;

  const profile = {
    id: 'p_' + Date.now(),
    name,
    avatar,
    age,
    stars: 0,
    completedActivities: [],
  };
  state.data.profiles.push(profile);
  saveData();
  openMap(profile.id);
});

document.getElementById('btn-switch-profile').addEventListener('click', () => {
  renderProfileGrid();
  showScreen('screen-profiles');
});

/* ---------------------------------------------------------
   Mapa de aventura
--------------------------------------------------------- */
function openMap(profileId){
  state.currentProfileId = profileId;
  const profile = getProfile(profileId);
  document.getElementById('map-avatar').textContent = profile.avatar;
  document.getElementById('map-name').textContent = profile.name;
  document.getElementById('stars-total').textContent = profile.stars;
  document.getElementById('mascot-text').textContent =
    `Olá, ${profile.name}! Escolhe uma ilha para explorares comigo. 🌟`;
  showScreen('screen-map');
}

document.querySelectorAll('.island').forEach(island => {
  island.addEventListener('click', () => {
    if(island.classList.contains('locked')) return;
    openActivities(island.dataset.area);
  });
});

/* ---------------------------------------------------------
   Lista de atividades de uma área
--------------------------------------------------------- */
function openActivities(areaKey){
  state.currentArea = areaKey;
  const area = AREAS[areaKey];
  document.getElementById('activities-title').textContent = area.title;

  const profile = getProfile(state.currentProfileId);
  const grid = document.getElementById('activities-grid');
  grid.innerHTML = '';

  area.activities.forEach(activity => {
    const done = profile.completedActivities.includes(activity.id);
    const card = document.createElement('button');
    card.className = 'activity-card' + (done ? ' done' : '');
    card.innerHTML = `
      <span class="emoji">${activity.emoji}</span>
      <span class="info">
        <strong>${activity.label}</strong>
        <span class="stars-mini">${done ? 'Concluído ⭐⭐⭐' : 'Por explorar'}</span>
      </span>
    `;
    card.addEventListener('click', () => startActivity(areaKey, activity));
    grid.appendChild(card);
  });

  showScreen('screen-activities');
}

/* ---------------------------------------------------------
   Ecrã de atividade (quiz de escolha múltipla)
--------------------------------------------------------- */
const ROUNDS_PER_ACTIVITY = 3;

function startActivity(areaKey, activity){
  state.currentActivity = activity;
  state.activityIndex = 0;
  state.activityScore = 0;
  playRound();
}

function playRound(){
  if(state.activityIndex >= ROUNDS_PER_ACTIVITY){
    finishActivity();
    return;
  }
  const round = state.currentActivity.build();
  state.currentRound = round;

  document.getElementById('activity-progress-bar').style.width =
    `${(state.activityIndex / ROUNDS_PER_ACTIVITY) * 100}%`;
  document.getElementById('activity-question').textContent = round.question;

  const optionsWrap = document.getElementById('activity-options');
  optionsWrap.innerHTML = '';
  round.options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = opt.display;
    btn.addEventListener('click', () => handleAnswer(btn, opt));
    optionsWrap.appendChild(btn);
  });

  showScreen('screen-activity');
  setTimeout(() => speak(round.audio), 250);
}

document.getElementById('btn-replay-audio').addEventListener('click', () => {
  if(state.currentRound) speak(state.currentRound.audio);
});

function handleAnswer(btn, opt){
  const allButtons = document.querySelectorAll('.option-btn');
  allButtons.forEach(b => b.disabled = true);

  if(opt.correct){
    btn.classList.add('correct');
    state.activityScore++;
    speak('Boa! Muito bem!');
  }else{
    btn.classList.add('wrong');
    const correctBtn = [...allButtons].find((b, i) => state.currentRound.options[i].correct);
    if(correctBtn) correctBtn.classList.add('correct');
    speak('Quase! Vamos tentar a próxima.');
  }

  setTimeout(() => {
    state.activityIndex++;
    playRound();
  }, 1100);
}

function finishActivity(){
  document.getElementById('activity-progress-bar').style.width = '100%';

  const profile = getProfile(state.currentProfileId);
  const starsEarned = state.activityScore;

  if(!profile.completedActivities.includes(state.currentActivity.id)){
    profile.completedActivities.push(state.currentActivity.id);
  }
  profile.stars += starsEarned;
  saveData();

  document.getElementById('reward-text').textContent =
    `Acertaste ${starsEarned} de ${ROUNDS_PER_ACTIVITY}!`;
  document.getElementById('reward-stars').innerHTML =
    '⭐'.repeat(Math.max(1, starsEarned)) || '🌟';

  showScreen('screen-reward');
  launchConfetti();
  speak('Parabéns, completaste a atividade!');
}

document.getElementById('btn-reward-continue').addEventListener('click', () => {
  openActivities(state.currentArea);
});

/* ---------------------------------------------------------
   Confetis simples em canvas
--------------------------------------------------------- */
function launchConfetti(){
  const canvas = document.getElementById('confetti-canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  const colors = ['#FF6F5E', '#38B6C2', '#FFC845', '#58C97D', '#9B5FE0'];
  const pieces = Array.from({ length: 60 }, () => ({
    x: Math.random() * canvas.width,
    y: -20 - Math.random() * canvas.height,
    size: 4 + Math.random() * 6,
    speed: 2 + Math.random() * 3,
    color: colors[Math.floor(Math.random() * colors.length)],
    rotation: Math.random() * 360,
  }));

  let frame = 0;
  const maxFrames = 140;

  function tick(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach(p => {
      p.y += p.speed;
      p.rotation += 6;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      ctx.restore();
    });
    frame++;
    if(frame < maxFrames){
      requestAnimationFrame(tick);
    }else{
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
  tick();
}

/* ---------------------------------------------------------
   Modo pais: portão de matemática + relatório + definições
--------------------------------------------------------- */
let gateAnswer = 0;

document.getElementById('btn-open-parents-from-profiles').addEventListener('click', () => {
  const a = Math.floor(Math.random() * 8) + 2; // 2 a 9
  const b = Math.floor(Math.random() * 8) + 2; // 2 a 9
  gateAnswer = a * b;
  document.getElementById('gate-question').textContent = `${a} × ${b} = ?`;
  document.getElementById('gate-answer').value = '';
  document.getElementById('gate-error').textContent = '';
  showScreen('screen-parents-gate');
});

document.getElementById('btn-gate-confirm').addEventListener('click', () => {
  const value = Number(document.getElementById('gate-answer').value);
  if(value === gateAnswer){
    openParentsScreen();
  }else{
    document.getElementById('gate-error').textContent = 'Não é essa a resposta certa. Tenta de novo.';
  }
});

function openParentsScreen(){
  const report = document.getElementById('parents-report');
  report.innerHTML = '';

  if(state.data.profiles.length === 0){
    report.innerHTML = '<p class="hint">Ainda não há exploradores criados.</p>';
  }

  state.data.profiles.forEach(profile => {
    const row = document.createElement('div');
    row.className = 'report-row';
    row.innerHTML = `
      <span>${profile.avatar} ${profile.name}</span>
      <span>${profile.stars} ⭐ · ${profile.completedActivities.length} atividades</span>
    `;
    report.appendChild(row);
  });

  const slider = document.getElementById('time-limit-input');
  slider.value = state.data.screenTimeMinutes ?? 30;
  document.getElementById('time-limit-value').textContent = `${slider.value} min`;

  showScreen('screen-parents');
}

document.getElementById('time-limit-input').addEventListener('input', (e) => {
  document.getElementById('time-limit-value').textContent = `${e.target.value} min`;
  state.data.screenTimeMinutes = Number(e.target.value);
  saveData();
});

document.getElementById('btn-reset-all').addEventListener('click', () => {
  if(confirm('Tens a certeza? Isto apaga todo o progresso guardado neste dispositivo.')){
    state.data = { profiles: [], parentPin: null, screenTimeMinutes: 30 };
    saveData();
    renderProfileGrid();
    showScreen('screen-profiles');
  }
});

/* ---------------------------------------------------------
   Arranque
--------------------------------------------------------- */
renderProfileGrid();
showScreen('screen-profiles');
