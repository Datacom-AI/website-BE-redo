import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import * as fs from 'fs-extra';
import { NotFoundException } from '@nestjs/common';

export function createImageName(image: Express.Multer.File): string {
  console.log('Image:', image);
  const ext = path.extname(image.originalname);
  const name = path.basename(image.originalname, ext);
  const newName = `${name}-${uuidv4()}${ext}`;
  return newName;
}

export function saveImage(image: Express.Multer.File, path: string): void {
  try {
    fs.writeFileSync(path, image.buffer);
  } catch (error) {
    console.error('Error saving image:', error);
    throw new NotFoundException('Error saving image');
  }
}

export function deleteImage(path: string): void {
  try {
    fs.unlinkSync(path);
  } catch (error) {
    console.error('Error deleting image:', error);
    throw new NotFoundException('Error deleting image');
  }
}
