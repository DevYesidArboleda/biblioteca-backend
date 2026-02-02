const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const logger = require('../utils/logger');

// Configuración de cookies
const cookieOptions = {
  httpOnly: true,        
  secure: process.env.NODE_ENV === 'production', 
  sameSite: 'strict',    
  maxAge: 24 * 60 * 60 * 1000  // 24 horas
};

// Registro de usuario
exports.register = async (req, res) => {
  try {
    const { username, password, role } = req.body;

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      logger.warn('Intento de registro con username existente', { username });
      return res.status(400).json({ 
        success: false, 
        message: 'El usuario ya existe' 
      });
    }

    const user = new User({ username, password, role });
    await user.save();

    logger.info('Usuario registrado exitosamente', { 
      userId: user._id, 
      username: user.username 
    });

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        id: user._id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    logger.error('Error en registro de usuario', { error: error.message });
    res.status(500).json({ 
      success: false, 
      message: 'Error al registrar usuario',
      error: error.message 
    });
  }
};

// Login con jwt 
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      logger.warn('Intento de login con username inexistente', { username });
      return res.status(401).json({ 
        success: false, 
        message: 'Credenciales inválidas' 
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      logger.warn('Intento de login con password incorrecto', { username });
      return res.status(401).json({ 
        success: false, 
        message: 'Credenciales inválidas' 
      });
    }

    // Generar jwt
    const token = jwt.sign(
      { 
        id: user._id, 
        username: user.username, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Guardar token
    res.cookie('token', token, cookieOptions);

    logger.info('Login exitoso', { 
      userId: user._id, 
      username: user.username 
    });

    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        user: {
          id: user._id,
          username: user.username,
          role: user.role
        }
      }      
    });
  } catch (error) {
    logger.error('Error en login', { error: error.message });
    res.status(500).json({ 
      success: false, 
      message: 'Error al iniciar sesión',
      error: error.message 
    });
  }
};

// Salir de la sesion
exports.logout = (req, res) => {
  res.clearCookie('token', cookieOptions);
  
  logger.info('Logout exitoso', { userId: req.user?.id });
  
  res.json({
    success: true,
    message: 'Logout exitoso'
  });
};

// Verificar sesion actual
exports.checkSession = (req, res) => {
  res.json({
    success: true,
    data: {
      user: {
        id: req.user.id,
        username: req.user.username,
        role: req.user.role
      }
    }
  });
};