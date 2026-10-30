(() => {
  const byId = id => document.getElementById(id);
  const dialog = byId('installDialog');
  const install = byId('installButton');
  const platformButtons = [...document.querySelectorAll('[data-install-platform]')];
  const displayMode = matchMedia('(display-mode: standalone)');
  const ua = navigator.userAgent;
  const ios = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const detectedPlatform = ios ? 'ios' : /Android/.test(ua) ? 'android' : 'desktop';
  const embedded = /Instagram|FBAN|FBAV|; wv\)|\bWhatsApp\b|Line\//i.test(ua);
  const secure = window.isSecureContext && /^https?:$/.test(location.protocol);
  const standalone = () => displayMode.matches || navigator.standalone === true;
  let selectedPlatform = detectedPlatform;
  let deferredPrompt = null;
  let registration = null;
  let installing = false;
  let installed = standalone();
  let offlineReady = false;

  const guides = {
    ios: '<h3>No iPhone ou iPad</h3><ol><li>Abra o link do Meu Corre no <strong>Safari</strong>.</li><li>Toque em <strong>Compartilhar</strong> (quadrado com seta para cima). Em alguns layouts, essa opção fica no menu da página.</li><li>Escolha <strong>Adicionar à Tela de Início</strong>.</li><li>Se aparecer, mantenha <strong>Abrir como App da Web</strong> ativado e toque em <strong>Adicionar</strong>.</li></ol><p>Depois, abra pelo ícone Meu Corre na Tela de Início. Se a opção não aparecer, procure em Editar Ações no menu Compartilhar.</p>',
    android: '<h3>No Android</h3><ol><li>Abra o link no <strong>Chrome</strong> ou, em um Samsung, no <strong>Samsung Internet</strong>.</li><li>Use o botão <strong>Instalar agora</strong>, quando disponível, ou abra o menu do navegador.</li><li>Escolha <strong>Instalar aplicativo</strong> ou <strong>Adicionar à tela inicial</strong> e confirme.</li></ol><p>O ícone Meu Corre ficará na tela de aplicativos ou na tela inicial, conforme o navegador.</p>',
    desktop: '<h3>No computador</h3><ol><li>Abra o link no <strong>Chrome</strong> ou <strong>Microsoft Edge</strong>.</li><li>Use <strong>Instalar agora</strong>, quando disponível, ou o ícone de instalação na barra de endereço.</li><li>Confirme para abrir o Meu Corre em uma janela própria.</li></ol><p>No Safari do Mac (macOS Sonoma ou mais recente), use <strong>Arquivo → Adicionar ao Dock</strong>. Os nomes das opções podem variar.</p>'
  };

  function message(text) { byId('installFeedback').textContent = text; }

  function renderInstructions() {
    platformButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.installPlatform === selectedPlatform)));
    byId('installInstructions').innerHTML = guides[selectedPlatform];
    byId('nativeInstall').hidden = !deferredPrompt || selectedPlatform !== detectedPlatform || selectedPlatform === 'ios' || embedded || !secure || installed;
    byId('nativeInstall').disabled = installing;
    byId('nativeInstall').textContent = installing ? 'Aguardando confirmação…' : 'Instalar agora';
    const warning = byId('installWarning');
    warning.hidden = secure && !embedded;
    warning.textContent = !secure
      ? 'A instalação precisa do site publicado com HTTPS. Abra o link publicado; o arquivo index.html sozinho não pode ser instalado.'
      : 'Você está usando o navegador de outro aplicativo. Abra este link no Safari (iPhone) ou no Chrome (Android) para instalar.';
  }

  function installedState() {
    installed = installed || standalone();
    install.hidden = installed;
    byId('installCard').hidden = installed;
    if (installed) dialog.close();
  }

  function openInstall() {
    selectedPlatform = detectedPlatform;
    message('');
    renderInstructions();
    dialog.showModal();
  }

  install.onclick = openInstall;
  byId('installCardButton').onclick = openInstall;
  byId('closeInstall').onclick = byId('dismissInstall').onclick = () => dialog.close();
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const r = dialog.getBoundingClientRect();
    if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close();
  });
  platformButtons.forEach(button => {
    button.onclick = () => { selectedPlatform = button.dataset.installPlatform; message(''); renderInstructions(); };
  });

  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    deferredPrompt = event;
    renderInstructions();
  });
  byId('nativeInstall').onclick = async () => {
    if (!deferredPrompt || installing || installed) return;
    const prompt = deferredPrompt;
    deferredPrompt = null;
    installing = true;
    message('Confirme a instalação na janela do navegador.');
    renderInstructions();
    try {
      await prompt.prompt();
      const choice = await prompt.userChoice;
      if (!installed) message(choice.outcome === 'accepted'
        ? 'Solicitação aceita. O navegador vai concluir a instalação.'
        : 'Instalação cancelada. Você pode continuar usando o site ou instalar pelo menu do navegador.');
    } catch {
      message('O aviso de instalação não pôde ser aberto. Siga as etapas abaixo pelo menu do navegador.');
    } finally {
      installing = false;
      renderInstructions();
    }
  };
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    installed = true;
    message('Meu Corre instalado! Abra pelo ícone no seu dispositivo.');
    installedState();
  });
  displayMode.addEventListener('change', installedState);
  installedState();

  const address = byId('appAddress');
  address.value = /^https?:$/.test(location.protocol) ? new URL('./', location.href).href : '';
  byId('copyAppLink').disabled = !address.value;
  byId('copyAppLink').onclick = async () => {
    try {
      await navigator.clipboard.writeText(address.value);
      message('Link copiado. Cole no navegador do dispositivo em que deseja instalar.');
    } catch {
      address.focus();
      address.select();
      message('Selecione e copie o endereço acima para abrir em outro navegador.');
    }
  };

  function connection() {
    const status = byId('connectionStatus');
    status.hidden = navigator.onLine;
    status.textContent = offlineReady
      ? 'Você está offline. As molduras continuam disponíveis neste dispositivo.'
      : 'Sem conexão. A edição aberta pode continuar; evite fechar ou recarregar o app.';
  }
  window.addEventListener('online', connection);
  window.addEventListener('offline', connection);
  connection();
  const offlineStatus = byId('offlineStatus');
  if ('serviceWorker' in navigator && secure) {
    offlineStatus.textContent = 'Preparando o app para usar sem internet…';
    navigator.serviceWorker.register('./sw.js', { scope: './', updateViaCache: 'none' }).then(reg => {
      registration = reg;
      const offerUpdate = () => {
        if (reg.waiting && navigator.serviceWorker.controller) byId('updateNotice').hidden = false;
      };
      offerUpdate();
      reg.addEventListener('updatefound', () => {
        const worker = reg.installing;
        if (!worker) return;
        worker.addEventListener('statechange', () => {
          if (worker.state === 'installed') offerUpdate();
          if (worker.state === 'redundant' && !offlineReady) offlineStatus.textContent = 'O modo offline não ficou pronto. Abra novamente quando estiver conectado.';
        });
      });
      navigator.serviceWorker.ready.then(() => {
        offlineReady = true;
        offlineStatus.textContent = 'App pronto para usar sem internet neste dispositivo.';
        connection();
      });
    }).catch(() => {
      offlineStatus.textContent = 'O modo offline não está disponível neste navegador. Você pode usar o site online.';
    });
  } else {
    offlineStatus.textContent = 'Abra o site publicado em um navegador compatível para instalar e usar offline.';
  }
  byId('updateApp').onclick = () => {
    if (!registration?.waiting) return;
    navigator.serviceWorker.addEventListener('controllerchange', () => location.reload(), { once: true });
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
  };
})();
