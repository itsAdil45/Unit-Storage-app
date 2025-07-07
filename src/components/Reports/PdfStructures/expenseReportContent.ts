import { ExpenseReportData } from "../../../types/ExpenseReport";

const formatCurrency = (amount: number | string) => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `AED ${num.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const generateExpenseReportContent = (expenseData: ExpenseReportData[]) => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Calculate totals across all warehouses and expense types
  const totalExpenses = expenseData.reduce((sum, item) => sum + item.total, 0);
  const totalWarehouses = [...new Set(expenseData.map(item => item.warehouseId))].length;
  const totalExpenseTypes = [...new Set(expenseData.map(item => item.expenseType))].length;

  // Group by warehouse for summary
  const warehouseExpenses = expenseData.reduce((acc, item) => {
    if (!acc[item.warehouseId]) {
      acc[item.warehouseId] = {
        warehouseName: item.warehouseName,
        total: 0,
        expenseCount: 0
      };
    }
    acc[item.warehouseId].total += item.total;
    acc[item.warehouseId].expenseCount += 1;
    return acc;
  }, {} as Record<number, { warehouseName: string; total: number; expenseCount: number }>);

  // Group by expense type for summary
  const expenseTypeBreakdown = expenseData.reduce((acc, item) => {
    if (!acc[item.expenseType]) {
      acc[item.expenseType] = 0;
    }
    acc[item.expenseType] += item.total;
    return acc;
  }, {} as Record<string, number>);

  let html = `
    <html>
      <head>
        <meta charset="utf-8">
        <title>Expense Report</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            color: #333; 
          }
          .header { 
            text-align: center; 
            margin-bottom: 30px; 
            border-bottom: 2px solid #dc3545; 
            padding-bottom: 20px; 
          }
          .summary-section {
            margin-bottom: 40px;
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
          }
          .summary-grid { 
            display: grid; 
            grid-template-columns: repeat(4, 1fr); 
            gap: 15px; 
            margin-bottom: 20px; 
          }
          .summary-item { 
            text-align: center; 
            padding: 15px; 
            border: 1px solid #ddd; 
            border-radius: 5px; 
            background-color: white;
          }
          .summary-value { 
            font-size: 18px; 
            font-weight: bold; 
            color: #dc3545; 
          }
          .summary-label { 
            font-size: 14px; 
            color: #666; 
            margin-top: 5px;
          }
          .breakdown-section {
            margin-bottom: 40px;
          }
          .breakdown-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
          }
          .breakdown-card {
            background-color: white;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 20px;
          }
          .breakdown-title {
            font-size: 16px;
            font-weight: bold;
            color: #dc3545;
            margin-bottom: 15px;
            border-bottom: 1px solid #eee;
            padding-bottom: 10px;
          }
          .breakdown-item {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #f5f5f5;
          }
          .breakdown-item:last-child {
            border-bottom: none;
          }
          .breakdown-name {
            font-size: 14px;
            color: #333;
          }
          .breakdown-value {
            font-size: 14px;
            font-weight: bold;
            color: #dc3545;
          }
          .expense-details-section { 
            margin-bottom: 40px; 
          }
          .expense-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 20px; 
          }
          .expense-table th, 
          .expense-table td { 
            border: 1px solid #ddd; 
            padding: 12px; 
            text-align: left; 
            font-size: 13px; 
          }
          .expense-table th { 
            background-color: #f8f9fa; 
            font-weight: bold; 
            color: #dc3545;
          }
          .expense-table tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          .expense-table tr:hover {
            background-color: #f5f5f5;
          }
          .amount-cell {
            text-align: right;
            font-weight: bold;
            color: #dc3545;
          }
          .date-cell {
            white-space: nowrap;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Expense Report</h1>
          <p>Generated on: ${currentDate}</p>
        </div>

        <div class="summary-section">
          <h2>Overall Summary</h2>
          <div class="summary-grid">
            <div class="summary-item">
              <div class="summary-value">${formatCurrency(totalExpenses)}</div>
              <div class="summary-label">Total Expenses</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">${totalWarehouses}</div>
              <div class="summary-label">Warehouses</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">${totalExpenseTypes}</div>
              <div class="summary-label">Expense Types</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">${expenseData.length}</div>
              <div class="summary-label">Total Entries</div>
            </div>
          </div>
        </div>

        <div class="breakdown-section">
          <h2>Expense Breakdown</h2>
          <div class="breakdown-grid">
            <div class="breakdown-card">
              <div class="breakdown-title">By Warehouse</div>
  `;

  // Add warehouse breakdown
  Object.entries(warehouseExpenses)
    .sort(([,a], [,b]) => b.total - a.total)
    .forEach(([warehouseId, data]) => {
      html += `
        <div class="breakdown-item">
          <div class="breakdown-name">${data.warehouseName}</div>
          <div class="breakdown-value">${formatCurrency(data.total)}</div>
        </div>
      `;
    });

  html += `
            </div>
            <div class="breakdown-card">
              <div class="breakdown-title">By Expense Type</div>
  `;

  // Add expense type breakdown
  Object.entries(expenseTypeBreakdown)
    .sort(([,a], [,b]) => b - a)
    .forEach(([expenseType, total]) => {
      html += `
        <div class="breakdown-item">
          <div class="breakdown-name">${expenseType}</div>
          <div class="breakdown-value">${formatCurrency(total)}</div>
        </div>
      `;
    });

  html += `
            </div>
          </div>
        </div>

        <div class="expense-details-section">
          <h2>Detailed Expense Records</h2>
          <table class="expense-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Warehouse</th>
                <th>Expense Type</th>
                <th>Description</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
  `;

  // Sort expenses by date (newest first) and then by amount (highest first)
  const sortedExpenses = [...expenseData].sort((a, b) => {
    const dateCompare = new Date(b.date).getTime() - new Date(a.date).getTime();
    return dateCompare !== 0 ? dateCompare : b.total - a.total;
  });

  sortedExpenses.forEach((expense) => {
    html += `
      <tr>
        <td class="date-cell">${formatDate(expense.date)}</td>
        <td>${expense.warehouseName}</td>
        <td>${expense.expenseType}</td>
        <td>${expense.description}</td>
        <td class="amount-cell">${formatCurrency(expense.total)}</td>
      </tr>
    `;
  });

  html += `
            </tbody>
          </table>
        </div>
      </body>
    </html>
  `;

  return html;
};

export default generateExpenseReportContent;