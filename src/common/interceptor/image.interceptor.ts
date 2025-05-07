import { UnsupportedMediaTypeException } from '@nestjs/common';
import { memoryStorage } from 'multer';

export const ImageOption = {
  storage: memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
      cb(null, true);
    } else {
      cb(new UnsupportedMediaTypeException(), false);
    }
  },
};
