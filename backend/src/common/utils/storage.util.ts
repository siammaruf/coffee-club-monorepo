import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';

export const defaultStorage = diskStorage({
  destination: (req, file, cb) => {
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const uploadPath = path.join('uploads', year.toString(), month);

      fs.mkdirSync(uploadPath, { recursive: true });
      cb(null, uploadPath);
    } catch (err) {
      cb(err as NodeJS.ErrnoException, '');
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '.avif');
  },
});

export const receiptStorage = diskStorage({
  destination: (req, file, cb) => {
    try {
      const now = new Date();
      const year = now.getFullYear().toString();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const uploadPath = path.join('uploads', 'receipts', year, month);

      fs.mkdirSync(uploadPath, { recursive: true });
      cb(null, uploadPath);
    } catch (err) {
      cb(err as NodeJS.ErrnoException, '');
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname || '');
    cb(null, `receipt_${uniqueSuffix}${ext}`);
  },
});

export const iconStorage = diskStorage({
  destination: (req, file, cb) => {
    try {
      const uploadPath = path.join('uploads', 'icons');
      fs.mkdirSync(uploadPath, { recursive: true });
      cb(null, uploadPath);
    } catch (err) {
      cb(err as NodeJS.ErrnoException, '');
    }
  },
  filename: (req, file, cb) => {
    const randomName = Array(32)
      .fill(null)
      .map(() => Math.round(Math.random() * 16).toString(16))
      .join('');
    const ext = path.extname(file.originalname || '');
    cb(null, `${randomName}${ext}`);
  }
});