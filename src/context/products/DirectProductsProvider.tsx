
import React, { createContext, useContext, useEffect, ReactNode, useState } from "react";
import { ProductsContextType } from "./types";
import { useProductsOperations } from "./useProductsOperations";
import { useAuth } from "../AuthContext";

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

interface DirectProductsProviderProps {
  children: ReactNode;
}

export const DirectProductsProvider = ({ children }: DirectProductsProviderProps) => {
  const [isReady, setIsReady] = useState(false);
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  
  // Wait for auth to be ready before initializing products
  useEffect(() => {
    if (!authLoading) {
      setIsReady(true);
    }
  }, [authLoading]);

  // Always provide a valid context, but with loading states when not ready
  const fallbackContextValue: ProductsContextType = {
    products: [],
    loading: !isReady || authLoading,
    addProduct: async () => null,
    updateProduct: async () => null,
    deleteProduct: async () => false,
    getProductById: () => undefined,
    getProductByCode: () => undefined,
    searchProducts: () => [],
    refreshProducts: async () => {},
    importProductsFromCsv: async () => {},
    importProductsFromFile: async () => {},
    importProducts: async () => {},
  };

  if (!isReady) {
    return (
      <ProductsContext.Provider value={fallbackContextValue}>
        {children}
      </ProductsContext.Provider>
    );
  }

  return <ProductsProviderWithHooks isAuthenticated={isAuthenticated}>{children}</ProductsProviderWithHooks>;
};

// Component that uses hooks - only rendered when ready
const ProductsProviderWithHooks = ({ 
  children, 
  isAuthenticated 
}: { 
  children: ReactNode; 
  isAuthenticated: boolean; 
}) => {
  const operations = useProductsOperations();

  // Fetch products when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      operations.refreshProducts();
    }
  }, [isAuthenticated, operations]);

  return (
    <ProductsContext.Provider value={operations}>
      {children}
    </ProductsContext.Provider>
  );
};

export const useProducts = (): ProductsContextType => {
  const context = useContext(ProductsContext);
  if (context === undefined) {
    throw new Error("useProducts must be used within a DirectProductsProvider");
  }
  return context;
};
