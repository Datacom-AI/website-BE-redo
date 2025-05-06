import { Module } from '@nestjs/common';
import { ProductCategoryController } from './productCategory.controller';
import { ProductCategoryService } from './productCategory.service';

@Module({
  controllers: [ProductCategoryController],
  providers: [ProductCategoryService],
})
export class ProductCategoryModule {}
