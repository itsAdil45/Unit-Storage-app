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
  unitNumber: string;
  payments: Payment[];
}

export interface CustomerReportData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  inquiry: string;
  totalBookings: number;
  activeBookings: number;
  completedBookings: number;
  totalPayment: number;
  paidPayment: number;
  pendingPayments: number;
  bookingDetails: BookingDetail[];
}

export interface ApiResponse {
  status: string;
  message: string;
  data: {
    downloadLink: string;
    reportData: CustomerReportData[];
  };
}
