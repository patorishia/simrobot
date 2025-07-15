// public/js/simulador2/Caixa.js

class Caixa {
  /**
   * @param {string} cor        — cor da caixa ("verde", "vermelho", etc)
   * @param {string} startPoint — id do nó inicial
   * @param {object} p          — instância p5
   * @param {number} escala     — mesma escala do Robot
   * @param {number} offsetX    — mesmo offset X
   * @param {number} offsetY    — mesmo offset Y
   */
  constructor(cor, startPoint, p, escala, offsetX, offsetY) {
    this.p = p;
    this.cor = cor;
    this.startPoint = startPoint;
    this.start = startPoint;

    // Recebe escala e offsets iguais ao Robot
    this.escala = escala;
    this.offsetX = offsetX;
    this.offsetY = offsetY;

    // posiciona no nó do mapa
    const pt = mapa[startPoint];
    this.pos = this.p.createVector(pt.x, pt.y);
    this.direction = 90;
    this.picked = false;
    if(this.cor == "vermelho"){
      this.processos = 2;
    }else if(this.cor == "verde"){
      this.processos = 1;
    }else{
      this.processos = 0;
    }
  }

  update() {
    this.p.push();
    this.p.translate(this.fitX(this.pos.x), this.fitY(this.pos.y));
    this.p.rotate(this.p.radians(this.direction));

    if (this.cor === "verde") {
      this.p.fill(0, 255, 0);
    } else if (this.cor === "vermelho") {
      this.p.fill(255, 0, 0);
    } else {
      this.p.fill(0, 0, 255);
    }

    this.p.rectMode(this.p.CENTER);
    this.p.noStroke();
    this.p.rect(0, 0, 20, 30);
    this.p.pop();
  }

  fitX(x) {
    return x * this.escala + this.offsetX;
  }

  fitY(y) {
    return y * this.escala + this.offsetY;
  }

  processarCaixa(){
    if(this.cor == "vermelho"){
      switch(this.start){
        case 'L':
          this.start = 'K';
          this.cor = "verde";
          this.processos = 1;
          console.log("Caixa processada de L para K");
          break;

        case 'S':
          this.start = 'R';
          this.cor = "verde";
          this.processos = 1;
          console.log("Caixa processada de S para R");
          break;

        default:
          console.log("Este ponto nao pode processar uma caixa "+this.cor);
          break;
      }
    }else if(this.cor == "verde"){
      switch(this.start){
        case 'P':
          this.start = 'O';
          this.cor = "azul";
          this.processos = 0;
          console.log("Caixa processada de P para O");
          break;

        case 'X':
          this.start = 'V';
          this.cor = "azul";
          this.processos = 0;
          console.log("Caixa processada de X para V");
          break;

        default:
          console.log("Este ponto nao pode processar uma caixa "+this.cor);
          break;
      }
    }else{
      console.log("Esta caixa ja esta processada");
    }

    this.pos = this.p.createVector(mapa[this.start].x, mapa[this.start].y);
  }
}

// expõe globalmente
window.Caixa = Caixa;
