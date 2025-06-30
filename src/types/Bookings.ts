export interface Payment {
  id: number;
  amount: string;
  paymentDate: string;
  paymentMethod: string | null;
  status: string;
  deleted: number;
  remarks: string | null;
  invoiceAttachment: string | null;
  paymentReceivedAttachment: string | null;
  startDate: string;
  endDate: string;
}

export interface Customer {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  inquiry: string;
  deleted: number;
}

export interface StorageUnit {
  unitNumber: string;
}

export interface User {
  email: string;
}

export interface Booking {
  id: number;
  startDate: string;
  endDate: string;
  status: string;
  totalPrice: string;
  spaceOccupied: string;
  createdAt: string;
  updatedAt: string;
  deleted: number;
  userId: number;
  storageUnitId: number;
  customerId: number;
  pdfDocumentUrl: string | null;
  customer: Customer;
  storageUnit: StorageUnit;
  user: User;
  payments: Payment[];
}

export type BookingFilterType = 'All' | 'active' | 'completed' | 'cancelled';