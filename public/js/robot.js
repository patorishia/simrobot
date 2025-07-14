///public/js/robot.js

class Robot {
    constructor(start = "A", speed = 30, color = "red", mapa, p, escala, offsetX, offsetY, dadosJSON) {
        this.p = p;  // guardar a instância p5
        this.mapa = mapa;
        this.escala = escala;
        this.offsetX = offsetX;
        this.offsetY = offsetY;
        this.dadosJSON = dadosJSON;
        this.currIndex = 0;
        this.speed = speed;
        this.coordinates = {};
        this.graph = {};
        this.start = start;
        this.color = color;
        this.estadoAtual = "parado";
        this.distanciaPercorrida = 0;
        this.direction = 0;

        this.pos = this.p.createVector(this.mapa[start].x * this.escala + this.offsetX, this.mapa[start].y * this.escala + this.offsetY);
        this.lastPos = this.pos.copy();

        for (let point of this.dadosJSON.points) {
            this.coordinates[point.id] = { x: point.x, y: point.y };
            this.graph[point.id] = {};
        }

        for (let point of this.dadosJSON.points) {
            const id = point.id;
            for (let neighbor of point.connects) {
                const dx = this.coordinates[neighbor].x - this.coordinates[id].x;
                const dy = this.coordinates[neighbor].y - this.coordinates[id].y;
                const distance = Math.hypot(dx, dy);
                this.graph[id][neighbor] = distance;
                this.graph[neighbor][id] = distance;

                console.log(`${id} → ${neighbor}: dx=${dx}, dy=${dy}, distance=${distance}`);
            }
        }


        this.allShortestPaths = {};
        for (const node in this.graph) {
            this.allShortestPaths[node] = this.dijkstra(node);
        }

        this.path = null;
        this.target = null;
    }

    update() {
        if (this.path && this.currIndex < this.path.length - 1) {
            this.estadoAtual = "mover";
            let dir = this.p5VectorSub(this.target, this.pos);
            let distToTarget = dir.mag();

            if (distToTarget < this.speed) {
                this.pos = this.target.copy();
                if (this.currIndex < this.path.length - 1) {
                    let from = this.path[this.currIndex];
                    let to = this.path[this.currIndex + 1];
                    this.distanciaPercorrida += this.graph[from][to];
                }
                this.lastPos = this.pos.copy();

                this.currIndex++;
                adicionarLog(`${this.color === 'red' ? 'Robô 1' : 'Robô 2'} chegou ao nó ${this.path[this.currIndex]}`);

                if (this.currIndex < this.path.length - 1) {
                    let next = this.mapa[this.path[this.currIndex + 1]];
                    this.target = this.p.createVector(
                        next.x * this.escala + this.offsetX,
                        next.y * this.escala + this.offsetY
                    );
                    this.start = this.path[this.currIndex];
                } else {
                    this.start = this.path[this.currIndex];
                    this.path = null;
                    this.currIndex = 0;
                    this.estadoAtual = "parado";
                    adicionarLog(`${this.color === 'red' ? 'Robô 1' : 'Robô 2'} chegou ao destino final: ${this.start}`);
                }
            } else {
                dir.setMag(this.speed);
                this.pos.add(dir);
                this.lastPos = this.pos.copy();
            }


            if (dir.mag() > 0) {
                this.direction = this.p.degrees(dir.heading());
            }
        } else {
            this.estadoAtual = "parado";
        }

        // Desenhar robô
        this.p.push();
        this.p.translate(this.pos.x, this.pos.y);
        this.p.rotate(this.p.radians(this.direction));
        this.p.fill(this.color);
        this.p.ellipse(0, 0, 20);
        this.p.stroke(0);
        this.p.line(0, 0, 10, 0);
        this.p.pop();

        if (this.color === "red") {
            window.distanciaRobo1 = this.distanciaPercorrida;
        } else if (this.color === "blue") {
            window.distanciaRobo2 = this.distanciaPercorrida;
        }




    }


    dijkstra(startNode) {
        const distances = {};
        const previous = {};
        const queue = new Set(Object.keys(this.graph));

        for (const node of queue) {
            distances[node] = Infinity;
            previous[node] = null;
        }
        distances[startNode] = 0;

        while (queue.size > 0) {
            let currentNode = [...queue].reduce((a, b) => distances[a] < distances[b] ? a : b);
            queue.delete(currentNode);

            for (const neighbor in this.graph[currentNode]) {
                const alt = distances[currentNode] + this.graph[currentNode][neighbor];
                if (alt < distances[neighbor]) {
                    distances[neighbor] = alt;
                    previous[neighbor] = currentNode;
                }
            }
        }

        return { distances, previous };
    }

