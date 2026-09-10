import multer from 'multer';
import path from 'path';
import { ApiException } from '../exception/ApiException.js';

// Onde salvar e  como renomear evitando colisão de nomes
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

// Validação de extensão (filtro de tipo de arquivo)
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new ApiException('INVALID_FILE_TYPE', 400, 'Apenas imagens (JPG, PNG, WEBP) são permitidas.')
    );
  }
};

// Limite de tamanho
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2 MegaBytes
  },
});
