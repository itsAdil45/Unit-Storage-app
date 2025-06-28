
export type StorageUnit = {
  id: number;              // Unit number (display ID)
  dbId: number;           // Database ID for operations
  percentage: number;     // Occupancy percentage
  customers: number;      // Number of customers
  warehouse: string;      // Warehouse name
  floor: string;         // Floor identifier
  size: number;          // Size in square feet
  status: string;        // Unit status (e.g., 'available', 'maintenance')
  warehouseId: number;   // Warehouse ID for operations
  bookings: any[];       // Array of bookings (you may want to define a Booking type)
};

// types/Unit.ts
export interface UnitData {
  id: number;
  unitNumber: string;
  size: number;
  floor: string;
  warehouseId: number;
  warehouseName: string;
  status: 'available' | 'maintenance';
  pricePerDay: number | null;
  totalSpaceOccupied: number;
}


 export type Item = {
  id: number;
  percentage: number;
  customers: number;
};

export type Props = {
  label: string;
  value: number;
  percent?: string;
  iconColor?: string;
};

export type FilterType = 'All' | 'Active' | 'Inactive';
export type SortType = 'name' | 'recent' | 'status';

export interface PaymentOverviewData {
  overduePayments: number;
  paymentsPaid: number;
  totalCustomers: number;
  unpaidPayments: number;
}


export interface StorageOverviewData {
  total: number;
  empty: number;
  occupied: number;
  checkingOut: number;
  overdue: number;
}

export interface ExpenseData {
  id: number;
  expenseType: string;
  amount: string;
  date: string; // in YYYY-MM-DD format
  description: string;
  createdAt: string;
  updatedAt: string;
  deleted: number;
  userId: number;
  warehouseId: number;
  warehouse: {
    name: string;
  };
  user: {
    email: string;
  };
}



export type DrawerParamList = {
  Home: undefined;
  Expenses: undefined;
  // Add any other screens here
};