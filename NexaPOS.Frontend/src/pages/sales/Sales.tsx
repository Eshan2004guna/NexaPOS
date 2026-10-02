import { useMemo, useState } from "react";
import {
  Eye,
  Search,
  X,
  Receipt,
  Banknote,
  CreditCard,
  ShoppingCart,
  CalendarDays,
} from "lucide-react";

import type { Sale } from "../../types/sale";
import { saleService } from "../../services/saleService";

const formatCurrency = (value: number) =>
  `Rs. ${value.toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDateTime = (value: string) => {
  const date = new Date(value);

  return date.toLocaleString("en-LK", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function Sales() {
  const [sales] = useState<Sale[]>(
    saleService.getSales(),
  );

  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] =
    useState<"All" | "Cash" | "Card">("All");

  const [selectedSale, setSelectedSale] =
    useState<Sale | null>(null);

  const filteredSales = useMemo(() => {
    const query = search.trim().toLowerCase();

    return sales.filter((sale) => {
      const matchesSearch =
        !query ||
        sale.invoiceNumber
          .toLowerCase()
          .includes(query) ||
        sale.customerName
          .toLowerCase()
          .includes(query) ||
        (sale.customerPhone ?? "")
          .toLowerCase()
          .includes(query);

      const matchesPayment =
        paymentFilter === "All" ||
        sale.paymentMethod === paymentFilter;

      return matchesSearch && matchesPayment;
    });
  }, [sales, search, paymentFilter]);

  const totalSales = filteredSales.reduce(
    (sum, sale) => sum + sale.total,
    0,
  );

  const cashSales = filteredSales
    .filter(
      (sale) => sale.paymentMethod === "Cash",
    )
    .reduce((sum, sale) => sum + sale.total, 0);

  const cardSales = filteredSales
    .filter(
      (sale) => sale.paymentMethod === "Card",
    )
    .reduce((sum, sale) => sum + sale.total, 0);

  const totalItems = filteredSales.reduce(
    (sum, sale) =>
      sum +
      sale.items.reduce(
        (itemSum, item) => itemSum + item.quantity,
        0,
      ),
    0,
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Sales
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          View and manage completed sales
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Total Sales
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {formatCurrency(totalSales)}
              </p>
            </div>

            <div className="rounded-lg bg-emerald-100 p-3 text-emerald-600">
              <Receipt size={22} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Invoices
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {filteredSales.length}
              </p>
            </div>

            <div className="rounded-lg bg-blue-100 p-3 text-blue-600">
              <ShoppingCart size={22} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Cash Sales
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {formatCurrency(cashSales)}
              </p>
            </div>

            <div className="rounded-lg bg-amber-100 p-3 text-amber-600">
              <Banknote size={22} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Card Sales
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {formatCurrency(cardSales)}
              </p>
            </div>

            <div className="rounded-lg bg-purple-100 p-3 text-purple-600">
              <CreditCard size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Search */}
          <div className="relative w-full lg:max-w-md">
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
              placeholder="Search invoice, customer or phone..."
              className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Payment Filter */}
          <div className="flex items-center gap-2">
            {(["All", "Cash", "Card"] as const).map(
              (option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() =>
                    setPaymentFilter(option)
                  }
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                    paymentFilter === option
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {option}
                </button>
              ),
            )}
          </div>
        </div>
      </div>

      {/* Sales Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="font-semibold text-slate-900">
              Sales History
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              {totalItems} items across{" "}
              {filteredSales.length} invoices
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-500">
            <CalendarDays size={16} />
            All sales
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-225 text-left">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">
                  Invoice
                </th>

                <th className="px-5 py-3 font-semibold">
                  Date
                </th>

                <th className="px-5 py-3 font-semibold">
                  Customer
                </th>

                <th className="px-5 py-3 font-semibold">
                  Items
                </th>

                <th className="px-5 py-3 font-semibold">
                  Payment
                </th>

                <th className="px-5 py-3 text-right font-semibold">
                  Total
                </th>

                <th className="px-5 py-3 text-right font-semibold">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredSales.map((sale) => (
                <tr
                  key={sale.id}
                  className="transition hover:bg-slate-50"
                >
                  <td className="px-5 py-4">
                    <span className="font-semibold text-blue-600">
                      {sale.invoiceNumber}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-600">
                    {formatDateTime(sale.saleDate)}
                  </td>

                  <td className="px-5 py-4">
                    <div className="font-medium text-slate-900">
                      {sale.customerName}
                    </div>

                    {sale.customerPhone && (
                      <div className="mt-1 text-xs text-slate-500">
                        {sale.customerPhone}
                      </div>
                    )}
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-600">
                    {sale.items.reduce(
                      (sum, item) =>
                        sum + item.quantity,
                      0,
                    )}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                        sale.paymentMethod === "Cash"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-purple-100 text-purple-700"
                      }`}
                    >
                      {sale.paymentMethod}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-right font-semibold text-slate-900">
                    {formatCurrency(sale.total)}
                  </td>

                  <td className="px-5 py-4 text-right">
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedSale(sale)
                      }
                      className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
                    >
                      <Eye size={16} />
                      View
                    </button>
                  </td>
                </tr>
              ))}

              {filteredSales.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-12 text-center"
                  >
                    <Receipt
                      size={40}
                      className="mx-auto text-slate-300"
                    />

                    <p className="mt-3 font-medium text-slate-600">
                      No sales found
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      Try changing your search or payment filter.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sale Details Modal */}
      {selectedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Sale Details
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {selectedSale.invoiceNumber}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedSale(null)
                }
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6 p-6">
              {/* Invoice Information */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Invoice
                  </p>

                  <p className="mt-1 font-semibold text-slate-900">
                    {selectedSale.invoiceNumber}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Date
                  </p>

                  <p className="mt-1 font-semibold text-slate-900">
                    {formatDateTime(
                      selectedSale.saleDate,
                    )}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Customer
                  </p>

                  <p className="mt-1 font-semibold text-slate-900">
                    {selectedSale.customerName}
                  </p>

                  {selectedSale.customerPhone && (
                    <p className="mt-1 text-sm text-slate-500">
                      {selectedSale.customerPhone}
                    </p>
                  )}
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Payment Method
                  </p>

                  <p className="mt-1 font-semibold text-slate-900">
                    {selectedSale.paymentMethod}
                  </p>
                </div>
              </div>

              {/* Items */}
              <div>
                <h3 className="mb-3 font-semibold text-slate-900">
                  Purchased Items
                </h3>

                <div className="overflow-hidden rounded-xl border border-slate-200">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                      <tr>
                        <th className="px-4 py-3">
                          Product
                        </th>

                        <th className="px-4 py-3 text-center">
                          Qty
                        </th>

                        <th className="px-4 py-3 text-right">
                          Unit Price
                        </th>

                        <th className="px-4 py-3 text-right">
                          Total
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {selectedSale.items.map(
                        (item, index) => (
                          <tr key={`${item.productName}-${index}`}>
                            <td className="px-4 py-3">
                              <div className="font-medium text-slate-900">
                                {item.productName}
                              </div>

                              {item.sku && (
                                <div className="mt-1 text-xs text-slate-500">
                                  SKU: {item.sku}
                                </div>
                              )}
                            </td>

                            <td className="px-4 py-3 text-center text-sm text-slate-600">
                              {item.quantity}
                            </td>

                            <td className="px-4 py-3 text-right text-sm text-slate-600">
                              {formatCurrency(
                                item.unitPrice,
                              )}
                            </td>

                            <td className="px-4 py-3 text-right font-medium text-slate-900">
                              {formatCurrency(
                                item.total,
                              )}
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="ml-auto max-w-sm space-y-3 rounded-xl bg-slate-50 p-5">
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Subtotal</span>

                  <span>
                    {formatCurrency(
                      selectedSale.subtotal,
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-sm text-slate-600">
                  <span>Discount</span>

                  <span>
                    -{" "}
                    {formatCurrency(
                      selectedSale.discount,
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-sm text-slate-600">
                  <span>Loyalty Discount</span>

                  <span>
                    -{" "}
                    {formatCurrency(
                      selectedSale.loyaltyDiscount,
                    )}
                  </span>
                </div>

                <div className="border-t border-slate-200 pt-3">
                  <div className="flex justify-between text-lg font-bold text-slate-900">
                    <span>Total</span>

                    <span>
                      {formatCurrency(
                        selectedSale.total,
                      )}
                    </span>
                  </div>
                </div>

                {selectedSale.paymentMethod ===
                  "Cash" && (
                  <>
                    <div className="flex justify-between text-sm text-slate-600">
                      <span>Cash Received</span>

                      <span>
                        {formatCurrency(
                          selectedSale.cashReceived,
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm font-semibold text-emerald-600">
                      <span>Change</span>

                      <span>
                        {formatCurrency(
                          selectedSale.change,
                        )}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end border-t border-slate-200 px-6 py-4">
              <button
                type="button"
                onClick={() =>
                  setSelectedSale(null)
                }
                className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}