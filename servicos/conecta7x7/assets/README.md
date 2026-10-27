# Conecta 7x7 — demonstração independente

A página `../index.html` usa exclusivamente os assets desta pasta. Não depende do CSS, tema ou JavaScript da página principal.

- `conecta.css`: identidade visual, fontes, layout centralizado, animação de montagem dos depoimentos e responsividade.
- `conecta-flow.svg`: ilustração vetorial original do fluxo conversa → atendimento.
- `conecta.js`: perguntas, revisão, webhook e mensagem de WhatsApp.

O destino da demonstração é o WhatsApp de Matheus (`CONECTA_CONFIG.whatsappNumber`). Troque pelo número internacional do cliente ao adaptar. O webhook é o mesmo da página principal.

O POST JSON inclui `conecta: true`, `page: "/servicos/conecta7x7/index.html"`, `source`, `service`, `requestId`, `name`, `contact`, `employees`, `transcript`, `consent` e `submittedAt`. Ele só acontece após a confirmação. O cenário do Make pode usar `conecta` para distinguir esta origem. Deduplicar pelo `requestId` evita duplicatas em tentativas após falhas.

O botão Enviar e abrir WhatsApp inicia as duas ações no mesmo clique: abre o WhatsApp com as respostas preenchidas e envia o POST ao webhook. A abertura ocorre antes de aguardar a resposta HTTP, durante o gesto do usuário. O visitante confirma o envio no aplicativo; não há envio automático pela API do WhatsApp. Se o webhook falhar, a retentativa repete apenas o POST, preservando requestId e sem abrir outra conversa. Se o navegador bloquear a nova aba, é exibido um link de recuperação para abrir o WhatsApp. O fetch usa keepalive para permitir a conclusão quando a página vai para segundo plano.

Os depoimentos são exemplos explicitamente identificados como ilustrativos. Substitua por relatos reais autorizados antes de usá-los como prova social de clientes. A animação ocorre uma vez ao entrar na tela; movimento reduzido mostra o conteúdo sem animação.

As perguntas e respostas ficam em memória nesta aba, sem armazenamento persistente. O endpoint deve validar dados, tratar spam e habilitar CORS. O teste de integração usou respostas simuladas para evitar registros fictícios no Make.

O chat tem três perguntas: nome, contato (e-mail ou WhatsApp) e quantidade de funcionários, com as opções Apenas eu, De 2 a 5 e Mais de 5. O resumo e a mensagem de WhatsApp usam esses mesmos três campos.

O hero usa `demo.js` para simular a apresentação da empresa, as perguntas e a organização do atendimento em um loop de 10 segundos. Inicia ao entrar na tela e pausa ao sair ou ocultar a aba. Não exibe legenda, controles ou títulos das etapas. Movimento reduzido mostra uma visão final estática. É uma simulação local, sem chamadas ao webhook ou abertura do WhatsApp.
