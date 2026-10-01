import { useMemo, useState } from "react";
import {
  Calculator,
  CircleDollarSign,
  CreditCard,
  Minus,
  Plus,
  Search,
  ShoppingCart,
  Trash2,
  UserRound,
} from "lucide-react";

type BillItem = {
  id: number;
  name: string;
  quantity: number;
  price: number;
};

type Product = {
  id: number;
  name: string;
  price: number;
};

const products: Product[] = [
  { id: 1, name: "Rice 5kg", price: 1250 },
  { id: 2, name: "Milk Powder", price: 1200 },
  { id: 3, name: "Bread", price: 180 },
  { id: 4, name: "Sugar 1kg", price: 350 },
  { id: 5, name: "Tea 400g", price: 850 },
  { id: 6, name: "Biscuits", price: 250 },
  { id: 7, name: "Cooking Oil 1L", price: 720 },
  { id: 8, name: "Eggs 10 Pack", price: 650 },
];

export default function POS() {
  const [items, setItems] = useState<BillItem[]>([
    {
      id: 1,
      name: "Rice 5kg",
      quantity: 1,
      price: 1250,
    },
    {
      id: 2,
      name: "Milk Powder",
      quantity: 2,
      price: 1200,
    },
    {
      id: 3,
      name: "Bread",
      quantity: 2,
      price: 180,
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [cashReceived, setCashReceived] = useState("");
  const [discount, setDiscount] = useState(100);
  const [showManualItem, setShowManualItem] = useState(false);

  const [manualName, setManualName] = useState("");
  const [manualPrice, setManualPrice] = useState("");
  const [manualQuantity, setManualQuantity] = useState("1");

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const subtotal = useMemo(
    () =>
      items.reduce(
        (total, item) =>
          total + item.quantity * item.price,
        0,
      ),
    [items],
  );

  const safeDiscount = Math.min(
    Math.max(discount, 0),
    subtotal,
  );

  const total = subtotal - safeDiscount;

  const cash = Number(cashReceived) || 0;

  const change = Math.max(cash - total, 0);

  const insufficient =
    cashReceived !== "" && cash < total;

  // --------------------------------------------------
  // ADD PRODUCT
  // --------------------------------------------------

  const addProduct = (product: Product) => {
    setItems((current) => {
      const existing = current.find(
        (item) => item.id === product.id,
      );

      if (existing) {
        return current.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item,
        );
      }

      return [
        ...current,
        {
          id: product.id,
          name: product.name,
          quantity: 1,
          price: product.price,
        },
      ];
    });

    setSearchTerm("");
  };

  // --------------------------------------------------
  // UPDATE QUANTITY
  // --------------------------------------------------

  const updateQuantity = (
    id: number,
    amount: number,
  ) => {
    setItems((current) =>
      current
        .map((item) =>
          item.id === id
            ? {
                ...item,
                quantity: item.quantity + amount,
              }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  // --------------------------------------------------
  // REMOVE ITEM
  // --------------------------------------------------

  const removeItem = (id: number) => {
    setItems((current) =>
      current.filter((item) => item.id !== id),
    );
  };

  // --------------------------------------------------
  // CLEAR BILL
  // --------------------------------------------------

  const clearBill = () => {
    setItems([]);
    setCashReceived("");
    setDiscount(0);
  };

  // --------------------------------------------------
  // ADD MANUAL ITEM
  // --------------------------------------------------

  const addManualItem = () => {
    const name = manualName.trim();
    const price = Number(manualPrice);
    const quantity = Number(manualQuantity);

    if (!name) {
      alert("Please enter an item name.");
      return;
    }

    if (price <= 0) {
      alert("Please enter a valid price.");
      return;
    }

    if (quantity <= 0) {
      alert("Please enter a valid quantity.");
      return;
    }

    const manualId = Date.now();

    setItems((current) => [
      ...current,
      {
        id: manualId,
        name,
        price,
        quantity,
      },
    ]);

    setManualName("");
    setManualPrice("");
    setManualQuantity("1");
    setShowManualItem(false);
  };

  // --------------------------------------------------
  // COMPLETE PAYMENT
  // --------------------------------------------------

  const completePayment = () => {
    if (items.length === 0) {
      alert("Please add at least one item.");
      return;
    }

    if (cash < total) {
      alert("Insufficient payment amount.");
      return;
    }

    alert(
      `Payment completed successfully!\n\nTotal: Rs. ${total.toLocaleString()}\nCash: Rs. ${cash.toLocaleString()}\nChange: Rs. ${change.toLocaleString()}`,
    );
  };

  return (
    <div className="space-y-5">
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            POS Billing
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Create a new customer bill.
          </p>
        </div>

        <div className="rounded-lg bg-white px-4 py-2 text-sm shadow-sm ring-1 ring-slate-200">
          Invoice:{" "}
          <span className="font-semibold">
            INV-001246
          </span>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_390px]">
        {/* ==========================================
            LEFT SIDE
        ========================================== */}

        <div className="space-y-5">
          {/* PRODUCT SEARCH */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search
                  size={19}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(event.target.value)
                  }
                  placeholder="Search product..."
                  className="h-11 w-full rounded-lg border border-slate-200 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <button
                onClick={() =>
                  setShowManualItem(
                    !showManualItem,
                  )
                }
                className="rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Manual Item
              </button>
            </div>

            {/* MANUAL ITEM FORM */}
            {showManualItem && (
              <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-4">
                <div className="mb-4">
                  <h3 className="font-semibold text-slate-900">
                    Add Manual Item
                  </h3>

                  <p className="text-xs text-slate-500">
                    Use this for products that are not in
                    the product list.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600">
                      Item Name
                    </label>

                    <input
                      value={manualName}
                      onChange={(event) =>
                        setManualName(event.target.value)
                      }
                      placeholder="Item name"
                      className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600">
                      Unit Price
                    </label>

                    <input
                      type="number"
                      min="0"
                      value={manualPrice}
                      onChange={(event) =>
                        setManualPrice(event.target.value)
                      }
                      placeholder="Price"
                      className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600">
                      Quantity
                    </label>

                    <input
                      type="number"
                      min="1"
                      value={manualQuantity}
                      onChange={(event) =>
                        setManualQuantity(
                          event.target.value,
                        )
                      }
                      className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="mt-3 flex justify-end gap-2">
                  <button
                    onClick={() =>
                      setShowManualItem(false)
                    }
                    className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-white"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={addManualItem}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    Add to Bill
                  </button>
                </div>
              </div>
            )}

            {/* PRODUCT LIST */}
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() =>
                    addProduct(product)
                  }
                  className="rounded-lg border border-slate-200 p-3 text-left transition hover:border-blue-400 hover:bg-blue-50"
                >
                  <p className="font-medium text-slate-800">
                    {product.name}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Rs.{" "}
                    {product.price.toLocaleString()}
                  </p>
                </button>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="mt-4 rounded-lg bg-slate-50 p-5 text-center">
                <p className="text-sm font-medium text-slate-600">
                  No products found
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Try another search or use Manual Item.
                </p>
              </div>
            )}
          </div>

          {/* CURRENT BILL */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 p-5">
              <div>
                <h2 className="font-semibold text-slate-900">
                  Current Bill
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  {items.length} product
                  {items.length !== 1 ? "s" : ""}
                </p>
              </div>

              <button
                onClick={clearBill}
                disabled={items.length === 0}
                className="text-sm font-medium text-red-500 hover:text-red-600 disabled:cursor-not-allowed disabled:text-slate-300"
              >
                Clear Bill
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-5 py-3">
                      Product
                    </th>

                    <th className="px-5 py-3">
                      Price
                    </th>

                    <th className="px-5 py-3">
                      Quantity
                    </th>

                    <th className="px-5 py-3">
                      Total
                    </th>

                    <th className="px-5 py-3"></th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-900">
                          {item.name}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        Rs.{" "}
                        {item.price.toLocaleString()}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex w-fit items-center gap-2 rounded-lg border border-slate-200 p-1">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                -1,
                              )
                            }
                            className="rounded p-1 hover:bg-slate-100"
                          >
                            <Minus size={15} />
                          </button>

                          <span className="w-6 text-center text-sm font-medium">
                            {item.quantity}
                          </span>

                          <button
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                1,
                              )
                            }
                            className="rounded p-1 hover:bg-slate-100"
                          >
                            <Plus size={15} />
                          </button>
                        </div>
                      </td>

                      <td className="px-5 py-4 font-semibold text-slate-900">
                        Rs.{" "}
                        {(
                          item.quantity *
                          item.price
                        ).toLocaleString()}
                      </td>

                      <td className="px-5 py-4">
                        <button
                          onClick={() =>
                            removeItem(item.id)
                          }
                          className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500"
                        >
                          <Trash2 size={17} />
                        </button>
                      </td>
                    </tr>
                  ))}

                  {items.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-5 py-16 text-center"
                      >
                        <div className="flex flex-col items-center">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                            <ShoppingCart
                              size={22}
                            />
                          </div>

                          <p className="mt-3 font-medium text-slate-600">
                            No items in this bill
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            Search or add a product to
                            begin.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ==========================================
            RIGHT SIDE
        ========================================== */}

        <div className="space-y-5">
          {/* CUSTOMER */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <UserRound size={19} />
              </div>

              <div>
                <p className="font-semibold text-slate-900">
                  Customer
                </p>

                <p className="text-xs text-slate-500">
                  Optional
                </p>
              </div>
            </div>

            <button className="mt-4 w-full rounded-lg border border-dashed border-slate-300 px-4 py-3 text-sm text-slate-500 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600">
              + Select or Add Customer
            </button>
          </div>

          {/* BILL SUMMARY */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-slate-900">
              Bill Summary
            </h2>

            <div className="mt-5 space-y-4 text-sm">
              <SummaryRow
                label="Subtotal"
                value={`Rs. ${subtotal.toLocaleString()}`}
              />

              {/* DISCOUNT */}
              <div>
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="discount"
                    className="text-slate-500"
                  >
                    Discount
                  </label>

                  <div className="flex items-center">
                    <span className="mr-1 text-slate-400">
                      Rs.
                    </span>

                    <input
                      id="discount"
                      type="number"
                      min="0"
                      max={subtotal}
                      value={discount}
                      onChange={(event) =>
                        setDiscount(
                          Number(event.target.value),
                        )
                      }
                      className="w-24 rounded-md border border-slate-200 px-2 py-1 text-right text-sm outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-base font-semibold text-slate-900">
                    Grand Total
                  </span>

                  <span className="text-2xl font-bold text-blue-600">
                    Rs. {total.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* PAYMENT */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-slate-900">
              Payment
            </h2>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-3 text-sm font-medium text-white">
                <CircleDollarSign size={17} />
                Cash
              </button>

              <button className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50">
                <CreditCard size={17} />
                Card
              </button>
            </div>

            <label className="mt-5 block text-sm font-medium text-slate-700">
              Cash Received
            </label>

            <div className="relative mt-2">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                Rs.
              </span>

              <input
                type="number"
                min="0"
                value={cashReceived}
                onChange={(event) =>
                  setCashReceived(
                    event.target.value,
                  )
                }
                placeholder="0.00"
                className="h-12 w-full rounded-lg border border-slate-200 pl-11 pr-4 text-lg font-semibold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {insufficient && (
              <p className="mt-2 text-xs font-medium text-red-500">
                Insufficient payment amount.
              </p>
            )}

            <div className="mt-4 rounded-xl bg-emerald-50 p-4">
              <p className="text-sm text-emerald-700">
                Change
              </p>

              <p className="mt-1 text-3xl font-bold text-emerald-600">
                Rs. {change.toLocaleString()}
              </p>
            </div>

            <button
              onClick={completePayment}
              disabled={
                items.length === 0 ||
                cash < total
              }
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3.5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              <Calculator size={18} />
              Complete Payment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-500">
        {label}
      </span>

      <span className="font-medium text-slate-800">
        {value}
      </span>
    </div>
  );
}