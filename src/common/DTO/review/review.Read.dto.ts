import {} from 'class-validator';

export class ReviewAuthorReadDTO {
  id: string;
  name: string;
  profileImageUrl?: string | null;
}

export class ReviewProductReadDTO {
  id: string;
  name: string;
  imageUrl?: string | null;
}

export class ReviewReadDTO {
  id: string;

  author: ReviewAuthorReadDTO;
  product: ReviewProductReadDTO;

  rating?: number | null;

  comment?: string | null;

  createdAt: Date;
  updatedAt: Date;
}
