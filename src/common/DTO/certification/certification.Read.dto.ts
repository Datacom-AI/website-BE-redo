export class CertificationReadDTO {
  id: string;

  manufacturerProfileId: string;

  name: string;

  description?: string | null;
  issuingOrganization?: string | null;
  certificateNumber?: string | null;
  issueDate?: Date | null;
  expiryDate?: Date | null;

  certificationCompliance?: string[];

  createdAt: Date;
  updatedAt: Date;
}
