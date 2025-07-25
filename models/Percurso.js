const mongoose = require('mongoose');

const percursoSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  nome: { type: String, required: true },
  dados: { type: Object, required: true },
  distanciasPercorridas: {
    robo1: { type: Number, default: 0 },
    robo2: { type: Number, default: 0 },
  },
}, { timestamps: true });

module.exports = mongoose.model('Percurso', percursoSchema);
