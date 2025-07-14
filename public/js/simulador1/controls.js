// public/js/simulador1/controls.js


// Guarda todos os logs únicos
const logsRegistrados = new Set();

// Função auxiliar de log
function adicionarLog(mensagem) {
  if (!logsRegistrados.has(mensagem)) {
    const logOutput = document.getElementById('logOutput');
    const timestamp = new Date().toLocaleTimeString();
    const linha = document.createElement('div');
    linha.textContent = `[${timestamp}] ${mensagem}`;
    logOutput.appendChild(linha);
    logOutput.scrollTop = logOutput.scrollHeight;

    console.log(mensagem);
    logsRegistrados.add(mensagem);
  }
}

// Expor no window para o sketch.js usar
window.criarInterfacePercurso = function (robo1, robo2, seletorRoboID, finalizarBtnId) {
  const percursoEscolhido = window.percursoEscolhido; // usa global
  const mapa = window.mapa;

  const seletorRobo = document.getElementById(seletorRoboID);
  const finalizarBtn = document.getElementById(finalizarBtnId);

  function criarDropdowns(roboKey, noInicialSelectId, percursoContainerId, robo) {
    const percursoContainer = document.getElementById(percursoContainerId);
    const noInicialSelect = document.getElementById(noInicialSelectId);

    const percurso = percursoEscolhido[roboKey];
    percurso.length = 0;
    percurso.push(robo.start);

    percursoContainer.innerHTML = '';
    noInicialSelect.innerHTML = '';

    const opt = document.createElement('option');
    opt.value = robo.start;
    opt.textContent = robo.start;
    noInicialSelect.appendChild(opt);

    function criarDropdownOpcoes(noAtual, index) {
      const dropdown = document.createElement('select');
      dropdown.id = `${percursoContainerId}_noDropdown_${index}`;

      const optVazia = document.createElement('option');
      optVazia.value = "";
      optVazia.textContent = "-- selecione --";
      dropdown.appendChild(optVazia);

      for (const ligado of mapa[noAtual].connects) {
        const opt = document.createElement('option');
        opt.value = ligado;
        opt.textContent = ligado;
        dropdown.appendChild(opt);
      }

      dropdown.addEventListener('change', () => {
        while (percursoContainer.children.length > index + 1) {
          percursoContainer.removeChild(percursoContainer.lastChild);
          percurso.pop();
        }

        const escolhido = dropdown.value;
        if (escolhido) {
          percurso[index + 1] = escolhido;
          criarDropdownOpcoes(escolhido, index + 1);
        }
      });

      percursoContainer.appendChild(dropdown);
    }

    criarDropdownOpcoes(robo.start, 0);
  }

  // Inicializa os dropdowns dos dois robôs
  criarDropdowns('robo1', 'noInicialRobo1', 'percursoContainerRobo1', robo1);
  criarDropdowns('robo2', 'noInicialRobo2', 'percursoContainerRobo2', robo2);

  finalizarBtn.addEventListener('click', () => {
    const selected = seletorRobo.value;

    if (selected === 'robo1' || selected === 'ambos') {
      if (percursoEscolhido.robo1.length >= 2) {
        robo1.reset();
        robo1.definirPercurso(percursoEscolhido.robo1);
        adicionarLog(`Robô 1 percurso definido: ${percursoEscolhido.robo1.join(' → ')}`);
      } else {
        alert("Robô 1 precisa de pelo menos dois nós.");
        return;
      }
    }

    if (selected === 'robo2' || selected === 'ambos') {
      if (percursoEscolhido.robo2.length >= 2) {
        robo2.reset();
        robo2.definirPercurso(percursoEscolhido.robo2);
        adicionarLog(`Robô 2 percurso definido: ${percursoEscolhido.robo2.join(' → ')}`);
      } else {
        alert("Robô 2 precisa de pelo menos dois nós.");
        return;
      }
    }
  });
};

