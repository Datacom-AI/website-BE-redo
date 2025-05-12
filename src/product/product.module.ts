import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { ProductCategoryModule } from './product-category/product-category.module';

@Module({
  controllers: [ProductController],
  providers: [ProductService],
  imports: [ProductCategoryModule]
})
export class ProductModule {}
