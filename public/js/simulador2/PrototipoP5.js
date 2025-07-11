// public/js/simulador2/prototipop5.js

window.initSimulador2 = async function () {
  const container = document.getElementById('simulador2');
  const html = await fetch('/simulador2/content.html').then(r => r.text());
  container.innerHTML = html;

  initBlockly();
  window.workspace = workspace;

  const dadosJSON = await fetch('/data/map.json').then(r => r.json());
  const mapa = {};
  dadosJSON.points.forEach(pt => mapa[pt.id] = pt);
  window.mapa = mapa;
  window.robo = null;

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
    const caixas = {};

    sketch.setup = () => {
      sketch.createCanvas(w, h).parent('mapa2');

      sketch.canvas.style.width = '100%';
      sketch.canvas.style.height = '100%';

      window.robo = new Robot("ST1", 30, "red", mapa, sketch, escala, offsetX, offsetY, dadosJSON);
      

      caixas[0] = new Caixa("azul", "A", sketch, escala, offsetX, offsetY);
      caixas[1] = new Caixa("verde", "B", sketch, escala, offsetX, offsetY);
      caixas[2] = new Caixa("vermelho", "C", sketch, escala, offsetX, offsetY);
      caixas[3] = new Caixa("azul", "D", sketch, escala, offsetX, offsetY);

      document.getElementById('btnExecutar')?.addEventListener('click', executarPrograma);
      document.getElementById('btnReset')?.addEventListener('click', () => sketch.clear());
      document.getElementById('btnguardar')?.addEventListener('click', guardarBlocos);
      document.getElementById('btnCarregar')?.addEventListener('click', carregarBlocos);
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

      
      window.robo.update();
      Object.values(caixas).forEach(c => c.update());
    };

    window.fitBoxX = x => x * escala + offsetX;
    window.fitBoxY = y => y * escala + offsetY;
  });
};
