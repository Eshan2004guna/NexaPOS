export type PurchaseItem = {
  productId: number;
  productName: string;
  quantity: number;
  costPrice: number;
  total: number;
};

export type Purchase = {
  id: number;
  invoiceNumber: string;
  supplierName: string;
  supplierPhone: string;
  purchaseDate: string;
  items: PurchaseItem[];
  subtotal: number;
  discount: number;
  total: number;
  notes: string;
};