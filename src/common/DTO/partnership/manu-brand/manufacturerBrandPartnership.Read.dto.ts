import { UserReadMinimalDTO } from '../../others/userMinimal.Read.dto';

export class ManufacturerBrandPartnershipReadDTO {
  id: string;

  manufacturerUserId: string;
  brandUserId: string;

  manufacturerUser: UserReadMinimalDTO;
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
