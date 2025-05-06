import { UserReadMinimalDTO } from '../../others/userMinimal.Read.dto';

export class RetailerManufacturerPartnershipReadDTO {
  id: string;

  manufacturerUserId: string;
  retailerUserId: string;

  manufacturerUser: UserReadMinimalDTO;
  retailerUser: UserReadMinimalDTO;

  partnershipType?: string | null;
  agreementDetails?: string | null;
  creditTerms?: string | null;
  minimumOrderRequirements?: string | null;

  isActive: boolean;

  notes?: string | null;
  partnershipTier?: string | null;

  partnershipStartDate?: Date | null;
  partnershipEndDate?: Date | null;

  createdAt: Date;
  updatedAt: Date;
}
