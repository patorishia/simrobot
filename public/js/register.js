document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registerForm');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = form.username.value.trim();
    const password = form.password.value;

    if (!username || !password) {
      alert('Por favor, preencha todos os campos.');
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Utilizador criado com sucesso! Agora pode fazer login.');
        window.location.href = '/login';  // redireciona para a página de login
      } else {
        alert('Erro no registo: ' + (data.error || 'Ocorreu um erro.'));
      }
    } catch (err) {
      console.error('Erro no fetch:', err);
      alert('Erro ao comunicar com o servidor.');
    }
  });
});