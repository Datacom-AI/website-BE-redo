export class StoreLocationReadDTO {
  id: string;

  retailerProfileId: string;

  name: string;

  addressStreet?: string | null;
  addressCity?: string | null;
  addressState?: string | null;
  addressZipCode?: string | null;
  sizeSqFt?: number | null;
  locationType?: string | null;

  isPrimary: boolean;

  createdAt: Date;
  updatedAt: Date;
}
