// public/js/simulador2/Robots.js

class Robots {
    /**
    * @param {string} cor        — cor do robô ("vermelho" para 1, "azul" para 2)
    * @param {string} startPoint — id do nó inicial
    * @param {object} p          — instância p5
    * @param {object} dir        — direção a que o robô aponta
    * @param {number} escala     — mesma escala do Robot
    * @param {number} offsetX    — mesmo offset X
    * @param {number} offsetY    — mesmo offset Y
    * @param {object} dadosJSON  — dados do mapa em formato JSON
    * @param {object} caixas     — caixas do jogo
    */
    constructor(startPoint,cor,dir,p,escala, offsetX, offsetY,dadosJSON,caixas) {
        this.currIndex = 0;
        this.speed = 30;
        this.dadosJSON = dadosJSON;
        this.caixas = caixas;
        this.p = p;
        this.escala = escala;
        this.offsetX = offsetX;
        this.offsetY = offsetY;
        this.startPoint = startPoint;
        this.coordinates = {};
        this.graph = {};
        this.start = startPoint;
        this.pos = null;
        this.cor = cor;

        // Posição inicial e direção (0 graus = para a direita)
        this.pos = this.p.createVector(mapa[this.start].x, mapa[this.start].y);
        this.direction = dir; // graus
        this.moving = false;

        // Verificar se Robo tem caixa a segurar
        this.hasCaixa = null;
        this.touchCaixa = false;
        
        //Escrever os dados do mapa
        for (let i = 0; i < this.dadosJSON.points.length; i++) {
            const point = this.dadosJSON.points[i];
            this.coordinates[point.id] = { x: point.x, y: point.y };
            this.graph[point.id] = {};
        }
        
        for (let i = 0; i < this.dadosJSON.points.length; i++) {
            const point = this.dadosJSON.points[i];
            const id = point.id;
            const connects = point.connects;
            for (let j = 0; j < connects.length; j++) {
                const neighbor = connects[j];
                const dx = this.coordinates[neighbor].x - this.coordinates[id].x;
                const dy = this.coordinates[neighbor].y - this.coordinates[id].y;
                const distance = Math.hypot(dx, dy);
                this.graph[id][neighbor] = distance;
            }
        }
        this.path = null;
    }

    update() {
        if (this.pos == null) {
            this.pos = this.p.createVector(this.start.x, this.start.y);
        }

        // Desenhar o robo atualizado
        this.p.push();
        this.p.translate(this.fitBoxX(this.pos.x), this.fitBoxY(this.pos.y));  // Usar exatamente a posição do robo
        this.p.rotate(this.p.radians(this.direction));
        if(this.cor=="vermelho"){
            this.p.fill(255, 0, 0);
        }else{
            this.p.fill(0, 0, 255);
        }
        this.p.ellipse(0, 0, 20);
        this.p.stroke(0);
        this.p.line(0, 0, 10, 0); // indicador de direção
        this.p.pop();
    }

    // Resetar posição e direção do robo
    reset() {
        if(this.start!=null && this.touchCaixa == false){
            this.pos = this.p.createVector(mapa[this.start].x, mapa[this.start].y);
        }else if(this.start!=null && this.touchCaixa == true){
            switch (this.direction){
                case 0:
                    this.pos = this.p.createVector(mapa[this.start].x-500, mapa[this.start].y);
                    break;
            
                case 90:
                    this.pos = this.p.createVector(mapa[this.start].x, mapa[this.start].y-500);
                    break;

                case 180:
                    this.pos = this.p.createVector(mapa[this.start].x+500, mapa[this.start].y);
                    break;

                case 270:
                    this.pos = this.p.createVector(mapa[this.start].x, mapa[this.start].y+500);
                    break;
            }
        }
        //this.direction = 0;
        this.moving = false;
    }

    //Funcao para repor robo a posicao inicial
    hardReset(){
        this.pos = this.p.createVector(mapa[this.startPoint].x, mapa[this.startPoint].y);
        this.direction = 0;
        this.moving = false;
    }

