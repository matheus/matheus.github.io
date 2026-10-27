// Public webhook URL only; never put credentials in this file.
const CHAT_CONFIG = {
  webhookUrl: 'https://hook.us2.make.com/qntoqzf79hb5dps82zcpxgux81gfj3as',
  serviceDescription: 'O Conecta 7x7 apresenta seus serviços, conversa com os interessados e organiza as informações para o próximo atendimento. O fluxo é adaptado à sua empresa para sua equipe receber cada oportunidade com mais contexto.',
};
(() => {
const motion = matchMedia('(prefers-reduced-motion: reduce)');
if ('IntersectionObserver' in window) {
  if (!motion.matches) document.documentElement.classList.add('js-motion');
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
  }), { threshold: .08 });
  document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
}
const select = selector => document.querySelector(selector);
const heading = select('#offer-title'), label = select('#answer-label');
const context = select('#messages'), actions = select('#chat-actions');
const form = select('#chat-form'), input = select('#answer');
const privacy = select('.chat-privacy'), restart = select('#restart');
let stage = 'name', transcript = [], data = {}, sending = false, controller;
// Submission IDs are for deduplication, not authentication. Works over HTTP too.
function createRequestId() {
  const bytes = new Uint8Array(16);
  if (typeof globalThis.crypto?.getRandomValues === 'function') globalThis.crypto.getRandomValues(bytes);
  else for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  bytes[6] = (bytes[6] & 15) | 64; bytes[8] = (bytes[8] & 63) | 128;
  const hex = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
}
function show(next, question, explanation, step, interactive = true) {
  stage = next; label.textContent = question; context.textContent = explanation;
  transcript.push({ role: 'assistant', content: `${question}\n${explanation}` });
  select('#conversation-progress').textContent = `VAMOS CONVERSAR · ${step} / 05`;
  actions.replaceChildren(); form.hidden = !['name','email','company'].includes(next);
  heading.classList.remove('question-enter');
  void heading.offsetWidth;
  heading.classList.add('question-enter');
  if (interactive) {
    select('.conversation-stage').scrollIntoView({ behavior: motion.matches ? 'instant' : 'smooth', block: 'start' });
    // Keep mobile keyboards closed unless the visitor chooses to type.
    heading.focus({ preventScroll: true });
  }
}
function ask(next, question, explanation, step, placeholder, type = 'text', autocomplete = 'off', interactive = true) {
  show(next, question, explanation, step, interactive);
  input.value = ''; input.type = type; input.placeholder = placeholder;
  input.autocomplete = autocomplete; input.maxLength = next === 'company' ? 240 : 120;
  select('#send-label').textContent = next === 'name' ? 'Vamos começar' : 'Continuar';
}
function choice(text, callback, primary = true) {
  const button = document.createElement('button'); button.type = 'button';
  button.textContent = text; if (primary) button.className = 'primary';
  button.addEventListener('click', () => {
    transcript.push({ role: 'user', content: text }); callback();
  }); actions.append(button);
}
function reset(interactive = true) {
  controller?.abort(); sending = false; restart.disabled = false;
  transcript = []; data = { requestId: createRequestId(), source: 'matheusgodoy.com', service: 'Conecta 7x7' };
  privacy.textContent = 'Seus dados só serão enviados ao confirmar no final.';
  ask('name', 'Como posso chamar você?', 'Oi! Sou o assistente do Matheus. Vamos descobrir como um funcionário digital pode ajudar sua empresa? Comece me contando seu nome.', '01', 'Seu nome aqui…', 'text', 'given-name', interactive);
}
function serviceIntro() {
  show('service', 'Quer conhecer seu primeiro funcionário digital?', 'Já existem soluções prontas que podem ser adaptadas ao seu negócio. A primeira delas é o Conecta 7x7.', '04');
  choice('Conhecer o Conecta 7x7 ↗', () => {
    show('product', 'Conheça o Conecta 7x7.', `${CHAT_CONFIG.serviceDescription}\n\nFunciona assim: o visitante conhece sua empresa, responde às perguntas do atendimento e sua equipe recebe as informações organizadas para continuar a conversa. O Matheus define com você o conteúdo, as perguntas e as integrações necessárias.`, '04');
    const serviceLink = document.createElement('a');
    serviceLink.href = '/servicos/conecta7x7/index.html';
    serviceLink.target = '_blank';
    serviceLink.rel = 'noopener noreferrer';
    serviceLink.textContent = 'Ver o Conecta 7x7 em detalhes ↗';
    serviceLink.setAttribute('aria-label', 'Ver o Conecta 7x7 em detalhes (abre em nova aba)');
    serviceLink.addEventListener('click', () => transcript.push({ role: 'user', content: 'Abriu a página do Conecta 7x7 para conhecer os detalhes.' }));
    actions.append(serviceLink);
    choice('Quero conversar sobre minha empresa ↗', review);
  });
}
function review() {
  show('review', 'Vamos dar o próximo passo?', `Confira seus dados:\n${data.name}\n${data.email}\n${data.company}`, '05');
  if (CHAT_CONFIG.webhookUrl) {
    privacy.textContent = 'Ao confirmar, seu nome, e-mail, empresa e conversa serão enviados ao Matheus para continuar o atendimento.';
    choice('Confirmar e enviar ↗', send); choice('Corrigir meus dados', () => reset(), false);
  } else {
    context.textContent += '\n\nO envio pelo site ainda está sendo configurado. Seus dados não foram enviados. Por enquanto, continue diretamente com o Matheus pelo WhatsApp.';
    const link = document.createElement('a'); link.textContent = 'Conversar com o Matheus ↗'; link.target = '_blank'; link.rel = 'noopener noreferrer';
    link.href = 'https://wa.me/5516982650942?text=' + encodeURIComponent('Olá, Matheus! Conheci o Conecta 7x7 no seu site e quero conversar sobre automação para minha empresa.'); actions.append(link);
    choice('Recomeçar', () => reset(), false);
    privacy.textContent = 'As respostas ficam apenas nesta aba. Nenhum dado foi enviado.';
  }
}
async function send() {
  if (sending || !CHAT_CONFIG.webhookUrl) return;
  sending = true; restart.disabled = true; actions.querySelectorAll('button').forEach(button => button.disabled = true);
  privacy.textContent = 'Enviando seu contato…'; controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(CHAT_CONFIG.webhookUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: controller.signal, body: JSON.stringify({ ...data, transcript, consent: true, submittedAt: new Date().toISOString() }) });
    if (!response.ok) throw new Error('Envio recusado');
    show('done', 'Conversa iniciada. Vamos em frente.', 'Seu contato foi recebido. O próximo passo é conversar com o Matheus para entender sua operação e mapear o que pode ser automatizado.', '05');
    privacy.textContent = 'Contato enviado com sua confirmação.'; choice('Começar de novo', () => reset());
  } catch {
    show('review', 'Vamos tentar mais uma vez?', 'Não consegui confirmar o recebimento. Suas respostas continuam nesta aba.', '05');
    privacy.textContent = 'Recebimento ainda não confirmado.'; choice('Tentar novamente ↗', send);
  } finally { clearTimeout(timeout); sending = false; restart.disabled = false; }
}
form.addEventListener('submit', event => {
  event.preventDefault(); const value = input.value.trim();
  if (!value || !form.reportValidity()) return;
  transcript.push({ role: 'user', content: value });
  if (stage === 'name') {
    data.name = value;
    ask('email', `${value}, qual é o seu e-mail?`, 'Tudo começa com uma conversa: o Matheus mapeia as tarefas repetitivas da sua empresa e transforma esse trabalho em soluções digitais. Assim, sua equipe ganha tempo para vender.\n\nQual é o melhor e-mail para continuar essa conversa?', '02', 'voce@empresa.com.br', 'email', 'email');
  } else if (stage === 'email') {
    data.email = value;
    ask('company', 'Qual é a sua empresa?', 'Entender o ramo de atuação ajuda a encontrar as oportunidades certas. Conte o nome da sua empresa ou compartilhe o site; os detalhes da operação serão aprofundados na conversa com o Matheus.', '03', 'Nome da empresa ou site…', 'text', 'organization');
  } else if (stage === 'company') { data.company = value; serviceIntro(); }
});
restart.addEventListener('click', () => reset());
reset(false);
})();
