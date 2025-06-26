export type StorageUnit = {
  id: string;
  percentage: number;
  customers: number;
  warehouse: string;
  floor: string;
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

