import { useEffect, useMemo, useState } from "react";

import type { Product } from "../../types/product";

import { productService } from "../../services/productService";

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

  X,

  Star,

  UserPlus,

} from "lucide-react";



type BillItem = {

  id: number;

  name: string;

  quantity: number;

  price: number;

};







type Customer = {

  id: number;

  name: string;

  phone: string;

  email: string;

  points: number;

};






const initialCustomers: Customer[] = [

  {

    id: 1,

    name: "Kasun Perera",

    phone: "0771234567",

    email: "kasun@example.com",

    points: 245,

  },

  {

    id: 2,

    name: "Nimal Silva",

    phone: "0712345678",

    email: "nimal@example.com",

    points: 120,

  },

  {

    id: 3,

    name: "Amal Fernando",

    phone: "0769876543",

    email: "amal@example.com",

    points: 380,

  },

];



export default function POS() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    setProducts(productService.getProducts());
  }, []);


  const [items, setItems] = useState<BillItem[]>([

    {

      id: 1,

      name: "Rice 5kg",

      quantity: 1,

      price: 1100,

    },

    {

      id: 2,

      name: "Milk Powder",

      quantity: 2,

      price: 950,

    },

    {

      id: 3,

      name: "Bread",

      quantity: 2,

      price: 150,

    },

  ]);



  const [customers, setCustomers] =

    useState<Customer[]>(initialCustomers);



  const [selectedCustomer, setSelectedCustomer] =

    useState<Customer | null>(null);



  const [searchTerm, setSearchTerm] = useState("");



  const [cashReceived, setCashReceived] =

    useState("");



  const [discount, setDiscount] = useState(100);



  const [redeemPoints, setRedeemPoints] =

    useState(0);



  const [showManualItem, setShowManualItem] =

    useState(false);



  const [showCustomerModal, setShowCustomerModal] =

    useState(false);



  const [showAddCustomer, setShowAddCustomer] =

    useState(false);



  const [customerSearch, setCustomerSearch] =

    useState("");



  const [newCustomerName, setNewCustomerName] =

    useState("");



  const [newCustomerPhone, setNewCustomerPhone] =

    useState("");



  const [newCustomerEmail, setNewCustomerEmail] =

    useState("");



  const [manualName, setManualName] = useState("");

  const [manualPrice, setManualPrice] = useState("");

  const [manualQuantity, setManualQuantity] =

    useState("1");



  // ==========================================

  // PRODUCT SEARCH

  // ==========================================



  const filteredProducts = products.filter(

    (product) =>

      product.name

        .toLowerCase()

        .includes(searchTerm.toLowerCase()),

  );



  // ==========================================

  // CUSTOMER SEARCH

  // ==========================================



  const filteredCustomers = customers.filter(

    (customer) =>

      customer.name

        .toLowerCase()

        .includes(customerSearch.toLowerCase()) ||

      customer.phone.includes(customerSearch),

  );



  // ==========================================

  // BILL CALCULATIONS

  // ==========================================



  const subtotal = useMemo(

    () =>

      items.reduce(

        (total, item) =>

          total + item.quantity * item.price,

        0,

      ),

    [items],

  );



  /*

   * Loyalty rule:

   * Rs.100 spent = 1 point

   */

  const pointsEarned = Math.floor(subtotal / 100);



  /*

   * 1 point = Rs.1 discount

   *

   * Maximum redeemable points:

   * - Customer's available points

   * - Bill amount after normal discount

   */

  const maximumRedeemablePoints = selectedCustomer

    ? Math.min(

        selectedCustomer.points,

        Math.max(subtotal - discount, 0),

      )

    : 0;



  const safeRedeemPoints = Math.min(

    Math.max(redeemPoints, 0),

    maximumRedeemablePoints,

  );



  const safeDiscount = Math.min(

    Math.max(discount, 0),

    subtotal,

  );



  const total =

    subtotal -

    safeDiscount -

    safeRedeemPoints;



  const cash = Number(cashReceived) || 0;



  const change = Math.max(

    cash - total,

    0,

  );



  const insufficient =

    cashReceived !== "" && cash < total;



  const newCustomerPoints = selectedCustomer

    ? selectedCustomer.points +

      pointsEarned -

      safeRedeemPoints

    : 0;



  // ==========================================

  // ADD PRODUCT

  // ==========================================

  const addProduct = (product: Product) => {
    if (product.stock <= 0) {
      alert(`${product.name} is out of stock.`);
      return;
    }

    const existingItem = items.find((item) => item.id === product.id);

    if (existingItem && existingItem.quantity >= product.stock) {
      alert(`Only ${product.stock} units of ${product.name} are available.`);
      return;
    }

    setItems((current) => {
      const existing = current.find((item) => item.id === product.id);

      if (existing) {
        return current.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }

      return [
        ...current,
        {
          id: product.id,
          name: product.name,
          quantity: 1,
          price: product.sellingPrice,
        },
      ];
    });

    setSearchTerm("");
  };

  // ==========================================
  // UPDATE QUANTITY
  // ==========================================

  const updateQuantity = (id: number, amount: number) => {
    if (amount > 0) {
      const product = products.find((item) => item.id === id);
      const currentItem = items.find((item) => item.id === id);

      if (product && currentItem && currentItem.quantity >= product.stock) {
        alert(`Only ${product.stock} units of ${product.name} are available.`);
        return;
      }
    }

    setItems((current) =>
      current
        .map((item) =>
          item.id === id
            ? { ...item, quantity: item.quantity + amount }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  // ==========================================
  // REMOVE ITEM

  // ==========================================



  const removeItem = (id: number) => {

    setItems((current) =>

      current.filter(

        (item) => item.id !== id,

      ),

    );

  };



  // ==========================================

  // CLEAR BILL

  // ==========================================



  const clearBill = () => {

    setItems([]);

    setCashReceived("");

    setDiscount(0);

    setRedeemPoints(0);

  };



  // ==========================================

  // MANUAL ITEM

  // ==========================================



  const addManualItem = () => {

    const name = manualName.trim();

    const price = Number(manualPrice);

    const quantity =

      Number(manualQuantity);



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



    setItems((current) => [

      ...current,

      {

        id: Date.now(),

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



  // ==========================================

  // SELECT CUSTOMER

  // ==========================================



  const selectCustomer = (

    customer: Customer,

  ) => {

    setSelectedCustomer(customer);

    setRedeemPoints(0);

    setShowCustomerModal(false);

    setCustomerSearch("");

  };



  // ==========================================

  // REMOVE CUSTOMER

  // ==========================================



  const removeCustomer = () => {

    setSelectedCustomer(null);

    setRedeemPoints(0);

  };



  // ==========================================

  // ADD CUSTOMER

  // ==========================================



  const addCustomer = () => {

    const name = newCustomerName.trim();

    const phone =

      newCustomerPhone.trim();

    const email =

      newCustomerEmail.trim();



    if (!name) {

      alert("Please enter customer name.");

      return;

    }



    if (!phone) {

      alert("Please enter customer phone number.");

      return;

    }



    const newCustomer: Customer = {

      id: Date.now(),

      name,

      phone,

      email,

      points: 0,

    };



    setCustomers((current) => [

      ...current,

      newCustomer,

    ]);



    setSelectedCustomer(newCustomer);



    setNewCustomerName("");

    setNewCustomerPhone("");

    setNewCustomerEmail("");



    setShowAddCustomer(false);

    setShowCustomerModal(false);

    setCustomerSearch("");

  };



  // ==========================================

  // COMPLETE PAYMENT

  // ==========================================



  const completePayment = () => {

    if (items.length === 0) {

      alert("Please add at least one item.");

      return;

    }



    if (cash < total) {

      alert("Insufficient payment amount.");

      return;

    }



    /*

     * Update customer's loyalty balance.

     *

     * Later this will be handled by

     * the C# backend + SQL Server.

     */

    if (selectedCustomer) {

      setCustomers((current) =>

        current.map((customer) =>

          customer.id === selectedCustomer.id

            ? {

                ...customer,

                points:

                  customer.points +

                  pointsEarned -

                  safeRedeemPoints,

              }

            : customer,

        ),

      );

    }

    // Update shared inventory after a successful payment.
    const updatedProducts = productService.getProducts().map((product) => {
      const soldItem = items.find((item) => item.id === product.id);

      if (!soldItem) {
        return product;
      }

      return {
        ...product,
        stock: Math.max(product.stock - soldItem.quantity, 0),
      };
    });

    productService.saveProducts(updatedProducts);
    setProducts(updatedProducts);




    alert(

      `Payment completed successfully!\n\n` +

        `Total: Rs. ${total.toLocaleString()}\n` +

        `Cash: Rs. ${cash.toLocaleString()}\n` +

        `Change: Rs. ${change.toLocaleString()}\n\n` +

        `${

          selectedCustomer

            ? `Points earned: ${pointsEarned}\n` +

              `Points redeemed: ${safeRedeemPoints}\n` +

              `New points balance: ${newCustomerPoints}`

            : "No customer selected."

        }`,

    );

  };



  return (

    <div className="space-y-5">

      {/* ========================================

          HEADER

      ======================================== */}



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

        {/* ======================================

            LEFT SIDE

        ====================================== */}



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

                    setSearchTerm(

                      event.target.value,

                    )

                  }

                  placeholder="Search product..."

                  className="h-11 w-full rounded-lg border border-slate-200 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"

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



            {/* MANUAL ITEM */}



            {showManualItem && (

              <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-4">

                <div className="mb-4">

                  <h3 className="font-semibold text-slate-900">

                    Add Manual Item

                  </h3>



                  <p className="text-xs text-slate-500">

                    Add an item that is not in

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

                        setManualName(

                          event.target.value,

                        )

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

                        setManualPrice(

                          event.target.value,

                        )

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

                    className="rounded-lg px-4 py-2 text-sm text-slate-600 hover:bg-white"

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



            {/* PRODUCTS */}



            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">

              {filteredProducts.map(

                (product) => (

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

                      {product.sellingPrice.toLocaleString()}

                    </p>

                  </button>

                ),

              )}

            </div>

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

                  {items.length !== 1

                    ? "s"

                    : ""}

                </p>

              </div>



              <button

                onClick={clearBill}

                disabled={items.length === 0}

                className="text-sm font-medium text-red-500 disabled:text-slate-300"

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



                    <th />

                  </tr>

                </thead>



                <tbody className="divide-y divide-slate-100">

                  {items.map((item) => (

                    <tr key={item.id}>

                      <td className="px-5 py-4 font-medium text-slate-900">

                        {item.name}

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



                          <span className="w-6 text-center font-medium">

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



                      <td className="px-5 py-4 font-semibold">

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

                          className="text-slate-400 hover:text-red-500"

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

                        <ShoppingCart

                          size={30}

                          className="mx-auto text-slate-300"

                        />



                        <p className="mt-3 font-medium text-slate-600">

                          No items in this bill

                        </p>

                      </td>

                    </tr>

                  )}

                </tbody>

              </table>

            </div>

          </div>

        </div>



        {/* ======================================

            RIGHT SIDE

        ====================================== */}



        <div className="space-y-5">

          {/* CUSTOMER */}



          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">

                  <UserRound size={19} />

                </div>



                <div>

                  <p className="font-semibold text-slate-900">

                    Customer

                  </p>



                  <p className="text-xs text-slate-500">

                    {selectedCustomer

                      ? "Selected customer"

                      : "Optional"}

                  </p>

                </div>

              </div>



              {selectedCustomer && (

                <button

                  onClick={removeCustomer}

                  className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500"

                >

                  <X size={17} />

                </button>

              )}

            </div>



            {!selectedCustomer ? (

              <button

                onClick={() =>

                  setShowCustomerModal(true)

                }

                className="mt-4 w-full rounded-lg border border-dashed border-slate-300 px-4 py-3 text-sm text-slate-500 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600"

              >

                + Select or Add Customer

              </button>

            ) : (

              <div className="mt-4 rounded-lg bg-slate-50 p-4">

                <p className="font-semibold text-slate-900">

                  {selectedCustomer.name}

                </p>



                <p className="mt-1 text-xs text-slate-500">

                  {selectedCustomer.phone}

                </p>



                {selectedCustomer.email && (

                  <p className="mt-1 text-xs text-slate-500">

                    {selectedCustomer.email}

                  </p>

                )}



                <div className="mt-4 flex items-center justify-between rounded-lg bg-white p-3">

                  <div className="flex items-center gap-2">

                    <Star

                      size={17}

                      className="fill-yellow-400 text-yellow-400"

                    />



                    <span className="text-sm font-medium">

                      Loyalty Points

                    </span>

                  </div>



                  <span className="font-bold text-blue-600">

                    {selectedCustomer.points}

                  </span>

                </div>

              </div>

            )}

          </div>



          {/* LOYALTY */}



          {selectedCustomer && (

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="flex items-center gap-2">

                <Star

                  size={19}

                  className="fill-yellow-400 text-yellow-400"

                />



                <h2 className="font-semibold text-slate-900">

                  Loyalty Points

                </h2>

              </div>



              <div className="mt-4 space-y-3">

                <div className="flex justify-between text-sm">

                  <span className="text-slate-500">

                    Current Points

                  </span>



                  <span className="font-semibold">

                    {selectedCustomer.points}

                  </span>

                </div>



                <div className="flex justify-between text-sm">

                  <span className="text-slate-500">

                    Points Earned

                  </span>



                  <span className="font-semibold text-emerald-600">

                    +{pointsEarned}

                  </span>

                </div>



                <div className="border-t border-slate-200 pt-3">

                  <label className="text-sm font-medium text-slate-700">

                    Redeem Points

                  </label>



                  <div className="mt-2 flex items-center gap-2">

                    <input

  type="number"

  min="0"

  max={maximumRedeemablePoints}

  value={redeemPoints === 0 ? "" : redeemPoints}

  onChange={(event) => {

    const value = Number(event.target.value);



    setRedeemPoints(

      Math.min(

        Math.max(value || 0, 0),

        maximumRedeemablePoints,

      ),

    );

  }}

  placeholder="0"

  className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500"

/>



                    <span className="whitespace-nowrap text-xs text-slate-500">

                      max{" "}

                      {maximumRedeemablePoints}

                    </span>

                  </div>



                  <p className="mt-2 text-xs text-slate-400">

                    1 point = Rs. 1 discount

                  </p>

                </div>



                <div className="rounded-lg bg-blue-50 p-3">

                  <div className="flex justify-between text-sm">

                    <span className="text-slate-600">

                      New Balance

                    </span>



                    <span className="font-bold text-blue-600">

                      {newCustomerPoints}

                    </span>

                  </div>



                  <div className="mt-1 flex justify-between text-xs">

                    <span className="text-slate-500">

                      Redeem discount

                    </span>



                    <span className="font-medium text-blue-600">

                      Rs.{" "}

                      {safeRedeemPoints.toLocaleString()}

                    </span>

                  </div>

                </div>

              </div>

            </div>

          )}



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

                        Number(

                          event.target.value,

                        ),

                      )

                    }

                    className="w-24 rounded-md border border-slate-200 px-2 py-1 text-right text-sm outline-none focus:border-blue-500"

                  />

                </div>

              </div>



              {safeRedeemPoints > 0 && (

                <SummaryRow

                  label="Loyalty Discount"

                  value={`- Rs. ${safeRedeemPoints.toLocaleString()}`}

                />

              )}



              <div className="border-t border-slate-200 pt-4">

                <div className="flex items-center justify-between">

                  <span className="text-base font-semibold">

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



              <button className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-3 text-sm font-medium text-slate-600">

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

                className="h-12 w-full rounded-lg border border-slate-200 pl-11 pr-4 text-lg font-semibold outline-none focus:border-blue-500"

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

              className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3.5 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"

            >

              <Calculator size={18} />

              Complete Payment

            </button>

          </div>

        </div>

      </div>



      {/* ========================================

          CUSTOMER MODAL

      ======================================== */}



      {showCustomerModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">

          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b border-slate-200 p-5">

              <div>

                <h2 className="text-lg font-bold text-slate-900">

                  Select Customer

                </h2>



                <p className="text-xs text-slate-500">

                  Search an existing customer or add

                  a new one.

                </p>

              </div>



              <button

                onClick={() =>

                  setShowCustomerModal(false)

                }

                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"

              >

                <X size={19} />

              </button>

            </div>



            <div className="p-5">

              {/* SEARCH */}



              <div className="relative">

                <Search

                  size={18}

                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"

                />



                <input

                  value={customerSearch}

                  onChange={(event) =>

                    setCustomerSearch(

                      event.target.value,

                    )

                  }

                  placeholder="Search name or phone..."

                  className="h-11 w-full rounded-lg border border-slate-200 pl-10 pr-4 text-sm outline-none focus:border-blue-500"

                />

              </div>



              {/* ADD CUSTOMER */}



              <button

                onClick={() =>

                  setShowAddCustomer(

                    !showAddCustomer,

                  )

                }

                className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-600 hover:bg-blue-100"

              >

                <UserPlus size={17} />

                Add New Customer

              </button>



              {/* NEW CUSTOMER FORM */}



              {showAddCustomer && (

                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">

                  <h3 className="font-semibold text-slate-900">

                    New Customer

                  </h3>



                  <div className="mt-3 space-y-3">

                    <input

                      value={newCustomerName}

                      onChange={(event) =>

                        setNewCustomerName(

                          event.target.value,

                        )

                      }

                      placeholder="Full name *"

                      className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500"

                    />



                    <input

                      value={newCustomerPhone}

                      onChange={(event) =>

                        setNewCustomerPhone(

                          event.target.value,

                        )

                      }

                      placeholder="Phone number *"

                      className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500"

                    />



                    <input

                      value={newCustomerEmail}

                      onChange={(event) =>

                        setNewCustomerEmail(

                          event.target.value,

                        )

                      }

                      placeholder="Email address"

                      className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500"

                    />



                    <button

                      onClick={addCustomer}

                      className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"

                    >

                      Create Customer

                    </button>

                  </div>

                </div>

              )}



              {/* CUSTOMER LIST */}



              <div className="mt-5 space-y-2">

                {filteredCustomers.map(

                  (customer) => (

                    <button

                      key={customer.id}

                      onClick={() =>

                        selectCustomer(

                          customer,

                        )

                      }

                      className="flex w-full items-center justify-between rounded-xl border border-slate-200 p-4 text-left hover:border-blue-400 hover:bg-blue-50"

                    >

                      <div>

                        <p className="font-semibold text-slate-900">

                          {customer.name}

                        </p>



                        <p className="mt-1 text-xs text-slate-500">

                          {customer.phone}

                        </p>

                      </div>



                      <div className="flex items-center gap-1 text-sm font-semibold text-blue-600">

                        <Star

                          size={15}

                          className="fill-yellow-400 text-yellow-400"

                        />



                        {customer.points}

                      </div>

                    </button>

                  ),

                )}



                {filteredCustomers.length ===

                  0 && (

                  <div className="py-8 text-center">

                    <UserRound

                      size={30}

                      className="mx-auto text-slate-300"

                    />



                    <p className="mt-2 text-sm font-medium text-slate-600">

                      No customers found

                    </p>

                  </div>

                )}

              </div>

            </div>

          </div>

        </div>

      )}

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