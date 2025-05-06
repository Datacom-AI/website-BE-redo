import { CampaignStatus, CampaignType } from 'generated/prisma';

export class MarketingCampaignReadDTO {
  id: string;

  brandProfileId: string;

  name: string;

  description?: string | null;
  startDate?: Date | null;
  endDate?: Date | null;
  targetAudience?: string | null;

  campaignType?: CampaignType | null;
  status: CampaignStatus;

  marketingBudget?: number | null;

  budgetAllocationJson?: object | null;

  createdAt: Date;
  updatedAt: Date;
}
