import { v4 as uuidv4 } from 'uuid';
import * as path from 'node:path';
import * as fs from 'fs/promises';
import { BadRequestException, Logger } from '@nestjs/common';

const logger = new Logger('ImageUtils');

export function createImageName(image: Express.Multer.File): string {
  if (!image || !image.originalname) {
    logger.error('Invalid image object');
    throw new BadRequestException('Invalid image object');
  }
  const ext = path.extname(image.originalname);
  const name = path.basename(image.originalname, ext);
  const newName = `${name}-${uuidv4()}${ext}`;
  return newName;
}

export async function saveImage(
  image: Express.Multer.File,
  imagePath: string,
): Promise<void> {
  try {
    await fs.writeFile(imagePath, image.buffer);
  } catch (error) {
    console.error(`Error saving image to ${imagePath}:`, error);

    throw new BadRequestException('Error saving image');
  }
}

export async function removeImage(imagePath: string): Promise<void> {
  try {
    await fs.unlink(imagePath);
  } catch (error) {
    if (error.code === 'ENOENT') {
      logger.warn(`Image not found at ${imagePath}, skipping removal`);

      return;
    }

    logger.error(`Error removing image at ${imagePath}:`, error);
    throw new BadRequestException('Error removing image');
  }
}
