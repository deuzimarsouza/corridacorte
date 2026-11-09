(() => {
  const byId = (id) => document.getElementById(id);
  const name = byId('name');
  const nameKey = 'meu-corre:nome';
  try {
    const saved = localStorage.getItem(nameKey);
    if (saved) {
      name.value = saved.slice(0, name.maxLength);
      name.dispatchEvent(new Event('input'));
    }
  } catch { /* O editor também funciona com armazenamento bloqueado. */ }
  name.addEventListener('input', () => {
    try {
      localStorage.setItem(nameKey, name.value.trim());
    } catch { /* A lembrança do nome é opcional. */ }
  });

  const help = byId('helpDialog');
  byId('helpButton').onclick = () => help.showModal();
  byId('closeHelp').onclick = byId('dismissHelp').onclick = () => help.close();

  const preview = byId('previewDialog');
  const stage = byId('previewStage');
  const home = byId('stageHome');
  const openPreview = () => {
    if (preview.open) return;
    home.style.minHeight = Math.ceil(stage.getBoundingClientRect().height) + 'px';
    byId('stageLarge').append(stage);
    preview.showModal();
  };
  byId('expandPreview').onclick = byId('mobilePreview').onclick = openPreview;
  byId('closePreview').onclick = () => preview.close();
  byId('returnToEditor').onclick = () => preview.close('editor');
  preview.addEventListener('close', () => {
    home.append(stage);
    home.style.removeProperty('min-height');
    if (preview.returnValue === 'editor') {
      const tab = document.querySelector('.tab[aria-selected="true"]');
      tab.focus({ preventScroll: true });
      byId('editor').scrollIntoView({ block: 'nearest' });
    }
    preview.returnValue = '';
  });
  for (const dialog of [help, preview]) {
    dialog.addEventListener('click', (event) => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right ||
          event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
    });
  }
})();
