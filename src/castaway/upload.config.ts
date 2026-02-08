import { BadRequestException } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import * as multer from 'multer';

export const uploadConfig: MulterOptions = {
  storage: multer.memoryStorage(),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'), // 5MB default
  },
  fileFilter: (req, file, callback) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    const allowedExts = ['.jpg', '.jpeg', '.png', '.webp'];

    const ext = file.originalname.toLowerCase().match(/\.[^.]*$/)?.[0];

    if (
      !allowedMimes.includes(file.mimetype) ||
      !ext ||
      !allowedExts.includes(ext)
    ) {
      return callback(
        new BadRequestException('Only JPG, PNG, and WebP images are allowed'),
        false,
      );
    }

    callback(null, true);
  },
};