// Expor função para download/upload
window.configurarUploadDownload = function () {
  const percursoEscolhido = window.percursoEscolhido;
  const mapa = window.mapa;

  document.getElementById('downloadPercurso').addEventListener('click', () => {
    const percurso = window.percursoEscolhido;
    const nome = window.percursoNome || "Percurso";
    const userName = window.userName || "Desconhecido";
    const distanciasPercorridas = {
      robo1: window.roboA?.distanciaPercorrida || 0,
      robo2: window.roboAC?.distanciaPercorrida || 0
    };

    if ((!percurso.robo1 || percurso.robo1.length < 2) &&
      (!percurso.robo2 || percurso.robo2.length < 2)) {
      alert("Defina pelo menos um percurso antes de fazer download.");
      return;
    }

    const ficheiro = {
      nome,
      userName,
      distanciasPercorridas,
      dados: {
        robo1: percurso.robo1,
        robo2: percurso.robo2
      }
    };



    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(ficheiro, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${nome}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  });


  document.getElementById('uploadPercurso').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
      try {
        const dados = JSON.parse(e.target.result);
        let robo1 = dados.robo1;
        let robo2 = dados.robo2;

        if (!robo1 || !robo2) {
          if (dados.dados) {
            robo1 = dados.dados.robo1;
            robo2 = dados.dados.robo2;
          }
        }


        if (!robo1 || !robo2) {
          alert("Arquivo JSON inválido.");
          return;
        }

        if (!Array.isArray(robo1) || !Array.isArray(robo2)) {
          alert("Formato inválido.");
          return;
        }


        percursoEscolhido.robo1 = robo1;
        percursoEscolhido.robo2 = robo2;

        if (window.roboA && percursoEscolhido.robo1.length > 0) {
          window.roboA.start = percursoEscolhido.robo1[0];
        }

        if (window.roboAC && percursoEscolhido.robo2.length > 0) {
          window.roboAC.start = percursoEscolhido.robo2[0];
        }




        window.percursoNome = dados.nome || "Percurso";


        window.distanciaRobo1 = dados.distanciasPercorridas?.robo1 || 0;
        window.distanciaRobo2 = dados.distanciasPercorridas?.robo2 || 0;

        if (window.roboA) window.roboA.distanciaPercorrida = window.distanciaRobo1;
        if (window.roboAC) window.roboAC.distanciaPercorrida = window.distanciaRobo2;





        function atualizarDropdowns(roboKey, percursoContainerId) {
          const percursoContainer = document.getElementById(percursoContainerId);
          percursoContainer.innerHTML = '';

          const percurso = percursoEscolhido[roboKey];
          if (!percurso || percurso.length < 1) return;

          percurso.forEach((no, index) => {
            const dropdown = document.createElement('select');
            dropdown.id = `${percursoContainerId}_noDropdown_${index}`;

            const optVazia = document.createElement('option');
            optVazia.value = "";
            optVazia.textContent = "-- selecione --";
            dropdown.appendChild(optVazia);

            let opcoes = [];
            if (index === 0) {
              opcoes = [no];
            } else {
              const anterior = percurso[index - 1];
              opcoes = mapa[anterior]?.connects || [];
            }

            opcoes.forEach(op => {
              const opt = document.createElement('option');
              opt.value = op;
              opt.textContent = op;
              dropdown.appendChild(opt);
            });

            dropdown.value = no;

            dropdown.addEventListener('change', () => {
              percursoEscolhido[roboKey] = percursoEscolhido[roboKey].slice(0, index);
              const escolhido = dropdown.value;
              if (escolhido) {
                percursoEscolhido[roboKey][index] = escolhido;
              }
              while (percursoContainer.children.length > index + 1) {
                percursoContainer.removeChild(percursoContainer.lastChild);
                percursoEscolhido[roboKey].pop();
              }
            });

            percursoContainer.appendChild(dropdown);
          });
        }

        atualizarDropdowns('robo1', 'percursoContainerRobo1');
        atualizarDropdowns('robo2', 'percursoContainerRobo2');

        alert("Percurso carregado com sucesso!");
        adicionarLog("Percurso carregado de ficheiro.");
      } catch (err) {
        alert("Erro ao ler JSON.");
        console.error(err);
      }
    };
    reader.readAsText(file);
  });
};

window.configurarVelocidade = function () {
  const velElem = document.getElementById('velocidade');
  if (velElem) {
    velElem.addEventListener('input', function (e) {
      const minSpeed = 1;
      const maxSpeed = 10;
      const sliderVal = parseInt(e.target.value);
      const novaVel = minSpeed + (sliderVal - 1) * (maxSpeed - minSpeed) / 9;
      window.roboA.speed = novaVel;
      window.roboAC.speed = novaVel;
    });
    velElem.dispatchEvent(new Event('input')); // Aplica a velocidade inicial
  }

};

// Expor log também (opcional)
window.adicionarLog = adicionarLog;


//Botao Guardar Percurso na Base de dados
document.getElementById('simulador1').addEventListener('click', (event) => {
  if (event.target && event.target.id === 'guardarPercursoDB') {
    const percurso = window.percursoEscolhido;
    const nome = prompt("Nome do percurso:", "Percurso 1");
    window.percursoNome = nome;


    if (!nome) {
      alert("Precisa dar um nome ao percurso!");
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      alert("Utilizador não autenticado");
      return;
    }

    fetch('/api/percursos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        nome,
        dados: percurso,
        distanciasPercorridas: {
          robo1: window.roboA?.distanciaPercorrida || 0,
          robo2: window.roboAC?.distanciaPercorrida || 0
        }
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          alert("Erro: " + data.error);
        } else {
          alert("Percurso guardado com sucesso!");
        }
      })
      .catch(err => {
        console.error(err);
        alert("Erro ao guardar percurso");
      });
  }
});


const token = localStorage.getItem('token');

if (token) {
  fetch('/api/user/me', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
    .then(res => res.json())
    .then(user => {
      window.userName = user.username || "Desconhecido";
      console.log("Utilizador autenticado:", window.userName);
    })
    .catch(err => {
      console.error("Erro ao buscar utilizador:", err);
    });
}

