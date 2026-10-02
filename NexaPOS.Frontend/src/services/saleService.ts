import type { Sale } from "../types/sale";

const STORAGE_KEY = "nexapos_sales";

const getDefaultSales = (): Sale[] => [
  {
    id: 1,
    invoiceNumber: "INV-0001",
    customerId: 1,
    customerName: "John Silva",
    customerPhone: "0771234567",
    saleDate: "2026-09-30T10:30:00",
    items: [
      {
        productId: 1,
        productName: "Rice 5kg",
        sku: "RICE-5KG",
        quantity: 2,
        unitPrice: 1250,
        total: 2500,
      },
    ],
    subtotal: 2500,
    discount: 0,
    loyaltyDiscount: 0,
    total: 2500,
    paymentMethod: "Cash",
    cashReceived: 3000,
    change: 500,
    createdAt: "2026-09-30T10:30:00",
  },
  {
    id: 2,
    invoiceNumber: "INV-0002",
    customerId: 2,
    customerName: "Nimal Perera",
    customerPhone: "0712345678",
    saleDate: "2026-09-30T14:15:00",
    items: [
      {
        productId: 2,
        productName: "Milk Powder",
        sku: "MILK-001",
        quantity: 1,
        unitPrice: 950,
        total: 950,
      },
      {
        productId: 3,
        productName: "Bread",
        sku: "BREAD-001",
        quantity: 2,
        unitPrice: 180,
        total: 360,
      },
    ],
    subtotal: 1310,
    discount: 100,
    loyaltyDiscount: 0,
    total: 1210,
    paymentMethod: "Card",
    cashReceived: 0,
    change: 0,
    createdAt: "2026-09-30T14:15:00",
  },
];

const initializeSales = (): Sale[] => {
  const existing = localStorage.getItem(STORAGE_KEY);

  if (existing) {
    try {
      return JSON.parse(existing) as Sale[];
    } catch {
      // Invalid stored data — reset to defaults
    }
  }

  const defaults = getDefaultSales();

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(defaults),
  );

  return defaults;
};

export const saleService = {
  getSales(): Sale[] {
    return initializeSales();
  },

  getSaleById(id: number): Sale | undefined {
    return this.getSales().find(
      (sale) => sale.id === id,
    );
  },

  getSaleByInvoiceNumber(
    invoiceNumber: string,
  ): Sale | undefined {
    return this.getSales().find(
      (sale) =>
        sale.invoiceNumber.toLowerCase() ===
        invoiceNumber.toLowerCase(),
    );
  },

  addSale(sale: Sale): Sale {
    const sales = this.getSales();

    const updatedSales = [
      sale,
      ...sales,
    ];

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updatedSales),
    );

    return sale;
  },

  updateSale(sale: Sale): void {
    const sales = this.getSales();

    const updatedSales = sales.map(
      (existingSale) =>
        existingSale.id === sale.id
          ? sale
          : existingSale,
    );

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updatedSales),
    );
  },

  deleteSale(id: number): void {
    const sales = this.getSales();

    const updatedSales = sales.filter(
      (sale) => sale.id !== id,
    );

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updatedSales),
    );
  },

  saveSales(sales: Sale[]): void {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(sales),
    );
  },

  clearSales(): void {
    localStorage.removeItem(STORAGE_KEY);
  },
};