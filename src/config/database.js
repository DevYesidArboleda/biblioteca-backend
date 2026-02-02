const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('👌 MongoDB conectado correctamente');
  } catch (error) {
    logger.error('🚫 Error conectando a MongoDB:', error);
    process.exit(1);
  }
};

module.exports = connectDB;