# matheusgodoy.com

Site estático em HTML, CSS e JavaScript, compatível com GitHub Pages.

## Página principal

- `index.html`: Porquê (hero), Como (processo) e O Que (vitrine de serviços).
- `styles.css`: estrutura e animações.
- `theme-dark.css`: tema grafite/laranja, tipografia e catálogo.
- `app.js`: animações de entrada, respeitando movimento reduzido. A página principal não coleta nem envia dados.
- `assets/matheus-cutout.png`: retrato com transparência.

Para expandir a vitrine, adicione um novo `article.service-card` dentro de `.services-list`, com título, descrição, imagem e link para a página do serviço.

## Serviços

- `/servicos/conecta7x7/index.html`: apresentação, depoimentos ilustrativos, investimento e chat com três perguntas.
- `/servicos/conecta7x7/climaprime/index.html`: demonstração adaptada para climatização.

Os chats e configurações de webhook/WhatsApp pertencem às páginas de serviço. Consulte seus READMEs e assets locais. O chat do Conecta identifica a origem com `conecta: true`; a ClimaPrime inclui também `climaprime: true`.

## Visualização

Sirva a pasta por HTTP local. Confira desktop/celular, navegação por teclado e movimento reduzido. Os testes de chat em `tests/conecta-chat.cjs` usam webhook simulado. Não há publicação automática. O CNAME e as demais páginas foram preservados.