    // Mover o robo para a frente em "steps" (passos)
    async moveForward(chosenNeighbor) {
        var targetCoords;
        var target;
        var offTracks = false;
        for (var i=0; i<Object.keys(this.caixas).length; i++){
            if(this.caixas[i].start == chosenNeighbor){     
                this.touchCaixa = true;
            }
        }

        if(chosenNeighbor===undefined){
            offTracks = true;
            switch (this.direction){
                case 0:
                    targetCoords = this.p.createVector(mapa[this.start].x+25, mapa[this.start].y);
                    break;
            
                case 90:
                    targetCoords = this.p.createVector(mapa[this.start].x, mapa[this.start].y+25);
                    break;

                case 180:
                    targetCoords = this.p.createVector(mapa[this.start].x-25, mapa[this.start].y);
                    break;

                case 270:
                    targetCoords = this.p.createVector(mapa[this.start].x, mapa[this.start].y-25);
                    break;
            }
            var target = this.p.createVector(targetCoords.x, targetCoords.y);
        }else{
            targetCoords = this.coordinates[chosenNeighbor];
            //Caso encontre uma caixa a sua frente
            if(this.touchCaixa==true){
                for (var i=0; i<Object.keys(this.caixas).length; i++){
                    if(this.caixas[i].start == chosenNeighbor){
                        switch (this.direction){
                            case 0:
                                target = this.p.createVector(targetCoords.x-500, targetCoords.y);
                                break;
            
                            case 90:
                                target = this.p.createVector(targetCoords.x, targetCoords.y-500);
                                break;

                            case 180:
                                target = this.p.createVector(targetCoords.x+500, targetCoords.y);
                                break;

                            case 270:
                                target = this.p.createVector(targetCoords.x, targetCoords.y+500);
                                break;
                        }
                        
                    }
                }
            }else{
                target = this.p.createVector(targetCoords.x, targetCoords.y);
            }
        }
        
        return new Promise(resolve => {
            // Função para mover passo a passo até alcançar o destino
            const moveStep = () => {
                let dir = this.p5VectorSub(target, this.pos);
                
                if(offTracks!=false){
                    //Caso o robo saia das linhas de guia
                    for (let pt of this.dadosJSON.points) {
                        for (let bridge of pt.connects) {
                            let ptFinal = mapa[bridge];
                            let dxCheck = ptFinal.x - pt.x;
                            let dyCheck = ptFinal.y - pt.y;

                            //Incrementa a distancia do robo a andar ate encontrar um objeto
                            if(dir.mag() < this.speed){
                                console.log("extender")
                                switch (this.direction){
                                    case 0:
                                        targetCoords = this.p.createVector(target.x+25, target.y);
                                        break;
            
                                    case 90:
                                        targetCoords = this.p.createVector(target.x, target.y+25);
                                        break;

                                    case 180:
                                        targetCoords = this.p.createVector(target.x-25, target.y);
                                        break;

                                    case 270:
                                        targetCoords = this.p.createVector(target.x, target.y-25);
                                        break;
                                }
                                target =  targetCoords;
                            }

                            //Caso o robo deteta uma linha, para de incrementar a distancia
                            if(this.pos.x <= ptFinal.x && this.pos.x >= pt.x
                                && this.pos.y <= ptFinal.y && this.pos.y >= pt.y && pt.id != this.start
                            ){
                                if(this.pos.x == ptFinal.x && this.pos.y == ptFinal.y){
                                    offTracks = false;
                                    chosenNeighbor = ptFinal.id;
                                    target = this.p.createVector(ptFinal.x, ptFinal.y);
                                }else if(this.pos.x == pt.x && this.pos.y == pt.y && this.start!=pt.id){
                                    offTracks = false;
                                    chosenNeighbor = pt.id;
                                    target = this.p.createVector(pt.x, pt.y);
                                }else{
                                    if(this.pos.x <= pt.x+dxCheck/2 && this.pos.y <= pt.y+dyCheck/2){
                                        offTracks = false;
                                        chosenNeighbor = pt.id;
                                        target = this.p.createVector(pt.x, pt.y);
                                    }else if(this.pos.x > pt.x+dxCheck/2 && this.pos.y > pt.y+dyCheck/2){
                                        offTracks = false;
                                        chosenNeighbor = ptFinal.id;
                                        target = this.p.createVector(ptFinal.x, ptFinal.y);
                                    }
                                }
                                this.currIndex = 0;
                                this.path = null;
                            }
                        }
                    }
                }else{
                    
                    //Caso nao saia
                    if (dir.mag() < this.speed) {
                        console.log("stop condition")
                        this.pos = target.copy();
                        this.start = chosenNeighbor;
                        this.currIndex = 0;
                        this.path = null;
                        //Sistema de detecao de ficar fora da pista
                        if(this.pos.x<=-100 || this.pos.x >=14000 || this.pos.y<=-100 || this.pos.y>=11750){
                            console.log("Posicao de robo: "+this.pos)
                            this.start = null;
                        }

                        //Se tiver caixa
                        if(this.hasCaixa!=null){
                            this.hasCaixa.pos = this.p.createVector(this.pos.x+500*this.p.cos(this.p.radians(this.hasCaixa.direction)),this.pos.y+500*this.p.sin(this.p.radians(this.hasCaixa.direction)));
                        }

                        resolve();
                        return;
                    }
                }
                //Se tiver caixa
                if(this.hasCaixa!=null){
                    this.hasCaixa.pos = this.p.createVector(this.pos.x+500*this.p.cos(this.p.radians(this.hasCaixa.direction)),this.pos.y+500*this.p.sin(this.p.radians(this.hasCaixa.direction)));
                }
                dir.setMag(this.speed);
                this.pos.add(dir);
                setTimeout(moveStep, 20);
            };

            moveStep();
        });
    }

