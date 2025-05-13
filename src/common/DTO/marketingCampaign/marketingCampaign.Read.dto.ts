import { Status, CampaignType } from 'generated/prisma';

export class MarketingCampaignReadDTO {
  id: string;

  brandProfileId: string;

  name: string;

  description?: string | null;
  startDate?: Date | null;
  endDate?: Date | null;
  targetAudience?: string | null;

  campaignType?: CampaignType | null;
  status: Status;

  marketingBudget?: number | null;

  budgetAllocationJson?: object | null;

  createdAt: Date;
  updatedAt: Date;
}
