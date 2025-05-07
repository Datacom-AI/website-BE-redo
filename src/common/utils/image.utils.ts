import { v4 as uuidv4 } from 'uuid';
import * as path from 'node:path';
import * as fs from 'fs';
import { NotFoundException } from '@nestjs/common';

export function createImageName(avatar: Express.Multer.File): string {
  console.log('avatar', avatar);
  const ext = path.extname(avatar.originalname);
  const name = path.basename(avatar.originalname, ext);
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

export function removeImage(imagePath: string): void {
  try {
    fs.unlinkSync(imagePath);
  } catch (error) {
    console.error('Error removing image:', error);
    throw new NotFoundException('Error removing image');
  }
}
