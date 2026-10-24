// Contato comercial já utilizado em /maisclientes.
const WHATSAPP_NUMBER = '5516982650942';
const WHATSAPP_MESSAGE = 'Olá, Matheus! Conheci o Captador 7x7 no seu site, entendi o que está incluído na implantação de R$ 500 e gostaria de conversar sobre a contratação.';
document.querySelector('#whatsapp-cta').href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

const motion = matchMedia('(prefers-reduced-motion: reduce)');
const reveals = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  if (!motion.matches) document.documentElement.classList.add('motion-ready');
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  }, { threshold: 0, rootMargin: '0px 0px -30px 0px' });
  reveals.forEach(element => observer.observe(element));
}

const week = document.querySelector('.week');
let weekStarted = false;
function illuminateWeek() {
  if (weekStarted) return;
  weekStarted = true;
  week.querySelectorAll('span').forEach((day, index) => {
    if (motion.matches) day.classList.add('lit');
    else setTimeout(() => day.classList.add('lit'), index * 320);
  });
}
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) { illuminateWeek(); observer.disconnect(); }
  }, { threshold: .8 });
  observer.observe(week);
} else illuminateWeek();

const stage = document.querySelector('#demo-stage');
const page = document.querySelector('#demo-page');
const panel = document.querySelector('#demo-panel');
const cursor = document.querySelector('#demo-cursor');
const pause = document.querySelector('#demo-pause');
const replay = document.querySelector('#demo-replay');
const status = document.querySelector('#demo-status');
const pieces = [...page.querySelectorAll('.build-piece')];
let running = false;
let started = false;
let finished = false;
let elapsed = 0;
let previousTime = null;
let frame = 0;
let eventIndex = 0;
let autoPaused = false;

function announce(text) { status.textContent = text; }
function showPage() {
  page.hidden = false; panel.hidden = true; panel.replaceChildren();
  page.classList.remove('building'); pieces.forEach(piece => piece.classList.remove('built'));
  cursor.classList.remove('visible', 'click');
}
function showPanel(content) {
  page.hidden = true; panel.hidden = false; panel.innerHTML = content;
  cursor.classList.remove('visible', 'click');
}
function pointTo(element) {
  if (!element) return;
  const target = element.getBoundingClientRect();
  const area = stage.getBoundingClientRect();
  cursor.style.left = `${target.left - area.left + target.width * .7}px`;
  cursor.style.top = `${target.top - area.top + target.height * .55}px`;
  cursor.classList.add('visible');
}
function selectOption() {
  const option = panel.querySelector('.demo-option');
  option?.classList.add('selected');
  cursor.classList.add('click');
}
const questions = [
  ['Qual serviço você precisa?', ['Instalação', 'Manutenção', 'Higienização']],
  ['Onde será realizado o serviço?', ['Residência', 'Empresa']],
  ['Quando pretende contratar?', ['O mais rápido possível', 'Nos próximos dias', 'Estou pesquisando']]
];
function question(index) {
  const [title, options] = questions[index];
  showPanel(`<p class="panel-kicker">CLIMAPRIME / SOLICITAÇÃO DE ORÇAMENTO</p><h3>${title}</h3><div class="demo-options">${options.map(option => `<div class="demo-option">${option}</div>`).join('')}</div><p class="demo-progress">${index + 1} de 3 · Pré-qualificação</p>`);
  announce(`Pergunta ${index + 1} de 3: ${title}`);
}
function summary() {
  showPanel('<p class="panel-kicker">CLIMAPRIME / SOLICITAÇÃO ORGANIZADA</p><h3>Tudo pronto para conversar.</h3><div class="request-summary"><p><span>Serviço</span>Instalação</p><p><span>Local</span>Residência</p><p><span>Prazo</span>O mais rápido possível</p></div><span class="mock-button" id="mock-send">ENVIAR SOLICITAÇÃO PELO WHATSAPP</span>');
  announce('As respostas são organizadas em uma solicitação.');
}
const events = [
  [0, () => { page.classList.add('building'); announce('01 / Uma página profissional ganha forma.'); }],
  ...pieces.map((piece, i) => [450 + i * 650, () => piece.classList.add('built')]),
  [4200, () => { announce('02 / Um visitante solicita um orçamento.'); pointTo(document.querySelector('#mock-budget')); }],
  [5100, () => cursor.classList.add('click')],
  [5700, () => question(0)],
  [7200, () => pointTo(panel.querySelector('.demo-option'))],
  [8000, selectOption],
  [9600, () => question(1)],
  [11100, () => pointTo(panel.querySelector('.demo-option'))],
  [11900, selectOption],
  [13500, () => question(2)],
  [15300, () => pointTo(panel.querySelector('.demo-option'))],
  [16100, selectOption],
  [17900, summary],
  [20500, () => { announce('05 / A solicitação segue para o WhatsApp.'); pointTo(document.querySelector('#mock-send')); }],
  [21400, () => cursor.classList.add('click')],
  [22200, () => {
    showPanel('<p class="panel-kicker">WHATSAPP / PRÉVIA DA MENSAGEM</p><h3>Uma conversa com contexto.</h3><div class="whatsapp-preview"><p>Olá! Gostaria de solicitar um orçamento.</p><p>Serviço: Instalação.<br>Local: Residência.<br>Prazo: O mais rápido possível.</p></div><p class="demo-note">Simulação. O visitante precisa confirmar o envio no WhatsApp.</p>');
    announce('Mensagem preparada. O envio depende da confirmação do visitante.');
  }],
  [27700, () => {
    showPage(); finished = true; running = false; pause.disabled = true; pause.textContent = 'Concluído';
    announce('06 / Seu próximo atendimento começa antes da primeira conversa.');
  }]
];
function tick(time) {
  if (!running) return;
  if (previousTime !== null) elapsed += time - previousTime;
  previousTime = time;
  while (eventIndex < events.length && elapsed >= events[eventIndex][0]) events[eventIndex++][1]();
  if (running) frame = requestAnimationFrame(tick);
}
function setRunning(value) {
  running = value; previousTime = null; cancelAnimationFrame(frame);
  pause.textContent = value ? 'Pausar' : 'Continuar';
  pause.setAttribute('aria-label', value ? 'Pausar demonstração' : 'Continuar demonstração');
  // Freeze CSS transitions as well as the event clock while paused.
  for (const animation of stage.getAnimations({ subtree: true })) value ? animation.play() : animation.pause();
  if (value) frame = requestAnimationFrame(tick);
}
function start() {
  cancelAnimationFrame(frame); showPage();
  elapsed = 0; previousTime = null; eventIndex = 0; started = true; finished = false; autoPaused = false;
  pause.disabled = false; replay.textContent = 'ASSISTIR NOVAMENTE ↻'; setRunning(true);
}
pause.addEventListener('click', () => { autoPaused = false; setRunning(!running); });
replay.addEventListener('click', start);

