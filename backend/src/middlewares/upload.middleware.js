const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// Configurar almacenamiento dinámico
const createUploadMiddleware = (folderName) => {
  let storage;

  // Use Cloudinary if enabled via env var and configured for specific folders
  const useCloudinary = process.env.USE_CLOUDINARY === 'true' && 
                        process.env.CLOUDINARY_CLOUD_NAME && 
                        (folderName === 'products' || folderName === 'payments' || folderName === 'categories' || folderName === 'settings' || folderName === 'testimonials' || folderName === 'banners');

  if (useCloudinary) {
    storage = new CloudinaryStorage({
      cloudinary: cloudinary,
      params: (req, file) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);

        let transformation;
        if (folderName === 'products') {
          transformation = [{ width: 500, height: 500, crop: 'pad' }];
        }

        if (folderName === 'banners') {
          const placement = String(req?.body?.placement || 'carousel');
          if (placement === 'offer_small') {
            transformation = [{ width: 800, height: 400, crop: 'fill', gravity: 'auto' }];
          } else if (placement === 'offer_large') {
            transformation = [{ width: 1200, height: 600, crop: 'fill', gravity: 'auto' }];
          } else if (placement === 'vendor') {
            transformation = [{ width: 300, height: 200, crop: 'pad' }];
          } else {
            transformation = [{ width: 1200, height: 430, crop: 'fill', gravity: 'auto' }];
          }
        }

        return {
          folder: folderName,
          allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
          public_id: `${file.fieldname}-${uniqueSuffix}`,
          transformation
        };
      }
    });
  } else {
    // Fallback to local storage
    storage = multer.diskStorage({
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
  }

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
