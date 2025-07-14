// types/OccupancyReport.ts

export interface Payment {
  paymentId: number;
  date: string;
  method: string;
  amount: string;
  startDate: string;
  endDate: string;
  status: string;
}

export interface Booking {
  bookingId: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  startDate: string;
  endDate: string;
  bookingStatus: string;
  spaceOccupied: string;
  price: string;
  payments: Payment[];
}

export interface OccupiedUnit {
  unitId: number;
  unitNumber: string;
  warehouseName: string;
  floor: string;
  size: number;
  status: string;
  bookings: Booking[];
}

export interface AvailableUnit {
  unitId: number;
  unitNumber: string;
  warehouseName: string;
  floor: string;
  size: number;
  status: string;
  bookings: Booking[];
}

export interface OccupancyReportData {
  date: string;
  totalUnits: number;
  occupiedUnits: number;
  availableUnits: number;
  occupancyRate: number;
  occupiedUnitDetails: OccupiedUnit[];
  availableUnitDetails: AvailableUnit[];
}

export interface OccupancyReportResponse {
  status: string;
  message: string;
  data: {
    downloadLink: string;
    reportData: OccupancyReportData[];
  };
}
