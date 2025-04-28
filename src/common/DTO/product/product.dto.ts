import { IsNotEmpty, IsString } from 'class-validator';

export class ProductDTO {
  @IsString()
  @IsNotEmpty()
  name: string;

  category: string;
  description: string;
  price: number;
  countInStock: number;
  image: string;
  rating: number;
  numReviews: number;
  createdAt: Date;
  updatedAt: Date;
}