    reconstructPath(start, end, previous) {
        const path = [];
        let current = end;
        while (current !== null) {
            path.unshift(current);
            current = previous[current];
        }
        return path[0] === start ? path : [];
    }

    desenhoPath(end) {
        const result = this.allShortestPaths[this.start];
        this.path = this.reconstructPath(this.start, end, result.previous);

        console.log(`${this.start} to ${end}:`, this.path);
        console.log(`Distance: ${result.distances[end].toFixed(2)}`);

        this.pos = this.p.createVector(
            this.mapa[this.path[0]].x * this.escala + this.offsetX,
            this.mapa[this.path[0]].y * this.escala + this.offsetY
        );
        this.lastPos = this.pos.copy();

        if (this.path.length > 1) {
            let next = this.mapa[this.path[1]];
            this.target = this.p.createVector(next.x * this.escala + this.offsetX, next.y * this.escala + this.offsetY);
        } else {
            this.target = this.pos.copy();
        }

        this.currIndex = 0;
        this.estadoAtual = "mover";

        console.log("Pos inicial:", this.pos);
        console.log("Target inicial:", this.target);
        adicionarLog(`${this.color === 'red' ? 'Robô 1' : 'Robô 2'} vai de ${this.start} para ${end}. Caminho: ${this.path.join(' → ')}`);
    }

    reset() {
        this.pos = this.p.createVector(
            this.mapa[this.start].x * this.escala + this.offsetX,
            this.mapa[this.start].y * this.escala + this.offsetY
        );
        this.lastPos = this.pos.copy();
        this.path = null;
        this.currIndex = 0;
        this.estadoAtual = "parado";
        this.target = null;
    }

    async moveForward() {
        const neighbors = Object.keys(this.graph[this.start]);
        const currentPos = this.p.createVector(
            this.mapa[this.start].x * this.escala + this.offsetX,
            this.mapa[this.start].y * this.escala + this.offsetY
        );

        let chosenNeighbor = null;
        let smallestAngle = 90;
        let dirVec = this.p5VectorFromAngle(this.p.radians(this.direction));

        for (let neighbor of neighbors) {
            const neighborPos = this.coordinates[neighbor];
            const neighborPosScaled = this.p.createVector(
                neighborPos.x * this.escala + this.offsetX,
                neighborPos.y * this.escala + this.offsetY
            );
            const toNeighbor = this.p5VectorSub(neighborPosScaled, currentPos).normalize();
            let angle = this.p.degrees(dirVec.angleBetween(toNeighbor));
            if (Math.abs(angle) < smallestAngle) {
                smallestAngle = Math.abs(angle);
                chosenNeighbor = neighbor;
            }
        }

        if (!chosenNeighbor) {
            console.log("No target found");
            return;
        }

        const target = this.p.createVector(
            this.coordinates[chosenNeighbor].x * this.escala + this.offsetX,
            this.coordinates[chosenNeighbor].y * this.escala + this.offsetY
        );

        return new Promise(resolve => {
            const moveStep = () => {
                let dir = this.p5VectorSub(target, this.pos);
                if (dir.mag() < this.speed) {
                    this.pos = target.copy();
                    if (this.currIndex < this.path.length - 1) {
                        let from = this.path[this.currIndex];
                        let to = this.path[this.currIndex + 1];
                        this.distanciaPercorrida += this.graph[from][to];
                    }
                    this.lastPos = this.pos.copy();
                    this.start = chosenNeighbor;
                    this.currIndex = 0;
                    this.path = null;
                    resolve();
                    return;
                }
                dir.setMag(this.speed);
                this.pos.add(dir);
                setTimeout(moveStep, 20);
            };
            moveStep();
        });
    }

    async turnRight() {
        return this._turn(90);
    }

    async turnLeft() {
        return this._turn(-90);
    }

    async _turn(angleDelta) {
        return new Promise(resolve => {
            let targetDir = (this.direction + angleDelta + 360) % 360;

            const step = () => {
                let diff = angleDifference(this.direction, targetDir);

                if (Math.abs(diff) < 5) {
                    this.direction = targetDir;
                    resolve();
                    return;
                }

                let turnSpeed = 5;
                if (diff > 0) {
                    this.direction = (this.direction + turnSpeed) % 360;
                } else {
                    this.direction = (this.direction - turnSpeed + 360) % 360;
                }

                setTimeout(step, 20);
            };
            step();
        });
    }

