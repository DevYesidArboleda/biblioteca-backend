const Book = require('../models/Book.model');
const logger = require('../utils/logger');
const fs = require('fs');
const path = require('path');

// Crear libro
exports.createBook = async (req, res) => {
  try {
    const { title, author, year, status, isbn, description } = req.body;

    const book = new Book({
      title,
      author,
      year,
      status,
      isbn,
      description,
      image: req.file ? req.file.filename : 'default-book.png',
      createdBy: req.user.id
    });

    await book.save();

    logger.info('Libro creado', { 
      bookId: book._id, 
      title: book.title,
      createdBy: req.user.username 
    });

    res.status(201).json({
      success: true,
      message: 'Libro creado exitosamente',
      data: book
    });
  } catch (error) {
    // Verifica si se subio la imagen en caso de que no, se eliminara
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    
    logger.error('Error al crear libro', { error: error.message });
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'El ISBN ya existe'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al crear libro',
      error: error.message
    });
  }
};

// Listar libros 
exports.getBooks = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      status = '', 
      sortBy = 'createdAt', 
      order = 'desc',
      yearFrom,
      yearTo
    } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } }
      ];
    }

    if (status) {
      query.status = status;
    }

    if (yearFrom || yearTo) {
      query.year = {};
      if (yearFrom) query.year.$gte = parseInt(yearFrom);
      if (yearTo) query.year.$lte = parseInt(yearTo);
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const sort = { [sortBy]: sortOrder };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [books, total] = await Promise.all([
      Book.find(query)
        .sort(sort)
        .limit(parseInt(limit))
        .skip(skip)
        .populate('createdBy', 'username')
        .populate('borrowedBy', 'username')
        .populate('reservedBy', 'username'),
      Book.countDocuments(query)
    ]);

    logger.info('Libros listados', { page, limit, total, filters: query });

    res.json({
      success: true,
      data: {
        books,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    logger.error('Error al listar libros', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error al listar libros',
      error: error.message
    });
  }
};

// Obtener detalle de libro
exports.getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
      .populate('createdBy', 'username')
      .populate('borrowedBy', 'username')
      .populate('reservedBy', 'username');

    if (!book) {
      logger.warn('Libro no encontrado', { bookId: req.params.id });
      return res.status(404).json({
        success: false,
        message: 'Libro no encontrado'
      });
    }

    logger.info('Detalle de libro obtenido', { bookId: book._id });

    res.json({
      success: true,
      data: book
    });
  } catch (error) {
    logger.error('Error al obtener libro', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error al obtener libro',
      error: error.message
    });
  }
};

// Actualizar un libro
exports.updateBook = async (req, res) => {
  try {
    const { title, author, year, status, isbn, description } = req.body;
    
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(404).json({
        success: false,
        message: 'Libro no encontrado'
      });
    }

    book.title = title || book.title;
    book.author = author || book.author;
    book.year = year || book.year;
    book.status = status || book.status;
    book.isbn = isbn || book.isbn;
    book.description = description || book.description;

    // Si hay nueva imagen
    if (req.file) {
      // Eliminar imagen anterior en caso que no sea default
      if (book.image && book.image !== 'default-book.png') {
        const oldImagePath = path.join(__dirname, '../../uploads/images/', book.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      book.image = req.file.filename;
    }

    await book.save();

    logger.info('Libro actualizado', { 
      bookId: book._id, 
      updatedBy: req.user.username 
    });

    res.json({
      success: true,
      message: 'Libro actualizado exitosamente',
      data: book
    });
  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path);
    
    logger.error('Error al actualizar libro', { error: error.message });
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'El ISBN ya existe'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al actualizar libro',
      error: error.message
    });
  }
};

// Eliminar libro
exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Libro no encontrado'
      });
    }

    // Eliminar imagen si no es default
    if (book.image && book.image !== 'default-book.png') {
      const imagePath = path.join(__dirname, '../../uploads/images/', book.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    logger.info('Libro eliminado', { 
      bookId: book._id, 
      title: book.title,
      deletedBy: req.user.username 
    });

    res.json({
      success: true,
      message: 'Libro eliminado exitosamente'
    });
  } catch (error) {
    logger.error('Error al eliminar libro', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error al eliminar libro',
      error: error.message
    });
  }
};

// Prestamo de libro
exports.borrowBook = async (req, res) => {
  try {
    const { days = 14 } = req.body;
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Libro no encontrado'
      });
    }

    await book.borrow(req.user.id, days);

    logger.info('Libro prestado', {
      bookId: book._id,
      borrowedBy: req.user.username,
      dueDate: book.dueDate
    });

    res.json({
      success: true,
      message: `Libro prestado exitosamente. Fecha de devolución: ${book.dueDate.toLocaleDateString()}`,
      data: book
    });
  } catch (error) {
    logger.error('Error al prestar libro', { error: error.message });
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Devolver libro
exports.returnBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Libro no encontrado'
      });
    }

    // Verificar si el usuario lo presto
    if (book.borrowedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para devolver este libro'
      });
    }

    await book.return();

    logger.info('Libro devuelto', {
      bookId: book._id,
      returnedBy: req.user.username
    });

    res.json({
      success: true,
      message: 'Libro devuelto exitosamente',
      data: book
    });
  } catch (error) {
    logger.error('Error al devolver libro', { error: error.message });
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Reservar libro
exports.reserveBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Libro no encontrado'
      });
    }

    await book.reserve(req.user.id);

    logger.info('Libro reservado', {
      bookId: book._id,
      reservedBy: req.user.username
    });

    res.json({
      success: true,
      message: 'Libro reservado exitosamente',
      data: book
    });
  } catch (error) {
    logger.error('Error al reservar libro', { error: error.message });
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Cancelar reserva
exports.cancelReservation = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Libro no encontrado'
      });
    }

    // Verificar que el usuario sea quien lo reservo (Lo puede hacer el admin)
    if (book.reservedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para cancelar esta reserva'
      });
    }

    await book.cancelReservation();

    logger.info('Reserva cancelada', {
      bookId: book._id,
      cancelledBy: req.user.username
    });

    res.json({
      success: true,
      message: 'Reserva cancelada exitosamente',
      data: book
    });
  } catch (error) {
    logger.error('Error al cancelar reserva', { error: error.message });
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};