    // Virar o robo 90 graus para a direita
    async turnRight() {
        return new Promise(resolve => {
            let targetDir = (this.direction + 90) % 360;
            const turnStep = () => {
                this.direction += 5;
                if (this.direction >= 360) this.direction -= 360;

                //Se tiver caixa
                if(this.hasCaixa!=null){
                    this.hasCaixa.direction = this.direction;
                    this.hasCaixa.pos = this.p.createVector(this.pos.x+500*this.p.cos(this.p.radians(this.hasCaixa.direction)),this.pos.y+500*this.p.sin(this.p.radians(this.hasCaixa.direction)));
                }

                if (Math.abs(this.direction - targetDir) < 5) {
                    this.direction = targetDir;
                    if(this.hasCaixa!=null){
                        this.hasCaixa.direction = this.direction;
                        this.hasCaixa.pos = this.p.createVector(this.pos.x+500*this.p.cos(this.p.radians(this.hasCaixa.direction)),this.pos.y+500*this.p.sin(this.p.radians(this.hasCaixa.direction)));
                    }
                    resolve();
                    return;
                }
                
                setTimeout(turnStep, 20);
            };
            turnStep();
        });
    }

    // Virar o robo 90 graus para a esquerda
    async turnLeft() {
        return new Promise(resolve => {
            let targetDir = (this.direction - 90 + 360) % 360;
            const turnStep = () => {
                this.direction -= 5;
                if (this.direction < 0) this.direction += 360;

                //Se tiver caixa
                if(this.hasCaixa!=null){
                    this.hasCaixa.direction = this.direction;
                    this.hasCaixa.pos = this.p.createVector(this.pos.x+500*this.p.cos(this.p.radians(this.hasCaixa.direction)),this.pos.y+500*this.p.sin(this.p.radians(this.hasCaixa.direction)));
                }

                if (Math.abs(this.direction - targetDir) < 5) {
                    this.direction = targetDir;
                    if(this.hasCaixa!=null){
                        this.hasCaixa.direction = this.direction;
                        this.hasCaixa.pos = this.p.createVector(this.pos.x+500*this.p.cos(this.p.radians(this.hasCaixa.direction)),this.pos.y+500*this.p.sin(this.p.radians(this.hasCaixa.direction)));
                    }
                    resolve();
                    return;
                }
                
                setTimeout(turnStep, 20);
            };
            turnStep();
        });
    }

