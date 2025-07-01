export interface StorageUnit {
  id: number;
  warehouseId: number;
  unitNumber: string;
  size: number;
  floor: string;
  status: string;
  pricePerDay: number | null;
  createdAt: string;
  updatedAt: string;
  deleted: number;
  userId: number;
}
export interface Warehouse {
  id: number;
  name: string;
  address: string;
  createdAt: string;
  updatedAt: string;
  videoFileLink: string;
  deleted: number;
  userId: number;
  storageUnits: StorageUnit[];
  uniqueFloors: string[];
}

export interface WarehouseItemProps {
  item: Warehouse;
  index: number;
  colors: any;
  dark: boolean;
  onEdit: (warehouse: Warehouse) => void;
  onDeletePress: () => void; // This will be injected by AnimatedDeleteWrapper
}
