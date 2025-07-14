import { RevenueReportData } from '../../../types/RevenueReport';
import { formatAEDCurrency } from '../../../Utils/Formatters';

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const generateRevenueReportContent = (revenueData: RevenueReportData[]) => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Calculate totals across all warehouses
  const totalRevenue = revenueData.reduce(
    (sum, item) => sum + item.totalRevenue,
    0,
  );
  const totalExpenses = revenueData.reduce(
    (sum, item) => sum + item.totalExpenses,
    0,
  );
  const totalNetRevenue = revenueData.reduce(
    (sum, item) => sum + item.netRevenue,
    0,
  );

  let html = `
    <html>
      <head>
        <meta charset="utf-8">
        <title>Revenue Report</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            color: #333; 
          }
          .header { 
            text-align: center; 
            margin-bottom: 30px; 
            border-bottom: 2px solid #007bff; 
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
            grid-template-columns: repeat(3, 1fr); 
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
            color: #007bff; 
          }
          .summary-label { 
            font-size: 14px; 
            color: #666; 
            margin-top: 5px;
          }
          .warehouse-section { 
            margin-bottom: 40px; 
            page-break-inside: avoid; 
          }
          .warehouse-header { 
            background-color: #f8f9fa; 
            padding: 15px; 
            border-radius: 8px; 
            margin-bottom: 20px; 
          }
          .warehouse-name { 
            font-size: 18px; 
            font-weight: bold; 
            color: #007bff; 
          }
          .warehouse-info { 
            margin-top: 10px; 
            font-size: 14px; 
          }
          .revenue-grid { 
            display: grid; 
            grid-template-columns: repeat(4, 1fr); 
            gap: 15px; 
            margin-bottom: 20px; 
          }
          .revenue-item { 
            text-align: center; 
            padding: 12px; 
            border: 1px solid #ddd; 
            border-radius: 5px; 
          }
          .revenue-value { 
            font-size: 16px; 
            font-weight: bold; 
            color: #007bff; 
          }
          .revenue-label { 
            font-size: 12px; 
            color: #666; 
          }
          .revenue-positive { color: #4CAF50; }
          .revenue-negative { color: #FF5722; }
          .customers-section { 
            margin-top: 20px; 
          }
          .customers-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 10px; 
          }
          .customers-table th, 
          .customers-table td { 
            border: 1px solid #ddd; 
            padding: 10px; 
            text-align: left; 
            font-size: 12px; 
          }
          .customers-table th { 
            background-color: #f8f9fa; 
            font-weight: bold; 
          }
          .customers-table tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          .no-customers {
            text-align: center;
            color: #666;
            font-style: italic;
            padding: 20px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Revenue Report</h1>
          <p>Generated on: ${currentDate}</p>
        </div>

        <div class="summary-section">
          <h2>Overall Summary</h2>
          <div class="summary-grid">
            <div class="summary-item">
              <div class="summary-value">${formatAEDCurrency(totalRevenue)}</div>
              <div class="summary-label">Total Revenue</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">${formatAEDCurrency(totalExpenses)}</div>
              <div class="summary-label">Total Expenses</div>
            </div>
            <div class="summary-item">
              <div class="summary-value ${totalNetRevenue >= 0 ? 'revenue-positive' : 'revenue-negative'}">${formatAEDCurrency(totalNetRevenue)}</div>
              <div class="summary-label">Net Revenue</div>
            </div>
          </div>
        </div>
  `;

  revenueData.forEach((warehouse) => {
    html += `
      <div class="warehouse-section">
        <div class="warehouse-header">
          <div class="warehouse-name">${warehouse.warehouseName}</div>
          <div class="warehouse-info">
            <div><strong>Warehouse ID:</strong> ${warehouse.warehouseId}</div>
            <div><strong>Report Date:</strong> ${formatDate(warehouse.date)}</div>
          </div>
        </div>
        
        <div class="revenue-grid">
          <div class="revenue-item">
            <div class="revenue-value">${formatAEDCurrency(warehouse.totalRevenue)}</div>
            <div class="revenue-label">Total Revenue</div>
          </div>
          <div class="revenue-item">
            <div class="revenue-value">${formatAEDCurrency(warehouse.totalExpenses)}</div>
            <div class="revenue-label">Total Expenses</div>
          </div>
          <div class="revenue-item">
            <div class="revenue-value ${warehouse.netRevenue >= 0 ? 'revenue-positive' : 'revenue-negative'}">${formatAEDCurrency(warehouse.netRevenue)}</div>
            <div class="revenue-label">Net Revenue</div>
          </div>
          <div class="revenue-item">
            <div class="revenue-value">${warehouse.customerDetails.length}</div>
            <div class="revenue-label">Active Customers</div>
          </div>
        </div>
        
        <div class="customers-section">
          <h3>Customer Revenue Details</h3>
    `;

    if (warehouse.customerDetails.length > 0) {
      html += `
        <table class="customers-table">
          <thead>
            <tr>
              <th>Customer Name</th>
              <th>Unit Number</th>
              <th>Revenue Amount</th>
            </tr>
          </thead>
          <tbody>
      `;

      warehouse.customerDetails.forEach((customer) => {
        html += `
          <tr>
            <td>${customer.customerName}</td>
            <td>${customer.unitNumber || 'N/A'}</td>
            <td>${formatAEDCurrency(customer.amount)}</td>
          </tr>
        `;
      });

      html += `
          </tbody>
        </table>
      `;
    } else {
      html += `
        <div class="no-customers">
          No customer revenue data available for this warehouse.
        </div>
      `;
    }

    html += `
        </div>
      </div>
    `;
  });

  html += `
      </body>
    </html>
  `;

  return html;
};

export default generateRevenueReportContent;
