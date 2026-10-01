import {
  ArrowDownRight,
  ArrowUpRight,
  CreditCard,
  Package,
  ShoppingCart,
  Users,
} from "lucide-react";

const stats = [
  {
    title: "Today's Sales",
    value: "Rs. 125,450",
    change: "+12.5%",
    positive: true,
    icon: CreditCard,
  },
  {
    title: "Today's Orders",
    value: "248",
    change: "+8.2%",
    positive: true,
    icon: ShoppingCart,
  },
  {
    title: "Total Customers",
    value: "1,842",
    change: "+5.4%",
    positive: true,
    icon: Users,
  },
  {
    title: "Low Stock Items",
    value: "18",
    change: "Needs attention",
    positive: false,
    icon: Package,
  },
];

export default function Dashboard() {
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
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {stat.title}
                  </p>

                  <h2 className="mt-2 text-2xl font-bold text-slate-900">
                    {stat.value}
                  </h2>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Icon size={22} />
                </div>
              </div>

              <div className="mt-4 flex items-center gap-1 text-xs">
                {stat.positive ? (
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
                    stat.positive
                      ? "font-medium text-emerald-600"
                      : "font-medium text-red-500"
                  }
                >
                  {stat.change}
                </span>

                {stat.positive && (
                  <span className="text-slate-400">
                    from yesterday
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Dashboard */}
      <div className="grid gap-6 xl:grid-cols-3">
        {/* Sales Chart Placeholder */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-slate-900">
                Sales Overview
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Sales performance for the current week
              </p>
            </div>

            <select className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none">
              <option>This Week</option>
              <option>This Month</option>
              <option>This Year</option>
            </select>
          </div>

          <div className="mt-6 flex h-64 items-end gap-3">
            {[45, 65, 50, 80, 60, 90, 72].map(
              (height, index) => (
                <div
                  key={index}
                  className="flex flex-1 flex-col items-center gap-2"
                >
                  <div className="flex h-52 w-full items-end">
                    <div
                      className="w-full rounded-t-lg bg-blue-500 transition hover:bg-blue-600"
                      style={{ height: `${height}%` }}
                    />
                  </div>

                  <span className="text-xs text-slate-400">
                    {
                      ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][
                        index
                      ]
                    }
                  </span>
                </div>
              ),
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
              amount="Rs. 65,200"
              percentage="52%"
            />

            <PaymentRow
              name="Card"
              amount="Rs. 42,100"
              percentage="34%"
            />

            <PaymentRow
              name="Bank Transfer"
              amount="Rs. 18,150"
              percentage="14%"
            />
          </div>
        </div>
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

          <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
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
              <Transaction
                invoice="INV-001245"
                customer="Kasun Perera"
                amount="Rs. 4,850"
                payment="Cash"
              />

              <Transaction
                invoice="INV-001244"
                customer="Nimal Fernando"
                amount="Rs. 8,200"
                payment="Card"
              />

              <Transaction
                invoice="INV-001243"
                customer="Amal Silva"
                amount="Rs. 2,450"
                payment="Cash"
              />
            </tbody>
          </table>
        </div>
      </div>
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
          className="h-full rounded-full bg-blue-500"
          style={{ width: percentage }}
        />
      </div>
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