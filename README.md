# matheusgodoy.com

Site estático em HTML, CSS e JavaScript puro, compatível com GitHub Pages. Não requer instalação ou compilação.

## Visualizar localmente

Na pasta do projeto:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Abra http://localhost:8000. Encerre com Ctrl+C.

## Arquivos da página principal

- `index.html`: três seções, conteúdo, escopo, preço, CTA e metadados.
- `styles.css`: composição responsiva, tipografia e animações.
- `app.js`: WhatsApp, entradas progressivas, semana e demonstração ClimaPrime.
- `assets/matheus-godoy.webp`: retrato otimizado a partir de `avatar.jpg`.
- `CNAME`: domínio personalizado; preservar ao publicar.

O contato comercial está centralizado em `WHATSAPP_NUMBER` no início de `app.js`. O link em HTML também permite usar o CTA sem JavaScript; ao alterar o número ou a mensagem, atualizar esse fallback.

A demonstração inicia ao entrar na área visível, executa uma única vez e permite pausar e reiniciar. Ao sair da tela ou ocultar a aba, ela pausa. Com movimento reduzido, o visitante avança manualmente pelas etapas. A demonstração não abre WhatsApp nem envia dados.

## Conferência visual

- Conferir larguras de 320, 375, 768 e 1440 pixels e zoom de 200%.
- Navegar por Tab: pular para conteúdo, pausar, assistir novamente e CTA final.
- Verificar as seis cenas e o retorno à página inicial, incluindo pausa e replay.
- Ativar movimento reduzido e avançar pelas etapas manualmente.
- Conferir a mensagem no WhatsApp sem enviá-la.

As páginas independentes e os favicons existentes foram preservados. Nenhuma publicação automática faz parte da implementação.
