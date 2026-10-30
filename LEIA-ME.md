# Meu Corre — Corrida Corte 2026

Aplicativo de molduras para fotos, em HTML, CSS e JavaScript, sem dependências de instalação.

## Usar e instalar

1. Acesse o site publicado usando HTTPS.
2. Clique em **Instalar app** e siga as orientações exibidas.
3. A tela sugere seu dispositivo. Você também pode escolher **Android**, **iPhone / iPad** ou **Computador** para consultar outro passo a passo.

- **Android:** Chrome ou Samsung Internet → Instalar agora (quando disponível), ou menu do navegador → Instalar aplicativo / Adicionar à tela inicial → confirmar.
- **iPhone / iPad:** Safari → Compartilhar → Adicionar à Tela de Início → manter Abrir como App da Web ativado, se a opção aparecer → Adicionar. Em alguns layouts, Compartilhar fica no menu da página. Não há aviso automático de instalação como no Android.
- **Windows / Linux / Mac:** Chrome ou Edge → Instalar agora ou ícone de instalação na barra de endereço → confirmar. No Safari do Mac (macOS Sonoma ou posterior), Arquivo → Adicionar ao Dock.

Se abrir dentro do Instagram, WhatsApp ou outro app, copie o link e abra no navegador recomendado. O botão **Copiar link** ajuda a usar o mesmo endereço em outro dispositivo. A aparência e os nomes dos menus variam com a versão do navegador.

O link hospedado pelo projeto segue com acesso privado e exige uma conta autorizada. A instalação não altera a permissão de acesso. O ZIP pode ser hospedado em outro serviço HTTPS, como o GitHub Pages; esta versão não envia fotos a um servidor.

A instalação depende do navegador e deve ser confirmada pelo usuário. Abrir `index.html` diretamente não permite instalar a PWA. Para testes no computador, sirva a pasta com `python -m http.server 8000` e abra `http://localhost:8000`.

## Fotos e molduras

Escolha a foto, ajuste o enquadramento, selecione uma moldura e salve em PNG 1080 × 1080. O nome é opcional. A moldura Meu Pace aceita minutos e segundos (05:30).

São 7 molduras. As 3 de pré-evento funcionam até 28/11/2026 às 23h59:59, horário de Brasília. Em 29/11/2026 às 00h, elas são bloqueadas e as 4 de pós-evento são liberadas. A regra usa o relógio do dispositivo, não é uma restrição protegida no servidor.

As fotos são processadas localmente. O app não armazena as fotos entre sessões; salve a imagem antes de fechar ou atualizar. Depois de aparecer **App pronto para usar sem internet neste dispositivo**, a interface e as molduras ficam disponíveis offline. O navegador pode remover o cache para liberar espaço.

## Publicar o ZIP

Extraia os arquivos e publique todo o conteúdo, mantendo a pasta `icons`, em uma hospedagem estática HTTPS. Não requer Node.js ou build. Os caminhos relativos também funcionam em subpastas, como no GitHub Pages.

O manifesto é `manifest.webmanifest`, a instalação é controlada por `pwa.js` e o cache por `sw.js`. Ao publicar novas alterações, troque a versão da constante CACHE em `sw.js`. A atualização fica aguardando confirmação no app para não descartar a foto durante a edição. O cache guarda somente recursos do app: páginas de autenticação, fotos escolhidas e requisições externas não entram no cache. Cada versão usa seu próprio conjunto de arquivos.

## Verificações desta versão

Os testes automatizados cobrem manifesto e recursos, as datas das sete molduras, cache offline, preservação de páginas de autenticação, separação de versões, orientação para iPhone/iPad, aceitação/cancelamento/falha do aviso de instalação e navegadores embutidos. A interface foi conferida no navegador com larguras de computador e celular. A instalação no sistema de aparelhos físicos Android/iOS/Windows não foi executada neste ambiente.

Para executar os testes no repositório: `node --test tests/pwa.test.cjs`.

Referências técnicas: [instalação de PWAs (MDN)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable), [web apps no iPhone (Apple)](https://support.apple.com/guide/iphone/iphea86e5236/ios).
