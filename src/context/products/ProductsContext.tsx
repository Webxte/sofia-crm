
import React, { createContext, useContext, useEffect, ReactNode } from "react";
import { useProductsOperations } from "./useProductsOperations";
import { ProductsContextType } from "./types";
import { useAuth } from "@/context/AuthContext";

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export const ProductsProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const operations = useProductsOperations();

  // Fetch products when the component mounts or when auth state changes
  useEffect(() => {
    if (isAuthenticated) {
      operations.refreshProducts();
    }
  }, [isAuthenticated]);

  return (
    <ProductsContext.Provider value={operations}>
      {children}
    </ProductsContext.Provider>
  );
};

export const useProducts = (): ProductsContextType => {
  const context = useContext(ProductsContext);
  if (context === undefined) {
    throw new Error("useProducts must be used within a ProductsProvider");
  }
  return context;
};
