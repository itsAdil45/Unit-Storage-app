import * as XLSX from 'xlsx';
import { OccupancyReportData, OccupiedUnit, AvailableUnit, Booking, Payment } from "../../../types/OccupancyReport";
import { formatDate, formatCurrency } from '../../../Utils/Formatters';

export const generateOccupancyExcelWorkbook = (occupancyData: OccupancyReportData[]): XLSX.WorkBook => {
  const workbook = XLSX.utils.book_new();

  // Occupancy Summary Sheet
  const occupancySummaryData = occupancyData.map(report => ({
    'Report Date': formatDate(report.date),
    'Total Units': report.totalUnits,
    'Occupied Units': report.occupiedUnits,
    'Available Units': report.availableUnits,
    'Occupancy Rate (%)': report.occupancyRate.toFixed(2),
    'Vacancy Rate (%)': (100 - report.occupancyRate).toFixed(2),
  }));
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(occupancySummaryData), 'Occupancy Summary');

  // Unit Details Sheet
  const unitDetailsData: any[] = [];
  occupancyData.forEach(report => {
    // Add occupied units
    report.occupiedUnitDetails.forEach(unit => {
      const totalBookingRevenue = unit.bookings.reduce((sum, booking) => sum + parseFloat(booking.price), 0);
      const totalPayments = unit.bookings.reduce((sum, booking) => sum + booking.payments.length, 0);
      const totalPaidAmount = unit.bookings.reduce((sum, booking) => {
        return sum + booking.payments.reduce((paySum, payment) => {
          return paySum + (payment.status.toLowerCase() === 'paid' ? parseFloat(payment.amount) : 0);
        }, 0);
      }, 0);

      unitDetailsData.push({
        'Report Date': formatDate(report.date),
        'Unit ID': unit.unitId,
        'Unit Number': unit.unitNumber,
        'Warehouse Name': unit.warehouseName,
        'Floor': unit.floor,
        'Size (sq ft)': unit.size,
        'Status': unit.status,
        'Occupancy Status': 'Occupied',
        'Active Bookings': unit.bookings.length,
        'Total Revenue': formatCurrency(totalBookingRevenue),
        'Total Payments': totalPayments,
        'Total Paid Amount': formatCurrency(totalPaidAmount),
        'Outstanding Amount': formatCurrency(totalBookingRevenue - totalPaidAmount),
        'Revenue per Sq Ft': unit.size > 0 ? formatCurrency(totalBookingRevenue / unit.size) : 0,
      });
    });

    // Add available units
    report.availableUnitDetails.forEach(unit => {
      unitDetailsData.push({
        'Report Date': formatDate(report.date),
        'Unit ID': unit.unitId,
        'Unit Number': unit.unitNumber,
        'Warehouse Name': unit.warehouseName,
        'Floor': unit.floor,
        'Size (sq ft)': unit.size,
        'Status': unit.status,
        'Occupancy Status': 'Available',
        'Active Bookings': 0,
        'Total Revenue': 0,
        'Total Payments': 0,
        'Total Paid Amount': 0,
        'Outstanding Amount': 0,
        'Revenue per Sq Ft': 0,
      });
    });
  });
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(unitDetailsData), 'Unit Details');

  // Booking Details Sheet
  const bookingDetailsData: any[] = [];
  occupancyData.forEach(report => {
    report.occupiedUnitDetails.forEach(unit => {
      unit.bookings.forEach(booking => {
        const totalPayments = booking.payments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
        const paidPayments = booking.payments.filter(p => p.status.toLowerCase() === 'paid').length;
        const pendingPayments = booking.payments.filter(p => p.status.toLowerCase() === 'pending').length;
        const failedPayments = booking.payments.filter(p => p.status.toLowerCase() === 'failed').length;

        bookingDetailsData.push({
          'Report Date': formatDate(report.date),
          'Booking ID': booking.bookingId,
          'Unit ID': unit.unitId,
          'Unit Number': unit.unitNumber,
          'Warehouse Name': unit.warehouseName,
          'Customer Name': booking.customerName,
          'Customer Email': booking.customerEmail,
          'Customer Phone': booking.customerPhone,
          'Start Date': formatDate(booking.startDate),
          'End Date': formatDate(booking.endDate),
          'Booking Status': booking.bookingStatus,
          'Space Occupied (sq ft)': booking.spaceOccupied,
          'Booking Price': formatCurrency(booking.price),
          'Total Payments': booking.payments.length,
          'Paid Payments': paidPayments,
          'Pending Payments': pendingPayments,
          'Failed Payments': failedPayments,
          'Total Payment Amount': formatCurrency(totalPayments),
          'Outstanding Amount': formatCurrency(parseFloat(booking.price) - totalPayments),
          'Days Booked': Math.ceil((new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime()) / (1000 * 60 * 60 * 24)),
          'Price per Day': formatCurrency(parseFloat(booking.price) / Math.ceil((new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime()) / (1000 * 60 * 60 * 24))),
        });
      });
    });
  });
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(bookingDetailsData), 'Booking Details');

  // Payment Details Sheet
  const paymentDetailsData: any[] = [];
  occupancyData.forEach(report => {
    report.occupiedUnitDetails.forEach(unit => {
      unit.bookings.forEach(booking => {
        booking.payments.forEach(payment => {
          paymentDetailsData.push({
            'Report Date': formatDate(report.date),
            'Payment ID': payment.paymentId,
            'Booking ID': booking.bookingId,
            'Unit Number': unit.unitNumber,
            'Warehouse Name': unit.warehouseName,
            'Customer Name': booking.customerName,
            'Payment Date': formatDate(payment.date),
            'Payment Method': payment.method,
            'Amount': formatCurrency(payment.amount),
            'Status': payment.status,
            'Period Start': formatDate(payment.startDate),
            'Period End': formatDate(payment.endDate),
            'Period Days': Math.ceil((new Date(payment.endDate).getTime() - new Date(payment.startDate).getTime()) / (1000 * 60 * 60 * 24)),
            'Amount per Day': formatCurrency(parseFloat(payment.amount) / Math.ceil((new Date(payment.endDate).getTime() - new Date(payment.startDate).getTime()) / (1000 * 60 * 60 * 24))),
          });
        });
      });
    });
  });
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(paymentDetailsData), 'Payment Details');

  // Warehouse Analysis Sheet
  const warehouseAnalysisData: any[] = [];
  const warehouseStats = new Map<string, {
    totalUnits: number;
    occupiedUnits: number;
    availableUnits: number;
    totalRevenue: number;
    totalBookings: number;
    totalPayments: number;
    totalSize: number;
    averageUnitSize: number;
    floors: Set<string>;
  }>();

  occupancyData.forEach(report => {
    [...report.occupiedUnitDetails, ...report.availableUnitDetails].forEach(unit => {
      if (!warehouseStats.has(unit.warehouseName)) {
        warehouseStats.set(unit.warehouseName, {
          totalUnits: 0,
          occupiedUnits: 0,
          availableUnits: 0,
          totalRevenue: 0,
          totalBookings: 0,
          totalPayments: 0,
          totalSize: 0,
          averageUnitSize: 0,
          floors: new Set()
        });
      }
      
      const stats = warehouseStats.get(unit.warehouseName)!;
      stats.totalUnits++;
      stats.totalSize += unit.size;
      stats.floors.add(unit.floor);
      
      if (unit.status === 'occupied' || (unit as any).bookings?.length > 0) {
        stats.occupiedUnits++;
        const bookings = (unit as OccupiedUnit).bookings || [];
        stats.totalBookings += bookings.length;
        bookings.forEach(booking => {
          stats.totalRevenue += parseFloat(booking.price);
          stats.totalPayments += booking.payments.length;
        });
      } else {
        stats.availableUnits++;
      }
    });
  });

  warehouseStats.forEach((stats, warehouseName) => {
    stats.averageUnitSize = stats.totalUnits > 0 ? stats.totalSize / stats.totalUnits : 0;
    const occupancyRate = stats.totalUnits > 0 ? (stats.occupiedUnits / stats.totalUnits) * 100 : 0;
    const revenuePerUnit = stats.totalUnits > 0 ? stats.totalRevenue / stats.totalUnits : 0;
    const revenuePerSqFt = stats.totalSize > 0 ? stats.totalRevenue / stats.totalSize : 0;

    warehouseAnalysisData.push({
      'Warehouse Name': warehouseName,
      'Total Units': stats.totalUnits,
      'Occupied Units': stats.occupiedUnits,
      'Available Units': stats.availableUnits,
      'Occupancy Rate (%)': occupancyRate.toFixed(2),
      'Vacancy Rate (%)': (100 - occupancyRate).toFixed(2),
      'Total Floor Area (sq ft)': stats.totalSize,
      'Average Unit Size (sq ft)': stats.averageUnitSize.toFixed(2),
      'Number of Floors': stats.floors.size,
      'Floor List': Array.from(stats.floors).join(', '),
      'Total Revenue': formatCurrency(stats.totalRevenue),
      'Total Bookings': stats.totalBookings,
      'Total Payments': stats.totalPayments,
      'Revenue per Unit': formatCurrency(revenuePerUnit),
      'Revenue per Sq Ft': formatCurrency(revenuePerSqFt),
      'Average Bookings per Occupied Unit': stats.occupiedUnits > 0 ? (stats.totalBookings / stats.occupiedUnits).toFixed(2) : 0,
    });
  });

  warehouseAnalysisData.sort((a, b) => parseFloat(b['Occupancy Rate (%)']) - parseFloat(a['Occupancy Rate (%)']));
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(warehouseAnalysisData), 'Warehouse Analysis');

  // Customer Analysis Sheet
  const customerAnalysisData: any[] = [];
  const customerStats = new Map<string, {
    email: string;
    phone: string;
    totalBookings: number;
    totalRevenue: number;
    totalPayments: number;
    totalSpaceOccupied: number;
    warehouses: Set<string>;
    units: Set<string>;
    bookingStatuses: Set<string>;
    paymentMethods: Set<string>;
  }>();

  occupancyData.forEach(report => {
    report.occupiedUnitDetails.forEach(unit => {
      unit.bookings.forEach(booking => {
        if (!customerStats.has(booking.customerName)) {
          customerStats.set(booking.customerName, {
            email: booking.customerEmail,
            phone: booking.customerPhone,
            totalBookings: 0,
            totalRevenue: 0,
            totalPayments: 0,
            totalSpaceOccupied: 0,
            warehouses: new Set(),
            units: new Set(),
            bookingStatuses: new Set(),
            paymentMethods: new Set()
          });
        }

        const stats = customerStats.get(booking.customerName)!;
        stats.totalBookings++;
        stats.totalRevenue += parseFloat(booking.price);
        stats.totalPayments += booking.payments.length;
        stats.totalSpaceOccupied += parseFloat(booking.spaceOccupied);
        stats.warehouses.add(unit.warehouseName);
        stats.units.add(unit.unitNumber);
        stats.bookingStatuses.add(booking.bookingStatus);

        booking.payments.forEach(payment => {
          stats.paymentMethods.add(payment.method);
        });
      });
    });
  });

  customerStats.forEach((stats, customerName) => {
    customerAnalysisData.push({
      'Customer Name': customerName,
      'Email': stats.email,
      'Phone': stats.phone,
      'Total Bookings': stats.totalBookings,
      'Total Revenue': formatCurrency(stats.totalRevenue),
      'Total Payments': stats.totalPayments,
      'Total Space Occupied (sq ft)': stats.totalSpaceOccupied,
      'Unique Warehouses': stats.warehouses.size,
      'Warehouse List': Array.from(stats.warehouses).join(', '),
      'Unique Units': stats.units.size,
      'Unit Numbers': Array.from(stats.units).join(', '),
      'Booking Statuses': Array.from(stats.bookingStatuses).join(', '),
      'Payment Methods Used': Array.from(stats.paymentMethods).join(', '),
      'Average Revenue per Booking': formatCurrency(stats.totalRevenue / stats.totalBookings),
      'Average Space per Booking (sq ft)': (stats.totalSpaceOccupied / stats.totalBookings).toFixed(2),
    });
  });

  customerAnalysisData.sort((a, b) => parseFloat(b['Total Revenue']) - parseFloat(a['Total Revenue']));
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(customerAnalysisData), 'Customer Analysis');

  return workbook;
};
