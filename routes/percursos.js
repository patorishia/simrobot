//routes/percursos.js
const express = require('express');
const jwt = require('jsonwebtoken');
const Percurso = require('../models/Percurso');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware para proteger rotas
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Token não fornecido' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido' });
  }
}

// Rota para listar todos os percursos (sem conflito)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const percursos = await Percurso.find({ userId: req.user.id });
    res.json(percursos);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao obter percursos' });
  }
});

// Rota para obter percurso específico (detalhes)
router.get('/detalhes/:id', authMiddleware, async (req, res) => {
  console.log('Rota detalhes chamada para ID:', req.params.id);
  try {
    const percurso = await Percurso.findOne({ _id: req.params.id, userId: req.user.id });
    if (!percurso) return res.status(404).json({ error: 'Percurso não encontrado' });
    res.json(percurso);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao obter percurso' });
  }
});


// Criar novo percurso
router.post('/', authMiddleware, async (req, res) => {
  const { nome, dados } = req.body;
  if (!nome || !dados) return res.status(400).json({ error: 'Campos obrigatórios' });

  try {
    const novoPercurso = new Percurso({ userId: req.user.id, nome, dados });
    await novoPercurso.save();
    res.status(201).json(novoPercurso);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao guardar percurso' });
  }
});

// Apagar percurso
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const percurso = await Percurso.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!percurso) return res.status(404).json({ error: 'Percurso não encontrado' });
    res.json({ message: 'Percurso apagado' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao apagar percurso' });
  }
});

// Atualizar distância percorrida
router.patch('/:id/distancia', authMiddleware, async (req, res) => {
  const { distanciaPercorrida } = req.body;

  if (typeof distanciaPercorrida !== 'number') {
    return res.status(400).json({ error: 'distanciaPercorrida inválida' });
  }

  try {
    const percurso = await Percurso.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { distanciaPercorrida },
      { new: true }
    );

    if (!percurso) return res.status(404).json({ error: 'Percurso não encontrado' });

    res.json(percurso);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar distância' });
  }
});


module.exports = router;
