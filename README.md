# matheusgodoy.com

Página estática em HTML, CSS e JavaScript, compatível com GitHub Pages. Sem compilação.

## Estrutura

- `index.html`: Porquê (hero), Como (mapeamento e transformação) e O Que (chat).
- `styles.css`: tema claro, tipografia, responsividade e animações com suporte a movimento reduzido.
- `conversation-v3.js`: conversa guiada, uma pergunta por vez, e envio opcional de contato. `app.js` mantém um carregador de compatibilidade.
- `assets/matheus-cutout.png`: retrato com fundo transparente.

## Configurar o envio

O webhook do Make já está configurado em `CHAT_CONFIG.webhookUrl`, no início de `conversation-v3.js`. Nenhum segredo deve ser colocado no frontend. Sem URL, a página informa que a captação está indisponível e oferece o WhatsApp, sem transmitir as respostas.

A conversa pede nome, e-mail e empresa/site, apresenta o Conecta 7x7 e mostra um resumo. O envio só ocorre ao clicar em **Confirmar e enviar**, após o aviso de uso dos dados. Não há armazenamento persistente nem envio por abandono da página.

O endpoint deve aceitar POST JSON, responder com status 2xx apenas após receber os dados e permitir CORS para `https://matheusgodoy.com` (incluindo o preflight OPTIONS). O corpo contém `requestId`, `source`, `service`, `name`, `email`, `company`, `transcript` (role/content), `consent` e `submittedAt`. Use `requestId` para deduplicar tentativas. O salvamento em planilha é responsabilidade do fluxo do webhook. Configure validação e proteção contra spam no servidor.

A descrição inicial do Conecta 7x7 está em `CHAT_CONFIG.serviceDescription`; confirme o escopo comercial antes de publicar. O nome/site não permite inferir o ramo automaticamente: o chat informa que essa descoberta será aprofundada na conversa com Matheus.

## Visualização

Sirva a pasta com um servidor HTTP local e abra `index.html`. Confira desktop, celular, navegação por teclado, movimento reduzido, reinício e o fluxo do chat. Teste o webhook com um endpoint de testes antes de habilitar a captação. As outras páginas e o CNAME foram preservados.
