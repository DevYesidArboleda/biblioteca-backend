
const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'El título es requerido'],
    trim: true,
    maxlength: 200
  },
  author: {
    type: String,
    required: [true, 'El autor es requerido'],
    trim: true,
    maxlength: 100
  },
  year: {
    type: Number,
    required: [true, 'El año de publicación es requerido'],
    min: 1000,
    max: new Date().getFullYear() + 1
  },
  status: {
    type: String,
    enum: ['disponible', 'prestado', 'reservado'],
    default: 'disponible'
  },
  isbn: {
    type: String,
    trim: true,
    unique: true,
    sparse: true
  },
  description: {
    type: String,
    maxlength: 1000
  },
  image: {
    type: String,
    default: 'default-book.png'
  },
  // Datos de préstamo
  borrowedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  borrowedAt: {
    type: Date,
    default: null
  },
  dueDate: {
    type: Date,
    default: null
  },
  // Datos de reserva
  reservedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  reservedAt: {
    type: Date,
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

BookSchema.index({ title: 'text', author: 'text' });
BookSchema.index({ status: 1 });
BookSchema.index({ year: -1 });

BookSchema.pre('save', function() {
  this.updatedAt = Date.now();
});

// Metodo para prestar libro
BookSchema.methods.borrow = function(userId, days = 14) {
  if (this.status !== 'disponible') {
    throw new Error('El libro no está disponible para préstamo');
  }
  
  this.status = 'prestado';
  this.borrowedBy = userId;
  this.borrowedAt = new Date();
  this.dueDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  
  return this.save();
};

// Metodo para devolver libro
BookSchema.methods.return = function() {
  if (this.status !== 'prestado') {
    throw new Error('El libro no está prestado');
  }
  
  this.status = 'disponible';
  this.borrowedBy = null;
  this.borrowedAt = null;
  this.dueDate = null;
  
  return this.save();
};

// Metodo para reservar libro
BookSchema.methods.reserve = function(userId) {
  if (this.status === 'reservado') {
    throw new Error('El libro ya está reservado');
  }
  
  if (this.status === 'disponible') {
    throw new Error('El libro está disponible, puedes tomarlo directamente');
  }
  
  this.reservedBy = userId;
  this.reservedAt = new Date();
  this.status = 'reservado';
  
  return this.save();
};

// Metodo para cancelar reserva
BookSchema.methods.cancelReservation = function() {
  this.reservedBy = null;
  this.reservedAt = null;
  
  // Si estaba solo reservado, volver a disponible
  if (this.status === 'reservado' && !this.borrowedBy) {
    this.status = 'disponible';
  }
  
  return this.save();
};

module.exports = mongoose.model('Book', BookSchema);