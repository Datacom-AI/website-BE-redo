import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { ProductCategoryModule } from './productCategory/productCategory.module';
import { PrismaService } from 'src/prisma.service';

@Module({
  providers: [ProductService, PrismaService],
  controllers: [ProductController],
  imports: [ProductCategoryModule],
})
export class ProductModule {}
