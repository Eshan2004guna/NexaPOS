import type { Purchase } from "../types/purchase";

const STORAGE_KEY = "nexapos_purchases";

function getDefaultPurchases(): Purchase[] {
  return [];
}

function readPurchases(): Purchase[] {
  const stored = localStorage.getItem(STORAGE_KEY);

  if (!stored) {
    const defaults = getDefaultPurchases();

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(defaults),
    );

    return defaults;
  }

  try {
    return JSON.parse(stored) as Purchase[];
  } catch {
    const defaults = getDefaultPurchases();

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(defaults),
    );

    return defaults;
  }
}

function writePurchases(purchases: Purchase[]) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(purchases),
  );
}

export const purchaseService = {
  getPurchases(): Purchase[] {
    return readPurchases();
  },

  getPurchaseById(id: number): Purchase | undefined {
    return readPurchases().find(
      (purchase) => purchase.id === id,
    );
  },

  addPurchase(purchase: Purchase): Purchase {
    const purchases = readPurchases();

    const updatedPurchases = [
      purchase,
      ...purchases,
    ];

    writePurchases(updatedPurchases);

    return purchase;
  },

  deletePurchase(id: number): void {
    const purchases = readPurchases();

    const updatedPurchases = purchases.filter(
      (purchase) => purchase.id !== id,
    );

    writePurchases(updatedPurchases);
  },

  savePurchases(purchases: Purchase[]): void {
    writePurchases(purchases);
  },
};