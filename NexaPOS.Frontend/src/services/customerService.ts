import type { Customer } from "../types/customer";

const STORAGE_KEY = "nexapos_customers";

function getDefaultCustomers(): Customer[] {
  return [
    {
      id: 1,
      name: "John Silva",
      phone: "0771234567",
      email: "john@example.com",
      address: "Colombo",

      loyaltyPoints: 120,
      balance: 0,

      totalPurchases: 8,
      totalSpent: 24500,

      lastPurchaseDate: "2026-09-30",

      createdAt: "2026-09-01",
    },
    {
      id: 2,
      name: "Nimal Perera",
      phone: "0712345678",
      email: "nimal@example.com",
      address: "Kaduwela",

      loyaltyPoints: 65,
      balance: 0,

      totalPurchases: 5,
      totalSpent: 12800,

      lastPurchaseDate: "2026-09-28",

      createdAt: "2026-09-05",
    },
    {
      id: 3,
      name: "Kamal Fernando",
      phone: "0759876543",
      email: "kamal@example.com",
      address: "Maharagama",

      loyaltyPoints: 210,
      balance: 500,

      totalPurchases: 14,
      totalSpent: 42150,

      lastPurchaseDate: "2026-09-29",

      createdAt: "2026-09-10",
    },
  ];
}

function readCustomers(): Customer[] {
  const stored = localStorage.getItem(
    STORAGE_KEY,
  );

  if (!stored) {
    const defaults = getDefaultCustomers();

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(defaults),
    );

    return defaults;
  }

  try {
    return JSON.parse(
      stored,
    ) as Customer[];
  } catch {
    const defaults = getDefaultCustomers();

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(defaults),
    );

    return defaults;
  }
}

function writeCustomers(
  customers: Customer[],
) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(customers),
  );
}

export const customerService = {
  getCustomers(): Customer[] {
    return readCustomers();
  },

  getCustomerById(
    id: number,
  ): Customer | undefined {
    return readCustomers().find(
      (customer) =>
        customer.id === id,
    );
  },

  getCustomerByPhone(
    phone: string,
  ): Customer | undefined {
    return readCustomers().find(
      (customer) =>
        customer.phone === phone,
    );
  },

  addCustomer(
    customer: Customer,
  ): Customer {
    const customers =
      readCustomers();

    const updatedCustomers = [
      customer,
      ...customers,
    ];

    writeCustomers(
      updatedCustomers,
    );

    return customer;
  },

  updateCustomer(
    customer: Customer,
  ): Customer {
    const customers =
      readCustomers();

    const updatedCustomers =
      customers.map(
        (item) =>
          item.id === customer.id
            ? customer
            : item,
      );

    writeCustomers(
      updatedCustomers,
    );

    return customer;
  },

  deleteCustomer(
    id: number,
  ): void {
    const customers =
      readCustomers();

    const updatedCustomers =
      customers.filter(
        (customer) =>
          customer.id !== id,
      );

    writeCustomers(
      updatedCustomers,
    );
  },

  saveCustomers(
    customers: Customer[],
  ): void {
    writeCustomers(
      customers,
    );
  },
};