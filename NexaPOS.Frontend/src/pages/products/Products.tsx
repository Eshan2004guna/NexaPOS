import { useMemo, useState } from "react";
import {
  Barcode,
  Edit,
  Package,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

type Product = {
  id: number;
  name: string;
  sku: string;
  barcode: string;
  category: string;
  costPrice: number;
  sellingPrice: number;
  stock: number;
  reorderLevel: number;
};

const initialProducts: Product[] = [
  {
    id: 1,
    name: "Rice 5kg",
    sku: "RIC-005",
    barcode: "8901234567890",
    category: "Groceries",
    costPrice: 1100,
    sellingPrice: 1250,
    stock: 42,
    reorderLevel: 10,
  },
  {
    id: 2,
    name: "Milk Powder",
    sku: "MLK-001",
    barcode: "8901234567891",
    category: "Dairy",
    costPrice: 1050,
    sellingPrice: 1200,
    stock: 18,
    reorderLevel: 10,
  },
  {
    id: 3,
    name: "Bread",
    sku: "BRD-001",
    barcode: "8901234567892",
    category: "Bakery",
    costPrice: 150,
    sellingPrice: 180,
    stock: 8,
    reorderLevel: 10,
  },
  {
    id: 4,
    name: "Sugar 1kg",
    sku: "SUG-001",
    barcode: "8901234567893",
    category: "Groceries",
    costPrice: 300,
    sellingPrice: 350,
    stock: 25,
    reorderLevel: 8,
  },
  {
    id: 5,
    name: "Tea 400g",
    sku: "TEA-004",
    barcode: "8901234567894",
    category: "Beverages",
    costPrice: 750,
    sellingPrice: 850,
    stock: 4,
    reorderLevel: 10,
  },
  {
    id: 6,
    name: "Cooking Oil 1L",
    sku: "OIL-001",
    barcode: "8901234567895",
    category: "Groceries",
    costPrice: 650,
    sellingPrice: 720,
    stock: 31,
    reorderLevel: 8,
  },
];

const emptyForm = {
  name: "",
  sku: "",
  barcode: "",
  category: "Groceries",
  costPrice: "",
  sellingPrice: "",
  stock: "",
  reorderLevel: "",
};

export default function Products() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(products.map((p) => p.category)))],
    [products],
  );

  const filteredProducts = products.filter((product) => {
    const query = search.toLowerCase();

    const matchesSearch =
      product.name.toLowerCase().includes(query) ||
      product.sku.toLowerCase().includes(query) ||
      product.barcode.includes(query);

    const matchesCategory =
      categoryFilter === "All" || product.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const totalProducts = products.length;

  const lowStockProducts = products.filter(
    (product) => product.stock <= product.reorderLevel,
  ).length;

  const inventoryValue = products.reduce(
    (total, product) => total + product.costPrice * product.stock,
    0,
  );

  const openAddModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (product: Product) => {
    setEditingId(product.id);

    setForm({
      name: product.name,
      sku: product.sku,
      barcode: product.barcode,
      category: product.category,
      costPrice: String(product.costPrice),
      sellingPrice: String(product.sellingPrice),
      stock: String(product.stock),
      reorderLevel: String(product.reorderLevel),
    });

    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.name.trim() || !form.sellingPrice) {
      return;
    }

    const productData = {
      name: form.name.trim(),
      sku: form.sku.trim(),
      barcode: form.barcode.trim(),
      category: form.category,
      costPrice: Number(form.costPrice) || 0,
      sellingPrice: Number(form.sellingPrice),
      stock: Number(form.stock) || 0,
      reorderLevel: Number(form.reorderLevel) || 0,
    };

    if (editingId !== null) {
      setProducts((current) =>
        current.map((product) =>
          product.id === editingId
            ? {
                ...product,
                ...productData,
              }
            : product,
        ),
      );
    } else {
      setProducts((current) => [
        ...current,
        {
          id: Date.now(),
          ...productData,
        },
      ]);
    }

    closeModal();
  };

  const deleteProduct = (id: number) => {
    const product = products.find((item) => item.id === id);

    if (!product) return;

    const confirmed = window.confirm(
      `Delete "${product.name}" from products?`,
    );

    if (!confirmed) return;

    setProducts((current) =>
      current.filter((product) => product.id !== id),
    );
  };

  const getStockStatus = (product: Product) => {
    if (product.stock === 0) {
      return {
        label: "Out of Stock",
        className: "bg-red-50 text-red-600",
      };
    }

    if (product.stock <= product.reorderLevel) {
      return {
        label: "Low Stock",
        className: "bg-amber-50 text-amber-600",
      };
    }

    return {
      label: "In Stock",
      className: "bg-emerald-50 text-emerald-600",
    };
  };

  const formatCurrency = (amount: number) =>
    `Rs. ${amount.toLocaleString("en-LK")}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Products
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage your products, prices and stock.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          <Plus size={18} />
          Add Product
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total Products</p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {totalProducts}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Package size={22} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Low Stock Items
              </p>

              <p className="mt-2 text-2xl font-bold text-amber-600">
                {lowStockProducts}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <Package size={22} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Inventory Value
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {formatCurrency(inventoryValue)}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <Barcode size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* Search and filter */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search
              size={19}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search product, SKU or barcode..."
              className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(event) =>
              setCategoryFilter(event.target.value)
            }
            className="h-11 rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none focus:border-blue-500"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Product table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Product
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  SKU / Barcode
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Category
                </th>

                <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Cost Price
                </th>

                <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Selling Price
                </th>

                <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Stock
                </th>

                <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </th>

                <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-14 text-center"
                  >
                    <Package
                      size={38}
                      className="mx-auto text-slate-300"
                    />

                    <p className="mt-3 font-medium text-slate-700">
                      No products found
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      Try changing your search or filter.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
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
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-slate-700">
                          {product.sku || "-"}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {product.barcode || "No barcode"}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                          {product.category}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right text-sm text-slate-600">
                        {formatCurrency(product.costPrice)}
                      </td>

                      <td className="px-5 py-4 text-right text-sm font-semibold text-slate-900">
                        {formatCurrency(product.sellingPrice)}
                      </td>

                      <td className="px-5 py-4 text-center">
                        <span className="font-semibold text-slate-800">
                          {product.stock}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-center">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() =>
                              openEditModal(product)
                            }
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600"
                            title="Edit product"
                          >
                            <Edit size={17} />
                          </button>

                          <button
                            onClick={() =>
                              deleteProduct(product.id)
                            }
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                            title="Delete product"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-200 px-5 py-4 text-sm text-slate-500">
          Showing {filteredProducts.length} of {products.length} products
        </div>
      </div>

      {/* Add/Edit Product Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {editingId !== null
                    ? "Edit Product"
                    : "Add Product"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Enter the product information below.
                </p>
              </div>

              <button
                onClick={closeModal}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-6"
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Product Name *
                  </label>

                  <input
                    required
                    value={form.name}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        name: event.target.value,
                      })
                    }
                    placeholder="e.g. Rice 5kg"
                    className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    SKU
                  </label>

                  <input
                    value={form.sku}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        sku: event.target.value,
                      })
                    }
                    placeholder="e.g. RIC-005"
                    className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Barcode
                  </label>

                  <input
                    value={form.barcode}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        barcode: event.target.value,
                      })
                    }
                    placeholder="Scan or enter barcode"
                    className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Category
                  </label>

                  <select
                    value={form.category}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        category: event.target.value,
                      })
                    }
                    className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option>Groceries</option>
                    <option>Dairy</option>
                    <option>Bakery</option>
                    <option>Beverages</option>
                    <option>Household</option>
                    <option>Personal Care</option>
                    <option>Other</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Cost Price
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.costPrice}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        costPrice: event.target.value,
                      })
                    }
                    placeholder="0.00"
                    className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Selling Price *
                  </label>

                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.sellingPrice}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        sellingPrice: event.target.value,
                      })
                    }
                    placeholder="0.00"
                    className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Initial Stock
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        stock: event.target.value,
                      })
                    }
                    placeholder="0"
                    className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Reorder Level
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={form.reorderLevel}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        reorderLevel: event.target.value,
                      })
                    }
                    placeholder="10"
                    className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  {editingId !== null
                    ? "Update Product"
                    : "Save Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}