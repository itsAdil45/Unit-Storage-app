export interface Payment {
  paymentId: number;
  date: string;
  method: string | null;
  amount: string;
  startDate: string;
  endDate: string;
  status: 'paid' | 'pending';
}

export interface BookingDetail {
  bookingId: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  startDate: string;
  endDate: string;
  bookingStatus: 'active' | 'completed' | 'cancelled';
  spaceOccupied: string;
  price: string;
  payments: Payment[];
}

export interface UnitReportData {
  unitId: number;
  unitNumber: string;
  warehouseName: string;
  floor: string;
  size: number;
  status: string;
  bookings: BookingDetail[];
}

export interface ApiResponse {
  status: string;
  message: string;
  data: {
    downloadLink: string;
    reportData: UnitReportData[];
  };
}
