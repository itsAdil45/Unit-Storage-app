

import { CustomerReportData } from "../../../types/CustomerReport";

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
  const generateCustomerPDFContent = (customers: CustomerReportData[]) => {
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    let html = `
      <html>
        <head>
          <meta charset="utf-8">
          <title>Customer Report</title>
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
            .customer-section { 
              margin-bottom: 40px; 
              page-break-inside: avoid; 
            }
            .customer-header { 
              background-color: #f8f9fa; 
              padding: 15px; 
              border-radius: 8px; 
              margin-bottom: 20px; 
            }
            .customer-name { 
              font-size: 18px; 
              font-weight: bold; 
              color: #007bff; 
            }
            .customer-info { 
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
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Customer Report</h1>
            <p>Generated on: ${currentDate}</p>
          </div>
    `;

    customers.forEach((customer) => {
      html += `
        <div class="customer-section">
          <div class="customer-header">
            <div class="customer-name">${customer.firstName} ${customer.lastName}</div>
            <div class="customer-info">
              <div><strong>Email:</strong> ${customer.email}</div>
              <div><strong>Phone:</strong> ${customer.phone}</div>
              <div><strong>Inquiry:</strong> ${customer.inquiry}</div>
            </div>
          </div>
          
          <div class="summary-grid">
            <div class="summary-item">
              <div class="summary-value">${customer.totalBookings}</div>
              <div class="summary-label">Total Bookings</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">${customer.activeBookings}</div>
              <div class="summary-label">Active Bookings</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">${customer.completedBookings}</div>
              <div class="summary-label">Completed Bookings</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">${formatCurrency(customer.totalPayment)}</div>
              <div class="summary-label">Total Payment</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">${formatCurrency(customer.paidPayment)}</div>
              <div class="summary-label">Paid Payment</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">${formatCurrency(customer.pendingPayments)}</div>
              <div class="summary-label">Pending Payments</div>
            </div>
          </div>
          
          <div class="booking-details">
            <h3>Booking Details</h3>
      `;

      customer.bookingDetails.forEach((booking) => {
        html += `
          <div class="booking-item">
            <div class="booking-header">
              Booking #${booking.bookingId} - Unit ${booking.unitNumber}
            </div>
            <div class="booking-info">
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

  export default generateCustomerPDFContent;