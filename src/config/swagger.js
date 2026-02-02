// backend/src/config/swagger.js
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Book Management API',
      version: '1.0.0',
      description: 'Sistema de Gestión de Libros creacion, edicion con préstamos y reservas',
      contact: {
        name: 'API Support',
        email: 'devye23@gmail.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Servidor de Desarrollo'
      }
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'token',
          description: 'JWT token almacenado en cookie HTTP-only'
        }
      },
      schemas: {
        User: {
          type: 'object',
          required: ['username', 'password'],
          properties: {
            _id: {
              type: 'string',
              description: 'ID unico del usuario',
              example: '507f1f77b'
            },
            username: {
              type: 'string',
              minLength: 3,
              description: 'Nombre de usuario único',
              example: 'admin'
            },
            password: {
              type: 'string',
              minLength: 6,
              description: 'Contraseña',
              example: 'admin123'
            },
            role: {
              type: 'string',
              enum: ['admin', 'user'],
              default: 'user',
              description: 'Rol del usuario',
              example: 'admin'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación',
              example: '2026-01-31T10:00:00Z'
            }
          }
        },
        Book: {
          type: 'object',
          required: ['title', 'author', 'year'],
          properties: {
            _id: {
              type: 'string',
              description: 'ID único del libro',
              example: '507f1f77b'
            },
            title: {
              type: 'string',
              maxLength: 200,
              description: 'Título del libro',
              example: 'Cien Años de Soledad'
            },
            author: {
              type: 'string',
              maxLength: 100,
              description: 'Autor del libro',
              example: 'Gabriel García Márquez'
            },
            year: {
              type: 'integer',
              minimum: 1000,
              maximum: 2027,
              description: 'Año de publicación',
              example: 1967
            },
            status: {
              type: 'string',
              enum: ['disponible', 'prestado', 'reservado'],
              default: 'disponible',
              description: 'Estado actual del libro',
              example: 'disponible'
            },
            isbn: {
              type: 'string',
              description: 'ISBN codigo internacional del libro',
              example: '123456789'
            },
            description: {
              type: 'string',
              maxLength: 1000,
              description: 'Descripción del libro',
              example: 'Descripcion breve del libro'
            },
            image: {
              type: 'string',
              description: 'Nombre del archivo de imagen',
              example: 'default.jpg'
            },
            borrowedBy: {
              type: 'string',
              description: 'ID del usuario que prestó el libro',
              example: '507f1f77bcf86cd799439011'
            },
            borrowedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de prestamo',
              example: '2026-01-31T10:00:00Z'
            },
            dueDate: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de devolucion',
              example: '2026-02-14T10:00:00Z'
            },
            reservedBy: {
              type: 'string',
              description: 'ID del usuario que reservó el libro',
              example: '507f1f77bc'
            },
            reservedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de reserva',
              example: '2026-01-31T10:00:00Z'
            },
            createdBy: {
              type: 'string',
              description: 'ID del usuario que creo el libro',
              example: '507f1f77bc'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2026-01-31T10:00:00Z'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2026-01-31T10:00:00Z'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Error al procesar la solicitud'
            },
            error: {
              type: 'string',
              example: 'Detalles del error'
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Authentication',
        description: 'Endpoints de autenticación y gestión de sesiones'
      },
      {
        name: 'Books',
        description: 'CRUD de libros'
      },
      {
        name: 'Loans',
        description: 'Sistema de préstamos y reservas'
      }
    ]
  },
  apis: ['./src/routes/*.js'] 
};

const specs = swaggerJsdoc(options);

module.exports = { specs, swaggerUi };