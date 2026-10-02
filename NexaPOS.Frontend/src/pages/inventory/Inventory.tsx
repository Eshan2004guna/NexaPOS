import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpFromLine,
  ClipboardList,
  Package,
  Search,
  X,
} from "lucide-react";

import type { Product } from "../../types/product";
import { productService } from "../../services/productService";

type AdjustmentType = "Stock In" | "Stock Out";

type StockHistory = {
  id: number;
  productId: number;
  productName: string;
  type: AdjustmentType;
  quantity: number;
  reason: string;
  date: string;
};

const HISTORY_STORAGE_KEY = "nexapos_stock_history";

function getStockHistory(): StockHistory[] {
  const stored = localStorage.getItem(HISTORY_STORAGE_KEY);

  if (!stored) {
    return [];
  }

  try {
    return JSON.parse(stored) as StockHistory[];
  } catch {
    return [];
  }
}

function saveStockHistory(history: StockHistory[]) {
  localStorage.setItem(
    HISTORY_STORAGE_KEY,
    JSON.stringify(history),
  );
}

export default function Inventory() {
  const [products, setProducts] = useState<Product[]>(
    productService.getProducts(),
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] =
    useState("All");

  const [showAdjustmentModal, setShowAdjustmentModal] =
    useState(false);

  const [selectedProduct, setSelectedProduct] =
    useState<Product | null>(null);

  const [adjustmentType, setAdjustmentType] =
    useState<AdjustmentType>("Stock In");

  const [adjustmentQuantity, setAdjustmentQuantity] =
    useState("");

  const [adjustmentReason, setAdjustmentReason] =
    useState("");

  const [history, setHistory] = useState<StockHistory[]>(
    getStockHistory(),
  );

  const categories = useMemo(() => {
    return [
      "All",
      ...Array.from(
        new Set(
          products.map((product) => product.category),
        ),
      ),
    ];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();

    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(search) ||
        product.sku.toLowerCase().includes(search) ||
        product.barcode.toLowerCase().includes(search);

      const matchesCategory =
        categoryFilter === "All" ||
        product.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, categoryFilter]);

  const totalProducts = products.length;

  const totalStockUnits = products.reduce(
    (total, product) => total + product.stock,
    0,
  );

  const lowStockProducts = products.filter(
    (product) =>
      product.stock > 0 &&
      product.stock <= product.reorderLevel,
  ).length;

  const outOfStockProducts = products.filter(
    (product) => product.stock === 0,
  ).length;

  const inventoryValue = products.reduce(
    (total, product) =>
      total + product.costPrice * product.stock,
    0,
  );

  const openAdjustmentModal = (
    product: Product,
    type: AdjustmentType,
  ) => {
    setSelectedProduct(product);
    setAdjustmentType(type);
    setAdjustmentQuantity("");
    setAdjustmentReason("");
    setShowAdjustmentModal(true);
  };

  const closeAdjustmentModal = () => {
    setShowAdjustmentModal(false);
    setSelectedProduct(null);
    setAdjustmentQuantity("");
    setAdjustmentReason("");
  };

  const handleStockAdjustment = () => {
    if (!selectedProduct) {
      return;
    }

    const quantity = Number(adjustmentQuantity);

    if (!Number.isInteger(quantity) || quantity <= 0) {
      alert("Please enter a valid whole number quantity.");
      return;
    }

    if (!adjustmentReason.trim()) {
      alert("Please enter a reason for the stock adjustment.");
      return;
    }

    if (
      adjustmentType === "Stock Out" &&
      quantity > selectedProduct.stock
    ) {
      alert(
        `Cannot remove ${quantity} units. Only ${selectedProduct.stock} units are available.`,
      );
      return;
    }

    const newStock =
      adjustmentType === "Stock In"
        ? selectedProduct.stock + quantity
        : selectedProduct.stock - quantity;

    const updatedProduct: Product = {
      ...selectedProduct,
      stock: newStock,
    };

    productService.updateProduct(updatedProduct);

    const newHistoryEntry: StockHistory = {
      id: Date.now(),
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      type: adjustmentType,
      quantity,
      reason: adjustmentReason.trim(),
      date: new Date().toISOString(),
    };

    const updatedHistory = [
      newHistoryEntry,
      ...history,
    ];

    saveStockHistory(updatedHistory);

    setHistory(updatedHistory);
    setProducts(productService.getProducts());

    closeAdjustmentModal();

    alert(
      `${adjustmentType} completed successfully.\n\n${selectedProduct.name}\nNew Stock: ${newStock}`,
    );
  };

  const getStockStatus = (product: Product) => {
    if (product.stock === 0) {
      return {
        text: "Out of Stock",
        className: "bg-red-100 text-red-700",
      };
    }

    if (product.stock <= product.reorderLevel) {
      return {
        text: "Low Stock",
        className: "bg-amber-100 text-amber-700",
      };
    }

    return {
      text: "Healthy",
      className: "bg-emerald-100 text-emerald-700",
    };
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Inventory
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Manage stock levels, stock adjustments and
          inventory history.
        </p>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {/* Total Products */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Products
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {totalProducts}
              </p>
            </div>

            <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
              <Package size={21} />
            </div>
          </div>
        </div>

        {/* Stock Units */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Stock Units
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {totalStockUnits.toLocaleString()}
              </p>
            </div>

            <div className="rounded-lg bg-indigo-50 p-3 text-indigo-600">
              <ClipboardList size={21} />
            </div>
          </div>
        </div>

        {/* Low Stock */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Low Stock
              </p>

              <p className="mt-1 text-2xl font-bold text-amber-600">
                {lowStockProducts}
              </p>
            </div>

            <div className="rounded-lg bg-amber-50 p-3 text-amber-600">
              <AlertTriangle size={21} />
            </div>
          </div>
        </div>

        {/* Out of Stock */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Out of Stock
              </p>

              <p className="mt-1 text-2xl font-bold text-red-600">
                {outOfStockProducts}
              </p>
            </div>

            <div className="rounded-lg bg-red-50 p-3 text-red-600">
              <Package size={21} />
            </div>
          </div>
        </div>

        {/* Inventory Value */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Inventory Value
              </p>

              <p className="mt-1 text-xl font-bold text-slate-900">
                Rs. {inventoryValue.toLocaleString()}
              </p>
            </div>

            <div className="rounded-lg bg-emerald-50 p-3 text-emerald-600">
              <Package size={21} />
            </div>
          </div>
        </div>
      </div>

      {/* FILTERS */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
              placeholder="Search product, SKU or barcode..."
              className="h-11 w-full rounded-lg border border-slate-200 pl-10 pr-4 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(event) =>
              setCategoryFilter(event.target.value)
            }
            className="h-11 rounded-lg border border-slate-200 px-4 text-sm outline-none focus:border-blue-500"
          >
            {categories.map((category) => (
              <option
                key={category}
                value={category}
              >
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* INVENTORY TABLE */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Product
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Category
                </th>

                <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Current Stock
                </th>

                <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Reorder Level
                </th>

                <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </th>

                <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((product) => {
                const status = getStockStatus(product);

                return (
                  <tr
                    key={product.id}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-900">
                        {product.name}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        SKU: {product.sku}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {product.category}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <span className="text-lg font-bold text-slate-900">
                        {product.stock}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right text-sm text-slate-600">
                      {product.reorderLevel}
                    </td>

                    <td className="px-5 py-4 text-center">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}
                      >
                        {status.text}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() =>
                            openAdjustmentModal(
                              product,
                              "Stock In",
                            )
                          }
                          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                        >
                          <ArrowDownToLine size={15} />
                          Stock In
                        </button>

                        <button
                          onClick={() =>
                            openAdjustmentModal(
                              product,
                              "Stock Out",
                            )
                          }
                          disabled={product.stock === 0}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <ArrowUpFromLine size={15} />
                          Stock Out
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredProducts.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-14 text-center"
                  >
                    <Package
                      size={38}
                      className="mx-auto text-slate-300"
                    />

                    <p className="mt-3 font-medium text-slate-600">
                      No products found
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Try another search or category.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* STOCK HISTORY */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <h2 className="font-semibold text-slate-900">
            Stock History
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Recent stock adjustments.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Date
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Product
                </th>

                <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Type
                </th>

                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Quantity
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Reason
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {history.slice(0, 10).map((entry) => (
                <tr
                  key={entry.id}
                  className="hover:bg-slate-50"
                >
                  <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-500">
                    {formatDate(entry.date)}
                  </td>

                  <td className="px-5 py-4 text-sm font-medium text-slate-900">
                    {entry.productName}
                  </td>

                  <td className="px-5 py-4 text-center">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        entry.type === "Stock In"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {entry.type}
                    </span>
                  </td>

                  <td
                    className={`px-5 py-4 text-right text-sm font-bold ${
                      entry.type === "Stock In"
                        ? "text-emerald-600"
                        : "text-red-600"
                    }`}
                  >
                    {entry.type === "Stock In"
                      ? "+"
                      : "-"}
                    {entry.quantity}
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-600">
                    {entry.reason}
                  </td>
                </tr>
              ))}

              {history.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-12 text-center"
                  >
                    <ClipboardList
                      size={35}
                      className="mx-auto text-slate-300"
                    />

                    <p className="mt-3 text-sm font-medium text-slate-600">
                      No stock history yet
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Stock adjustments will appear here.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* STOCK ADJUSTMENT MODAL */}
      {showAdjustmentModal && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 p-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {adjustmentType}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  {selectedProduct.name}
                </p>
              </div>

              <button
                onClick={closeAdjustmentModal}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={19} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-4 p-5">
              <div className="rounded-xl bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    Current Stock
                  </span>

                  <span className="text-xl font-bold text-slate-900">
                    {selectedProduct.stock}
                  </span>
                </div>
              </div>

              {/* Type */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Adjustment Type
                </label>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setAdjustmentType("Stock In")
                    }
                    className={`rounded-lg border px-4 py-3 text-sm font-semibold ${
                      adjustmentType === "Stock In"
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 text-slate-600"
                    }`}
                  >
                    Stock In
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setAdjustmentType("Stock Out")
                    }
                    className={`rounded-lg border px-4 py-3 text-sm font-semibold ${
                      adjustmentType === "Stock Out"
                        ? "border-red-500 bg-red-50 text-red-700"
                        : "border-slate-200 text-slate-600"
                    }`}
                  >
                    Stock Out
                  </button>
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Quantity
                </label>

                <input
                  type="number"
                  min="1"
                  step="1"
                  value={adjustmentQuantity}
                  onChange={(event) =>
                    setAdjustmentQuantity(
                      event.target.value,
                    )
                  }
                  placeholder="Enter quantity"
                  className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500"
                />
              </div>

              {/* Reason */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Reason
                </label>

                <textarea
                  value={adjustmentReason}
                  onChange={(event) =>
                    setAdjustmentReason(
                      event.target.value,
                    )
                  }
                  placeholder="e.g. New supplier delivery"
                  rows={3}
                  className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>

              {/* Preview */}
              {Number(adjustmentQuantity) > 0 && (
                <div className="rounded-xl bg-blue-50 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">
                      New Stock
                    </span>

                    <span className="text-lg font-bold text-blue-600">
                      {adjustmentType === "Stock In"
                        ? selectedProduct.stock +
                          Number(adjustmentQuantity)
                        : Math.max(
                            selectedProduct.stock -
                              Number(
                                adjustmentQuantity,
                              ),
                            0,
                          )}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 border-t border-slate-200 p-5">
              <button
                onClick={closeAdjustmentModal}
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                onClick={handleStockAdjustment}
                className={`rounded-lg px-5 py-2.5 text-sm font-semibold text-white ${
                  adjustmentType === "Stock In"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                Confirm {adjustmentType}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}