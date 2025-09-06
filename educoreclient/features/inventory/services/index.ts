// Inventory API service for external .NET Core API

import { apiClient, ApiResponse } from '@/lib/api-client';
import { API_CONFIG } from '@/config/app.config';
import {
  InventoryItem,
  Category,
  Supplier,
  StockTransaction,
  PurchaseOrder,
  StockAdjustment,
  InventoryReport,
  InventorySearchParams,
} from '@/features/inventory/types';

export class InventoryService {
  private readonly baseEndpoint = API_CONFIG.endpoints.inventory;

  // Item Management
  async getItems(params?: InventorySearchParams): Promise<ApiResponse<InventoryItem[]>> {
    return apiClient.get<InventoryItem[]>(`${this.baseEndpoint}/items`, { params });
  }

  async getItemById(id: string): Promise<ApiResponse<InventoryItem>> {
    return apiClient.get<InventoryItem>(`${this.baseEndpoint}/items/${id}`);
  }

  async createItem(item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<InventoryItem>> {
    return apiClient.post<InventoryItem>(`${this.baseEndpoint}/items`, item);
  }

  async updateItem(id: string, item: Partial<InventoryItem>): Promise<ApiResponse<InventoryItem>> {
    return apiClient.put<InventoryItem>(`${this.baseEndpoint}/items/${id}`, item);
  }

  async deleteItem(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${this.baseEndpoint}/items/${id}`);
  }

  // Category Management
  async getCategories(): Promise<ApiResponse<Category[]>> {
    return apiClient.get<Category[]>(`${this.baseEndpoint}/categories`);
  }

  async getCategoryById(id: string): Promise<ApiResponse<Category>> {
    return apiClient.get<Category>(`${this.baseEndpoint}/categories/${id}`);
  }

  async createCategory(category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Category>> {
    return apiClient.post<Category>(`${this.baseEndpoint}/categories`, category);
  }

  async updateCategory(id: string, category: Partial<Category>): Promise<ApiResponse<Category>> {
    return apiClient.put<Category>(`${this.baseEndpoint}/categories/${id}`, category);
  }

  async deleteCategory(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${this.baseEndpoint}/categories/${id}`);
  }

  // Supplier Management
  async getSuppliers(): Promise<ApiResponse<Supplier[]>> {
    return apiClient.get<Supplier[]>(`${this.baseEndpoint}/suppliers`);
  }

  async getSupplierById(id: string): Promise<ApiResponse<Supplier>> {
    return apiClient.get<Supplier>(`${this.baseEndpoint}/suppliers/${id}`);
  }

