require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser'); 
const path = require('path'); 
const connectDB = require('./config/database');
const logger = require('./utils/logger');
const { requestLogger } = require('./middlewares/logger.middleware');

const authRoutes = require('./routes/auth.routes');
const bookRoutes = require('./routes/book.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Conectar a MongoDB
connectDB();

app.use(cors({
  origin: 'http://localhost:3000', //Frontend
  credentials: true 
}));
app.use(express.json());
app.use(cookieParser()); 
app.use(requestLogger);

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date(),
    uptime: process.uptime() 
  });
});

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Ruta no encontrada' 
  });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  logger.error('Error no manejado', { error: err.message, stack: err.stack });
  res.status(500).json({ 
    success: false, 
    message: 'Error interno del servidor' 
  });
});

app.listen(PORT, () => {
  logger.info(`🚀 Servidor corriendo en puerto ${PORT}`);
  logger.info(`📚 API disponible en http://localhost:${PORT}/api`);
  logger.info(`🖼️  Imágenes en http://localhost:${PORT}/uploads/images/`);
});