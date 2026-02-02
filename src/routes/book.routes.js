const express = require('express');
const router = express.Router();
const bookController = require('../controllers/book.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

router.get('/', bookController.getBooks);
router.get('/:id', bookController.getBookById);

router.post('/', authenticateToken, upload.single('image'), bookController.createBook);
router.put('/:id', authenticateToken, upload.single('image'), bookController.updateBook);
router.delete('/:id', authenticateToken, bookController.deleteBook);

router.post('/:id/borrow', authenticateToken, bookController.borrowBook);
router.post('/:id/return', authenticateToken, bookController.returnBook);
router.post('/:id/reserve', authenticateToken, bookController.reserveBook);
router.delete('/:id/reserve', authenticateToken, bookController.cancelReservation);

module.exports = router;