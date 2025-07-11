document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = form.username.value.trim();
        const password = form.password.value;

        if (!username || !password) {
            alert('Por favor, preencha todos os campos.');
            return;
        }

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('username', data.username);
                alert('Login efetuado com sucesso!');
                window.location.href = '/index.html'; // página principal após login
            } else {
                alert('Erro no login: ' + (data.error || 'Credenciais inválidas.'));
            }
        } catch (err) {
            console.error('Erro no fetch:', err);
            alert('Erro ao comunicar com o servidor.');
        }
    });
});



