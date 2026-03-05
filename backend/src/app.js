const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const routes = require('./routes/index.routes');
const { connectDB } = require('./config/database');
const { User, Role, Permission } = require('./modules/associations');

const app = express();

// Middlewares Globales
app.use(helmet()); // Seguridad HTTP headers
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(morgan('dev')); // Logging
app.use(express.json()); // Parse JSON body

// Rutas
app.use('/api', routes);

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).json({ message: 'Recurso no encontrado' });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Error interno del servidor' });
});

// Conectar a Base de Datos
connectDB();

module.exports = app;
