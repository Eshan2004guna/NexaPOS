import { useMemo, useState } from "react";
import {
  Calendar,
  FileText,
  Package,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

import type { Product } from "../../types/product";
import type {
  Purchase,
  PurchaseItem,
} from "../../types/purchase";

import { productService } from "../../services/productService";
import { purchaseService } from "../../services/purchaseService";

type PurchaseLine = PurchaseItem;

type StockHistoryEntry = {
  id: number;
  productId: number;
  productName: string;
  type: "Stock In" | "Stock Out";
  quantity: number;
  reason: string;
  date: string;
};

const STOCK_HISTORY_STORAGE_KEY =
  "nexapos_stock_history";

export default function Purchases() {
  /*
   * PRODUCTS
   *
   * We read the shared products from productService.
   * This keeps Purchases connected with Products,
   * POS and Inventory.
   */
  const [products] = useState<Product[]>(
    productService.getProducts(),
  );

  /*
   * PURCHASES
   */
  const [purchases, setPurchases] = useState<Purchase[]>(
    purchaseService.getPurchases(),
  );

  /*
   * MODAL
   */
  const [showModal, setShowModal] = useState(false);

  /*
   * SEARCH
   */
  const [searchTerm, setSearchTerm] = useState("");

  /*
   * SUPPLIER
   */
  const [supplierName, setSupplierName] =
    useState("");

  const [supplierPhone, setSupplierPhone] =
    useState("");

  /*
   * PURCHASE INFORMATION
   */
  const [invoiceNumber, setInvoiceNumber] =
    useState("");

  const [purchaseDate, setPurchaseDate] =
    useState(
      new Date().toISOString().split("T")[0],
    );

  const [notes, setNotes] = useState("");

  /*
   * PRODUCT INPUT
   */
  const [selectedProductId, setSelectedProductId] =
    useState("");

  const [purchaseQuantity, setPurchaseQuantity] =
    useState("");

  const [purchaseCostPrice, setPurchaseCostPrice] =
    useState("");

  /*
   * CURRENT PURCHASE ITEMS
   */
  const [items, setItems] = useState<PurchaseLine[]>(
    [],
  );

  /*
   * FILTER PURCHASES
   */
  const filteredPurchases = useMemo(() => {
    const search = searchTerm
      .toLowerCase()
      .trim();

    if (!search) {
      return purchases;
    }

    return purchases.filter((purchase) => {
      return (
        purchase.invoiceNumber
          .toLowerCase()
          .includes(search) ||
        purchase.supplierName
          .toLowerCase()
          .includes(search) ||
        purchase.supplierPhone
          .toLowerCase()
          .includes(search)
      );
    });
  }, [purchases, searchTerm]);

  /*
   * PURCHASE SUBTOTAL
   */
  const subtotal = useMemo(() => {
    return items.reduce(
      (total, item) => total + item.total,
      0,
    );
  }, [items]);

  /*
   * SUMMARY
   */
  const totalPurchases = purchases.length;

  const totalPurchaseValue = purchases.reduce(
    (total, purchase) =>
      total + purchase.total,
    0,
  );

  /*
   * RESET FORM
   */
  const resetForm = () => {
    setSupplierName("");
    setSupplierPhone("");
    setInvoiceNumber("");

    setPurchaseDate(
      new Date().toISOString().split("T")[0],
    );

    setNotes("");

    setSelectedProductId("");
    setPurchaseQuantity("");
    setPurchaseCostPrice("");

    setItems([]);
  };

  /*
   * OPEN CREATE PURCHASE MODAL
   */
  const openCreateModal = () => {
    resetForm();

    setInvoiceNumber(
      `PO-${Date.now().toString().slice(-6)}`,
    );

    setShowModal(true);
  };

  /*
   * CLOSE MODAL
   */
  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  /*
   * ADD PRODUCT TO PURCHASE
   */
  const addPurchaseItem = () => {
    const productId = Number(selectedProductId);
    const quantity = Number(purchaseQuantity);
    const costPrice = Number(purchaseCostPrice);

    const product = products.find(
      (item) => item.id === productId,
    );

    if (!product) {
      alert("Please select a product.");
      return;
    }

    if (
      !Number.isInteger(quantity) ||
      quantity <= 0
    ) {
      alert(
        "Please enter a valid whole number quantity.",
      );
      return;
    }

    if (!Number.isFinite(costPrice) || costPrice <= 0) {
      alert("Please enter a valid cost price.");
      return;
    }

    /*
     * Check if product is already in this purchase.
     */
    const existingItemIndex = items.findIndex(
      (item) => item.productId === product.id,
    );

    const newItem: PurchaseLine = {
      productId: product.id,
      productName: product.name,
      quantity,
      costPrice,
      total: quantity * costPrice,
    };

    /*
     * If product already exists,
     * combine quantities.
     */
    if (existingItemIndex >= 0) {
      const updatedItems = [...items];

      const existingItem =
        updatedItems[existingItemIndex];

      const newQuantity =
        existingItem.quantity + quantity;

      updatedItems[existingItemIndex] = {
        ...existingItem,
        quantity: newQuantity,
        costPrice,
        total: newQuantity * costPrice,
      };

      setItems(updatedItems);
    } else {
      setItems([...items, newItem]);
    }

    /*
     * Clear product inputs.
     */
    setSelectedProductId("");
    setPurchaseQuantity("");
    setPurchaseCostPrice("");
  };

  /*
   * REMOVE PRODUCT FROM PURCHASE
   */
  const removePurchaseItem = (
    productId: number,
  ) => {
    setItems(
      items.filter(
        (item) => item.productId !== productId,
      ),
    );
  };

  /*
   * READ STOCK HISTORY
   */
  const getStockHistory =
    (): StockHistoryEntry[] => {
      const stored = localStorage.getItem(
        STOCK_HISTORY_STORAGE_KEY,
      );

      if (!stored) {
        return [];
      }

      try {
        return JSON.parse(
          stored,
        ) as StockHistoryEntry[];
      } catch {
        return [];
      }
    };

  /*
   * SAVE STOCK HISTORY
   */
  const saveStockHistory = (
    history: StockHistoryEntry[],
  ) => {
    localStorage.setItem(
      STOCK_HISTORY_STORAGE_KEY,
      JSON.stringify(history),
    );
  };

  /*
   * CREATE PURCHASE
   *
   * This function:
   *
   * 1. Validates the purchase.
   * 2. Saves the purchase.
   * 3. Increases product inventory.
   * 4. Updates cost price.
   * 5. Adds stock history.
   * 6. Refreshes purchase list.
   */
  const createPurchase = () => {
    /*
     * Validate supplier.
     */
    if (!supplierName.trim()) {
      alert("Please enter the supplier name.");
      return;
    }

    /*
     * Validate invoice.
     */
    if (!invoiceNumber.trim()) {
      alert("Please enter the invoice number.");
      return;
    }

    /*
     * Validate date.
     */
    if (!purchaseDate) {
      alert("Please select the purchase date.");
      return;
    }

    /*
     * Validate items.
     */
    if (items.length === 0) {
      alert("Please add at least one product.");
      return;
    }

    /*
     * Check invoice duplication.
     */
    const duplicateInvoice =
      purchases.some(
        (purchase) =>
          purchase.invoiceNumber.toLowerCase() ===
          invoiceNumber.trim().toLowerCase(),
      );

    if (duplicateInvoice) {
      alert(
        "This invoice number already exists. Please use a different invoice number.",
      );
      return;
    }

    /*
     * Create purchase object.
     */
    const purchase: Purchase = {
      id: Date.now(),

      invoiceNumber:
        invoiceNumber.trim(),

      supplierName:
        supplierName.trim(),

      supplierPhone:
        supplierPhone.trim(),

      purchaseDate,

      items: [...items],

      subtotal,

      discount: 0,

      total: subtotal,

      notes: notes.trim(),
    };

    /*
     * ----------------------------------------
     * STEP 1
     * Save purchase
     * ----------------------------------------
     */
    purchaseService.addPurchase(
      purchase,
    );

    /*
     * ----------------------------------------
     * STEP 2
     * Update inventory
     * ----------------------------------------
     */
    const stockHistory =
      getStockHistory();

    items.forEach((item) => {
      /*
       * Get the latest product
       * from shared product storage.
       */
      const product =
        productService.getProductById(
          item.productId,
        );

      /*
       * Product no longer exists.
       */
      if (!product) {
        return;
      }

      /*
       * Increase stock.
       */
      const updatedProduct: Product = {
        ...product,

        stock:
          product.stock +
          item.quantity,

        /*
         * Update the product cost price
         * to the latest purchase cost.
         */
        costPrice:
          item.costPrice,
      };

      /*
       * Save updated product.
       */
      productService.updateProduct(
        updatedProduct,
      );

      /*
       * Add inventory history.
       */
      const historyEntry: StockHistoryEntry = {
        id:
          Date.now() +
          Math.floor(
            Math.random() * 100000,
          ),

        productId:
          product.id,

        productName:
          product.name,

        type: "Stock In",

        quantity:
          item.quantity,

        reason:
          `Purchase ${purchase.invoiceNumber}`,

        date:
          new Date().toISOString(),
      };

      stockHistory.unshift(
        historyEntry,
      );
    });

    /*
     * ----------------------------------------
     * STEP 3
     * Save inventory history
     * ----------------------------------------
     */
    saveStockHistory(
      stockHistory,
    );

    /*
     * ----------------------------------------
     * STEP 4
     * Refresh purchase list
     * ----------------------------------------
     */
    setPurchases(
      purchaseService.getPurchases(),
    );

    /*
     * ----------------------------------------
     * STEP 5
     * Close modal
     * ----------------------------------------
     */
    closeModal();

    /*
     * Success message.
     */
    alert(
      `Purchase ${purchase.invoiceNumber} created successfully.\n\nInventory stock has been updated.`,
    );
  };

  return (
    <div className="space-y-6">
      {/* ============================================
          HEADER
      ============================================ */}

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Purchases
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage supplier purchases and stock
            receiving.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
        >
          <Plus size={18} />

          New Purchase
        </button>
      </div>

      {/* ============================================
          SUMMARY CARDS
      ============================================ */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Total Purchases */}

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Total Purchases
          </p>

          <p className="mt-1 text-2xl font-bold text-slate-900">
            {totalPurchases}
          </p>
        </div>

        {/* Purchase Value */}

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Purchase Value
          </p>

          <p className="mt-1 text-2xl font-bold text-slate-900">
            Rs.{" "}
            {totalPurchaseValue.toLocaleString()}
          </p>
        </div>
      </div>

      {/* ============================================
          SEARCH
      ============================================ */}

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(
                event.target.value,
              )
            }
            placeholder="Search invoice, supplier or phone..."
            className="h-11 w-full rounded-lg border border-slate-200 pl-10 pr-4 text-sm outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* ============================================
          PURCHASE TABLE
      ============================================ */}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Invoice
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Supplier
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Date
                </th>

                <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Items
                </th>

                <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Total
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredPurchases.map(
                (purchase) => (
                  <tr
                    key={purchase.id}
                    className="transition hover:bg-slate-50"
                  >
                    {/* Invoice */}

                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-900">
                        {
                          purchase.invoiceNumber
                        }
                      </p>
                    </td>

                    {/* Supplier */}

                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-slate-900">
                        {
                          purchase.supplierName
                        }
                      </p>

                      {purchase.supplierPhone && (
                        <p className="mt-1 text-xs text-slate-400">
                          {
                            purchase.supplierPhone
                          }
                        </p>
                      )}
                    </td>

                    {/* Date */}

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {
                        purchase.purchaseDate
                      }
                    </td>

                    {/* Items */}

                    <td className="px-5 py-4 text-center text-sm text-slate-600">
                      {
                        purchase.items
                          .length
                      }
                    </td>

                    {/* Total */}

                    <td className="px-5 py-4 text-right font-semibold text-slate-900">
                      Rs.{" "}
                      {purchase.total.toLocaleString()}
                    </td>
                  </tr>
                ),
              )}

              {filteredPurchases.length ===
                0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-14 text-center"
                  >
                    <FileText
                      size={38}
                      className="mx-auto text-slate-300"
                    />

                    <p className="mt-3 font-medium text-slate-600">
                      No purchases found
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Create your first
                      purchase to see it
                      here.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================
          CREATE PURCHASE MODAL
      ============================================ */}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            {/* ========================================
                MODAL HEADER
            ======================================== */}

            <div className="flex items-center justify-between border-b border-slate-200 p-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  New Purchase
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Create a supplier purchase
                  and receive products into
                  inventory.
                </p>
              </div>

              <button
                onClick={closeModal}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={19} />
              </button>
            </div>

            {/* ========================================
                BASIC INFORMATION
            ======================================== */}

            <div className="grid grid-cols-1 gap-4 border-b border-slate-200 p-5 md:grid-cols-2">
              {/* Supplier Name */}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Supplier Name
                </label>

                <input
                  type="text"
                  value={supplierName}
                  onChange={(event) =>
                    setSupplierName(
                      event.target.value,
                    )
                  }
                  placeholder="Enter supplier name"
                  className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500"
                />
              </div>

              {/* Supplier Phone */}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Supplier Phone
                </label>

                <input
                  type="text"
                  value={supplierPhone}
                  onChange={(event) =>
                    setSupplierPhone(
                      event.target.value,
                    )
                  }
                  placeholder="Enter phone number"
                  className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500"
                />
              </div>

              {/* Invoice */}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Invoice Number
                </label>

                <input
                  type="text"
                  value={invoiceNumber}
                  onChange={(event) =>
                    setInvoiceNumber(
                      event.target.value,
                    )
                  }
                  placeholder="PO-000001"
                  className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500"
                />
              </div>

              {/* Purchase Date */}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Purchase Date
                </label>

                <div className="relative">
                  <Calendar
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="date"
                    value={purchaseDate}
                    onChange={(event) =>
                      setPurchaseDate(
                        event.target.value,
                      )
                    }
                    className="h-11 w-full rounded-lg border border-slate-200 pl-10 pr-3 text-sm outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* ========================================
                PURCHASE ITEMS
            ======================================== */}

            <div className="space-y-4 p-5">
              <div>
                <h3 className="font-semibold text-slate-900">
                  Purchase Items
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Add the products received
                  from the supplier.
                </p>
              </div>

              {/* ADD PRODUCT FORM */}

              <div className="grid grid-cols-1 gap-3 md:grid-cols-[2fr_1fr_1fr_auto]">
                {/* Product */}

                <select
                  value={selectedProductId}
                  onChange={(event) => {
                    const value =
                      event.target.value;

                    setSelectedProductId(
                      value,
                    );

                    const product =
                      products.find(
                        (item) =>
                          item.id ===
                          Number(value),
                      );

                    /*
                     * Automatically use the
                     * existing cost price.
                     */
                    if (product) {
                      setPurchaseCostPrice(
                        String(
                          product.costPrice,
                        ),
                      );
                    } else {
                      setPurchaseCostPrice(
                        "",
                      );
                    }
                  }}
                  className="h-11 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500"
                >
                  <option value="">
                    Select product
                  </option>

                  {products.map(
                    (product) => (
                      <option
                        key={product.id}
                        value={product.id}
                      >
                        {product.name}
                      </option>
                    ),
                  )}
                </select>

                {/* Quantity */}

                <input
                  type="number"
                  min="1"
                  step="1"
                  value={purchaseQuantity}
                  onChange={(event) =>
                    setPurchaseQuantity(
                      event.target.value,
                    )
                  }
                  placeholder="Quantity"
                  className="h-11 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500"
                />

                {/* Cost Price */}

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={purchaseCostPrice}
                  onChange={(event) =>
                    setPurchaseCostPrice(
                      event.target.value,
                    )
                  }
                  placeholder="Cost price"
                  className="h-11 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500"
                />

                {/* Add */}

                <button
                  type="button"
                  onClick={
                    addPurchaseItem
                  }
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  <Plus size={17} />

                  Add
                </button>
              </div>

              {/* ======================================
                  ITEMS TABLE
              ====================================== */}

              <div className="overflow-hidden rounded-xl border border-slate-200">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Product
                        </th>

                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Quantity
                        </th>

                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Cost Price
                        </th>

                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Total
                        </th>

                        <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {items.map(
                        (item) => (
                          <tr
                            key={
                              item.productId
                            }
                          >
                            <td className="px-4 py-3">
                              <p className="text-sm font-medium text-slate-900">
                                {
                                  item.productName
                                }
                              </p>
                            </td>

                            <td className="px-4 py-3 text-right text-sm text-slate-600">
                              {
                                item.quantity
                              }
                            </td>

                            <td className="px-4 py-3 text-right text-sm text-slate-600">
                              Rs.{" "}
                              {item.costPrice.toLocaleString()}
                            </td>

                            <td className="px-4 py-3 text-right text-sm font-semibold text-slate-900">
                              Rs.{" "}
                              {item.total.toLocaleString()}
                            </td>

                            <td className="px-4 py-3 text-center">
                              <button
                                type="button"
                                onClick={() =>
                                  removePurchaseItem(
                                    item.productId,
                                  )
                                }
                                className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                              >
                                <Trash2
                                  size={17}
                                />
                              </button>
                            </td>
                          </tr>
                        ),
                      )}

                      {items.length ===
                        0 && (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-4 py-10 text-center"
                          >
                            <Package
                              size={32}
                              className="mx-auto text-slate-300"
                            />

                            <p className="mt-2 text-sm text-slate-500">
                              No products added
                              yet.
                            </p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ======================================
                  NOTES
              ====================================== */}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Notes
                </label>

                <textarea
                  value={notes}
                  onChange={(event) =>
                    setNotes(
                      event.target.value,
                    )
                  }
                  rows={3}
                  placeholder="Optional purchase notes..."
                  className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>

              {/* ======================================
                  TOTAL
              ====================================== */}

              <div className="flex justify-end">
                <div className="w-full max-w-sm rounded-xl bg-slate-50 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">
                      Subtotal
                    </span>

                    <span className="font-semibold text-slate-900">
                      Rs.{" "}
                      {subtotal.toLocaleString()}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3">
                    <span className="font-semibold text-slate-700">
                      Purchase Total
                    </span>

                    <span className="text-xl font-bold text-blue-600">
                      Rs.{" "}
                      {subtotal.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ========================================
                MODAL FOOTER
            ======================================== */}

            <div className="flex justify-end gap-3 border-t border-slate-200 p-5">
              <button
                onClick={closeModal}
                className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                onClick={
                  createPurchase
                }
                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Create Purchase
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}