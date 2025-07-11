///public/js/components/modal.js

//Modal Instruções
function setupModal() {
    const modal = document.getElementById('modalInstrucoes');
    const slider = document.getElementById('sliderInstrucoes');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const fecharBtn = document.getElementById('fecharInstrucoes');
    const btnInstrucoes = document.getElementById('btnInstrucoes');

    let currentSlide = 0;
    const totalSlides = slider ? slider.children.length : 0;

    if (!btnInstrucoes) return; // evita erro se botão não existir

    function updateSlider() {
        slider.style.transform = `translateX(-${currentSlide * 100}%)`;
        prevBtn.style.visibility = currentSlide === 0 ? 'hidden' : 'visible';
        nextBtn.style.visibility = currentSlide === totalSlides - 1 ? 'hidden' : 'visible';
    }

    btnInstrucoes.addEventListener('click', () => {
        modal.classList.remove('hidden');
        currentSlide = 0;
        updateSlider();
    });

    fecharBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    prevBtn.addEventListener('click', () => {
        if (currentSlide > 0) {
            currentSlide--;
            updateSlider();
        }
    });

    nextBtn.addEventListener('click', () => {
        if (currentSlide < totalSlides - 1) {
            currentSlide++;
            updateSlider();
        }
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
        }
    });
}


//Modal Perfil
function setupProfileModal() {
  const avatarBtn = document.getElementById('avatarBtn');
  const profileDropdown = document.getElementById('profileDropdown');
  const openProfileBtn = document.getElementById('openProfileBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const profileModal = document.getElementById('profileModal');
  const closeProfileModal = document.getElementById('closeProfileModal');
  const usernameDisplay = document.getElementById('usernameDisplay');
  const profileName = document.getElementById('profileName');
  const profileEmail = document.getElementById('profileEmail');
  const percursosList = document.getElementById('percursosList');

  if (!avatarBtn) return; // evita erros se o header não estiver

  avatarBtn.addEventListener('click', () => {
    profileDropdown.classList.toggle('hidden');
  });

  window.addEventListener('click', e => {
    if (!avatarBtn.contains(e.target) && !profileDropdown.contains(e.target)) {
      profileDropdown.classList.add('hidden');
    }
  });

  openProfileBtn.addEventListener('click', () => {
    profileDropdown.classList.add('hidden');
    profileModal.classList.remove('hidden');

    fetch('/api/user/me', {
      headers: { Authorization: `Bearer ${localStorage.getItem('simulador_token')}` }
    })
      .then(res => res.json())
      .then(user => {
        profileName.textContent = user.name || user.username || 'Não definido';
        profileEmail.textContent = user.email || 'Não definido';
        usernameDisplay.textContent = user.username || 'Utilizador';
      })
      .catch(() => {
        profileName.textContent = 'Erro ao carregar';
        profileEmail.textContent = 'Erro ao carregar';
      });

    fetch('/api/percursos', {
      headers: { Authorization: `Bearer ${localStorage.getItem('simulador_token')}` }
    })
      .then(res => res.json())
      .then(percursos => {
        percursosList.innerHTML = '';
        percursos.forEach(p => {
          const li = document.createElement('li');
          li.textContent = p.nome;
          percursosList.appendChild(li);
        });
      })
      .catch(() => {
        percursosList.innerHTML = '<li>Erro ao carregar percursos</li>';
      });
  });

  closeProfileModal.addEventListener('click', () => {
    profileModal.classList.add('hidden');
  });

  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('simulador_token');
    location.reload();
  });
}
