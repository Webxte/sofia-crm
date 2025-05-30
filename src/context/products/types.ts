
import { Product } from "@/types";

export interface ProductsContextType {
  products: Product[];
  loading: boolean;
  addProduct: (productData: Omit<Product, "id" | "createdAt" | "updatedAt">) => Promise<Product | null>;
  updateProduct: (id: string, productData: Partial<Product>) => Promise<Product | null>;
  deleteProduct: (id: string) => Promise<boolean>;
  getProductById: (id: string) => Product | undefined;
  getProductByCode: (code: string) => Product | undefined;
  searchProducts: (query: string) => Product[];
  refreshProducts: () => Promise<void>;
  importProductsFromCsv: (file: File) => Promise<void>;
  importProductsFromFile: (file: File) => Promise<void>;
  importProducts: (csvData: string) => Promise<void>;
}
