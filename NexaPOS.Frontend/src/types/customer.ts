export type Customer = {
  id: number;
  name: string;
  phone: string;
  email: string;
  address: string;

  loyaltyPoints: number;
  balance: number;

  totalPurchases: number;
  totalSpent: number;

  lastPurchaseDate: string | null;

  createdAt: string;
};