import { Outlet } from "react-router-dom";
import {
  BarChart3,
  Boxes,
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  ShoppingCart,
  Store,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";

const navigation = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    path: "/",
  },
  {
    name: "POS Billing",
    icon: ShoppingCart,
    path: "/pos",
  },
  {
    name: "Products",
    icon: Package,
    path: "/products",
  },
  {
    name: "Inventory",
    icon: Boxes,
    path: "/inventory",
  },
  {
    name: "Purchases",
    icon: ClipboardList,
    path: "/purchases",
  },
  {
    name: "Customers",
    icon: Users,
    path: "/customers",
  },
  {
    name: "Sales",
    icon: CreditCard,
    path: "/sales",
  },
  {
    name: "Reports",
    icon: BarChart3,
    path: "/reports",
  },
];

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-slate-950 text-white transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 font-bold">
              N
            </div>

            <div>
              <h1 className="text-lg font-bold">NexaPOS</h1>
              <p className="text-xs text-slate-400">Retail Management</p>
            </div>
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 text-slate-400 hover:bg-white/10 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Main Menu
          </p>

          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <a
                key={item.name}
                href={item.path}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
                <Icon size={19} />
                {item.name}
              </a>
            );
          })}

          <div className="my-5 border-t border-white/10" />

          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            System
          </p>

          <a
            href="/settings"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <Settings size={19} />
            Settings
          </a>
        </nav>

        {/* User */}
        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3 rounded-lg p-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-bold">
              A
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">Admin User</p>
              <p className="truncate text-xs text-slate-400">Administrator</p>
            </div>

            <button className="text-slate-400 hover:text-white">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main area */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm sm:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
          >
            <Menu size={22} />
          </button>

          <div className="hidden lg:block">
            <p className="text-sm font-medium text-slate-500">
              Welcome back
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 md:flex">
              <Store size={17} className="text-slate-400" />

              <span className="text-sm font-medium text-slate-700">
                Main Branch
              </span>
            </div>

            <button className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100">
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
              🔔
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}