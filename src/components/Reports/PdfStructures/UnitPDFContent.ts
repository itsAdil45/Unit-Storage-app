import { UnitReportData } from "../../../types/StorageUnitsReport";

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

const generateUnitPDFContent = (units: UnitReportData[]) => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  let html = `
    <html>
      <head>
        <meta charset="utf-8">
        <title>Unit Report</title>
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
          .unit-section { 
            margin-bottom: 40px; 
            page-break-inside: avoid; 
          }
          .unit-header { 
            background-color: #f8f9fa; 
            padding: 15px; 
            border-radius: 8px; 
            margin-bottom: 20px; 
          }
          .unit-name { 
            font-size: 18px; 
            font-weight: bold; 
            color: #007bff; 
          }
          .unit-info { 
            margin-top: 10px; 
            font-size: 14px; 
          }
          .summary-grid { 
            display: grid; 
            grid-template-columns: repeat(3, 1fr); 
            gap: 15px; 
            margin-bottom: 20px; 
          }
          .summary-item { 
            text-align: center; 
            padding: 10px; 
            border: 1px solid #ddd; 
            border-radius: 5px; 
          }
          .summary-value { 
            font-size: 16px; 
            font-weight: bold; 
            color: #007bff; 
          }
          .summary-label { 
            font-size: 12px; 
            color: #666; 
          }
          .booking-details { 
            margin-top: 20px; 
          }
          .booking-item { 
            border: 1px solid #ddd; 
            border-radius: 5px; 
            margin-bottom: 20px; 
            padding: 15px; 
          }
          .booking-header { 
            font-weight: bold; 
            margin-bottom: 10px; 
            color: #007bff; 
          }
          .booking-info { 
            display: grid; 
            grid-template-columns: repeat(2, 1fr); 
            gap: 10px; 
            margin-bottom: 15px; 
          }
          .payments-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 10px; 
          }
          .payments-table th, 
          .payments-table td { 
            border: 1px solid #ddd; 
            padding: 8px; 
            text-align: left; 
            font-size: 12px; 
          }
          .payments-table th { 
            background-color: #f8f9fa; 
            font-weight: bold; 
          }
          .status-paid { color: #4CAF50; font-weight: bold; }
          .status-pending { color: #FF9800; font-weight: bold; }
          .status-active { color: #4CAF50; font-weight: bold; }
          .status-completed { color: #2196F3; font-weight: bold; }
          .status-cancelled { color: #FF5722; font-weight: bold; }
          .status-available { color: #4CAF50; font-weight: bold; }
          .status-occupied { color: #FF9800; font-weight: bold; }
          .status-maintenance { color: #FF5722; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Unit Report</h1>
          <p>Generated on: ${currentDate}</p>
        </div>
  `;

  units.forEach((unit) => {
    const totalBookings = unit.bookings.length;
    const activeBookings = unit.bookings.filter(b => b.bookingStatus === 'active').length;
    const completedBookings = unit.bookings.filter(b => b.bookingStatus === 'completed').length;
    const totalRevenue = unit.bookings.reduce((sum, booking) => sum + parseFloat(booking.price), 0);
    const totalPayments = unit.bookings.reduce((sum, booking) => sum + booking.payments.length, 0);
    const paidPayments = unit.bookings.reduce((sum, booking) => sum + booking.payments.filter(p => p.status === 'paid').length, 0);

    html += `
      <div class="unit-section">
        <div class="unit-header">
          <div class="unit-name">Unit ${unit.unitNumber}</div>
          <div class="unit-info">
            <div><strong>Warehouse:</strong> ${unit.warehouseName}</div>
            <div><strong>Floor:</strong> ${unit.floor}</div>
            <div><strong>Size:</strong> ${unit.size} m²</div>
            <div><strong>Status:</strong> <span class="status-${unit.status.toLowerCase()}">${unit.status.toUpperCase()}</span></div>
          </div>
        </div>
        
        <div class="summary-grid">
          <div class="summary-item">
            <div class="summary-value">${totalBookings}</div>
            <div class="summary-label">Total Bookings</div>
          </div>
          <div class="summary-item">
            <div class="summary-value">${activeBookings}</div>
            <div class="summary-label">Active Bookings</div>
          </div>
          <div class="summary-item">
            <div class="summary-value">${completedBookings}</div>
            <div class="summary-label">Completed Bookings</div>
          </div>
          <div class="summary-item">
            <div class="summary-value">${formatCurrency(totalRevenue)}</div>
            <div class="summary-label">Total Revenue</div>
          </div>
          <div class="summary-item">
            <div class="summary-value">${totalPayments}</div>
            <div class="summary-label">Total Payments</div>
          </div>
          <div class="summary-item">
            <div class="summary-value">${paidPayments}</div>
            <div class="summary-label">Paid Payments</div>
          </div>
        </div>
        
        <div class="booking-details">
          <h3>Booking History</h3>
    `;

    unit.bookings.forEach((booking) => {
      html += `
        <div class="booking-item">
          <div class="booking-header">
            Booking #${booking.bookingId}
          </div>
          <div class="booking-info">
            <div><strong>Customer:</strong> ${booking.customerName}</div>
            <div><strong>Email:</strong> ${booking.customerEmail}</div>
            <div><strong>Phone:</strong> ${booking.customerPhone}</div>
            <div><strong>Start Date:</strong> ${formatDate(booking.startDate)}</div>
            <div><strong>End Date:</strong> ${formatDate(booking.endDate)}</div>
            <div><strong>Status:</strong> <span class="status-${booking.bookingStatus}">${booking.bookingStatus.toUpperCase()}</span></div>
            <div><strong>Space:</strong> ${booking.spaceOccupied} m²</div>
            <div><strong>Price:</strong> ${formatCurrency(booking.price)}</div>
          </div>
          
          <h4>Payment History</h4>
          <table class="payments-table">
            <thead>
              <tr>
                <th>Payment ID</th>
                <th>Date</th>
                <th>Method</th>
                <th>Amount</th>
                <th>Period</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
      `;

      booking.payments.forEach((payment) => {
        html += `
          <tr>
            <td>${payment.paymentId}</td>
            <td>${formatDate(payment.date)}</td>
            <td>${payment.method || 'N/A'}</td>
            <td>${formatCurrency(payment.amount)}</td>
            <td>${formatDate(payment.startDate)} - ${formatDate(payment.endDate)}</td>
            <td><span class="status-${payment.status}">${payment.status.toUpperCase()}</span></td>
          </tr>
        `;
      });

      html += `
            </tbody>
          </table>
        </div>
      `;
    });

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

export default generateUnitPDFContent;