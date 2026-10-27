// Demo destination. Replace whatsappNumber with the customer's number at deployment.
const CONECTA_CONFIG = {
  webhookUrl: 'https://hook.us2.make.com/qntoqzf79hb5dps82zcpxgux81gfj3as',
  whatsappNumber: '5516982650942',
};
(() => {
const $ = selector => document.querySelector(selector);
const motion = matchMedia('(prefers-reduced-motion: reduce)');
if ('IntersectionObserver' in window) {
  if (!motion.matches) document.documentElement.classList.add('motion');
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add(entry.target.classList.contains('testimonials') ? 'assembled' : 'visible');
      observer.unobserve(entry.target);
    }
  }), { threshold: .12 });
  document.querySelectorAll('.reveal, .testimonials').forEach(element => observer.observe(element));
}
const questions = [
  { key: 'name', title: 'Como posso chamar você?', context: 'Sou o assistente do Conecta 7x7. Vou fazer algumas perguntas para preparar seu atendimento. Para começar, qual é o seu nome?', placeholder: 'Seu nome aqui…', autocomplete: 'given-name' },
  { key: 'contact', title: 'Qual é o seu melhor contato?', context: 'Deixe seu e-mail ou WhatsApp para o Matheus continuar a conversa com você.', placeholder: 'Seu e-mail ou WhatsApp…' },
  { key: 'employees', title: 'Quantas pessoas trabalham na sua empresa?', context: 'Selecione a opção que representa o tamanho da sua equipe.', options: ['Apenas eu', 'De 2 a 5', 'Mais de 5'] },
];
const form = $('#chat-form'), input = $('#answer'), heading = $('#chat-question');
const context = $('#chat-context'), actions = $('#chat-actions'), status = $('#chat-status'), restart = $('#restart');
let step = 0, data = {}, transcript = [], sending = false, sent = false, whatsappOpened = false, controller;
function requestId() {
  const bytes = new Uint8Array(16);
  if (typeof globalThis.crypto?.getRandomValues === 'function') globalThis.crypto.getRandomValues(bytes);
  else for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
}
function present(title, text, interactive = true) {
  const label = $('#question-label');
  const keyword = ['você', 'empresa', 'contato', 'conectar', 'pronta', 'vez'].find(word => title.includes(word));
  label.replaceChildren();
  if (keyword) {
    const position = title.indexOf(keyword);
    const accent = document.createElement('em'); accent.textContent = keyword;
    label.append(document.createTextNode(title.slice(0, position)), accent, document.createTextNode(title.slice(position + keyword.length)));
  } else label.textContent = title;
  context.textContent = text;
  heading.classList.remove('question-enter'); void heading.offsetWidth; heading.classList.add('question-enter');
  if (interactive) {
    $('.question-stage').scrollIntoView({ behavior: motion.matches ? 'instant' : 'smooth', block: 'start' });
    heading.focus({ preventScroll: true });
  }
}
function ask(interactive = true) {
  const question = questions[step];
  form.hidden = Boolean(question.options); actions.replaceChildren();
  $('#progress').textContent = `${String(step + 1).padStart(2, '0')} / ${String(questions.length).padStart(2, '0')}`;
  transcript.push({ role: 'assistant', content: question.title });
  present(question.title, question.context, interactive);
  if (question.options) {
    question.options.forEach(option => button(option, () => answer(option)));
    return;
  }
  input.type = question.type || 'text'; input.value = '';
  input.placeholder = question.placeholder; input.autocomplete = question.autocomplete || 'off';
  input.maxLength = question.maxLength || 240;
}
function button(text, handler, primary = true) {
  const element = document.createElement('button'); element.type = 'button'; element.textContent = text;
  if (primary) element.className = 'button';
  element.addEventListener('click', handler); actions.append(element);
}
function summary() {
  return `Nome: ${data.name}\nContato: ${data.contact}\nQuantidade de funcionários: ${data.employees}`;
}
function whatsappUrl() {
  const message = `Olá, Matheus! Experimentei o Conecta 7x7 e gostaria de conversar.\n\n${summary()}`;
  return `https://wa.me/${CONECTA_CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
}
function openWhatsApp() {
  // Open synchronously during the click, before awaiting the webhook response.
  // A neutral tab lets us clear opener while retaining popup-block detection.
  let tab;
  try {
    tab = window.open('about:blank', '_blank');
    if (!tab) return false;
    tab.opener = null;
    tab.location.replace(whatsappUrl());
    return true;
  } catch {
    if (tab) tab.close();
    return false;
  }
}
function whatsappFallback() {
  if (whatsappOpened) return;
  const link = document.createElement('a'); link.className = 'button';
  link.textContent = 'Abrir WhatsApp ↗'; link.href = whatsappUrl();
  link.target = '_blank'; link.rel = 'noopener noreferrer';
  actions.append(link);
}
function review() {
  form.hidden = true; actions.replaceChildren(); $('#progress').textContent = 'REVISE E CONFIRME';
  present('Tudo certo para conectar?', summary());
  status.textContent = 'Ao confirmar, suas respostas serão enviadas ao Matheus e o WhatsApp abrirá com a mensagem pronta. Confirme o envio no aplicativo.';
  button('Enviar e abrir WhatsApp ↗', () => send(true));
  button('Corrigir minhas respostas', () => reset(), false);
}
async function send(launchWhatsApp = true) {
  if (sending || sent) return;
  sending = true; restart.disabled = true;
  if (launchWhatsApp && !whatsappOpened) whatsappOpened = openWhatsApp();
  actions.querySelectorAll('button').forEach(element => element.disabled = true);
  status.textContent = whatsappOpened ? 'WhatsApp aberto. Registrando suas respostas…' : 'Registrando suas respostas…'; controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(CONECTA_CONFIG.webhookUrl, {
      method: 'POST', keepalive: true, headers: { 'Content-Type': 'application/json' }, signal: controller.signal,
      body: JSON.stringify({ ...data, source: 'matheusgodoy.com', page: '/servicos/conecta7x7/index.html', conecta: true, service: 'Conecta 7x7', transcript, consent: true, submittedAt: new Date().toISOString() }),
    });
    if (!response.ok) throw new Error('Solicitação recusada');
    sent = true; actions.replaceChildren(); $('#progress').textContent = 'SOLICITAÇÃO RECEBIDA';
    present('Recebemos suas respostas.', whatsappOpened ? 'O WhatsApp foi aberto com sua mensagem pronta. Confirme o envio no aplicativo para continuar o atendimento.' : 'Seu navegador bloqueou a abertura automática do WhatsApp. Use o botão abaixo para abrir a mensagem pronta.');
    whatsappFallback();
    status.textContent = 'Recebimento no site confirmado. O envio da mensagem no WhatsApp depende da sua confirmação no aplicativo.';
  } catch {
    actions.replaceChildren();
    present('Vamos tentar mais uma vez?', `${whatsappOpened ? 'O WhatsApp foi aberto, mas não consegui confirmar o registro no site. Tente registrar novamente sem abrir outra conversa.' : 'Não consegui confirmar o registro no site. Você pode tentar novamente e usar o botão abaixo para abrir o WhatsApp.'}\n\n${summary()}`);
    button('Tentar registrar novamente ↗', () => send(false)); whatsappFallback();
    status.textContent = 'O recebimento pelo site ainda não foi confirmado.';
  } finally { clearTimeout(timeout); sending = false; restart.disabled = false; }
}
function reset(interactive = true) {
  if (sending) return;
  step = 0; sent = false; whatsappOpened = false; transcript = []; data = { requestId: requestId() };
  status.textContent = '';
  ask(interactive);
}
function answer(value) {
  if (step >= questions.length || sending) return;
  data[questions[step].key] = value; transcript.push({ role: 'user', content: value });
  step++;
  if (step < questions.length) ask(); else review();
}
form.addEventListener('submit', event => {
  event.preventDefault();
  if (step >= questions.length || questions[step].options) return;
  const value = input.value.trim();
  if (!value || !form.reportValidity()) return;
  answer(value);
});
restart.addEventListener('click', () => reset());
reset(false);
})();
