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

    // Recebe escala e offsets iguais ao Robot
    this.escala = escala;
    this.offsetX = offsetX;
    this.offsetY = offsetY;

    // posiciona no nó do mapa
    const pt = mapa[startPoint];
    this.pos = this.p.createVector(pt.x, pt.y);
    this.direction = 90;
    this.picked = false;
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
}

// expõe globalmente
window.Caixa = Caixa;
