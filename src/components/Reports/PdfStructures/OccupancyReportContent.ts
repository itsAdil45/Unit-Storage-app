import {
  OccupancyReportData,
  OccupiedUnit,
  AvailableUnit,
  Booking,
  Payment,
} from '../../../types/OccupancyReport';
import { formatAEDCurrency } from '../../../Utils/Formatters';

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatPercentage = (value: number) => {
  return `${value.toFixed(1)}%`;
};

const generateOccupancyReportContent = (
  occupancyData: OccupancyReportData[],
) => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Calculate aggregate statistics
  const totalUnitsAcrossAll = occupancyData.reduce(
    (sum, report) => sum + report.totalUnits,
    0,
  );
  const totalOccupiedUnits = occupancyData.reduce(
    (sum, report) => sum + report.occupiedUnits,
    0,
  );
  const totalAvailableUnits = occupancyData.reduce(
    (sum, report) => sum + report.availableUnits,
    0,
  );
  const averageOccupancyRate =
    occupancyData.length > 0
      ? occupancyData.reduce((sum, report) => sum + report.occupancyRate, 0) /
        occupancyData.length
      : 0;

  // Calculate revenue statistics
  let totalRevenue = 0;
  let totalBookings = 0;
  let totalPayments = 0;

  occupancyData.forEach((report) => {
    report.occupiedUnitDetails.forEach((unit) => {
      unit.bookings.forEach((booking) => {
        totalBookings++;
        totalRevenue += parseFloat(booking.price);
        totalPayments += booking.payments.length;
      });
    });
  });

  // Group by warehouse for summary
  const warehouseStats = new Map<
    string,
    {
      totalUnits: number;
      occupiedUnits: number;
      availableUnits: number;
      occupancyRate: number;
      revenue: number;
    }
  >();

  occupancyData.forEach((report) => {
    report.occupiedUnitDetails.forEach((unit) => {
      if (!warehouseStats.has(unit.warehouseName)) {
        warehouseStats.set(unit.warehouseName, {
          totalUnits: 0,
          occupiedUnits: 0,
          availableUnits: 0,
          occupancyRate: 0,
          revenue: 0,
        });
      }
      const stats = warehouseStats.get(unit.warehouseName)!;
      stats.occupiedUnits++;
      unit.bookings.forEach((booking) => {
        stats.revenue += parseFloat(booking.price);
      });
    });

    report.availableUnitDetails.forEach((unit) => {
      if (!warehouseStats.has(unit.warehouseName)) {
        warehouseStats.set(unit.warehouseName, {
          totalUnits: 0,
          occupiedUnits: 0,
          availableUnits: 0,
          occupancyRate: 0,
          revenue: 0,
        });
      }
      const stats = warehouseStats.get(unit.warehouseName)!;
      stats.availableUnits++;
    });
  });

  // Calculate occupancy rates for warehouses
  warehouseStats.forEach((stats, warehouse) => {
    stats.totalUnits = stats.occupiedUnits + stats.availableUnits;
    stats.occupancyRate =
      stats.totalUnits > 0 ? (stats.occupiedUnits / stats.totalUnits) * 100 : 0;
  });

  let html = `
    <html>
      <head>
        <meta charset="utf-8">
        <title>Occupancy Report</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            color: #333; 
          }
          .header { 
            text-align: center; 
            margin-bottom: 30px; 
            border-bottom: 2px solid #28a745; 
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
            color: #28a745; 
          }
          .summary-label { 
            font-size: 14px; 
            color: #666; 
            margin-top: 5px;
          }
          .occupancy-high { color: #28a745; }
          .occupancy-medium { color: #ffc107; }
          .occupancy-low { color: #dc3545; }
          .warehouse-section {
            margin-bottom: 40px;
            background-color: white;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 20px;
          }
          .warehouse-header {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
          }
          .warehouse-name {
            font-size: 18px;
            font-weight: bold;
            color: #28a745;
          }
          .warehouse-stats {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 10px;
            margin-top: 10px;
          }
          .warehouse-stat {
            text-align: center;
            padding: 10px;
            border: 1px solid #eee;
            border-radius: 3px;
            background-color: white;
          }
          .stat-value {
            font-weight: bold;
            color: #28a745;
          }
          .stat-label {
            font-size: 12px;
            color: #666;
          }
          .units-section {
            margin-top: 20px;
          }
          .units-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 15px;
            margin-top: 15px;
          }
          .unit-card {
            border: 1px solid #ddd;
            border-radius: 5px;
            padding: 15px;
            background-color: #fafafa;
          }
          .unit-occupied {
            border-left: 4px solid #28a745;
          }
          .unit-available {
            border-left: 4px solid #6c757d;
          }
          .unit-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
          }
          .unit-number {
            font-weight: bold;
            color: #333;
          }
          .unit-status {
            padding: 3px 8px;
            border-radius: 3px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
          }
          .status-occupied {
            background-color: #d4edda;
            color: #155724;
          }
          .status-available {
            background-color: #e2e3e5;
            color: #6c757d;
          }
          .unit-details {
            font-size: 14px;
            color: #666;
            margin-bottom: 10px;
          }
          .booking-section {
            margin-top: 15px;
            padding: 10px;
            background-color: white;
            border-radius: 3px;
            border: 1px solid #e9ecef;
          }
          .booking-header {
            font-weight: bold;
            color: #28a745;
            margin-bottom: 10px;
          }
          .booking-info {
            font-size: 13px;
            margin-bottom: 5px;
          }
          .booking-customer {
            font-weight: bold;
            color: #333;
          }
          .booking-dates {
            color: #666;
          }
          .booking-price {
            font-weight: bold;
            color: #28a745;
          }
          .payments-section {
            margin-top: 10px;
            padding: 8px;
            background-color: #f8f9fa;
            border-radius: 3px;
          }
          .payment-item {
            font-size: 12px;
            margin-bottom: 3px;
            display: flex;
            justify-content: space-between;
          }
          .payment-status {
            padding: 1px 5px;
            border-radius: 2px;
            font-size: 11px;
            font-weight: bold;
          }
          .payment-paid {
            background-color: #d4edda;
            color: #155724;
          }
          .payment-pending {
            background-color: #fff3cd;
            color: #856404;
          }
          .payment-failed {
            background-color: #f8d7da;
            color: #721c24;
          }
          .no-bookings {
            text-align: center;
            color: #666;
            font-style: italic;
            padding: 20px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Occupancy Report</h1>
          <p>Generated on: ${currentDate}</p>
        </div>

        <div class="summary-section">
          <h2>Overall Summary</h2>
          <div class="summary-grid">
            <div class="summary-item">
              <div class="summary-value">${totalUnitsAcrossAll}</div>
              <div class="summary-label">Total Units</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">${totalOccupiedUnits}</div>
              <div class="summary-label">Occupied Units</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">${totalAvailableUnits}</div>
              <div class="summary-label">Available Units</div>
            </div>
            <div class="summary-item">
              <div class="summary-value ${averageOccupancyRate >= 80 ? 'occupancy-high' : averageOccupancyRate >= 60 ? 'occupancy-medium' : 'occupancy-low'}">${formatPercentage(averageOccupancyRate)}</div>
              <div class="summary-label">Avg. Occupancy Rate</div>
            </div>
          </div>
          <div class="summary-grid">
            <div class="summary-item">
              <div class="summary-value">${formatAEDCurrency(totalRevenue)}</div>
              <div class="summary-label">Total Revenue</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">${totalBookings}</div>
              <div class="summary-label">Active Bookings</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">${totalPayments}</div>
              <div class="summary-label">Total Payments</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">${warehouseStats.size}</div>
              <div class="summary-label">Warehouses</div>
            </div>
          </div>
        </div>
  `;

  // Add warehouse sections
  Array.from(warehouseStats.entries()).forEach(([warehouseName, stats]) => {
    const occupiedUnits = occupancyData.flatMap((report) =>
      report.occupiedUnitDetails.filter(
        (unit) => unit.warehouseName === warehouseName,
      ),
    );
    const availableUnits = occupancyData.flatMap((report) =>
      report.availableUnitDetails.filter(
        (unit) => unit.warehouseName === warehouseName,
      ),
    );
    const allUnits = [...occupiedUnits, ...availableUnits];

    html += `
      <div class="warehouse-section">
        <div class="warehouse-header">
          <div class="warehouse-name">${warehouseName}</div>
          <div class="warehouse-stats">
            <div class="warehouse-stat">
              <div class="stat-value">${stats.totalUnits}</div>
              <div class="stat-label">Total Units</div>
            </div>
            <div class="warehouse-stat">
              <div class="stat-value">${stats.occupiedUnits}</div>
              <div class="stat-label">Occupied</div>
            </div>
            <div class="warehouse-stat">
              <div class="stat-value">${stats.availableUnits}</div>
              <div class="stat-label">Available</div>
            </div>
            <div class="warehouse-stat">
              <div class="stat-value ${stats.occupancyRate >= 80 ? 'occupancy-high' : stats.occupancyRate >= 60 ? 'occupancy-medium' : 'occupancy-low'}">${formatPercentage(stats.occupancyRate)}</div>
              <div class="stat-label">Occupancy</div>
            </div>
            <div class="warehouse-stat">
              <div class="stat-value">${formatAEDCurrency(stats.revenue)}</div>
              <div class="stat-label">Revenue</div>
            </div>
          </div>
        </div>

        <div class="units-section">
          <h3>Unit Details</h3>
          <div class="units-grid">
    `;

    // Add occupied units
    occupiedUnits.forEach((unit) => {
      html += `
        <div class="unit-card unit-occupied">
          <div class="unit-header">
            <div class="unit-number">Unit ${unit.unitNumber}</div>
            <div class="unit-status status-occupied">Occupied</div>
          </div>
          <div class="unit-details">
            <div>Floor: ${unit.floor}</div>
            <div>Size: ${unit.size} sq ft</div>
          </div>
      `;

      if (unit.bookings.length > 0) {
        unit.bookings.forEach((booking) => {
          html += `
            <div class="booking-section">
              <div class="booking-header">Booking #${booking.bookingId}</div>
              <div class="booking-info">
                <div class="booking-customer">${booking.customerName}</div>
                <div class="booking-dates">
                  ${formatDate(booking.startDate)} - ${formatDate(booking.endDate)}
                </div>
                <div class="booking-price">Price: ${formatAEDCurrency(booking.price)}</div>
                <div>Status: ${booking.bookingStatus}</div>
                <div>Space: ${booking.spaceOccupied} sq ft</div>
              </div>
          `;

          if (booking.payments.length > 0) {
            html += `
              <div class="payments-section">
                <strong>Payments:</strong>
            `;
            booking.payments.forEach((payment) => {
              html += `
                <div class="payment-item">
                  <span>${formatDate(payment.date)} - ${payment.method}</span>
                  <span>
                    ${formatAEDCurrency(payment.amount)}
                    <span class="payment-status payment-${payment.status.toLowerCase()}">${payment.status}</span>
                  </span>
                </div>
              `;
            });
            html += `
              </div>
            `;
          }

          html += `
            </div>
          `;
        });
      } else {
        html += `
          <div class="no-bookings">No active bookings</div>
        `;
      }

      html += `
        </div>
      `;
    });

    // Add available units
    availableUnits.forEach((unit) => {
      html += `
        <div class="unit-card unit-available">
          <div class="unit-header">
            <div class="unit-number">Unit ${unit.unitNumber}</div>
            <div class="unit-status status-available">Available</div>
          </div>
          <div class="unit-details">
            <div>Floor: ${unit.floor}</div>
            <div>Size: ${unit.size} sq ft</div>
          </div>
          <div class="no-bookings">Unit available for booking</div>
        </div>
      `;
    });

    html += `
          </div>
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

export default generateOccupancyReportContent;
