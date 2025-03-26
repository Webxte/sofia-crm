
import { createContext, useContext, useEffect, ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { ProductsContextType } from "./types";
import { useProductsOperations } from "./useProductsOperations";

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export const ProductsProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const {
    products,
    loading,
    refreshProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    getProductById,
    getProductByCode,
    importProducts,
    importProductsFromFile,
  } = useProductsOperations();

  useEffect(() => {
    if (isAuthenticated) {
      refreshProducts();
    }
  }, [isAuthenticated]);

  return (
    <ProductsContext.Provider
      value={{
        products,
        loading,
        addProduct,
        updateProduct,
        deleteProduct,
        getProductById,
        getProductByCode,
        importProducts,
        importProductsFromFile,
        refreshProducts,
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductsContext);
  if (context === undefined) {
    throw new Error("useProducts must be used within a ProductsProvider");
  }
  return context;
};
