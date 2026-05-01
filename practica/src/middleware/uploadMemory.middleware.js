import multer from 'multer';

// Sube a memoria (buffer) para que luego lo procese sharp y lo suba
// el storage service. Se usa para la firma de albaranes.
const MAX_MB = Number(process.env.UPLOAD_MAX_MB || 2);

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowed.includes(file.mimetype)) {
    return cb(new Error('Formato no permitido (solo jpg/png/webp)'));
  }
  cb(null, true);
};

const uploadMemory = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: MAX_MB * 1024 * 1024 },
});

export default uploadMemory;
