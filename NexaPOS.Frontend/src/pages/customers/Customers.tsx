import {
  Edit,
  Mail,
  Phone,
  Plus,
  Search,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { Customer } from "../../types/customer";
import { customerService } from "../../services/customerService";

type CustomerForm = {
  name: string;
  phone: string;
  email: string;
  address: string;
};

const emptyForm: CustomerForm = {
  name: "",
  phone: "",
  email: "",
  address: "",
};

function formatCurrency(value: number) {
  return `Rs. ${value.toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>(
    customerService.getCustomers(),
  );

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] =
    useState<Customer | null>(null);

  const [form, setForm] =
    useState<CustomerForm>(emptyForm);

  const [selectedCustomer, setSelectedCustomer] =
    useState<Customer | null>(null);

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return customers;
    }

    return customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(query) ||
        customer.phone.toLowerCase().includes(query) ||
        customer.email.toLowerCase().includes(query),
    );
  }, [customers, search]);

  const totalCustomers = customers.length;

  const totalSpent = customers.reduce(
    (total, customer) =>
      total + customer.totalSpent,
    0,
  );

  const totalLoyaltyPoints = customers.reduce(
    (total, customer) =>
      total + customer.loyaltyPoints,
    0,
  );

  const totalBalance = customers.reduce(
    (total, customer) =>
      total + customer.balance,
    0,
  );

  function openAddModal() {
    setEditingCustomer(null);
    setForm(emptyForm);
    setShowModal(true);
  }

  function openEditModal(customer: Customer) {
    setEditingCustomer(customer);

    setForm({
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      address: customer.address,
    });

    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingCustomer(null);
    setForm(emptyForm);
  }

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const name = form.name.trim();
    const phone = form.phone.trim();
    const email = form.email.trim();
    const address = form.address.trim();

    if (!name || !phone) {
      alert(
        "Customer name and phone number are required.",
      );
      return;
    }

    const existingCustomer =
      customerService.getCustomerByPhone(phone);

    if (
      existingCustomer &&
      existingCustomer.id !== editingCustomer?.id
    ) {
      alert(
        "A customer with this phone number already exists.",
      );
      return;
    }

    if (editingCustomer) {
      const updatedCustomer: Customer = {
        ...editingCustomer,
        name,
        phone,
        email,
        address,
      };

      customerService.updateCustomer(
        updatedCustomer,
      );

      setCustomers(
        customerService.getCustomers(),
      );

      if (
        selectedCustomer?.id ===
        updatedCustomer.id
      ) {
        setSelectedCustomer(
          updatedCustomer,
        );
      }
    } else {
      const newCustomer: Customer = {
        id: Date.now(),
        name,
        phone,
        email,
        address,

        loyaltyPoints: 0,
        balance: 0,

        totalPurchases: 0,
        totalSpent: 0,

        lastPurchaseDate: null,

        createdAt:
          new Date()
            .toISOString()
            .split("T")[0],
      };

      customerService.addCustomer(
        newCustomer,
      );

      setCustomers(
        customerService.getCustomers(),
      );
    }

    closeModal();
  }

  function handleDelete(customer: Customer) {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${customer.name}?`,
    );

    if (!confirmed) {
      return;
    }

    customerService.deleteCustomer(
      customer.id,
    );

    setCustomers(
      customerService.getCustomers(),
    );

    if (
      selectedCustomer?.id ===
      customer.id
    ) {
      setSelectedCustomer(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Customers
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage customers, loyalty points,
            balances and purchase history.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          <Plus size={18} />
          Add Customer
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Total Customers
              </p>

              <h2 className="mt-2 text-2xl font-bold text-slate-900">
                {totalCustomers}
              </h2>
            </div>

            <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
              <UserRound size={22} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Total Spending
              </p>

              <h2 className="mt-2 text-2xl font-bold text-slate-900">
                {formatCurrency(totalSpent)}
              </h2>
            </div>

            <div className="rounded-lg bg-emerald-50 p-3 text-emerald-600">
              <span className="text-lg font-bold">
                Rs
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Loyalty Points
              </p>

              <h2 className="mt-2 text-2xl font-bold text-slate-900">
                {totalLoyaltyPoints.toLocaleString()}
              </h2>
            </div>

            <div className="rounded-lg bg-amber-50 p-3 text-amber-600">
              <span className="text-lg font-bold">
                ★
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Customer Balance
              </p>

              <h2 className="mt-2 text-2xl font-bold text-slate-900">
                {formatCurrency(totalBalance)}
              </h2>
            </div>

            <div className="rounded-lg bg-purple-50 p-3 text-purple-600">
              <span className="text-lg font-bold">
                $
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative max-w-xl">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search by customer name, phone or email..."
            className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      {/* Customer Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-275">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Customer
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Contact
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Loyalty
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Purchases
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Total Spent
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Balance
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Last Purchase
                </th>

                <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.map(
                (customer) => (
                  <tr
                    key={customer.id}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedCustomer(
                            customer,
                          )
                        }
                        className="text-left"
                      >
                        <p className="font-semibold text-slate-900 hover:text-blue-600">
                          {customer.name}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          ID: CUST-
                          {String(
                            customer.id,
                          ).padStart(4, "0")}
                        </p>
                      </button>
                    </td>

                    <td className="px-5 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-slate-700">
                          <Phone size={14} />
                          {customer.phone}
                        </div>

                        {customer.email && (
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Mail size={13} />
                            {customer.email}
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                        {customer.loyaltyPoints} pts
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm font-medium text-slate-700">
                      {customer.totalPurchases}
                    </td>

                    <td className="px-5 py-4 text-sm font-semibold text-slate-900">
                      {formatCurrency(
                        customer.totalSpent,
                      )}
                    </td>

                    <td className="px-5 py-4 text-sm font-semibold text-slate-900">
                      {formatCurrency(
                        customer.balance,
                      )}
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {customer.lastPurchaseDate ||
                        "No purchases"}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            openEditModal(
                              customer,
                            )
                          }
                          className="rounded-lg p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600"
                          title="Edit customer"
                        >
                          <Edit size={17} />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(
                              customer,
                            )
                          }
                          className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                          title="Delete customer"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ),
              )}

              {filteredCustomers.length ===
                0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-12 text-center"
                  >
                    <UserRound
                      size={36}
                      className="mx-auto text-slate-300"
                    />

                    <p className="mt-3 font-semibold text-slate-700">
                      No customers found
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Try a different search or
                      add a new customer.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {editingCustomer
                    ? "Edit Customer"
                    : "Add Customer"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Enter customer information.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-4 p-6"
            >
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Customer Name *
                </label>

                <input
                  type="text"
                  value={form.name}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      name: event.target.value,
                    })
                  }
                  placeholder="Enter customer name"
                  className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Phone Number *
                </label>

                <input
                  type="tel"
                  value={form.phone}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      phone: event.target.value,
                    })
                  }
                  placeholder="0771234567"
                  className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Email
                </label>

                <input
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      email: event.target.value,
                    })
                  }
                  placeholder="customer@example.com"
                  className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Address
                </label>

                <textarea
                  value={form.address}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      address: event.target.value,
                    })
                  }
                  placeholder="Customer address"
                  rows={3}
                  className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  {editingCustomer
                    ? "Update Customer"
                    : "Add Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Details Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Customer Details
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Complete customer information
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedCustomer(null)
                }
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6 p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-xl font-bold text-blue-600">
                  {selectedCustomer.name
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    {selectedCustomer.name}
                  </h3>

                  <p className="text-sm text-slate-500">
                    Customer ID: CUST-
                    {String(
                      selectedCustomer.id,
                    ).padStart(4, "0")}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-medium uppercase text-slate-500">
                    Phone
                  </p>

                  <p className="mt-2 font-semibold text-slate-900">
                    {selectedCustomer.phone}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-medium uppercase text-slate-500">
                    Email
                  </p>

                  <p className="mt-2 font-semibold text-slate-900">
                    {selectedCustomer.email ||
                      "Not provided"}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-medium uppercase text-slate-500">
                    Address
                  </p>

                  <p className="mt-2 font-semibold text-slate-900">
                    {selectedCustomer.address ||
                      "Not provided"}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-medium uppercase text-slate-500">
                    Created
                  </p>

                  <p className="mt-2 font-semibold text-slate-900">
                    {selectedCustomer.createdAt}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs text-slate-500">
                    Loyalty Points
                  </p>

                  <p className="mt-2 text-xl font-bold text-amber-600">
                    {selectedCustomer.loyaltyPoints}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs text-slate-500">
                    Balance
                  </p>

                  <p className="mt-2 text-xl font-bold text-purple-600">
                    {formatCurrency(
                      selectedCustomer.balance,
                    )}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs text-slate-500">
                    Purchases
                  </p>

                  <p className="mt-2 text-xl font-bold text-blue-600">
                    {selectedCustomer.totalPurchases}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs text-slate-500">
                    Total Spent
                  </p>

                  <p className="mt-2 text-xl font-bold text-emerald-600">
                    {formatCurrency(
                      selectedCustomer.totalSpent,
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-200 pt-4">
                <div className="text-sm text-slate-500">
                  Last purchase:{" "}
                  <span className="font-medium text-slate-700">
                    {selectedCustomer.lastPurchaseDate ||
                      "No purchases"}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedCustomer(null)
                  }
                  className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}