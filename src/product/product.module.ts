import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { ProductCategoryModule } from './productCategory/productCategory.module';
import { PrismaService } from 'src/prisma.service';
import { ConfigService } from '@nestjs/config';

@Module({
  controllers: [ProductController],
  providers: [ProductService, PrismaService, ConfigService],
  imports: [ProductCategoryModule],
  exports: [ProductService],
})
export class ProductModule {}
