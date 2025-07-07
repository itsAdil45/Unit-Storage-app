import * as XLSX from 'xlsx';
import { ExpenseReportData } from "../../../types/ExpenseReport";

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatCurrency = (amount: number | string) => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return num;
};

export const generateExpenseExcelWorkbook = (expenseData: ExpenseReportData[]): XLSX.WorkBook => {
  const workbook = XLSX.utils.book_new();

  // Expense Summary Sheet
  const expenseSummaryData = expenseData.map(expense => ({
    'Date': formatDate(expense.date),
    'Warehouse ID': expense.warehouseId,
    'Warehouse Name': expense.warehouseName,
    'Expense Type': expense.expenseType,
    'Description': expense.description,
    'Amount': formatCurrency(expense.total),
    'Month': new Date(expense.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
    'Year': new Date(expense.date).getFullYear(),
  }));
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(expenseSummaryData), 'Expense Summary');

  // Warehouse Analysis Sheet
  const warehouseAnalysisData: any[] = [];
  const warehouseGroups = expenseData.reduce((acc, expense) => {
    if (!acc[expense.warehouseId]) {
      acc[expense.warehouseId] = {
        warehouseName: expense.warehouseName,
        expenses: []
      };
    }
    acc[expense.warehouseId].expenses.push(expense);
    return acc;
  }, {} as Record<number, { warehouseName: string; expenses: ExpenseReportData[] }>);

  Object.entries(warehouseGroups).forEach(([warehouseId, data]) => {
    const totalExpenses = data.expenses.reduce((sum, expense) => sum + expense.total, 0);
    const expenseCount = data.expenses.length;
    const averageExpense = expenseCount > 0 ? totalExpenses / expenseCount : 0;
    const expenseTypes = [...new Set(data.expenses.map(e => e.expenseType))];
    const dateRange = {
      earliest: new Date(Math.min(...data.expenses.map(e => new Date(e.date).getTime()))),
      latest: new Date(Math.max(...data.expenses.map(e => new Date(e.date).getTime())))
    };

    warehouseAnalysisData.push({
      'Warehouse ID': parseInt(warehouseId),
      'Warehouse Name': data.warehouseName,
      'Total Expenses': formatCurrency(totalExpenses),
      'Number of Expense Entries': expenseCount,
      'Average Expense Amount': formatCurrency(averageExpense),
      'Unique Expense Types': expenseTypes.length,
      'Expense Types List': expenseTypes.join(', '),
      'Date Range Start': formatDate(dateRange.earliest.toISOString()),
      'Date Range End': formatDate(dateRange.latest.toISOString()),
      'Highest Single Expense': formatCurrency(Math.max(...data.expenses.map(e => e.total))),
      'Lowest Single Expense': formatCurrency(Math.min(...data.expenses.map(e => e.total))),
    });
  });

  // Sort by total expenses descending
  warehouseAnalysisData.sort((a, b) => b['Total Expenses'] - a['Total Expenses']);
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(warehouseAnalysisData), 'Warehouse Analysis');

  // Expense Type Analysis Sheet
  const expenseTypeAnalysisData: any[] = [];
  const expenseTypeGroups = expenseData.reduce((acc, expense) => {
    if (!acc[expense.expenseType]) {
      acc[expense.expenseType] = [];
    }
    acc[expense.expenseType].push(expense);
    return acc;
  }, {} as Record<string, ExpenseReportData[]>);

  Object.entries(expenseTypeGroups).forEach(([expenseType, expenses]) => {
    const totalAmount = expenses.reduce((sum, expense) => sum + expense.total, 0);
    const expenseCount = expenses.length;
    const averageAmount = expenseCount > 0 ? totalAmount / expenseCount : 0;
    const warehouses = [...new Set(expenses.map(e => e.warehouseId))];
    const totalExpenseAmount = expenseData.reduce((sum, expense) => sum + expense.total, 0);
    const percentageOfTotal = totalExpenseAmount > 0 ? (totalAmount / totalExpenseAmount) * 100 : 0;

    expenseTypeAnalysisData.push({
      'Expense Type': expenseType,
      'Total Amount': formatCurrency(totalAmount),
      'Number of Entries': expenseCount,
      'Average Amount': formatCurrency(averageAmount),
      'Warehouses Count': warehouses.length,
      'Percentage of Total Expenses': percentageOfTotal.toFixed(2),
      'Highest Amount': formatCurrency(Math.max(...expenses.map(e => e.total))),
      'Lowest Amount': formatCurrency(Math.min(...expenses.map(e => e.total))),
      'Most Frequent Warehouse': expenses.reduce((acc, expense) => {
        acc[expense.warehouseName] = (acc[expense.warehouseName] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    });
  });

  // Convert the most frequent warehouse object to string
  expenseTypeAnalysisData.forEach(item => {
    const warehouseFreq = item['Most Frequent Warehouse'];
    const mostFrequent = Object.entries(warehouseFreq).sort(([,a], [,b]) => (b as number) - (a as number))[0];
    item['Most Frequent Warehouse'] = mostFrequent ? `${mostFrequent[0]} (${mostFrequent[1]} times)` : 'N/A';
  });

  // Sort by total amount descending
  expenseTypeAnalysisData.sort((a, b) => b['Total Amount'] - a['Total Amount']);
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(expenseTypeAnalysisData), 'Expense Type Analysis');

  // Monthly Trends Sheet
  const monthlyTrendsData: any[] = [];
  const monthlyGroups = expenseData.reduce((acc, expense) => {
    const monthKey = new Date(expense.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    if (!acc[monthKey]) {
      acc[monthKey] = [];
    }
    acc[monthKey].push(expense);
    return acc;
  }, {} as Record<string, ExpenseReportData[]>);

  Object.entries(monthlyGroups).forEach(([month, expenses]) => {
    const totalAmount = expenses.reduce((sum, expense) => sum + expense.total, 0);
    const expenseCount = expenses.length;
    const averageAmount = expenseCount > 0 ? totalAmount / expenseCount : 0;
    const uniqueWarehouses = [...new Set(expenses.map(e => e.warehouseId))].length;
    const uniqueExpenseTypes = [...new Set(expenses.map(e => e.expenseType))].length;

    monthlyTrendsData.push({
      'Month': month,
      'Total Expenses': formatCurrency(totalAmount),
      'Number of Entries': expenseCount,
      'Average Expense': formatCurrency(averageAmount),
      'Active Warehouses': uniqueWarehouses,
      'Expense Types Used': uniqueExpenseTypes,
      'Highest Single Expense': formatCurrency(Math.max(...expenses.map(e => e.total))),
      'Lowest Single Expense': formatCurrency(Math.min(...expenses.map(e => e.total))),
    });
  });

  // Sort by month chronologically
  monthlyTrendsData.sort((a, b) => new Date(a.Month).getTime() - new Date(b.Month).getTime());
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(monthlyTrendsData), 'Monthly Trends');

  // Overall Analytics Sheet
  const overallAnalytics = [];
  
  // Calculate overall totals and metrics
  const totalExpenses = expenseData.reduce((sum, expense) => sum + expense.total, 0);
  const totalEntries = expenseData.length;
  const totalWarehouses = [...new Set(expenseData.map(e => e.warehouseId))].length;
  const totalExpenseTypes = [...new Set(expenseData.map(e => e.expenseType))].length;
  const averageExpenseAmount = totalEntries > 0 ? totalExpenses / totalEntries : 0;
  const averageExpensesPerWarehouse = totalWarehouses > 0 ? totalExpenses / totalWarehouses : 0;
  const averageEntriesPerWarehouse = totalWarehouses > 0 ? totalEntries / totalWarehouses : 0;

  // Date range analysis
  const dates = expenseData.map(e => new Date(e.date));
  const earliestDate = new Date(Math.min(...dates.map(d => d.getTime())));
  const latestDate = new Date(Math.max(...dates.map(d => d.getTime())));
  const daysDifference = Math.ceil((latestDate.getTime() - earliestDate.getTime()) / (1000 * 60 * 60 * 24));

  overallAnalytics.push({
    'Metric': 'Total Expenses',
    'Value': formatCurrency(totalExpenses),
    'Type': 'Currency'
  });
  overallAnalytics.push({
    'Metric': 'Total Expense Entries',
    'Value': totalEntries,
    'Type': 'Count'
  });
  overallAnalytics.push({
    'Metric': 'Total Warehouses',
    'Value': totalWarehouses,
    'Type': 'Count'
  });
  overallAnalytics.push({
    'Metric': 'Total Expense Types',
    'Value': totalExpenseTypes,
    'Type': 'Count'
  });
  overallAnalytics.push({
    'Metric': 'Average Expense Amount',
    'Value': formatCurrency(averageExpenseAmount),
    'Type': 'Currency'
  });
  overallAnalytics.push({
    'Metric': 'Average Expenses per Warehouse',
    'Value': formatCurrency(averageExpensesPerWarehouse),
    'Type': 'Currency'
  });
  overallAnalytics.push({
    'Metric': 'Average Entries per Warehouse',
    'Value': averageEntriesPerWarehouse.toFixed(2),
    'Type': 'Decimal'
  });
  overallAnalytics.push({
    'Metric': 'Date Range (Days)',
    'Value': daysDifference,
    'Type': 'Count'
  });
  overallAnalytics.push({
    'Metric': 'Earliest Expense Date',
    'Value': formatDate(earliestDate.toISOString()),
    'Type': 'Date'
  });
  overallAnalytics.push({
    'Metric': 'Latest Expense Date',
    'Value': formatDate(latestDate.toISOString()),
    'Type': 'Date'
  });

  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(overallAnalytics), 'Overall Analytics');

  // Top Expenses Sheet
  const topExpensesData: any[] = [];
  
  // Sort all expenses by amount (highest first)
  const sortedExpenses = [...expenseData].sort((a, b) => b.total - a.total);
  
  sortedExpenses.forEach((expense, index) => {
    topExpensesData.push({
      'Rank': index + 1,
      'Date': formatDate(expense.date),
      'Warehouse Name': expense.warehouseName,
      'Warehouse ID': expense.warehouseId,
      'Expense Type': expense.expenseType,
      'Description': expense.description,
      'Amount': formatCurrency(expense.total),
      'Percentage of Total': totalExpenses > 0 ? ((expense.total / totalExpenses) * 100).toFixed(2) : 0,
    });
  });

  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(topExpensesData), 'Top Expenses');

  return workbook;
};