  async createSupplier(supplier: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Supplier>> {
    return apiClient.post<Supplier>(`${this.baseEndpoint}/suppliers`, supplier);
  }

  async updateSupplier(id: string, supplier: Partial<Supplier>): Promise<ApiResponse<Supplier>> {
    return apiClient.put<Supplier>(`${this.baseEndpoint}/suppliers/${id}`, supplier);
  }

  async deleteSupplier(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${this.baseEndpoint}/suppliers/${id}`);
  }

  // Stock Management
  async getStockTransactions(params?: any): Promise<ApiResponse<StockTransaction[]>> {
    return apiClient.get<StockTransaction[]>(`${this.baseEndpoint}/stock/transactions`, { params });
  }

  async addStock(itemId: string, quantity: number, reason: string): Promise<ApiResponse<StockTransaction>> {
    return apiClient.post<StockTransaction>(`${this.baseEndpoint}/stock/add`, {
      itemId,
      quantity,
      reason
    });
  }

  async removeStock(itemId: string, quantity: number, reason: string): Promise<ApiResponse<StockTransaction>> {
    return apiClient.post<StockTransaction>(`${this.baseEndpoint}/stock/remove`, {
      itemId,
      quantity,
      reason
    });
  }

  async adjustStock(adjustmentData: Omit<StockAdjustment, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<StockAdjustment>> {
    return apiClient.post<StockAdjustment>(`${this.baseEndpoint}/stock/adjust`, adjustmentData);
  }

  // Purchase Order Management
  async getPurchaseOrders(params?: any): Promise<ApiResponse<PurchaseOrder[]>> {
    return apiClient.get<PurchaseOrder[]>(`${this.baseEndpoint}/purchase-orders`, { params });
  }

  async getPurchaseOrderById(id: string): Promise<ApiResponse<PurchaseOrder>> {
    return apiClient.get<PurchaseOrder>(`${this.baseEndpoint}/purchase-orders/${id}`);
  }

  async createPurchaseOrder(order: Omit<PurchaseOrder, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<PurchaseOrder>> {
    return apiClient.post<PurchaseOrder>(`${this.baseEndpoint}/purchase-orders`, order);
  }

  async updatePurchaseOrder(id: string, order: Partial<PurchaseOrder>): Promise<ApiResponse<PurchaseOrder>> {
    return apiClient.put<PurchaseOrder>(`${this.baseEndpoint}/purchase-orders/${id}`, order);
  }

  async approvePurchaseOrder(id: string): Promise<ApiResponse<PurchaseOrder>> {
    return apiClient.post<PurchaseOrder>(`${this.baseEndpoint}/purchase-orders/${id}/approve`);
  }

  async receivePurchaseOrder(id: string, receivedItems: Array<{
    itemId: string;
    receivedQuantity: number;
  }>): Promise<ApiResponse<PurchaseOrder>> {
    return apiClient.post<PurchaseOrder>(`${this.baseEndpoint}/purchase-orders/${id}/receive`, {
      receivedItems
    });
  }

  // Reports and Analytics
  async getInventoryReport(): Promise<ApiResponse<InventoryReport>> {
    return apiClient.get<InventoryReport>(`${this.baseEndpoint}/reports/overview`);
  }

  async getLowStockItems(): Promise<ApiResponse<InventoryItem[]>> {
    return apiClient.get<InventoryItem[]>(`${this.baseEndpoint}/reports/low-stock`);
  }

  async getStockValuation(): Promise<ApiResponse<{
    totalValue: number;
    categoryWise: Array<{ category: string; value: number }>;
  }>> {
    return apiClient.get(`${this.baseEndpoint}/reports/valuation`);
  }

  // Search and Filters
  async searchItems(query: string): Promise<ApiResponse<InventoryItem[]>> {
    return apiClient.get<InventoryItem[]>(`${this.baseEndpoint}/items/search`, {
      params: { q: query }
    });
  }

  async getItemsByCategory(categoryId: string): Promise<ApiResponse<InventoryItem[]>> {
    return apiClient.get<InventoryItem[]>(`${this.baseEndpoint}/items/by-category/${categoryId}`);
  }

  async getItemsBySupplier(supplierId: string): Promise<ApiResponse<InventoryItem[]>> {
    return apiClient.get<InventoryItem[]>(`${this.baseEndpoint}/items/by-supplier/${supplierId}`);
  }

  // Bulk Operations
  async bulkUpdatePrices(updates: Array<{
    itemId: string;
    costPrice?: number;
    sellingPrice?: number;
    mrp?: number;
  }>): Promise<ApiResponse<InventoryItem[]>> {
    return apiClient.put<InventoryItem[]>(`${this.baseEndpoint}/items/bulk-update-prices`, updates);
  }

  async bulkStockAdjustment(adjustments: Array<{
    itemId: string;
    quantity: number;
    reason: string;
  }>): Promise<ApiResponse<StockTransaction[]>> {
    return apiClient.post<StockTransaction[]>(`${this.baseEndpoint}/stock/bulk-adjust`, adjustments);
  }

  // Export functionality
  async exportInventory(format: 'csv' | 'excel' | 'pdf', filters?: InventorySearchParams): Promise<Blob> {
    const response = await fetch(
      apiClient.buildUrl(`${this.baseEndpoint}/export`, { format, ...filters }),
      {
        headers: {
          'Authorization': `Bearer ${apiClient.getAccessToken()}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Export failed');
    }

    return response.blob();
  }

  // Import functionality
  async importItems(file: File): Promise<ApiResponse<{ imported: number; errors: any[] }>> {
    const formData = new FormData();
    formData.append('file', file);

    return apiClient.request<{ imported: number; errors: any[] }>(`${this.baseEndpoint}/items/import`, {
      method: 'POST',
      body: formData,
      headers: {}
    });
  }
}

// Create singleton instance
export const inventoryService = new InventoryService();

// Export default instance
export default inventoryService;
