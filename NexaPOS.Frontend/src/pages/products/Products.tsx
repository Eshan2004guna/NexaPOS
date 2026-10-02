import { useEffect, useMemo, useState } from "react";
import {
  Edit,
  Package,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

import type { Product } from "../../types/product";
import { productService } from "../../services/productService";

const emptyProduct: Product = {
  id: 0,
  name: "",
  sku: "",
  barcode: "",
  category: "Groceries",
  costPrice: 0,
  sellingPrice: 0,
  stock: 0,
  reorderLevel: 5,
};

function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] =
    useState<Product | null>(null);

  const [formData, setFormData] =
    useState<Product>(emptyProduct);

  useEffect(() => {
    setProducts(productService.getProducts());
  }, []);

  const categories = useMemo(() => {
    return [
      "All",
      ...Array.from(
        new Set(products.map((product) => product.category)),
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

  const lowStockProducts = products.filter(
    (product) => product.stock <= product.reorderLevel,
  ).length;

  const inventoryValue = products.reduce(
    (total, product) =>
      total + product.costPrice * product.stock,
    0,
  );

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      ...emptyProduct,
      id: 0,
    });
    setShowModal(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({ ...product });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setFormData({
      ...emptyProduct,
      id: 0,
    });
  };

  const handleInputChange = (
    field: keyof Product,
    value: string | number,
  ) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSaveProduct = () => {
    if (!formData.name.trim()) {
      alert("Please enter a product name.");
      return;
    }

    if (!formData.sku.trim()) {
      alert("Please enter an SKU.");
      return;
    }

    if (!formData.barcode.trim()) {
      alert("Please enter a barcode.");
      return;
    }

    if (formData.sellingPrice <= 0) {
      alert("Selling price must be greater than 0.");
      return;
    }

    if (editingProduct) {
      productService.updateProduct(formData);

      setProducts(productService.getProducts());

      alert("Product updated successfully.");
    } else {
      const newProduct: Product = {
        ...formData,
        id: Date.now(),
      };

      productService.addProduct(newProduct);

      setProducts(productService.getProducts());

      alert("Product added successfully.");
    }

    closeModal();
  };

  const handleDeleteProduct = (id: number) => {
    const product = products.find(
      (item) => item.id === id,
    );

    if (!product) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    productService.deleteProduct(id);

    setProducts(productService.getProducts());
  };

  const getStockStatus = (product: Product) => {
    if (product.stock === 0) {
      return {
        text: "Out of Stock",
        className:
          "bg-red-100 text-red-700",
      };
    }

    if (product.stock <= product.reorderLevel) {
      return {
        text: "Low Stock",
        className:
          "bg-amber-100 text-amber-700",
      };
    }

    return {
      text: "In Stock",
      className:
        "bg-emerald-100 text-emerald-700",
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Products
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage your products and inventory.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          <Plus size={18} />
          Add Product
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Total Products
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {totalProducts}
              </p>
            </div>

            <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
              <Package size={22} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Low Stock
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {lowStockProducts}
              </p>
            </div>

            <div className="rounded-lg bg-amber-50 p-3 text-amber-600">
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

              <p className="mt-1 text-2xl font-bold text-slate-900">
                Rs. {inventoryValue.toLocaleString()}
              </p>
            </div>

            <div className="rounded-lg bg-emerald-50 p-3 text-emerald-600">
              <Package size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
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
              className="h-11 w-full rounded-lg border border-slate-200 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500"
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

      {/* Product Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Product
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  SKU
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Category
                </th>

                <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Cost
                </th>

                <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Selling Price
                </th>

                <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Stock
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
                      <div className="font-semibold text-slate-900">
                        {product.name}
                      </div>

                      <div className="mt-1 text-xs text-slate-400">
                        {product.barcode}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {product.sku}
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {product.category}
                    </td>

                    <td className="px-5 py-4 text-right text-sm text-slate-600">
                      Rs. {product.costPrice.toLocaleString()}
                    </td>

                    <td className="px-5 py-4 text-right text-sm font-semibold text-slate-900">
                      Rs. {product.sellingPrice.toLocaleString()}
                    </td>

                    <td className="px-5 py-4 text-right text-sm text-slate-600">
                      {product.stock}
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
                            openEditModal(product)
                          }
                          className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                          title="Edit product"
                        >
                          <Edit size={17} />
                        </button>

                        <button
                          onClick={() =>
                            handleDeleteProduct(product.id)
                          }
                          className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
                          title="Delete product"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredProducts.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-12 text-center"
                  >
                    <Package
                      size={40}
                      className="mx-auto text-slate-300"
                    />

                    <p className="mt-3 text-sm font-medium text-slate-600">
                      No products found
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Try changing your search or category filter.
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
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {editingProduct
                    ? "Edit Product"
                    : "Add Product"}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Enter the product information below.
                </p>
              </div>

              <button
                onClick={closeModal}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Product Name
                </label>

                <input
                  type="text"
                  value={formData.name}
                  onChange={(event) =>
                    handleInputChange(
                      "name",
                      event.target.value,
                    )
                  }
                  placeholder="Enter product name"
                  className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  SKU
                </label>

                <input
                  type="text"
                  value={formData.sku}
                  onChange={(event) =>
                    handleInputChange(
                      "sku",
                      event.target.value,
                    )
                  }
                  placeholder="e.g. RIC-001"
                  className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Barcode
                </label>

                <input
                  type="text"
                  value={formData.barcode}
                  onChange={(event) =>
                    handleInputChange(
                      "barcode",
                      event.target.value,
                    )
                  }
                  placeholder="Enter barcode"
                  className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Category
                </label>

                <select
                  value={formData.category}
                  onChange={(event) =>
                    handleInputChange(
                      "category",
                      event.target.value,
                    )
                  }
                  className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500"
                >
                  <option value="Groceries">
                    Groceries
                  </option>

                  <option value="Dairy">
                    Dairy
                  </option>

                  <option value="Bakery">
                    Bakery
                  </option>

                  <option value="Beverages">
                    Beverages
                  </option>

                  <option value="Household">
                    Household
                  </option>

                  <option value="Personal Care">
                    Personal Care
                  </option>

                  <option value="Other">
                    Other
                  </option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Stock
                </label>

                <input
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(event) =>
                    handleInputChange(
                      "stock",
                      Number(event.target.value),
                    )
                  }
                  className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Cost Price
                </label>

                <input
                  type="number"
                  min="0"
                  value={formData.costPrice}
                  onChange={(event) =>
                    handleInputChange(
                      "costPrice",
                      Number(event.target.value),
                    )
                  }
                  className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Selling Price
                </label>

                <input
                  type="number"
                  min="0"
                  value={formData.sellingPrice}
                  onChange={(event) =>
                    handleInputChange(
                      "sellingPrice",
                      Number(event.target.value),
                    )
                  }
                  className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Reorder Level
                </label>

                <input
                  type="number"
                  min="0"
                  value={formData.reorderLevel}
                  onChange={(event) =>
                    handleInputChange(
                      "reorderLevel",
                      Number(event.target.value),
                    )
                  }
                  className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
              <button
                onClick={closeModal}
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                onClick={handleSaveProduct}
                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                {editingProduct
                  ? "Update Product"
                  : "Save Product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Products;