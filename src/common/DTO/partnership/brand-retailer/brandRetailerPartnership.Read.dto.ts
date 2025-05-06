import { UserReadMinimalDTO } from '../../others/userMinimal.Read.dto';

export class BrandRetailerPartnershipReadDTO {
  id: string;

  retailerUserId: string;
  brandUserId: string;

  retailerUser: UserReadMinimalDTO;
  brandUser: UserReadMinimalDTO;

  partnershipType?: string | null;
  agreementDetails?: string | null;

  isActive: boolean;

  notes?: string | null;

  partnershipStartDate?: Date | null;
  partnershipEndDate?: Date | null;

  partnershipTier?: string | null;

  createdAt: Date;
  updatedAt: Date;
}