    //Mover o robo para tras
    async moveBackward(chosenNeighbor) {
        let targetCoords, target;
        if (chosenNeighbor) {
            // se veio o ID do nó atrás, aponta para ele
            targetCoords = this.coordinates[chosenNeighbor];
            target = this.p.createVector(targetCoords.x, targetCoords.y);
        } else {
            // fallback: recua 25px
            switch (this.direction) {
                case 0: target = this.p.createVector(this.pos.x - 25, this.pos.y); break;
                case 90: target = this.p.createVector(this.pos.x, this.pos.y - 25); break;
                case 180: target = this.p.createVector(this.pos.x + 25, this.pos.y); break;
                case 270: target = this.p.createVector(this.pos.x, this.pos.y + 25); break;
            }
        }

        //Caso se andar para tras da caixa
        if(this.touchCaixa == true){
            this.touchCaixa == false;
        }

        return new Promise(resolve => {
            const moveStep = () => {
                const dir = this.p5VectorSub(target, this.pos);
                if (dir.mag() < this.speed) {
                    this.pos = target.copy();
                    //Se tiver caixa
                    if(this.hasCaixa!=null){
                        this.hasCaixa.pos = this.p.createVector(this.pos.x+500*this.p.cos(this.p.radians(this.hasCaixa.direction)),this.pos.y+500*this.p.sin(this.p.radians(this.hasCaixa.direction)));
                    }
                    if (chosenNeighbor) this.start = chosenNeighbor;
                    resolve();
                    return;
                }

                //Se tiver caixa
                if(this.hasCaixa!=null){
                    this.hasCaixa.pos = this.p.createVector(this.pos.x+500*this.p.cos(this.p.radians(this.hasCaixa.direction)),this.pos.y+500*this.p.sin(this.p.radians(this.hasCaixa.direction)));
                }

                dir.setMag(this.speed);
                this.pos.add(dir);
                setTimeout(moveStep, 20);
            };
            moveStep();
        });
    }

    //Pega na caixa
    async pickUpBox() {
        if(this.hasCaixa!=null){
            console.log("Este robo ja segura uma caixa");
            return;
        }

        for (var i=0; i<Object.keys(this.caixas).length; i++){
            if(this.caixas[i].start == this.start){
                this.hasCaixa = this.caixas[i];
                console.log("Robo apanhou a caixa")
            }
        }

        if(this.hasCaixa==null){
            console.log("Nao ha caixa neste ponto")
            return;
        }
        this.touchCaixa=false;
        return new Promise(resolve => setTimeout(resolve, 150)); // Simula delay
    }

    //Solta a caixa
    async dropBox() {
        if(this.hasCaixa==null){
            console.log("Nao ha caixa para soltar")
            return;
        }else{
            this.hasCaixa.start = this.start;
            if(this.hasCaixa.start == 'L' || this.hasCaixa.start == 'S' || this.hasCaixa.start == 'P' || this.hasCaixa.start == 'X'){
                this.hasCaixa.processarCaixa();
            }else{
                this.hasCaixa.pos = this.p.createVector(mapa[this.start].x, mapa[this.start].y);
            }
            this.hasCaixa = null;
            this.touchCaixa = true;
            switch (this.direction){
                case 0:
                    this.pos = this.p.createVector(mapa[this.start].x-500, mapa[this.start].y);
                    break;
            
                case 90:
                    this.pos = this.p.createVector(mapa[this.start].x, mapa[this.start].y-500);
                    break;

                case 180:
                    this.pos = this.p.createVector(mapa[this.start].x+500, mapa[this.start].y);
                    break;

                case 270:
                    this.pos = this.p.createVector(mapa[this.start].x, mapa[this.start].y+500);
                    break;
            }
        }

        return new Promise(resolve => setTimeout(resolve, 150)); // Simula delay
    }

