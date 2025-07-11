///routes/ststicRoutes.js
const path = require('path');
const express = require('express');

module.exports = function(app) {

  app.get('/', (req, res) => {
  res.redirect('/register');
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/register.html')); 
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/login.html')); 
});


  // Quando o browser pedir /simulador1, devolve content.html
  app.get('/simulador1', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/simulador1/content.html'));
  });

  // E tudo dentro de public/simulador1 (assets, JS, CSS) já está coberto pelo express.static
  // graças ao app.use(express.static('public')) no server.js.

  app.get('/simulador2', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/simulador2/content.html'));
  });
};
