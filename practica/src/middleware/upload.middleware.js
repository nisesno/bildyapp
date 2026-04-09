import multer from 'multer';
import path from 'node:path';
import crypto from 'node:crypto';

const MAX_MB = Number(process.env.UPLOAD_MAX_MB || 2);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'storage');
  },
  filename: (req, file, cb) => {
    // nombre aleatorio para evitar colisiones
    const ext = path.extname(file.originalname);
    const name = crypto.randomBytes(8).toString('hex');
    cb(null, `${Date.now()}-${name}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowed.includes(file.mimetype)) {
    return cb(new Error('Formato no permitido (solo jpg/png/webp)'));
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_MB * 1024 * 1024,
  },
});

export default upload;
