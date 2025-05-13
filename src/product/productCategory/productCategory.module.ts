import { Module } from '@nestjs/common';
import { ProductCategoryController } from './productCategory.controller';
import { ProductCategoryService } from './productCategory.service';
import { PrismaService } from 'src/prisma.service'; // Ensure PrismaService is imported

@Module({
  controllers: [ProductCategoryController],
  providers: [ProductCategoryService, PrismaService], // Add PrismaService to providers
  exports: [ProductCategoryService], // Export service if other modules need it
})
export class ProductCategoryModule {}
