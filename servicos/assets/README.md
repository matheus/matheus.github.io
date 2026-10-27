# Conecta 7x7 — demonstração independente

A página `../conecta.html` usa exclusivamente os assets desta pasta. Não depende do CSS, tema ou JavaScript da página principal.

- `conecta.css`: identidade visual, fontes, layout centralizado, animação de montagem dos depoimentos e responsividade.
- `conecta-flow.svg`: ilustração vetorial original do fluxo conversa → atendimento.
- `conecta.js`: perguntas, revisão, webhook e mensagem de WhatsApp.

O destino da demonstração é o WhatsApp de Matheus (`CONECTA_CONFIG.whatsappNumber`). Troque pelo número internacional do cliente ao adaptar. O webhook é o mesmo da página principal.

O POST JSON inclui `conecta: true`, `page: "/servicos/conecta.html"`, `source`, `service`, `requestId`, `name`, `contact`, `employees`, `transcript`, `consent` e `submittedAt`. Ele só acontece após a confirmação. O cenário do Make pode usar `conecta` para distinguir esta origem. Deduplicar pelo `requestId` evita duplicatas em tentativas após falhas.

Depois do recebimento HTTP 2xx, o visitante pode abrir o WhatsApp com todas as respostas preenchidas. Ele precisa confirmar o envio no aplicativo. A página não usa a API de envio automático do WhatsApp. Em caso de erro no webhook, permite tentar novamente ou continuar pelo WhatsApp, informando que o recebimento pelo site não foi confirmado.

Os depoimentos são exemplos explicitamente identificados como ilustrativos. Substitua por relatos reais autorizados antes de usá-los como prova social de clientes. A animação ocorre uma vez ao entrar na tela; movimento reduzido mostra o conteúdo sem animação.

As perguntas e respostas ficam em memória nesta aba, sem armazenamento persistente. O endpoint deve validar dados, tratar spam e habilitar CORS. O teste de integração usou respostas simuladas para evitar registros fictícios no Make.

O chat tem três perguntas: nome, contato (e-mail ou WhatsApp) e quantidade de funcionários, com as opções Apenas eu, De 2 a 5 e Mais de 5. O resumo e a mensagem de WhatsApp usam esses mesmos três campos.
