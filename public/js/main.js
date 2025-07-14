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
    try {
      const res = await fetch('/api/user/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (!res.ok) {
        console.warn('Token inválido ou expirado:', data.error);
        localStorage.removeItem('token');
        localStorage.removeItem('username');

        // Mostra login/registar, esconde avatar
        loginBtn.classList.remove('hidden');
        registerBtn.classList.remove('hidden');
        avatarBtn.classList.add('hidden');
        return;
      }

      // Token válido: mostra avatar, esconde login/registar
      usernameDisplay.textContent = data.username;
      loginBtn.classList.add('hidden');
      registerBtn.classList.add('hidden');
      avatarBtn.classList.remove('hidden');

    } catch (err) {
      console.error('Erro ao verificar token:', err);
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      loginBtn.classList.remove('hidden');
      registerBtn.classList.remove('hidden');
      avatarBtn.classList.add('hidden');
    }

  } else {
    // Sem token: mostra login/registar
    loginBtn.classList.remove('hidden');
    registerBtn.classList.remove('hidden');
    avatarBtn.classList.add('hidden');
  }
});
