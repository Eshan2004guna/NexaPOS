import type { Product } from "../types/product";

const STORAGE_KEY = "nexapos_products";

const defaultProducts: Product[] = [
  {
    id: 1,
    name: "Rice 5kg",
    sku: "RIC-001",
    barcode: "100000001",
    category: "Groceries",
    costPrice: 950,
    sellingPrice: 1100,
    stock: 25,
    reorderLevel: 10,
  },
  {
    id: 2,
    name: "Milk Powder",
    sku: "MIL-001",
    barcode: "100000002",
    category: "Dairy",
    costPrice: 850,
    sellingPrice: 950,
    stock: 18,
    reorderLevel: 8,
  },
  {
    id: 3,
    name: "Bread",
    sku: "BRD-001",
    barcode: "100000003",
    category: "Bakery",
    costPrice: 120,
    sellingPrice: 150,
    stock: 30,
    reorderLevel: 10,
  },
  {
    id: 4,
    name: "Sugar 1kg",
    sku: "SUG-001",
    barcode: "100000004",
    category: "Groceries",
    costPrice: 220,
    sellingPrice: 260,
    stock: 40,
    reorderLevel: 15,
  },
  {
    id: 5,
    name: "Tea 400g",
    sku: "TEA-001",
    barcode: "100000005",
    category: "Beverages",
    costPrice: 700,
    sellingPrice: 800,
    stock: 20,
    reorderLevel: 8,
  },
  {
    id: 6,
    name: "Cooking Oil 1L",
    sku: "OIL-001",
    barcode: "100000006",
    category: "Groceries",
    costPrice: 500,
    sellingPrice: 580,
    stock: 15,
    reorderLevel: 5,
  },
];

export const productService = {
  getProducts(): Product[] {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(defaultProducts),
      );

      return defaultProducts;
    }

    try {
      return JSON.parse(stored) as Product[];
    } catch {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(defaultProducts),
      );

      return defaultProducts;
    }
  },

  saveProducts(products: Product[]): void {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(products),
    );
  },

  addProduct(product: Product): void {
    const products = this.getProducts();

    products.push(product);

    this.saveProducts(products);
  },

  updateProduct(updatedProduct: Product): void {
    const products = this.getProducts();

    const updatedProducts = products.map((product) =>
      product.id === updatedProduct.id
        ? updatedProduct
        : product,
    );

    this.saveProducts(updatedProducts);
  },

  deleteProduct(id: number): void {
    const products = this.getProducts();

    const updatedProducts = products.filter(
      (product) => product.id !== id,
    );

    this.saveProducts(updatedProducts);
  },

  getProductById(id: number): Product | undefined {
    return this.getProducts().find(
      (product) => product.id === id,
    );
  },
};