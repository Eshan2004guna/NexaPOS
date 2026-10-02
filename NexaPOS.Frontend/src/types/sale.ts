export type SaleItem = {
  productId?: number;
  productName: string;
  sku?: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

export type Sale = {
  id: number;
  invoiceNumber: string;

  customerId?: number;
  customerName: string;
  customerPhone?: string;

  saleDate: string;

  items: SaleItem[];

  subtotal: number;
  discount: number;
  loyaltyDiscount: number;
  total: number;

  paymentMethod: "Cash" | "Card";
  cashReceived: number;
  change: number;

  createdAt: string;
};