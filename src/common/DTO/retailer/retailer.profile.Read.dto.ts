export class RetailerProfileReadDTO {
  id: string;
  userId: string;
  businessType?: string | null;
  storeFormat?: string | null;
  averageStoreSize?: string | null;
  customerBaseDescription?: string | null;
  totalSkus?: number | null;
  activeCustomerCount?: number | null;
  averageMonthlySales?: number | null;
  salesGrowthRateYoY?: number | null;
  inventoryInStockPercentage?: number | null;
  fulfillmentPercentage?: number | null;
  topSellingCategoriesJson?: object | null;
  customerDemographicsJson?: object | null;
  purchaseFrequencyJson?: object | null;
  storeLocationCount?: number;
  retailerProductCount?: number;
  createdAt: Date;
  updatedAt: Date;
}