    //Faz o robo esperar um dado tempo
    async halt(milisecs){
        console.log("Robo espera "+milisecs+" milisegundos");
        return new Promise(resolve => setTimeout(resolve, milisecs));
    }

    async turbo(milisecs){
        console.log("TURBO ainda por implementar")
        return new Promise(resolve => setTimeout(resolve, milisecs));
    }

    //Funcao para diminuir tamanho do mapa para caber no ecra
    fitBoxX(x){
        return x * this.escala + this.offsetX;
    }

    fitBoxY(y){
        return y * this.escala + this.offsetY;;
    }

    //Procura se na direcao dada ("frente" / "direita" / "esquerda") existe um objeto de destino
    pathFinder(direcaoDestino){

        if (this.start==null) {
            console.log("Robo passou limites do mapa")
            return;
        }
        const neighbors = Object.keys(this.graph[this.start]);
        const currentPos = this.p.createVector(mapa[this.start].x, mapa[this.start].y);
        // Procura vizinhos
        let chosenNeighbor = null;
        let smallestAngle = 30; // tolerancia de erro
        var dirVec;
        
        //Calcular o vetor de direcao de procura, dependendo da direcao dada pelo comando
        if(direcaoDestino.localeCompare("frente")==0){
            switch (this.direction){
                case 0:
                    dirVec = this.p.createVector(1,0);
                    break;
            
                case 90:
                    dirVec = this.p.createVector(0,1);
                    break;

                case 180:
                    dirVec = this.p.createVector(-1,0);
                    break;

                case 270:
                    dirVec = this.p.createVector(0,-1);
                    break;
            }
        }else if(direcaoDestino.localeCompare("direita")==0){
            switch (this.direction){
                case 0:
                    dirVec = this.p.createVector(0,1);
                    break;
            
                case 90:
                    dirVec = this.p.createVector(-1,0);
                    break;

                case 180:
                    dirVec = this.p.createVector(0,-1);
                    break;

                case 270:
                    dirVec = this.p.createVector(1,0);
                    break;
            }
        }else if(direcaoDestino.localeCompare("esquerda")==0){
            switch (this.direction){
                case 0:
                    dirVec = this.p.createVector(0,-1);
                    break;
            
                case 90:
                    dirVec = this.p.createVector(1,0);
                    break;

                case 180:
                    dirVec = this.p.createVector(0,1);
                    break;

                case 270:
                    dirVec = this.p.createVector(-1,0);
                    break;
            }
        }else if(direcaoDestino.localeCompare("tras")==0){
            switch (this.direction){
                case 0:
                    dirVec = this.p.createVector(-1,0);
                    break;
            
                case 90:
                    dirVec = this.p.createVector(0,-1);
                    break;

                case 180:
                    dirVec = this.p.createVector(1,0);
                    break;

                case 270:
                    dirVec = this.p.createVector(0,1);
                    break;
            }
        }

        //Procura vizinhos na diracao do robo
        for (let neighbor of neighbors) {
            const neighborPos = this.coordinates[neighbor];
            const toNeighbor = this.p.createVector(neighborPos.x - currentPos.x, neighborPos.y - currentPos.y).normalize();

            var angle = this.p.degrees(dirVec.angleBetween(toNeighbor));
            if(angle<0) angle = -angle;
            
            if (angle < smallestAngle) {
                smallestAngle = angle;
                chosenNeighbor = neighbor;
            }
        }

        if (!chosenNeighbor) {
            return;
        }

        return chosenNeighbor;
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
}

// expõe globalmente
window.Robots = Robots;