// Inventory module types

export interface InventoryItem {
  id: string;
  itemCode: string;
  name: string;
  description?: string;
  category: Category;
  supplier: Supplier;
  specifications: ItemSpecification[];
  pricing: PricingInfo;
  stock: StockInfo;
  location: StorageLocation;
  images: string[];
  status: 'active' | 'inactive' | 'discontinued';
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  level: number;
  isActive: boolean;
  itemCount: number;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: Address;
  gstNumber?: string;
  panNumber?: string;
  bankDetails: BankDetails;
  paymentTerms: string;
  rating: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface BankDetails {
  accountNumber: string;
  bankName: string;
  branchName: string;
  ifscCode: string;
  accountHolderName: string;
}

export interface ItemSpecification {
  name: string;
  value: string;
  unit?: string;
}

export interface PricingInfo {
  costPrice: number;
  sellingPrice: number;
  mrp: number;
  discount: number;
  taxRate: number;
  currency: string;
  priceHistory: PriceHistory[];
}

export interface PriceHistory {
  price: number;
  type: 'cost' | 'selling' | 'mrp';
  effectiveDate: Date;
  reason?: string;
}

export interface StockInfo {
  currentStock: number;
  minStockLevel: number;
  maxStockLevel: number;
  reorderPoint: number;
  unit: string;
  reservedStock: number;
  availableStock: number;
  lastUpdated: Date;
}

export interface StorageLocation {
  warehouse: string;
  zone: string;
  rack: string;
  shelf: string;
  bin: string;
}

export interface StockTransaction {
  id: string;
  itemId: string;
  itemName: string;
  type: 'in' | 'out' | 'adjustment' | 'transfer';
  quantity: number;
  unit: string;
  reason: string;
  reference?: string;
  location: StorageLocation;
  performedBy: string;
  performedAt: Date;
  remarks?: string;
}

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplier: Supplier;
  items: PurchaseOrderItem[];
  orderDate: Date;
  expectedDeliveryDate: Date;
  status: 'draft' | 'sent' | 'acknowledged' | 'partially_received' | 'received' | 'cancelled';
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  terms: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PurchaseOrderItem {
  itemId: string;
  itemName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  receivedQuantity: number;
  pendingQuantity: number;
}

export interface StockAdjustment {
  id: string;
  adjustmentNumber: string;
  items: StockAdjustmentItem[];
  reason: string;
  type: 'increase' | 'decrease' | 'correction';
  approvedBy?: string;
  approvedAt?: Date;
  status: 'pending' | 'approved' | 'rejected';
  remarks?: string;
  createdBy: string;
  createdAt: Date;
}

export interface StockAdjustmentItem {
  itemId: string;
  itemName: string;
  currentStock: number;
  adjustedStock: number;
  adjustmentQuantity: number;
  reason: string;
}

export interface LowStockItem {
  itemId: string;
  itemName: string;
  currentStock: number;
  minStockLevel: number;
  reorderPoint: number;
  shortfall: number;
  daysUntilStockOut: number;
  category: string;
  supplier: string;
}

export interface InventoryReport {
  totalItems: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  categoryWise: Array<{
    categoryName: string;
    itemCount: number;
    totalValue: number;
  }>;
  supplierWise: Array<{
    supplierName: string;
    itemCount: number;
    totalValue: number;
  }>;
  stockMovement: Array<{
    date: string;
    inward: number;
    outward: number;
    adjustment: number;
  }>;
}

export interface InventorySearchParams {
  search?: string;
  categoryId?: string;
  supplierId?: string;
  status?: string;
  stockStatus?: 'in_stock' | 'low_stock' | 'out_of_stock';
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
