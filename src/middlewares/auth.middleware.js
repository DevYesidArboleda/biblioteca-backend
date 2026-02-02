
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

const authenticateToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    logger.warn('Intento de acceso sin token');
    return res.status(401).json({ 
      success: false, 
      message: 'No autenticado' 
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      logger.warn('Token inválido o expirado', { error: err.message });
      return res.status(403).json({ 
        success: false, 
        message: 'Token inválido o expirado' 
      });
    }

    req.user = user;
    logger.info('Usuario autenticado', { userId: user.id, username: user.username });
    next();
  });
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    logger.warn('Intento de acceso a ruta de admin', { userId: req.user.id });
    return res.status(403).json({
      success: false,
      message: 'Se requieren permisos de administrador'
    });
  }
  next();
};

module.exports = { authenticateToken, requireAdmin };