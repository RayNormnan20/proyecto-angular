const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configurar almacenamiento dinámico
const createUploadMiddleware = (folderName) => {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const uploadPath = path.join(__dirname, `../../public/uploads/${folderName}`);
      // Asegurar que el directorio existe
      if (!fs.existsSync(uploadPath)) {
        console.log(`Creating directory: ${uploadPath}`);
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
      // Nombre único: timestamp + numero aleatorio + extension
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  });

  const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes'), false);
    }
  };

  return multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
      fileSize: 5 * 1024 * 1024 // 5MB max
    }
  });
};

module.exports = createUploadMiddleware;
