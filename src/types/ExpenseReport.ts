export interface ExpenseReportData {
  date: string;
  expenseType: string;
  description: string;
  total: number;
  warehouseId: number;
  warehouseName: string;
}

export interface ApiResponse {
  status: string;
  message: string;
  data: {
    downloadLink: string;
    reportDataResult: ExpenseReportData[];
  };
}
