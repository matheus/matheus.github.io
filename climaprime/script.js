(() => {
  'use strict';
  const form = document.querySelector('#qualification');
  const content = document.querySelector('#step-content');
  const error = document.querySelector('#error');
  const result = document.querySelector('#result');
  const answers = { service: '', property: '', city: '', neighborhood: '', urgency: '', name: '' };
  const steps = [
    { key: 'service', title: 'Como podemos ajudar?', hint: 'Escolha o serviço que você procura.', options: ['Instalação', 'Manutenção', 'Higienização'] },
    { key: 'property', title: 'Onde será o atendimento?', hint: 'Assim entendemos melhor o seu ambiente.', options: ['Residencial', 'Comercial'] },
    { key: 'location', title: 'Em qual região você está?', hint: 'Informe apenas cidade e bairro. Não precisamos do endereço completo.' },
    { key: 'urgency', title: 'Para quando você precisa?', hint: 'Essa preferência não confirma disponibilidade ou agendamento.', options: ['O quanto antes', 'Nos próximos dias', 'Estou apenas pesquisando'] },
    { key: 'name', title: 'Como podemos chamar você?', hint: 'Use um nome fictício para testar a demonstração.' }
  ];
  let step = 0;
  function render(focus = false) {
    form.hidden = false;
    result.hidden = true;
    error.textContent = '';
    const current = steps[step];
    content.replaceChildren();
    const fieldset = document.createElement('fieldset');
    const legend = document.createElement('legend');
    legend.textContent = current.title;
    fieldset.append(legend);
    const hint = document.createElement('p');
    hint.className = 'step-hint'; hint.id = 'step-hint'; hint.textContent = current.hint;
    fieldset.append(hint);
    if (current.options) {
      const group = document.createElement('div'); group.className = 'options';
      current.options.forEach((value, index) => {
        const label = document.createElement('label'); label.className = 'option';
        const input = document.createElement('input');
        input.type = 'radio'; input.name = current.key; input.value = value;
        input.checked = answers[current.key] === value; input.required = true;
        input.setAttribute('aria-describedby', 'step-hint'); input.id = `${current.key}-${index}`;
        label.append(input, document.createTextNode(value)); group.append(label);
      });
      fieldset.append(group);
    } else {
      const fields = current.key === 'location' ? [['city', 'Cidade', 'Ex.: Cidade Exemplo'], ['neighborhood', 'Bairro', 'Ex.: Centro']] : [['name', 'Seu nome', 'Ex.: Alex']];
      fields.forEach(([key, labelText, placeholder]) => {
        const label = document.createElement('label'); label.className = 'field-label'; label.htmlFor = key; label.textContent = labelText;
        const input = document.createElement('input'); input.type = 'text'; input.id = key; input.name = key;
        input.maxLength = 80; input.required = true; input.value = answers[key]; input.placeholder = placeholder;
        input.autocomplete = 'off'; input.setAttribute('aria-describedby', 'step-hint error');
        fieldset.append(label, input);
      });
    }
    content.append(fieldset);
    document.querySelector('#step-label').textContent = `PERGUNTA ${step + 1} DE 5`;
    document.querySelector('#progress-fill').style.width = `${(step + 1) * 20}%`;
    document.querySelector('#back').disabled = step === 0;
    document.querySelector('#next').textContent = step === 4 ? 'Conferir meu pedido →' : 'Continuar →';
    if (focus) { legend.tabIndex = -1; legend.focus(); }
  }
  function save() {
    const current = steps[step];
    if (current.options) answers[current.key] = form.querySelector('input:checked')?.value || '';
    else (current.key === 'location' ? ['city', 'neighborhood'] : ['name']).forEach(key => { answers[key] = form.elements[key].value.trim().replace(/\s+/g, ' '); });
  }
  function validate() {
    const current = steps[step];
    const keys = current.key === 'location' ? ['city', 'neighborhood'] : [current.key];
    const missing = keys.find(key => !answers[key]);
    if (!missing) return true;
    error.textContent = current.options ? 'Escolha uma opção para continuar.' : 'Preencha o campo indicado para continuar.';
    const input = current.options ? form.querySelector('input') : form.elements[missing];
    input.setAttribute('aria-invalid', 'true'); input.focus();
    return false;
  }
  function showResult() {
    form.hidden = true; result.hidden = false;
    const summary = document.querySelector('#summary'); summary.replaceChildren();
    const rows = [['Serviço', answers.service], ['Ambiente', answers.property], ['Cidade / bairro', `${answers.city} / ${answers.neighborhood}`], ['Urgência', answers.urgency], ['Nome', answers.name]];
    rows.forEach(([label, value]) => {
      const row = document.createElement('div'); const dt = document.createElement('dt'); const dd = document.createElement('dd');
      dt.textContent = label; dd.textContent = value; row.append(dt, dd); summary.append(row);
    });
    const message = `Olá! Estou testando a demonstração fictícia da ClimaPrime.\n\nMeu nome é ${answers.name}. Gostaria de solicitar um orçamento:\n• Serviço: ${answers.service}\n• Ambiente: ${answers.property}\n• Cidade: ${answers.city}\n• Bairro: ${answers.neighborhood}\n• Urgência: ${answers.urgency}\n\nEntendo que esta é uma demonstração, sem contratação ou agendamento real.`;
    document.querySelector('#message').value = message;
    const number = window.CLIMAPRIME_CONFIG?.whatsappNumber;
    const valid = typeof number === 'string' && /^[1-9]\d{7,14}$/.test(number);
    const link = document.querySelector('#whatsapp');
    link.hidden = !valid; link.removeAttribute('href');
    if (valid) link.href = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
    document.querySelector('#whatsapp-status').textContent = valid
      ? 'WhatsApp de demonstração configurado. O botão abre uma nova aba; você confirma o envio no aplicativo.'
      : 'Modo demonstração: nenhum WhatsApp válido foi configurado. Você pode copiar a mensagem abaixo, sem enviar.';
    document.querySelector('#copy-status').textContent = '';
    document.querySelector('#result-title').focus();
  }
  form.addEventListener('submit', event => {
    event.preventDefault(); save(); if (!validate()) return;
    if (step < 4) { step++; render(true); } else showResult();
  });
  document.querySelector('#back').addEventListener('click', () => { save(); if (step > 0) step--; render(true); });
  document.querySelector('#edit').addEventListener('click', () => { step = 0; render(true); });
  document.querySelectorAll('[data-service]').forEach(link => link.addEventListener('click', () => { answers.service = link.dataset.service; step = 0; render(); }));
  document.querySelector('#copy').addEventListener('click', async () => {
    const message = document.querySelector('#message');
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(message.value);
      document.querySelector('#copy-status').textContent = 'Mensagem copiada!';
    } catch {
      message.focus(); message.select();
      document.querySelector('#copy-status').textContent = 'Selecionei a mensagem. Use a opção Copiar do seu dispositivo ou Ctrl+C / ⌘C.';
    }
  });
  render();
})();
