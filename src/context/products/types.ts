
import { Product } from "@/types";

export interface ProductsContextType {
  products: Product[];
  loading: boolean;
  addProduct: (product: Omit<Product, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  getProductById: (id: string) => Product | undefined;
  getProductByCode: (code: string) => Product | undefined;
  importProducts: (csvData: string) => Promise<void>;
  importProductsFromFile: (file: File) => Promise<void>;
  refreshProducts: () => Promise<void>;
}
