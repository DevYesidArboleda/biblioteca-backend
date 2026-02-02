
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Crear directorio en caso que no exista
const uploadDir = './uploads/images';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generar nombre unico junto con la fecha
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'book-' + uniqueSuffix + ext);
  }
});

// Que extensiones se aceptan
const fileFilter = (req, file, cb) => {
  const validExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (validExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes (png, jpg, jpeg, gif, webp)'), false);
  }
};

// configura un maximo de 5 mg
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 
  }
});

module.exports = upload;