window.addEventListener('DOMContentLoaded', async () => {
  setupModal();
  setupProfileModal();
  setupThemeToggle('themeToggle', 'themeIcon', 'themeText');
  await initSimulador1();
  setupTabs();
  await initSimulador2();

  const token = localStorage.getItem('token');

  const loginBtn = document.getElementById('loginBtn');
  const registerBtn = document.getElementById('registerBtn');
  const avatarBtn = document.getElementById('avatarBtn');
  const usernameDisplay = document.getElementById('usernameDisplay');

  if (token) {
    console.log('Token encontrado:', token);

    // Esconde Login/Registar
    if (loginBtn) loginBtn.classList.add('hidden');
    if (registerBtn) registerBtn.classList.add('hidden');

    // Mostra avatar
    if (avatarBtn) avatarBtn.classList.remove('hidden');

    // Vai buscar nome
    fetch('/api/user/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(user => {
        console.log('User:', user);
        if (usernameDisplay) usernameDisplay.textContent = user.username || user.name || 'Utilizador';
      })
      .catch(err => console.error('Erro ao buscar utilizador:', err));
  } else {
    // Sem token = mostra Login/Registar
    if (loginBtn) loginBtn.classList.remove('hidden');
    if (registerBtn) registerBtn.classList.remove('hidden');
    if (avatarBtn) avatarBtn.classList.add('hidden');
  }
});
