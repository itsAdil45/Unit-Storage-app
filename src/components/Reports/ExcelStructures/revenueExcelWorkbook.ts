import * as XLSX from 'xlsx';
import { RevenueReportData } from '../../../types/RevenueReport';
import { formatDate, formatCurrency } from '../../../Utils/Formatters';

export const generateRevenueExcelWorkbook = (
  reportData: RevenueReportData[],
): XLSX.WorkBook => {
  const workbook = XLSX.utils.book_new();

  // Revenue Summary Sheet
  const revenueSummaryData = reportData.map((warehouse) => ({
    'Report Date': formatDate(warehouse.date),
    'Warehouse ID': warehouse.warehouseId,
    'Warehouse Name': warehouse.warehouseName,
    'Total Revenue': formatCurrency(warehouse.totalRevenue),
    'Total Expenses': formatCurrency(warehouse.totalExpenses),
    'Net Revenue': formatCurrency(warehouse.netRevenue),
    'Active Customers': warehouse.customerDetails.length,
    'Revenue per Customer':
      warehouse.customerDetails.length > 0
        ? formatCurrency(
            warehouse.totalRevenue / warehouse.customerDetails.length,
          )
        : 0,
  }));
  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(revenueSummaryData),
    'Revenue Summary',
  );

  // Warehouse Details Sheet
  const warehouseDetailsData: any[] = [];
  reportData.forEach((warehouse) => {
    // Calculate additional metrics per warehouse
    const totalCustomerRevenue = warehouse.customerDetails.reduce(
      (sum, customer) => sum + customer.amount,
      0,
    );
    const averageRevenuePerCustomer =
      warehouse.customerDetails.length > 0
        ? totalCustomerRevenue / warehouse.customerDetails.length
        : 0;

    warehouseDetailsData.push({
      'Report Date': formatDate(warehouse.date),
      'Warehouse ID': warehouse.warehouseId,
      'Warehouse Name': warehouse.warehouseName,
      'Total Revenue': formatCurrency(warehouse.totalRevenue),
      'Total Expenses': formatCurrency(warehouse.totalExpenses),
      'Net Revenue': formatCurrency(warehouse.netRevenue),
      'Profit Margin (%)':
        warehouse.totalRevenue > 0
          ? ((warehouse.netRevenue / warehouse.totalRevenue) * 100).toFixed(2)
          : 0,
      'Total Customers': warehouse.customerDetails.length,
      'Customer Revenue Sum': formatCurrency(totalCustomerRevenue),
      'Average Revenue per Customer': formatCurrency(averageRevenuePerCustomer),
      'Revenue vs Customer Revenue Diff': formatCurrency(
        warehouse.totalRevenue - totalCustomerRevenue,
      ),
    });
  });
  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(warehouseDetailsData),
    'Warehouse Details',
  );

  // Customer Revenue Details Sheet
  const customerRevenueData: any[] = [];
  reportData.forEach((warehouse) => {
    warehouse.customerDetails.forEach((customer) => {
      customerRevenueData.push({
        'Report Date': formatDate(warehouse.date),
        'Warehouse ID': warehouse.warehouseId,
        'Warehouse Name': warehouse.warehouseName,
        'Customer Name': customer.customerName,
        'Unit Number': customer.unitNumber || 'N/A',
        'Revenue Amount': formatCurrency(customer.amount),
        'Percentage of Warehouse Revenue':
          warehouse.totalRevenue > 0
            ? ((customer.amount / warehouse.totalRevenue) * 100).toFixed(2)
            : 0,
      });
    });
  });
  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(customerRevenueData),
    'Customer Revenue',
  );

  // Overall Analytics Sheet
  const overallAnalytics = [];

  // Calculate overall totals
  const totalRevenue = reportData.reduce(
    (sum, warehouse) => sum + warehouse.totalRevenue,
    0,
  );
  const totalExpenses = reportData.reduce(
    (sum, warehouse) => sum + warehouse.totalExpenses,
    0,
  );
  const totalNetRevenue = reportData.reduce(
    (sum, warehouse) => sum + warehouse.netRevenue,
    0,
  );
  const totalCustomers = reportData.reduce(
    (sum, warehouse) => sum + warehouse.customerDetails.length,
    0,
  );
  const totalWarehouses = reportData.length;

  overallAnalytics.push({
    Metric: 'Total Revenue',
    Value: formatCurrency(totalRevenue),
    Type: 'Currency',
  });
  overallAnalytics.push({
    Metric: 'Total Expenses',
    Value: formatCurrency(totalExpenses),
    Type: 'Currency',
  });
  overallAnalytics.push({
    Metric: 'Net Revenue',
    Value: formatCurrency(totalNetRevenue),
    Type: 'Currency',
  });
  overallAnalytics.push({
    Metric: 'Overall Profit Margin (%)',
    Value:
      totalRevenue > 0
        ? ((totalNetRevenue / totalRevenue) * 100).toFixed(2)
        : 0,
    Type: 'Percentage',
  });
  overallAnalytics.push({
    Metric: 'Total Warehouses',
    Value: totalWarehouses,
    Type: 'Count',
  });
  overallAnalytics.push({
    Metric: 'Total Customers',
    Value: totalCustomers,
    Type: 'Count',
  });
  overallAnalytics.push({
    Metric: 'Average Revenue per Warehouse',
    Value:
      totalWarehouses > 0 ? formatCurrency(totalRevenue / totalWarehouses) : 0,
    Type: 'Currency',
  });
  overallAnalytics.push({
    Metric: 'Average Revenue per Customer',
    Value:
      totalCustomers > 0 ? formatCurrency(totalRevenue / totalCustomers) : 0,
    Type: 'Currency',
  });
  overallAnalytics.push({
    Metric: 'Average Customers per Warehouse',
    Value:
      totalWarehouses > 0 ? (totalCustomers / totalWarehouses).toFixed(2) : 0,
    Type: 'Decimal',
  });

  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(overallAnalytics),
    'Overall Analytics',
  );

  // Top Performers Sheet
  const topPerformersData: any[] = [];

  // Top performing warehouses by revenue
  const warehousesByRevenue = [...reportData].sort(
    (a, b) => b.totalRevenue - a.totalRevenue,
  );
  warehousesByRevenue.forEach((warehouse, index) => {
    topPerformersData.push({
      Rank: index + 1,
      Category: 'Top Warehouse by Revenue',
      'Warehouse Name': warehouse.warehouseName,
      'Warehouse ID': warehouse.warehouseId,
      'Customer Name': '',
      'Unit Number': '',
      Value: formatCurrency(warehouse.totalRevenue),
      Metric: 'Total Revenue',
    });
  });

  // Top performing warehouses by net revenue
  const warehousesByNetRevenue = [...reportData].sort(
    (a, b) => b.netRevenue - a.netRevenue,
  );
  warehousesByNetRevenue.forEach((warehouse, index) => {
    topPerformersData.push({
      Rank: index + 1,
      Category: 'Top Warehouse by Net Revenue',
      'Warehouse Name': warehouse.warehouseName,
      'Warehouse ID': warehouse.warehouseId,
      'Customer Name': '',
      'Unit Number': '',
      Value: formatCurrency(warehouse.netRevenue),
      Metric: 'Net Revenue',
    });
  });

  // Top performing customers by revenue
  const allCustomers: any[] = [];
  reportData.forEach((warehouse) => {
    warehouse.customerDetails.forEach((customer) => {
      allCustomers.push({
        ...customer,
        warehouseName: warehouse.warehouseName,
        warehouseId: warehouse.warehouseId,
      });
    });
  });

  const customersByRevenue = allCustomers.sort((a, b) => b.amount - a.amount);
  customersByRevenue.forEach((customer, index) => {
    topPerformersData.push({
      Rank: index + 1,
      Category: 'Top Customer by Revenue',
      'Warehouse Name': customer.warehouseName,
      'Warehouse ID': customer.warehouseId,
      'Customer Name': customer.customerName,
      'Unit Number': customer.unitNumber || 'N/A',
      Value: formatCurrency(customer.amount),
      Metric: 'Revenue Amount',
    });
  });

  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(topPerformersData),
    'Top Performers',
  );

  return workbook;
};
