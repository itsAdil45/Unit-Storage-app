import * as XLSX from 'xlsx';
import { UnitReportData } from "../../../types/StorageUnitsReport";

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

export const generateUnitExcelWorkbook = (reportData: UnitReportData[]): XLSX.WorkBook => {
  const workbook = XLSX.utils.book_new();

  // Unit Summary Sheet
  const unitSummaryData = reportData.map(unit => {
    const totalBookings = unit.bookings.length;
    const activeBookings = unit.bookings.filter(b => b.bookingStatus === 'active').length;
    const completedBookings = unit.bookings.filter(b => b.bookingStatus === 'completed').length;
    const cancelledBookings = unit.bookings.filter(b => b.bookingStatus === 'cancelled').length;
    const totalRevenue = unit.bookings.reduce((sum, booking) => sum + parseFloat(booking.price), 0);
    const totalPayments = unit.bookings.reduce((sum, booking) => sum + booking.payments.length, 0);
    const paidPayments = unit.bookings.reduce((sum, booking) => sum + booking.payments.filter(p => p.status === 'paid').length, 0);
    const pendingPayments = unit.bookings.reduce((sum, booking) => sum + booking.payments.filter(p => p.status === 'pending').length, 0);

    return {
      'Unit ID': unit.unitId,
      'Unit Number': unit.unitNumber,
      'Warehouse Name': unit.warehouseName,
      'Floor': unit.floor,
      'Size (m²)': unit.size,
      'Status': unit.status.toUpperCase(),
      'Total Bookings': totalBookings,
      'Active Bookings': activeBookings,
      'Completed Bookings': completedBookings,
      'Cancelled Bookings': cancelledBookings,
      'Total Revenue': totalRevenue,
      'Total Payments': totalPayments,
      'Paid Payments': paidPayments,
      'Pending Payments': pendingPayments,
    };
  });
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(unitSummaryData), 'Unit Summary');

  // Booking Details Sheet
  const bookingDetailsData: any[] = [];
  reportData.forEach(unit => {
    unit.bookings.forEach(booking => {
      const totalPaymentAmount = booking.payments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
      const paidAmount = booking.payments
        .filter(p => p.status === 'paid')
        .reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
      const pendingAmount = booking.payments
        .filter(p => p.status === 'pending')
        .reduce((sum, payment) => sum + parseFloat(payment.amount), 0);

      bookingDetailsData.push({
        'Unit ID': unit.unitId,
        'Unit Number': unit.unitNumber,
        'Warehouse Name': unit.warehouseName,
        'Floor': unit.floor,
        'Unit Size (m²)': unit.size,
        'Unit Status': unit.status.toUpperCase(),
        'Booking ID': booking.bookingId,
        'Customer Name': booking.customerName,
        'Customer Email': booking.customerEmail,
        'Customer Phone': booking.customerPhone,
        'Start Date': formatDate(booking.startDate),
        'End Date': formatDate(booking.endDate),
        'Booking Status': booking.bookingStatus.toUpperCase(),
        'Space Occupied (m²)': booking.spaceOccupied,
        'Booking Price': parseFloat(booking.price),
        'Total Payments': booking.payments.length,
        'Paid Payments': booking.payments.filter(p => p.status === 'paid').length,
        'Pending Payments': booking.payments.filter(p => p.status === 'pending').length,
        'Total Payment Amount': totalPaymentAmount,
        'Paid Amount': paidAmount,
        'Pending Amount': pendingAmount,
      });
    });
  });
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(bookingDetailsData), 'Booking Details');

  // Payment Details Sheet
  const paymentDetailsData: any[] = [];
  reportData.forEach(unit => {
    unit.bookings.forEach(booking => {
      booking.payments.forEach(payment => {
        paymentDetailsData.push({
          'Unit ID': unit.unitId,
          'Unit Number': unit.unitNumber,
          'Warehouse Name': unit.warehouseName,
          'Floor': unit.floor,
          'Unit Size (m²)': unit.size,
          'Unit Status': unit.status.toUpperCase(),
          'Booking ID': booking.bookingId,
          'Customer Name': booking.customerName,
          'Customer Email': booking.customerEmail,
          'Customer Phone': booking.customerPhone,
          'Booking Status': booking.bookingStatus.toUpperCase(),
          'Payment ID': payment.paymentId,
          'Payment Date': formatDate(payment.date),
          'Payment Method': getPaymentMethodDisplay(payment.method),
          'Payment Amount': parseFloat(payment.amount),
          'Payment Status': payment.status.toUpperCase(),
          'Payment Period Start': formatDate(payment.startDate),
          'Payment Period End': formatDate(payment.endDate),
        });
      });
    });
  });
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(paymentDetailsData), 'Payment Details');

  // Unit Utilization Sheet - Additional analysis
  const unitUtilizationData = reportData.map(unit => {
    const totalBookings = unit.bookings.length;
    const activeBookings = unit.bookings.filter(b => b.bookingStatus === 'active').length;
    const completedBookings = unit.bookings.filter(b => b.bookingStatus === 'completed').length;
    const utilizationRate = totalBookings > 0 ? ((activeBookings + completedBookings) / totalBookings * 100).toFixed(2) : '0';
    const averageBookingDuration = unit.bookings.length > 0 ? 
      unit.bookings.reduce((sum, booking) => {
        const start = new Date(booking.startDate);
        const end = new Date(booking.endDate);
        const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        return sum + duration;
      }, 0) / unit.bookings.length : 0;

    return {
      'Unit ID': unit.unitId,
      'Unit Number': unit.unitNumber,
      'Warehouse Name': unit.warehouseName,
      'Floor': unit.floor,
      'Size (m²)': unit.size,
      'Current Status': unit.status.toUpperCase(),
      'Total Bookings': totalBookings,
      'Active Bookings': activeBookings,
      'Completed Bookings': completedBookings,
      'Utilization Rate (%)': utilizationRate,
      'Average Booking Duration (days)': Math.round(averageBookingDuration),
      'Revenue per m²': totalBookings > 0 ? 
        (unit.bookings.reduce((sum, booking) => sum + parseFloat(booking.price), 0) / unit.size).toFixed(2) : '0',
    };
  });
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(unitUtilizationData), 'Unit Utilization');

  return workbook;
};