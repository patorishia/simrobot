///public/js/main.js

window.addEventListener('DOMContentLoaded', async () => {
  setupModal();
  setupProfileModal();
  setupThemeToggle('themeToggle','themeIcon','themeText');
  await initSimulador1();
  setupTabs();
  await initSimulador2();
});

