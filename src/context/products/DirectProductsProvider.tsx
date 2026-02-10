
import React, { createContext, useContext, useEffect, ReactNode, useState, useMemo, useRef } from "react";
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
  
  useEffect(() => {
    if (!authLoading) {
      setIsReady(true);
    }
  }, [authLoading]);

  const fallbackContextValue: ProductsContextType = useMemo(() => ({
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
  }), [isReady, authLoading]);

  if (!isReady) {
    return (
      <ProductsContext.Provider value={fallbackContextValue}>
        {children}
      </ProductsContext.Provider>
    );
  }

  return <ProductsProviderWithHooks isAuthenticated={isAuthenticated}>{children}</ProductsProviderWithHooks>;
};

const ProductsProviderWithHooks = ({ 
  children, 
  isAuthenticated 
}: { 
  children: ReactNode; 
  isAuthenticated: boolean; 
}) => {
  const operations = useProductsOperations();
  const hasFetchedRef = useRef(false);

  // Stable reference to fetchProducts
  const fetchProductsRef = useRef(operations.fetchProducts);
  fetchProductsRef.current = operations.fetchProducts;

  // Fetch products ONCE when authenticated
  useEffect(() => {
    if (isAuthenticated && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchProductsRef.current();
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
    throw new Error("useProducts must be used within a DirectProductsProvider");
  }
  return context;
};
