import { last } from 'rxjs';

export class ReviewAuthorReadDTO {
  id: string;

  name: string;
  profileImageUrl?: string;
}

export class ReviewProductReadDTO {
  id: string;

  name: string;
  imageUrl?: string; // product image
}

export class ReviewReadDTO {
  id: string;

  author: ReviewAuthorReadDTO;
  product: ReviewProductReadDTO;

  rating?: number;
  comment?: string;

  createdAt: Date;
  updatedAt: Date;
}
