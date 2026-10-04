import { useMemo, useState } from "react";
import {
  BarChart3,
  CalendarDays,
  CreditCard,
  DollarSign,
  FileText,
  ShoppingBag,
  TrendingUp,
  Users,
} from "lucide-react";

import { saleService } from "../../services/saleService";

type ReportPeriod = "Today" | "This Week" | "This Month" | "All Time";

export default function Reports() {
  const [period, setPeriod] = useState<ReportPeriod>("This Month");

  const sales = saleService.getSales();

  const filteredSales = useMemo(() => {
    const now = new Date();

    return sales.filter((sale) => {
      const saleDate = new Date(sale.saleDate);

      if (period === "All Time") {
        return true;
      }

      if (period === "Today") {
        return (
          saleDate.getFullYear() === now.getFullYear() &&
          saleDate.getMonth() === now.getMonth() &&
          saleDate.getDate() === now.getDate()
        );
      }

      if (period === "This Week") {
        const startOfWeek = new Date(now);
        const day = startOfWeek.getDay();

        startOfWeek.setDate(
          startOfWeek.getDate() - day,
        );

        startOfWeek.setHours(0, 0, 0, 0);

        return saleDate >= startOfWeek;
      }

      if (period === "This Month") {
        return (
          saleDate.getFullYear() === now.getFullYear() &&
          saleDate.getMonth() === now.getMonth()
        );
      }

      return true;
    });
  }, [sales, period]);

  const totalSales = useMemo(
    () =>
      filteredSales.reduce(
        (sum, sale) => sum + sale.total,
        0,
      ),
    [filteredSales],
  );

  const totalInvoices = filteredSales.length;

  const cashSales = useMemo(
    () =>
      filteredSales
        .filter((sale) => sale.paymentMethod === "Cash")
        .reduce(
          (sum, sale) => sum + sale.total,
          0,
        ),
    [filteredSales],
  );

  const cardSales = useMemo(
    () =>
      filteredSales
        .filter((sale) => sale.paymentMethod === "Card")
        .reduce(
          (sum, sale) => sum + sale.total,
          0,
        ),
    [filteredSales],
  );

  const averageSale =
    totalInvoices > 0
      ? totalSales / totalInvoices
      : 0;

  const topProducts = useMemo(() => {
    const productMap = new Map<
      number,
      {
        productName: string;
        quantity: number;
        revenue: number;
      }
    >();

    filteredSales.forEach((sale) => {
      sale.items.forEach((item) => {
        const existing = productMap.get(
          item.productId ?? 0,
        );

        if (existing) {
          existing.quantity += item.quantity;
          existing.revenue += item.total;
        } else {
          productMap.set(item.productId ?? 0, {
            productName: item.productName,
            quantity: item.quantity,
            revenue: item.total,
          });
        }
      });
    });

    return Array.from(productMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [filteredSales]);

  const customerSales = useMemo(() => {
    const customerMap = new Map<
      string,
      {
        customerName: string;
        invoices: number;
        spent: number;
      }
    >();

    filteredSales.forEach((sale) => {
      const customerName =
        sale.customerName || "Walk-in Customer";

      const existing =
        customerMap.get(customerName);

      if (existing) {
        existing.invoices += 1;
        existing.spent += sale.total;
      } else {
        customerMap.set(customerName, {
          customerName,
          invoices: 1,
          spent: sale.total,
        });
      }
    });

    return Array.from(customerMap.values())
      .sort((a, b) => b.spent - a.spent)
      .slice(0, 5);
  }, [filteredSales]);

  const recentSales = [...filteredSales]
    .sort(
      (a, b) =>
        new Date(b.saleDate).getTime() -
        new Date(a.saleDate).getTime(),
    )
    .slice(0, 8);

  const formatCurrency = (value: number) =>
    `Rs. ${value.toLocaleString()}`;

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString();

  const formatDateTime = (date: string) =>
    new Date(date).toLocaleString();

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Reports
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Analyze sales, products, customers, and
            payment performance.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
          <CalendarDays
            size={17}
            className="ml-2 text-slate-400"
          />

          {(
            [
              "Today",
              "This Week",
              "This Month",
              "All Time",
            ] as ReportPeriod[]
          ).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setPeriod(option)}
              className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                period === option
                  ? "bg-blue-600 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ReportCard
          title="Total Sales"
          value={formatCurrency(totalSales)}
          icon={<DollarSign size={20} />}
          description={`${period} sales`}
          iconClass="bg-blue-50 text-blue-600"
        />

        <ReportCard
          title="Total Invoices"
          value={totalInvoices.toLocaleString()}
          icon={<FileText size={20} />}
          description="Completed invoices"
          iconClass="bg-purple-50 text-purple-600"
        />

        <ReportCard
          title="Cash Sales"
          value={formatCurrency(cashSales)}
          icon={<DollarSign size={20} />}
          description="Cash payments"
          iconClass="bg-emerald-50 text-emerald-600"
        />

        <ReportCard
          title="Card Sales"
          value={formatCurrency(cardSales)}
          icon={<CreditCard size={20} />}
          description="Card payments"
          iconClass="bg-orange-50 text-orange-600"
        />
      </div>

      {/* SECONDARY SUMMARY */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <ReportCard
          title="Average Sale"
          value={formatCurrency(averageSale)}
          icon={<TrendingUp size={20} />}
          description="Average invoice value"
          iconClass="bg-cyan-50 text-cyan-600"
        />

        <ReportCard
          title="Cash Transactions"
          value={filteredSales
            .filter(
              (sale) =>
                sale.paymentMethod === "Cash",
            )
            .length.toLocaleString()}
          icon={<ShoppingBag size={20} />}
          description="Cash invoices"
          iconClass="bg-green-50 text-green-600"
        />

        <ReportCard
          title="Card Transactions"
          value={filteredSales
            .filter(
              (sale) =>
                sale.paymentMethod === "Card",
            )
            .length.toLocaleString()}
          icon={<CreditCard size={20} />}
          description="Card invoices"
          iconClass="bg-indigo-50 text-indigo-600"
        />
      </div>

      {/* PAYMENT BREAKDOWN */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <BarChart3 size={20} />
          </div>

          <div>
            <h2 className="font-semibold text-slate-900">
              Payment Breakdown
            </h2>

            <p className="text-xs text-slate-500">
              Sales distribution by payment method
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <PaymentBar
            label="Cash"
            amount={cashSales}
            total={totalSales}
            count={
              filteredSales.filter(
                (sale) =>
                  sale.paymentMethod === "Cash",
              ).length
            }
          />

          <PaymentBar
            label="Card"
            amount={cardSales}
            total={totalSales}
            count={
              filteredSales.filter(
                (sale) =>
                  sale.paymentMethod === "Card",
              ).length
            }
          />
        </div>
      </div>

      {/* TOP PRODUCTS + CUSTOMERS */}
      <div className="grid gap-5 xl:grid-cols-2">
        {/* TOP PRODUCTS */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-200 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
              <ShoppingBag size={20} />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">
                Top Products
              </h2>

              <p className="text-xs text-slate-500">
                Highest revenue products
              </p>
            </div>
          </div>

          {topProducts.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {topProducts.map((product, index) => (
                <div
                  key={`${product.productName}-${index}`}
                  className="flex items-center justify-between p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">
                      {index + 1}
                    </div>

                    <div>
                      <p className="font-medium text-slate-900">
                        {product.productName}
                      </p>

                      <p className="text-xs text-slate-500">
                        {product.quantity} units sold
                      </p>
                    </div>
                  </div>

                  <p className="font-semibold text-slate-900">
                    {formatCurrency(product.revenue)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState message="No product sales for this period." />
          )}
        </div>

        {/* TOP CUSTOMERS */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-200 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <Users size={20} />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">
                Top Customers
              </h2>

              <p className="text-xs text-slate-500">
                Highest spending customers
              </p>
            </div>
          </div>

          {customerSales.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {customerSales.map(
                (customer, index) => (
                  <div
                    key={`${customer.customerName}-${index}`}
                    className="flex items-center justify-between p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">
                        {index + 1}
                      </div>

                      <div>
                        <p className="font-medium text-slate-900">
                          {customer.customerName}
                        </p>

                        <p className="text-xs text-slate-500">
                          {customer.invoices} invoice
                          {customer.invoices !== 1
                            ? "s"
                            : ""}
                        </p>
                      </div>
                    </div>

                    <p className="font-semibold text-slate-900">
                      {formatCurrency(customer.spent)}
                    </p>
                  </div>
                ),
              )}
            </div>
          ) : (
            <EmptyState message="No customer sales for this period." />
          )}
        </div>
      </div>

      {/* RECENT SALES */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <FileText size={20} />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">
                Recent Sales
              </h2>

              <p className="text-xs text-slate-500">
                Latest transactions
              </p>
            </div>
          </div>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            {period}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3">
                  Invoice
                </th>

                <th className="px-5 py-3">
                  Customer
                </th>

                <th className="px-5 py-3">
                  Date
                </th>

                <th className="px-5 py-3">
                  Payment
                </th>

                <th className="px-5 py-3">
                  Items
                </th>

                <th className="px-5 py-3 text-right">
                  Total
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {recentSales.map((sale) => (
                <tr
                  key={sale.id}
                  className="hover:bg-slate-50"
                >
                  <td className="px-5 py-4 font-semibold text-slate-900">
                    {sale.invoiceNumber}
                  </td>

                  <td className="px-5 py-4 text-slate-700">
                    {sale.customerName}
                  </td>

                  <td className="px-5 py-4 text-slate-500">
                    <div>
                      {formatDate(sale.saleDate)}
                    </div>

                    <div className="text-xs text-slate-400">
                      {formatDateTime(
                        sale.saleDate,
                      ).split(", ")[1]}
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        sale.paymentMethod ===
                        "Cash"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-blue-50 text-blue-700"
                      }`}
                    >
                      {sale.paymentMethod}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-slate-600">
                    {sale.items.reduce(
                      (sum, item) =>
                        sum + item.quantity,
                      0,
                    )}
                  </td>

                  <td className="px-5 py-4 text-right font-semibold text-slate-900">
                    {formatCurrency(sale.total)}
                  </td>
                </tr>
              ))}

              {recentSales.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-14 text-center"
                  >
                    <FileText
                      size={30}
                      className="mx-auto text-slate-300"
                    />

                    <p className="mt-3 font-medium text-slate-600">
                      No sales found
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      There are no sales for the
                      selected period.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ReportCard({
  title,
  value,
  description,
  icon,
  iconClass,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  iconClass: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {description}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconClass}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function PaymentBar({
  label,
  amount,
  total,
  count,
}: {
  label: string;
  amount: number;
  total: number;
  count: number;
}) {
  const percentage =
    total > 0 ? (amount / total) * 100 : 0;

  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-slate-800">
            {label}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {count} transaction
            {count !== 1 ? "s" : ""}
          </p>
        </div>

        <p className="font-semibold text-slate-900">
          Rs. {amount.toLocaleString()}
        </p>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-blue-600 transition-all"
          style={{
            width: `${Math.min(percentage, 100)}%`,
          }}
        />
      </div>

      <p className="mt-2 text-right text-xs text-slate-400">
        {percentage.toFixed(1)}%
      </p>
    </div>
  );
}

function EmptyState({
  message,
}: {
  message: string;
}) {
  return (
    <div className="px-5 py-12 text-center">
      <BarChart3
        size={28}
        className="mx-auto text-slate-300"
      />

      <p className="mt-3 text-sm text-slate-500">
        {message}
      </p>
    </div>
  );
}