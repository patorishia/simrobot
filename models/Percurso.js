const mongoose = require('mongoose');

const percursoSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  nome: { type: String, required: true },
  dataCriacao: { type: Date, default: Date.now },
  dados: { type: Object, required: true } 
});

module.exports = mongoose.model('Percurso', percursoSchema);
