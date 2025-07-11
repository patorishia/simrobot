//server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const connectDB = require('./db/connections');
const authRoutes = require('./routes/auth');
const percursosRoutes = require('./routes/percursos');
const setupStaticRoutes = require('./routes/staticRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 1) Serve **tudo** de `public/` como raiz estática
//    - /js/... → public/js/...  
//    - /data/... → public/data/...  
//    - /index.html, /login.html → public/index.html, public/login.html
app.use(express.static(path.join(__dirname, 'public')));



// 2) Rotas específicas para simuladores (HTML + assets)
setupStaticRoutes(app);

// 3) API
app.use('/api/auth', authRoutes);
app.use('/api/percursos', percursosRoutes);

// 4) Base de dados e arranque
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Servidor a correr em http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('Erro ao conectar ao banco de dados:', err);
  });
