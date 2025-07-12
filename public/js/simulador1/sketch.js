///public/js/simulador1/sketch.js
window.initSimulador1 = async function () {
    let dadosJSON, mapa = {}, roboA, roboAC;
    let escala, offsetX, offsetY;
    const padding = 20, escalaReducao = 0.7;

    // 1) Carrega o content.html e injeta no container
    const container = document.getElementById('simulador1');
    const html = await (await fetch('/simulador1/content.html')).text();
    container.innerHTML = html;
    await new Promise(r => setTimeout(r, 0)); // garante DOM pronto

    // 2) JSON do mapa
    dadosJSON = await (await fetch('/data/map.json')).json();
    dadosJSON.points.forEach(pt => mapa[pt.id] = pt);

    // Expor mapa globalmente para os controls
    window.mapa = mapa;

    // Percurso global
    const percursoEscolhido = {
        robo1: [],
        robo2: []
    };
    window.percursoEscolhido = percursoEscolhido;

    // 3) Cria o sketch P5
    const sketch = p => {
        p.setup = () => {
            const wrapper = document.getElementById('mapa');
            const w = wrapper.clientWidth;
            const h = wrapper.clientHeight;

            p.createCanvas(w, h).parent('mapa');

            // Força o CSS a ocupar 100%
            p.canvas.style.width = '100%';
            p.canvas.style.height = '100%';


            // calcular escala/offset
            let xs = dadosJSON.points.map(pt => pt.x),
                ys = dadosJSON.points.map(pt => pt.y),
                minX = Math.min(...xs), maxX = Math.max(...xs),
                minY = Math.min(...ys), maxY = Math.max(...ys);
            const mapaW = maxX - minX, mapaH = maxY - minY;
            const sx = (w - 2 * padding) / mapaW;
            const sy = (h - 2 * padding) / mapaH;
            escala = Math.min(sx, sy) * escalaReducao;
            offsetX = -minX * escala + padding + (w - 2 * padding - mapaW * escala) / 2;
            offsetY = -minY * escala + padding + (h - 2 * padding - mapaH * escala) / 2;

            // criar robôs
            roboA = new Robot('A', 10, 'red', mapa, p, escala, offsetX, offsetY, dadosJSON);
            roboAC = new Robot('AC', 10, 'blue', mapa, p, escala, offsetX, offsetY, dadosJSON);
            window.roboA = roboA;
            window.roboAC = roboAC;

            roboA.reset();
            roboAC.reset();

            window.configurarVelocidade();

            // criar interface de percurso
            window.criarInterfacePercurso(roboA, roboAC, 'selecionarRobo', 'finalizarPercurso');
            window.configurarUploadDownload();


            if (window.setupControlesSimulador1) {
                window.setupControlesSimulador1(mapa, roboA, roboAC, percursoEscolhido, window.adicionarLog);
            }

            // botão de destino
            document.getElementById('executarDestino').addEventListener('click', () => {
                const dest = document.getElementById('inputDestino').value.trim().toUpperCase();
                const sel = document.getElementById('selecionarRobo').value;
                if (mapa[dest]) {
                    if (sel === 'robo1' || sel === 'ambos') roboA.desenhoPath(dest);
                    if (sel === 'robo2' || sel === 'ambos') roboAC.desenhoPath(dest);
                    window.adicionarLog?.(`Destino ${dest} enviado para ${sel}`);
                } else {
                    alert(`Destino inválido: ${dest}`);
                }
            });
        };

        p.draw = () => {
            p.background(220);

            // pontes
            p.stroke(180);
            dadosJSON.points.forEach(pt => {
                pt.bridges.forEach(b => {
                    const q = mapa[b];
                    if (!q) return;
                    p.line(fitX(pt.x), fitY(pt.y), fitX(q.x), fitY(q.y));
                });
            });

            // nós
            p.noStroke();
            p.fill(0);
            dadosJSON.points.forEach(pt => {
                p.ellipse(fitX(pt.x), fitY(pt.y), 7);
                p.textAlign(p.CENTER, p.BOTTOM);
                p.text(pt.id, fitX(pt.x), fitY(pt.y) - 10);
            });

            // robôs
            roboA.update();
            roboAC.update();

            updatePainelStatus(roboA, '1');
            updatePainelStatus(roboAC, '2');
        };

        p.windowResized = () => {
            const w = document.getElementById('mapa').clientWidth;
            const h = document.getElementById('mapa').clientHeight;
            p.resizeCanvas(w, h);

            // recalcula escala/offset
            let xs = dadosJSON.points.map(pt => pt.x),
                ys = dadosJSON.points.map(pt => pt.y),
                minX = Math.min(...xs), maxX = Math.max(...xs),
                minY = Math.min(...ys), maxY = Math.max(...ys);
            const mapaW = maxX - minX, mapaH = maxY - minY;
            const sx = (w - 2 * padding) / mapaW;
            const sy = (h - 2 * padding) / mapaH;
            escala = Math.min(sx, sy) * escalaReducao;
            offsetX = -minX * escala + padding + (w - 2 * padding - mapaW * escala) / 2;
            offsetY = -minY * escala + padding + (h - 2 * padding - mapaH * escala) / 2;
        };

        function fitX(x) { return x * escala + offsetX; }
        function fitY(y) { return y * escala + offsetY; }

        function updatePainelStatus(robo, id) {
            document.getElementById(`distancia${id}`).textContent = robo.distanciaPercorrida?.toFixed(2) ?? '0.00';
            document.getElementById(`estado${id}`).textContent = robo.estadoAtual ?? 'Parado';
            document.getElementById(`posicao${id}`).textContent = `(${robo.pos.x.toFixed(0)}, ${robo.pos.y.toFixed(0)})`;
            document.getElementById(`direcao${id}`).textContent = `${robo.direction.toFixed(0)}°`;
        }
    };

    new p5(sketch);
};
