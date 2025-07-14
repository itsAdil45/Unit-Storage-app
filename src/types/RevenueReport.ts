export interface CustomerDetails {
  customerName: string;
  unitNumber: string | null;
  amount: number;
}

export interface RevenueReportData {
  date: string;
  warehouseId: number;
  warehouseName: string;
  totalRevenue: number;
  totalExpenses: number;
  netRevenue: number;
  customerDetails: CustomerDetails[];
}

export interface ApiResponse {
  status: string;
  message: string;
  data: {
    downloadLink: string;
    reportDataResult: RevenueReportData[];
  };
}
