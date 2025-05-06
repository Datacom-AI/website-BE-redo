import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { ProductCategoryModule } from './product-category/product-category.module';

@Module({
  providers: [ProductService],
  controllers: [ProductController],
  imports: [ProductCategoryModule],
})
export class ProductModule {}
