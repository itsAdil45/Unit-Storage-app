export interface Expense {
  id: number;
  expenseType: string;
  amount: string;
  date: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  deleted: 0 | 1;
  userId: number;
  warehouseId: number;
  warehouse: {
    name: string;
  };
  user: {
    email: string;
  };
}

export interface ExpenseItemProps {
  item: Expense;
  index: number;
  colors: any;
  dark: boolean;
  onEdit: (expense: Expense) => void;
  onDeletePress: () => void;
}
