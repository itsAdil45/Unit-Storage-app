import * as XLSX from 'xlsx';

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  const getPaymentMethodDisplay = (method: string | null) => {
    if (!method) return 'Not specified';
    return method.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };


export const generateCustomerExcelWorkbook = (reportData: any[]): XLSX.WorkBook => {
  const workbook = XLSX.utils.book_new();

  // Customer Summary Sheet
  const customerSummaryData = reportData.map(customer => ({
    'Customer Name': `${customer.firstName} ${customer.lastName}`,
    'Email': customer.email,
    'Phone': customer.phone,
    'Inquiry ID': customer.inquiry,
    'Total Bookings': customer.totalBookings,
    'Active Bookings': customer.activeBookings,
    'Completed Bookings': customer.completedBookings,
    'Total Payment': customer.totalPayment,
    'Paid Payment': customer.paidPayment,
    'Pending Payments': customer.pendingPayments,
  }));
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(customerSummaryData), 'Customer Summary');

  // Booking Details Sheet
  const bookingDetailsData: any[] = [];
  reportData.forEach(customer => {
    customer.bookingDetails.forEach((booking: { bookingId: any; unitNumber: any; startDate: any; endDate: any; bookingStatus: string; spaceOccupied: any; price: any; payments: { length: any; filter: (arg0: { (p: any): boolean; (p: any): boolean; }) => { (): any; new(): any; length: any; }; }; }) => {
      bookingDetailsData.push({
        'Customer Name': `${customer.firstName} ${customer.lastName}`,
        'Customer Email': customer.email,
        'Customer Phone': customer.phone,
        'Booking ID': booking.bookingId,
        'Unit Number': booking.unitNumber,
        'Start Date': formatDate(booking.startDate),
        'End Date': formatDate(booking.endDate),
        'Status': booking.bookingStatus.toUpperCase(),
        'Space Occupied (m²)': booking.spaceOccupied,
        'Price': booking.price,
        'Total Payments': booking.payments.length,
        'Paid Payments': booking.payments.filter(p => p.status === 'paid').length,
        'Pending Payments': booking.payments.filter(p => p.status === 'pending').length,
      });
    });
  });
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(bookingDetailsData), 'Booking Details');

  // Payment Details Sheet
  const paymentDetailsData: any[] = [];
  reportData.forEach(customer => {
    customer.bookingDetails.forEach((booking: { payments: any[]; bookingId: any; unitNumber: any; }) => {
      booking.payments.forEach(payment => {
        paymentDetailsData.push({
          'Customer Name': `${customer.firstName} ${customer.lastName}`,
          'Customer Email': customer.email,
          'Booking ID': booking.bookingId,
          'Unit Number': booking.unitNumber,
          'Payment ID': payment.paymentId,
          'Payment Date': formatDate(payment.date),
          'Payment Method': getPaymentMethodDisplay(payment.method),
          'Amount': payment.amount,
          'Payment Status': payment.status.toUpperCase(),
          'Payment Period Start': formatDate(payment.startDate),
          'Payment Period End': formatDate(payment.endDate),
        });
      });
    });
  });
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(paymentDetailsData), 'Payment Details');

  return workbook;
};
