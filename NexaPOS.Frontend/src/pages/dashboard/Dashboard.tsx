import { useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  CreditCard,
  Package,
  ShoppingCart,
  Users,
} from "lucide-react";

import { saleService } from "../../services/saleService";
import { productService } from "../../services/productService";
import { customerService } from "../../services/customerService";

type ChartPeriod = "This Week" | "This Month" | "This Year";

function formatCurrency(value: number) {
  return `Rs. ${value.toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function isSameDay(dateValue: string) {
  const date = new Date(dateValue);
  const today = new Date();

  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

function startOfWeek(date: Date) {
  const result = new Date(date);
  const day = result.getDay();

  const difference = day === 0 ? -6 : 1 - day;

  result.setDate(result.getDate() + difference);
  result.setHours(0, 0, 0, 0);

  return result;
}

function getWeekDayIndex(dateValue: string) {
  const date = new Date(dateValue);
  const monday = startOfWeek(new Date());

  const current = new Date(date);
  current.setHours(0, 0, 0, 0);

  const difference =
    Math.floor(
      (current.getTime() - monday.getTime()) /
        (1000 * 60 * 60 * 24),
    );

  return difference;
}

function getStartOfMonth(date: Date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    1,
  );
}

function getStartOfYear(date: Date) {
  return new Date(
    date.getFullYear(),
    0,
    1,
  );
}

function getDaysInCurrentMonth() {
  const today = new Date();

  return new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    0,
  ).getDate();
}

export default function Dashboard() {
  const [period, setPeriod] =
    useState<ChartPeriod>("This Week");

  const sales = saleService.getSales();
  const products = productService.getProducts();
  const customers = customerService.getCustomers();

  const dashboardData = useMemo(() => {
    const todaySales = sales.filter((sale) =>
      isSameDay(sale.saleDate),
    );

    const todaySalesAmount = todaySales.reduce(
      (sum, sale) => sum + sale.total,
      0,
    );

    const lowStockProducts = products.filter(
      (product) =>
        product.stock > 0 &&
        product.stock <= product.reorderLevel,
    );

    const outOfStockProducts = products.filter(
      (product) => product.stock <= 0,
    );

    const cashSales = todaySales
      .filter((sale) => sale.paymentMethod === "Cash")
      .reduce((sum, sale) => sum + sale.total, 0);

    const cardSales = todaySales
      .filter((sale) => sale.paymentMethod === "Card")
      .reduce((sum, sale) => sum + sale.total, 0);

    const totalPaymentAmount =
      cashSales + cardSales;

    const cashPercentage =
      totalPaymentAmount > 0
        ? Math.round(
            (cashSales / totalPaymentAmount) * 100,
          )
        : 0;

    const cardPercentage =
      totalPaymentAmount > 0
        ? Math.round(
            (cardSales / totalPaymentAmount) * 100,
          )
        : 0;

    return {
      todaySales,
      todaySalesAmount,
      lowStockProducts,
      outOfStockProducts,
      cashSales,
      cardSales,
      cashPercentage,
      cardPercentage,
    };
  }, [sales, products]);

  const chartData = useMemo(() => {
    if (period === "This Week") {
  const labels = [
        "Mon",
        "Tue",
        "Wed",
        "Thu",
        "Fri",
        "Sat",
        "Sun",
      ];

      const values = labels.map((_, index) => {
        return sales
          .filter(
            (sale) =>
              getWeekDayIndex(sale.saleDate) === index,
          )
          .reduce(
            (sum, sale) => sum + sale.total,
            0,
          );
      });

      return labels.map((label, index) => ({
        label,
        value: values[index],
      }));
    }

    if (period === "This Month") {
      const today = new Date();
      const monthStart = getStartOfMonth(today);
      const daysInMonth = getDaysInCurrentMonth();

      const labels = [
        "Week 1",
        "Week 2",
        "Week 3",
        "Week 4",
        "Week 5",
      ];

      const values = labels.map((_, weekIndex) => {
        const startDay = weekIndex * 7 + 1;
        const endDay = Math.min(
          startDay + 6,
          daysInMonth,
        );

        return sales
          .filter((sale) => {
            const saleDate = new Date(sale.saleDate);

            return (
              saleDate >= monthStart &&
              saleDate.getFullYear() ===
                today.getFullYear() &&
              saleDate.getMonth() ===
                today.getMonth() &&
              saleDate.getDate() >= startDay &&
              saleDate.getDate() <= endDay
            );
          })
          .reduce(
            (sum, sale) => sum + sale.total,
            0,
          );
      });

      return labels.map((label, index) => ({
        label,
        value: values[index],
      }));
    }

    const today = new Date();
    const yearStart = getStartOfYear(today);

    const labels = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const values = labels.map((_, monthIndex) => {
      return sales
        .filter((sale) => {
          const saleDate = new Date(sale.saleDate);

          return (
            saleDate >= yearStart &&
            saleDate.getFullYear() ===
              today.getFullYear() &&
            saleDate.getMonth() === monthIndex
          );
        })
        .reduce(
          (sum, sale) => sum + sale.total,
          0,
        );
    });

    return labels.map((label, index) => ({
      label,
      value: values[index],
    }));
  }, [period, sales]);

  const maxChartValue = Math.max(
    ...chartData.map((item) => item.value),
    1,
  );

  const recentSales = [...sales]
    .sort(
      (a, b) =>
        new Date(b.saleDate).getTime() -
        new Date(a.saleDate).getTime(),
    )
    .slice(0, 5);

  const totalSales = sales.reduce(
    (sum, sale) => sum + sale.total,
    0,
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Dashboard
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Here's what's happening with your business today.
        </p>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Today's Sales"
          value={formatCurrency(
            dashboardData.todaySalesAmount,
          )}
          change={`${dashboardData.todaySales.length} transactions`}
          positive
          icon={CreditCard}
        />

        <StatCard
          title="Today's Orders"
          value={dashboardData.todaySales.length.toString()}
          change={`${sales.length} total invoices`}
          positive
          icon={ShoppingCart}
        />

        <StatCard
          title="Total Customers"
          value={customers.length.toLocaleString()}
          change="Registered customers"
          positive
          icon={Users}
        />

        <StatCard
          title="Low Stock Items"
          value={dashboardData.lowStockProducts.length.toString()}
          change={
            dashboardData.outOfStockProducts.length > 0
              ? `${dashboardData.outOfStockProducts.length} out of stock`
              : "Stock level healthy"
          }
          positive={
            dashboardData.lowStockProducts.length === 0
          }
          icon={Package}
        />
      </div>

      {/* Main Dashboard */}
      <div className="grid gap-6 xl:grid-cols-3">
        {/* Sales Chart */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-semibold text-slate-900">
                Sales Overview
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Sales performance for {period.toLowerCase()}.
              </p>
            </div>

            <select
              value={period}
              onChange={(event) =>
                setPeriod(
                  event.target.value as ChartPeriod,
                )
              }
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
            >
              <option>This Week</option>
              <option>This Month</option>
              <option>This Year</option>
            </select>
          </div>

          <div className="mt-6">
            {chartData.every(
              (item) => item.value === 0,
            ) ? (
              <div className="flex h-64 items-center justify-center rounded-lg bg-slate-50">
                <div className="text-center">
                  <ShoppingCart
                    size={36}
                    className="mx-auto text-slate-300"
                  />

                  <p className="mt-3 text-sm font-medium text-slate-500">
                    No sales data for this period
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Complete a sale from POS to see it here.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex h-64 items-end gap-2 sm:gap-3">
                {chartData.map((item) => {
                  const height =
                    item.value > 0
                      ? Math.max(
                          (item.value / maxChartValue) *
                            100,
                          5,
                        )
                      : 0;

                  return (
                    <div
                      key={item.label}
                      className="flex min-w-0 flex-1 flex-col items-center gap-2"
                    >
                      <div className="group relative flex h-52 w-full items-end">
                        <div
                          className="w-full rounded-t-lg bg-blue-500 transition-all duration-300 group-hover:bg-blue-600"
                          style={{
                            height: `${height}%`,
                          }}
                          title={formatCurrency(
                            item.value,
                          )}
                        />

                        {item.value > 0 && (
                          <div className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-[10px] text-white opacity-0 transition group-hover:opacity-100">
                            {formatCurrency(item.value)}
                          </div>
                        )}
                      </div>

                      <span className="text-xs text-slate-400">
                        {item.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Payment Summary */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-slate-900">
            Payment Summary
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Today's payment methods
          </p>

          <div className="mt-6 space-y-5">
            <PaymentRow
              name="Cash"
              amount={formatCurrency(
                dashboardData.cashSales,
              )}
              percentage={`${dashboardData.cashPercentage}%`}
            />

            <PaymentRow
              name="Card"
              amount={formatCurrency(
                dashboardData.cardSales,
              )}
              percentage={`${dashboardData.cardPercentage}%`}
            />

            <div className="border-t border-slate-100 pt-4">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-slate-700">
                  Today's Total
                </span>

                <span className="font-bold text-slate-900">
                  {formatCurrency(
                    dashboardData.todaySalesAmount,
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Snapshot */}
      <div className="grid gap-4 sm:grid-cols-3">
        <InfoCard
          title="Total Products"
          value={products.length.toLocaleString()}
          description="Products in catalog"
        />

        <InfoCard
          title="Total Stock Units"
          value={products
            .reduce(
              (sum, product) => sum + product.stock,
              0,
            )
            .toLocaleString()}
          description="Units currently available"
        />

        <InfoCard
          title="Total Sales"
          value={formatCurrency(totalSales)}
          description="All recorded sales"
        />
      </div>

      {/* Recent Transactions */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 p-6">
          <div>
            <h2 className="font-semibold text-slate-900">
              Recent Transactions
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Latest sales transactions
            </p>
          </div>

          <button
            onClick={() => {
              window.location.href = "/sales";
            }}
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            View All
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-6 py-4">Invoice</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Payment</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {recentSales.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-10 text-center text-sm text-slate-400"
                  >
                    No sales transactions yet.
                  </td>
                </tr>
              ) : (
                recentSales.map((sale) => (
                  <Transaction
                    key={sale.id}
                    invoice={sale.invoiceNumber}
                    customer={sale.customerName}
                    amount={formatCurrency(sale.total)}
                    payment={sale.paymentMethod}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  change,
  positive,
  icon: Icon,
}: {
  title: string;
  value: string;
  change: string;
  positive: boolean;
  icon: React.ElementType;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <h2 className="mt-2 truncate text-2xl font-bold text-slate-900">
            {value}
          </h2>
        </div>

        <div className="ml-3 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <Icon size={22} />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-1 text-xs">
        {positive ? (
          <ArrowUpRight
            size={15}
            className="text-emerald-600"
          />
        ) : (
          <ArrowDownRight
            size={15}
            className="text-red-500"
          />
        )}

        <span
          className={
            positive
              ? "font-medium text-emerald-600"
              : "font-medium text-red-500"
          }
        >
          {change}
        </span>
      </div>
    </div>
  );
}

function InfoCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">
        {title}
      </p>

      <p className="mt-2 text-2xl font-bold text-slate-900">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-400">
        {description}
      </p>
    </div>
  );
}

function PaymentRow({
  name,
  amount,
  percentage,
}: {
  name: string;
  amount: string;
  percentage: string;
}) {
  return (
    <div>
      <div className="mb-2 flex justify-between text-sm">
        <span className="font-medium text-slate-700">
          {name}
        </span>

        <span className="text-slate-500">
          {amount}
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-blue-500 transition-all duration-500"
          style={{ width: percentage }}
        />
      </div>

      <p className="mt-1 text-right text-xs text-slate-400">
        {percentage}
      </p>
    </div>
  );
}

function Transaction({
  invoice,
  customer,
  amount,
  payment,
}: {
  invoice: string;
  customer: string;
  amount: string;
  payment: string;
}) {
  return (
    <tr className="hover:bg-slate-50">
      <td className="px-6 py-4 font-medium text-slate-900">
        {invoice}
      </td>

      <td className="px-6 py-4 text-slate-600">
        {customer}
      </td>

      <td className="px-6 py-4 font-medium text-slate-900">
        {amount}
      </td>

      <td className="px-6 py-4 text-slate-600">
        {payment}
      </td>

      <td className="px-6 py-4">
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600">
          Completed
        </span>
      </td>
    </tr>
  );
}