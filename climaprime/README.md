# ClimaPrime — demonstração do Captador 7x7

Landing page fictícia em HTML, CSS e JavaScript puro, pronta para hospedagem estática em `https://matheusgodoy.com/climaprime/`. Sem compilação, dependências, fontes externas ou serviços de formulário. A ilustração é SVG próprio, incluído no HTML.

## Arquivos

- `index.html`: página e ilustração.
- `styles.css`: visual responsivo e estados de foco.
- `script.js`: cinco etapas, validação, resumo, edição, cópia e WhatsApp.
- `config.js`: configuração opcional do WhatsApp.
- `favicon.svg`: ícone da página.

## Publicar no GitHub Pages existente

1. Abra o repositório que já publica `matheusgodoy.com`.
2. Identifique a pasta usada como origem pelo Pages em **Settings → Pages**. Em sites publicados por uma branch, costuma ser a raiz ou `docs/`. Em sites publicados por Actions, use o diretório de conteúdo estático copiado para o artefato final do site.
3. Copie a pasta `climaprime` inteira para dentro dessa origem. O resultado deve conter `climaprime/index.html`, `climaprime/styles.css`, `climaprime/script.js`, `climaprime/config.js` e `climaprime/favicon.svg`.
4. Não substitua o `index.html` principal, o `CNAME`, o workflow de publicação ou as configurações existentes do repositório. Não crie outro `CNAME` dentro de `climaprime`.
5. Faça commit e push pela rotina que você já usa. Isso pode disparar a publicação existente do Pages.
6. Após concluir a publicação, abra `https://matheusgodoy.com/climaprime/`. O endereço sem barra final deve ser redirecionado pelo host.

Todos os arquivos usam caminhos relativos (`./`), compatíveis com essa subpasta. O link no rodapé (`../`) retorna à página principal. Nenhum arquivo da página principal foi alterado por esta entrega. Nada foi publicado automaticamente.

## Configuração opcional do WhatsApp

O padrão é `whatsappNumber: ""` em `config.js`. Assim, o resultado mostra uma prévia copiável e **não cria um link de envio**. Uma configuração ausente ou fora do formato também mantém esse comportamento.

Se quiser experimentar com WhatsApp, preencha somente com um número que você controla ou tem autorização para usar em demonstração. Formato: código do país + DDD + número, apenas dígitos (sem `+`, espaços ou pontuação). O código faz apenas validação de formato; não confirma que o número existe ou tem WhatsApp.

Com um número válido, o botão abre `wa.me` em nova aba com a mensagem preenchida. O visitante ainda precisa confirmar o envio no WhatsApp. O número configurado é público, como todo arquivo estático.

## Experimentar localmente

Abra `index.html` no navegador ou, a partir da pasta que contém `climaprime`, execute:

```sh
python3 -m http.server 8000
```

Depois acesse `http://localhost:8000/climaprime/`.

A cópia automática depende das permissões do navegador e funciona melhor em HTTPS ou localhost. Se não estiver disponível, a página seleciona a mensagem e orienta a cópia manual.

## Conferência antes de compartilhar

- Experimente as três opções de serviço e os atalhos nos cards.
- Avance sem responder para conferir a validação.
- Preencha cidade, bairro, urgência e nome com dados fictícios.
- Use Voltar e Editar respostas para confirmar que os valores são preservados.
- Confira o resumo e a mensagem copiada.
- Sem número, confirme que não aparece botão de abrir WhatsApp.
- Se configurar um número autorizado, confira o destinatário e a mensagem na tela do WhatsApp, sem precisar enviar.
- Confira em celular e computador.

## Limites da demonstração

Não há backend, armazenamento local, analytics, envio de formulário, orçamento calculado, confirmação de cobertura ou agendamento. As respostas ficam somente na memória da página e são apagadas ao recarregar. Ao abrir o WhatsApp, os dados da mensagem passam a compor o endereço desse serviço; use dados fictícios nos testes.

A empresa é identificada como fictícia no topo, no formulário, no rodapé e na mensagem. Não há telefone, endereço, depoimentos ou certificações inventados. A página inclui `noindex, nofollow` para desencorajar indexação; isso não restringe acesso público.
