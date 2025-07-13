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

function setupProfileModal() {
  const avatarBtn = document.getElementById('avatarBtn');
  const profileDropdown = document.getElementById('profileDropdown');
  const openProfileBtn = document.getElementById('openProfileBtn');
  const profileModal = document.getElementById('profileModal');
  const closeProfileModal = document.getElementById('closeProfileModal');
  const profileName = document.getElementById('profileName');
  const percursosList = document.getElementById('percursosList');
  const percursoContent = document.getElementById('percursoContent');
  const viewerWrapper = document.getElementById('viewerWrapper');

  if (!avatarBtn) return;

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
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(user => {
        profileName.textContent = user.name || user.username || 'Não definido';
      })
      .catch(() => {
        profileName.textContent = 'Erro ao carregar';
      });

    percursosList.innerHTML = '';
    percursoContent.textContent = '';
    viewerWrapper.classList.add('opacity-0', 'pointer-events-none');

    fetch('/api/percursos', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(percursos => {
        percursos.forEach(p => {
          const li = document.createElement('li');
          li.className = 'flex justify-between items-center bg-gray-50 dark:bg-gray-700 p-2 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600';

          const nameSpan = document.createElement('span');
          nameSpan.textContent = p.nome;
          li.appendChild(nameSpan);

          const btns = document.createElement('div');
          btns.className = 'flex gap-2';

          const deleteBtn = document.createElement('button');
          deleteBtn.textContent = '🗑️';
          deleteBtn.title = 'Apagar';  
          deleteBtn.className = 'text-red-500 hover:text-red-700';
          deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm(`Tens a certeza que queres apagar "${p.nome}"?`)) {
              fetch(`/api/percursos/${p._id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
              })
                .then(res => {
                  if (!res.ok) throw new Error('Erro ao apagar');
                  li.remove();
                  percursoContent.textContent = '';
                  viewerWrapper.classList.add('opacity-0', 'pointer-events-none');
                  alert('Apagado com sucesso!');
                })
                .catch(() => alert('Erro ao apagar percurso.'));
            }
          });

          const downloadBtn = document.createElement('button');
          downloadBtn.textContent = '⬇️';
          downloadBtn.title = 'Download';
          downloadBtn.className = 'text-blue-500 hover:text-blue-700';
          downloadBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            fetch(`/api/percursos/detalhes/${p._id}`, {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            })
              .then(res => res.json())
              .then(data => {
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${p.nome}.json`;
                a.click();
                URL.revokeObjectURL(url);
              })
              .catch(() => alert('Erro ao gerar download.'));
          });

          btns.appendChild(deleteBtn);
          btns.appendChild(downloadBtn);
          li.appendChild(btns);

          li.addEventListener('click', () => {
            fetch(`/api/percursos/detalhes/${p._id}`, {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            })
              .then(res => res.json())
              .then(data => {
                percursoContent.textContent = JSON.stringify(data, null, 2);
                viewerWrapper.classList.remove('opacity-0', 'pointer-events-none');
              })
              .catch(() => {
                percursoContent.textContent = 'Erro ao carregar percurso.';
                viewerWrapper.classList.remove('opacity-0', 'pointer-events-none');
              });
          });

          percursosList.appendChild(li);
        });
      })
      .catch(() => {
        percursosList.innerHTML = '<li>Erro ao carregar percursos.</li>';
      });
  });

  closeProfileModal.addEventListener('click', () => {
    profileModal.classList.add('hidden');
  });
}