    async moveBackward(steps) {
        return new Promise(resolve => {
            let distance = steps * 10;
            let target = this.p5VectorAdd(this.pos, this.p5VectorFromAngle(this.p.radians(this.direction + 180), distance));

            const moveStep = () => {
                let dir = this.p5VectorSub(target, this.pos);
                if (dir.mag() < this.speed) {
                    this.pos = target.copy();
                    if (this.currIndex < this.path.length - 1) {
                        let from = this.path[this.currIndex];
                        let to = this.path[this.currIndex + 1];
                        this.distanciaPercorrida += this.graph[from][to];
                    }
                    this.lastPos = this.pos.copy();

                    resolve();
                    return;
                }
                dir.setMag(this.speed);
                this.pos.add(dir);
                setTimeout(moveStep, 20);
            };
            moveStep();
        });
    }

    async pickUpBox() {
        console.log("Picked up box");
        return new Promise(resolve => setTimeout(resolve, 500));
    }

    async dropBox() {
        console.log("Dropped box");
        return new Promise(resolve => setTimeout(resolve, 500));
    }

    definirPercurso(percurso) {
        this.path = percurso;
        this.currIndex = 0;

        if (this.path.length > 1) {
            let next = mapa[this.path[1]];
            this.target = this.p.createVector(next.x * this.escala + this.offsetX, next.y * this.escala + this.offsetY);
        } else {
            this.target = this.pos.copy();
        }

        this.estadoAtual = "mover";
    }

    // Helpers para facilitar o uso do p5.Vector com this.p

    p5VectorSub(a, b) {
        return this.p5VectorCopy(a).sub(b);
    }

    p5VectorAdd(a, b) {
        return this.p5VectorCopy(a).add(b);
    }

    p5VectorCopy(v) {
        return this.p.createVector(v.x, v.y);
    }

    p5VectorFromAngle(angle, length = 1) {
        return this.p5VectorCopy(this.p5VectorZero()).setHeading(angle).setMag(length);
    }

    p5VectorZero() {
        return this.p.createVector(0, 0);
    }

    /**
 * Procura se na direção dada ("frente" / "direita" / "esquerda" / "tras") existe um nó vizinho.
 */
    pathFinder(direcaoDestino) {
        console.log("🚩 Dentro do pathFinder");
        console.log("start:", this.start);
        console.log("direction:", this.direction);
        console.log("direcaoDestino:", direcaoDestino);
        console.log("🚩 Bridges disponíveis:", this.mapa[this.start].connects);


        if (this.start == null) {
            console.warn("Robô passou dos limites do mapa");
            return undefined;
        }

        const neighbors = Object.keys(this.graph[this.start]);
        const current = this.p.createVector(
            this.mapa[this.start].x,
            this.mapa[this.start].y
        );

        let chosenNeighbor = null;
        let smallestAngle = 30; // tolerância em graus
        let dirVec;

        const dir = this.direction % 360;
        if (direcaoDestino === "frente") {
            if (dir === 0) dirVec = this.p.createVector(1, 0);
            else if (dir === 90) dirVec = this.p.createVector(0, 1);
            else if (dir === 180) dirVec = this.p.createVector(-1, 0);
            else if (dir === 270) dirVec = this.p.createVector(0, -1);
        } else if (direcaoDestino === "direita") {
            if (dir === 0) dirVec = this.p.createVector(0, 1);
            else if (dir === 90) dirVec = this.p.createVector(-1, 0);
            else if (dir === 180) dirVec = this.p.createVector(0, -1);
            else if (dir === 270) dirVec = this.p.createVector(1, 0);
        } else if (direcaoDestino === "esquerda") {
            if (dir === 0) dirVec = this.p.createVector(0, -1);
            else if (dir === 90) dirVec = this.p.createVector(1, 0);
            else if (dir === 180) dirVec = this.p.createVector(0, 1);
            else if (dir === 270) dirVec = this.p.createVector(-1, 0);
        } else if (direcaoDestino === "tras") {
            if (dir === 0) dirVec = this.p.createVector(-1, 0);
            else if (dir === 90) dirVec = this.p.createVector(0, -1);
            else if (dir === 180) dirVec = this.p.createVector(1, 0);
            else if (dir === 270) dirVec = this.p.createVector(0, 1);
        } else {
            console.warn("Direção inválida:", direcaoDestino);
            return undefined;
        }

        for (let nid of neighbors) {
            const np = this.coordinates[nid];
            const v = this.p.createVector(np.x - current.x, np.y - current.y).normalize();
            let ang = Math.abs(this.p.degrees(dirVec.angleBetween(v)));
            if (ang < smallestAngle) {
                smallestAngle = ang;
                chosenNeighbor = nid;
            }
        }

        return chosenNeighbor;
    }

}

function angleDifference(a, b) {
    let diff = (b - a + 180) % 360 - 180;
    return diff < -180 ? diff + 360 : diff;
}
