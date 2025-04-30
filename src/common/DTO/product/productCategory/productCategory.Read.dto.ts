export class ProductCategoryReadDTO {
  id: string;

  name: string;

  // Note: The 'products' relation (one-to-many) is typically not nested in a Read DTO
  // Products are usually fetched via a separate endpoint (e.g., /products?categoryId=...)

  createdAt: Date;
  updatedAt: Date;
}
