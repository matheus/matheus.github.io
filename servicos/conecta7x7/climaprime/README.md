# ClimaPrime — demonstração Conecta 7x7

Página: `/servicos/conecta7x7/climaprime/index.html`.

Usa o modelo visual do Conecta via `assets/climaprime.css`, que importa o CSS base e aplica a identidade azul da climatização. A ilustração e o JavaScript são próprios desta demonstração. Conteúdo e perguntas foram adaptados de `/climaprime` sem alterar a versão original.

Perguntas: serviço (Instalação, Manutenção, Higienização), ambiente (Residencial, Comercial), cidade e bairro (na mesma etapa), preferência de prazo e nome. A preferência de prazo não confirma disponibilidade nem agendamento.

Após revisão e confirmação, envia ao mesmo webhook do Conecta com `conecta: true`, `climaprime: true`, `company: "ClimaPrime"` e `page: "/servicos/conecta7x7/climaprime/index.html"`. O payload inclui `requestId`, `name`, `service`, `property`, `city`, `neighborhood`, `urgency`, `transcript`, `consent` e `submittedAt`.

O destino do WhatsApp permanece o número de demonstração já configurado na página original: `5516982650942`. Altere `CONECTA_CONFIG.whatsappNumber` em `assets/climaprime.js` para o número autorizado da empresa antes de usar em produção. A pessoa confirma a mensagem no aplicativo; não há envio automático pela API do WhatsApp.

Depoimentos e personagens são explicitamente ilustrativos. Não representam experiências verificadas. A página mantém `noindex, nofollow` por ser uma demonstração.

Verificação realizada em 320, 375, 768 e 1440 pixels, com fluxo completo sem crypto, validação de cidade/bairro, movimento reduzido, reinício, payload, mensagem de WhatsApp e falha/retentativa/sucesso simulados no webhook. Nenhum registro fictício foi enviado ao Make.

O botão Enviar e abrir WhatsApp abre a mensagem e envia os dados ao webhook no mesmo clique, sem aguardar a resposta HTTP para abrir o aplicativo. Falhas no webhook permitem repetir apenas o registro, sem abrir outra conversa. Navegadores que bloqueiam a nova aba recebem um link de recuperação. O envio da mensagem é confirmado pelo visitante dentro do WhatsApp.

A ilustração do hero foi integrada como SVG inline e animada por `assets/climaprime.css`: fluxo de ar, partículas, indicador, luz ambiente, planta e etiquetas. `assets/climate-art.js` interrompe a animação fora da tela ou com aba oculta. Movimento reduzido mostra a cena estática. Os textos de apoio e avisos longos solicitados foram removidos; os cards ainda identificam os relatos como ilustrativos.
