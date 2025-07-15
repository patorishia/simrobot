// public/js/simulador2/prototipop5.js

window.initSimulador2 = async function () {
  const container = document.getElementById('simulador2');
  const html = await fetch('/simulador2/content.html').then(r => r.text());
  container.innerHTML = html;

  /*initBlockly();
  window.workspace = workspace;*/

  initTabs();

  const dadosJSON = await fetch('/data/map.json').then(r => r.json());
  const mapa = {};
  dadosJSON.points.forEach(pt => mapa[pt.id] = pt);
  window.mapa = mapa;
  window.robo = null;
  let dificuldade = 3;
  let caixas = {};
  let roboList = {};
  let blocklyList = {};

  const wrapper = document.getElementById('mapa2');
  const w = wrapper.clientWidth;
  const h = wrapper.clientHeight;

  const padding = 20;
  const escalaReducao = 0.7;

  let xs = dadosJSON.points.map(pt => pt.x);
  let ys = dadosJSON.points.map(pt => pt.y);
  let minX = Math.min(...xs), maxX = Math.max(...xs);
  let minY = Math.min(...ys), maxY = Math.max(...ys);

  const mapaW = maxX - minX;
  const mapaH = maxY - minY;

  const sx = (w - 2 * padding) / mapaW;
  const sy = (h - 2 * padding) / mapaH;

  const escala = Math.min(sx, sy) * escalaReducao;
  const offsetX = -minX * escala + padding + (w - 2 * padding - mapaW * escala) / 2;
  const offsetY = -minY * escala + padding + (h - 2 * padding - mapaH * escala) / 2;

  new p5(sketch => {

    sketch.setup = () => {
      sketch.createCanvas(w, h).parent('mapa2');

      sketch.canvas.style.width = '100%';
      sketch.canvas.style.height = '100%';

      sketch.comecarJogo();

      blocklyList[0] = new blockly_logic("nomeFile1");
      blocklyList[0].initBlockly('toolbox1', 'blocklyDiv1', roboList[0]);
      blocklyList[1] = new blockly_logic("nomeFile2");
      blocklyList[1].initBlockly('toolbox2', 'blocklyDiv2', roboList[1]);
      /*caixas[0] = new Caixa("azul", "A", sketch, escala, offsetX, offsetY);
      caixas[1] = new Caixa("verde", "B", sketch, escala, offsetX, offsetY);
      caixas[2] = new Caixa("vermelho", "C", sketch, escala, offsetX, offsetY);
      caixas[3] = new Caixa("azul", "D", sketch, escala, offsetX, offsetY);*/

      document.getElementById('btnExecutar').addEventListener('click', () => {
        for (var i = 0; i < Object.keys(blocklyList).length; i++) {
          blocklyList[i].executarPrograma();
        }
      });
      //botoes de salvar blockly
      document.getElementById('btnSalvar1').addEventListener('click', () => {
        blocklyList[0].salvarBlocos()
      });
      document.getElementById('btnSalvar2').addEventListener('click', () => {
        blocklyList[1].salvarBlocos()
      });
      //botoes de carregar blockly
      document.getElementById('btnCarregar1').addEventListener('click', () => {
        blocklyList[0].carregarBlocos("inputJSON1")
      });
      document.getElementById('btnCarregar2').addEventListener('click', () => {
        blocklyList[1].carregarBlocos("inputJSON2")
      });
      document.getElementById('btnReset').addEventListener('click', () => sketch.recomecarJogo());

      document.querySelectorAll('input[name="dificuldade"]').forEach(radio => {
        radio.addEventListener('change', () => {
          if (radio.checked == true) {
            dificuldade = radio.value;
            sketch.recomecarJogo();
          }
        });
      });
    };

    sketch.draw = () => {
      sketch.background(220);

      sketch.stroke(180);
      dadosJSON.points.forEach(pt => {
        pt.bridges.forEach(b => {
          const a = mapa[pt.id], target = mapa[b];
          sketch.line(
            fitBoxX(a.x), fitBoxY(a.y),
            fitBoxX(target.x), fitBoxY(target.y)
          );
        });
      });

      sketch.fill(0);
      sketch.noStroke();
      dadosJSON.points.forEach(pt => {
        sketch.ellipse(fitBoxX(pt.x), fitBoxY(pt.y), 7);
        sketch.textAlign(sketch.CENTER, sketch.BOTTOM);
        sketch.text(pt.id, fitBoxX(pt.x), fitBoxY(pt.y) - 10);
      });


      //window.robo.update();
      Object.values(roboList).forEach(r => r.update());
      Object.values(caixas).forEach(c => c.update());
    };

    sketch.comecarJogo = () => {
      if (dificuldade == 3) {
        //Caixas: 2 azuis, 1 verde e 1 vermelha
        caixas[0] = new Caixa("azul", "A", sketch, escala, offsetX, offsetY);
        caixas[1] = new Caixa("verde", "B", sketch, escala, offsetX, offsetY);
        caixas[2] = new Caixa("vermelho", "C", sketch, escala, offsetX, offsetY);
        caixas[3] = new Caixa("azul", "D", sketch, escala, offsetX, offsetY);
      } else if (dificuldade == 2) {
        //Caixas: 2 azuis e 2 verdes
        caixas[0] = new Caixa("azul", "A", sketch, escala, offsetX, offsetY);
        caixas[1] = new Caixa("verde", "B", sketch, escala, offsetX, offsetY);
        caixas[2] = new Caixa("verde", "C", sketch, escala, offsetX, offsetY);
        caixas[3] = new Caixa("azul", "D", sketch, escala, offsetX, offsetY);
      } else {
        //Caixas: 4 azuis
        caixas[0] = new Caixa("azul", "A", sketch, escala, offsetX, offsetY);
        caixas[1] = new Caixa("azul", "B", sketch, escala, offsetX, offsetY);
        caixas[2] = new Caixa("azul", "C", sketch, escala, offsetX, offsetY);
        caixas[3] = new Caixa("azul", "D", sketch, escala, offsetX, offsetY);
      }

      roboList[0] = new Robots("ST1", "vermelho", 0, sketch, escala, offsetX, offsetY, dadosJSON, caixas);
      roboList[1] = new Robots("ST2", "azul", 180, sketch, escala, offsetX, offsetY, dadosJSON, caixas);


    }

    sketch.recomecarJogo = () => {
      sketch.comecarJogo();

      blocklyList[0].updateRobo(roboList[0]);
      blocklyList[1].updateRobo(roboList[1]);
    }

    window.fitBoxX = x => x * escala + offsetX;
    window.fitBoxY = y => y * escala + offsetY;
  });


  function initTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.tab-content');

    function activateTab(tab) {
      tabs.forEach(t => {
        t.classList.remove('border-blue-600', 'text-blue-600', 'dark:text-blue-500');
        t.classList.add('text-gray-600', 'dark:text-gray-400', 'border-transparent');
      });
      contents.forEach(c => c.classList.add('hidden'));

      tab.classList.add('border-blue-600', 'text-blue-600', 'dark:text-blue-500');
      tab.classList.remove('text-gray-600', 'dark:text-gray-400', 'border-transparent');

      const tabId = tab.dataset.tab;
      const activeContent = document.getElementById(tabId);
      if (activeContent) activeContent.classList.remove('hidden');
    }

    tabs.forEach(tab => {
      tab.addEventListener('click', () => activateTab(tab));
    });

    if (tabs.length > 0) activateTab(tabs[0]);
  }

};
