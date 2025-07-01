export interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  inquiry: string;
  address: string;
  createdAt: string;
  deleted: 0 | 1;
}

export interface CustomerItemProps {
  item: Customer;
  index: number;
  colors: any;
  dark: boolean;
  onEdit: (customer: Customer) => void;
  onEmail: (userId: number) => void;
  onDeletePress: () => void;
}
