const express = require('express');
const router = express.Router();
const bookController = require('../controllers/book.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

/**
 * @swagger
 * /api/books:
 *   get:
 *     summary: Listar libros con filtros y paginación
 *     tags: [Books]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Libros por página
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por título o autor
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [disponible, prestado, reservado]
 *         description: Filtrar por estado
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, title, author, year]
 *           default: createdAt
 *         description: Campo para ordenar
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Orden ascendente o descendente
 *       - in: query
 *         name: yearFrom
 *         schema:
 *           type: integer
 *         description: Año mínimo de publicación
 *       - in: query
 *         name: yearTo
 *         schema:
 *           type: integer
 *         description: Año máximo de publicación
 *     responses:
 *       200:
 *         description: Lista de libros
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     books:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Book'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         pages:
 *                           type: integer
 */
router.get('/', bookController.getBooks);

/**
 * @swagger
 * /api/books/{id}:
 *   get:
 *     summary: Obtener detalle de un libro
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del libro
 *     responses:
 *       200:
 *         description: Detalle del libro
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Book'
 *       404:
 *         description: Libro no encontrado
 */
router.get('/:id', bookController.getBookById);

/**
 * @swagger
 * /api/books:
 *   post:
 *     summary: Crear un nuevo libro
 *     tags: [Books]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - author
 *               - year
 *             properties:
 *               title:
 *                 type: string
 *                 example: Don Quijote de la Mancha
 *               author:
 *                 type: string
 *                 example: Miguel de Cervantes
 *               year:
 *                 type: integer
 *                 example: 1605
 *               status:
 *                 type: string
 *                 enum: [disponible, prestado, reservado]
 *                 default: disponible
 *               isbn:
 *                 type: string
 *                 example: 123456789
 *               description:
 *                 type: string
 *                 example: Clásico de la literatura española
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Imagen de portada (PNG, JPG, JPEG, GIF, WEBP - máx 5MB)
 *     responses:
 *       201:
 *         description: Libro creado exitosamente
 *       400:
 *         description: ISBN duplicado o datos inválidos
 *       401:
 *         description: No autenticado
 */
router.post('/', authenticateToken, upload.single('image'), bookController.createBook);

/**
 * @swagger
 * /api/books/{id}:
 *   put:
 *     summary: Actualizar un libro
 *     tags: [Books]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               author:
 *                 type: string
 *               year:
 *                 type: integer
 *               status:
 *                 type: string
 *               isbn:
 *                 type: string
 *               description:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Libro actualizado exitosamente
 *       404:
 *         description: Libro no encontrado
 */
router.put('/:id', authenticateToken, upload.single('image'), bookController.updateBook);

/**
 * @swagger
 * /api/books/{id}:
 *   delete:
 *     summary: Eliminar un libro
 *     tags: [Books]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Libro eliminado exitosamente
 *       404:
 *         description: Libro no encontrado
 */
router.delete('/:id', authenticateToken, bookController.deleteBook);

/**
 * @swagger
 * /api/books/{id}/borrow:
 *   post:
 *     summary: Prestar un libro
 *     tags: [Loans]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               days:
 *                 type: integer
 *                 default: 14
 *                 description: Días de préstamo
 *                 example: 14
 *     responses:
 *       200:
 *         description: Libro prestado exitosamente
 *       400:
 *         description: El libro no está disponible
 */
router.post('/:id/borrow', authenticateToken, bookController.borrowBook);

/**
 * @swagger
 * /api/books/{id}/return:
 *   post:
 *     summary: Devolver un libro
 *     tags: [Loans]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Libro devuelto exitosamente
 *       400:
 *         description: El libro no está prestado
 */
router.post('/:id/return', authenticateToken, bookController.returnBook);

/**
 * @swagger
 * /api/books/{id}/reserve:
 *   post:
 *     summary: Reservar un libro
 *     tags: [Loans]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Libro reservado exitosamente
 *       400:
 *         description: El libro ya está reservado o está disponible
 */
router.post('/:id/reserve', authenticateToken, bookController.reserveBook);

/**
 * @swagger
 * /api/books/{id}/reserve:
 *   delete:
 *     summary: Cancelar reserva de un libro
 *     tags: [Loans]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reserva cancelada exitosamente
 *       403:
 *         description: No tienes permiso para cancelar esta reserva
 */
router.delete('/:id/reserve', authenticateToken, bookController.cancelReservation);

module.exports = router;
