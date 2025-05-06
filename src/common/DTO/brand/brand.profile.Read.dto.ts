export class BrandProfileReadDTO {
  id: string;
  name: string;

  growthRateYoY?: number | null;
  marketPenetrationPercentage?: number | null;
  marketSharePercentage?: number | null;
  estimatedShopperReachK?: number | null;
  totalRetailerSales?: number | null;

  productFeatures?: string[];
  brandCertifications?: string[];
  sustainabilityClaims?: string[];

  totalSocialMediaFollowers?: number | null;
  averageEngagementRate?: number | null;

  marketingCampaignCount?: number;

  createdAt: Date;
  updatedAt: Date;
}