// Reduced motion uses an explicit, manual sequence; no autoplay or cursor motion.
let manualStep = -1;
function manualNext() {
  manualStep = (manualStep + 1) % 6;
  if (manualStep === 0) { showPage(); announce('01 / Página profissional com serviços e solicitação de orçamento.'); }
  else if (manualStep <= 3) { question(manualStep - 1); panel.querySelector('.demo-option').classList.add('selected'); }
  else if (manualStep === 4) summary();
  else events.find(event => event[0] === 22200)[1]();
  replay.textContent = manualStep === 5 ? 'ASSISTIR NOVAMENTE ↻' : 'PRÓXIMA ETAPA →';
}
function configureMotion() {
  if (motion.matches) {
    cancelAnimationFrame(frame); running = false; showPage(); pause.disabled = true; pause.textContent = 'Sem movimento';
    manualStep = -1; replay.removeEventListener('click', start); replay.addEventListener('click', manualNext);
    replay.textContent = 'VER DEMONSTRAÇÃO PASSO A PASSO →';
    announce('Demonstração sem movimento. Use o controle abaixo para avançar.');
    document.documentElement.classList.remove('motion-ready');
    week.querySelectorAll('span').forEach(day => day.classList.add('lit'));
  } else {
    replay.removeEventListener('click', manualNext); replay.addEventListener('click', start);
    replay.textContent = 'ASSISTIR NOVAMENTE ↻';
    if (started) start();
  }
}
configureMotion(); motion.addEventListener('change', configureMotion);
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    const visible = entries[0].isIntersecting;
    if (visible && !started && !motion.matches) start();
    else if (!visible && running) { setRunning(false); autoPaused = true; }
    else if (visible && autoPaused && !finished && !motion.matches) { autoPaused = false; setRunning(true); }
  }, { threshold: .25 });
  observer.observe(stage);
}
document.addEventListener('visibilitychange', () => {
  if (document.hidden && running) { setRunning(false); autoPaused = true; }
  else if (!document.hidden && autoPaused && !finished && !motion.matches) {
    const bounds = stage.getBoundingClientRect();
    if (bounds.bottom > 0 && bounds.top < innerHeight) { autoPaused = false; setRunning(true); }
  }
});
