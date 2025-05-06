import { Injectable } from '@nestjs/common';

@Injectable()
export class ProductCategoryService {
  getAllCategories() {
    return ['Electronics', 'Books', 'Clothing'];
  }

  getCategoryById(id: number) {
    const categories = this.getAllCategories();
    return categories[id] || null;
  }
}
