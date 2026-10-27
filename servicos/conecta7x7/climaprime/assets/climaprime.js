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
  { key: 'service', title: 'Como podemos ajudar?', context: 'Escolha o serviço que você procura. Vamos organizar seu pedido para continuar o atendimento pelo WhatsApp.', options: ['Instalação', 'Manutenção', 'Higienização'] },
  { key: 'property', title: 'Onde será o atendimento?', context: 'Assim entendemos melhor o seu ambiente.', options: ['Residencial', 'Comercial'] },
  { key: 'location', title: 'Em qual região você está?', context: 'Informe apenas cidade e bairro. Não precisamos do endereço completo.', placeholder: 'Sua cidade…', autocomplete: 'address-level2' },
  { key: 'urgency', title: 'Para quando você precisa?', context: 'Essa preferência não confirma disponibilidade ou agendamento.', options: ['O quanto antes', 'Nos próximos dias', 'Estou apenas pesquisando'] },
  { key: 'name', title: 'Como podemos chamar você?', context: 'Seu nome ajuda a personalizar o atendimento e identificar o pedido.', placeholder: 'Seu nome aqui…', autocomplete: 'given-name' },
];
const form = $('#chat-form'), input = $('#answer'), heading = $('#chat-question');
const context = $('#chat-context'), actions = $('#chat-actions'), status = $('#chat-status'), restart = $('#restart');
let step = 0, data = {}, transcript = [], sending = false, sent = false, controller;
function requestId() {
  const bytes = new Uint8Array(16);
  if (typeof globalThis.crypto?.getRandomValues === 'function') globalThis.crypto.getRandomValues(bytes);
  else for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
}
function present(title, text, interactive = true) {
  const label = $('#question-label');
  const keyword = ['ajudar', 'atendimento', 'região', 'precisa', 'você', 'orçamento', 'pronto', 'vez'].find(word => title.includes(word));
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
  const location = question.key === 'location';
  $('#location-extra').hidden = !location;
  $('#neighborhood').required = location;
  $('#neighborhood').value = '';
  form.classList.toggle('location-form', location);
  $('#answer-label').textContent = location ? 'Cidade' : 'Seu nome';
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
  return `Nome: ${data.name}\nServiço: ${data.service}\nAmbiente: ${data.property}\nCidade: ${data.city}\nBairro: ${data.neighborhood}\nPreferência de prazo: ${data.urgency}`;
}
function whatsappLink() {
  const message = `Olá, ClimaPrime! Gostaria de solicitar um orçamento.\n\n${summary()}`;
  const link = document.createElement('a'); link.className = 'button';
  link.textContent = 'Continuar no WhatsApp ↗'; link.href = `https://wa.me/${CONECTA_CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
  link.target = '_blank'; link.rel = 'noopener noreferrer';
  actions.append(link);
}
function review() {
  form.hidden = true; actions.replaceChildren(); $('#progress').textContent = 'REVISE E CONFIRME';
  present('Vamos conferir seu orçamento?', summary());
  status.textContent = 'Ao confirmar, suas respostas serão enviadas ao responsável por esta demonstração. Depois, continue no WhatsApp com seu pedido pronto. O agendamento será combinado no atendimento.';
  button('Confirmar e enviar solicitação ↗', send);
  button('Corrigir minhas respostas', () => reset(), false);
}
async function send() {
  if (sending || sent) return;
  sending = true; restart.disabled = true;
  actions.querySelectorAll('button').forEach(element => element.disabled = true);
  status.textContent = 'Enviando suas respostas…'; controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(CONECTA_CONFIG.webhookUrl, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: controller.signal,
      body: JSON.stringify({ ...data, source: 'matheusgodoy.com', page: '/servicos/conecta7x7/climaprime/index.html', conecta: true, climaprime: true, company: 'ClimaPrime', transcript, consent: true, submittedAt: new Date().toISOString() }),
    });
    if (!response.ok) throw new Error('Solicitação recusada');
    sent = true; actions.replaceChildren(); $('#progress').textContent = 'PRÓXIMO PASSO · WHATSAPP';
    present('Seu pedido está pronto.', 'Recebemos suas respostas. Abra o WhatsApp para continuar o atendimento e combinar os detalhes do serviço. A solicitação não confirma agendamento.');
    whatsappLink();
    status.textContent = 'O site recebeu sua solicitação. O envio da mensagem no WhatsApp depende da sua confirmação no aplicativo.';
  } catch {
    actions.replaceChildren();
    present('Vamos tentar mais uma vez?', `Não consegui confirmar o recebimento no site. Suas respostas continuam aqui. Você pode tentar novamente ou continuar pelo WhatsApp.\n\n${summary()}`);
    button('Tentar enviar novamente ↗', send); whatsappLink();
    status.textContent = 'O recebimento pelo site ainda não foi confirmado.';
  } finally { clearTimeout(timeout); sending = false; restart.disabled = false; }
}
function reset(interactive = true) {
  if (sending) return;
  step = 0; sent = false; transcript = []; data = { requestId: requestId() };
  status.textContent = 'Você revisa o pedido antes de enviar. O agendamento será combinado no atendimento.';
  ask(interactive);
}
function answer(value) {
  if (step >= questions.length || sending) return;
  if (questions[step].key === 'location') {
    data.city = value.city; data.neighborhood = value.neighborhood;
    transcript.push({ role: 'user', content: value.city + ' / ' + value.neighborhood });
  } else {
    data[questions[step].key] = value; transcript.push({ role: 'user', content: value });
  }
  step++;
  if (step < questions.length) ask(); else review();
}
form.addEventListener('submit', event => {
  event.preventDefault();
  if (step >= questions.length || questions[step].options) return;
  const value = input.value.trim();
  if (!value || !form.reportValidity()) return;
  if (questions[step].key === 'location') {
    const neighborhood = $('#neighborhood').value.trim();
    if (!neighborhood) { $('#neighborhood').focus(); return; }
    answer({ city: value, neighborhood });
  } else answer(value);
});
restart.addEventListener('click', () => reset());
reset(false);
})();
