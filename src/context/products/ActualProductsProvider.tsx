
import React, { createContext, useContext, useEffect, ReactNode, useState } from "react";
import { ProductsContextType } from "./types";

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

interface ActualProductsProviderProps {
  children: ReactNode;
  isAuthenticated: boolean;
}

// Component that actually uses the hooks - only rendered when React is ready
const ProductsProviderWithHooks = ({ 
  children, 
  isAuthenticated 
}: ActualProductsProviderProps) => {
  // Only import and use hooks when this component is actually rendered
  const { useProductsOperations } = require("./useProductsOperations");
  
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

export const ActualProductsProvider = (props: ActualProductsProviderProps) => {
  const [isReactReady, setIsReactReady] = useState(false);

  useEffect(() => {
    // Ensure React is fully initialized before rendering hook-dependent components
    const timer = setTimeout(() => {
      setIsReactReady(true);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // Provide a fallback context while React initializes
  if (!isReactReady) {
    const fallbackContextValue: ProductsContextType = {
      products: [],
      loading: false,
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

    return (
      <ProductsContext.Provider value={fallbackContextValue}>
        {props.children}
      </ProductsContext.Provider>
    );
  }

  return <ProductsProviderWithHooks {...props} />;
};

export const useProducts = (): ProductsContextType => {
  const context = useContext(ProductsContext);
  if (context === undefined) {
    throw new Error("useProducts must be used within a ProductsProvider");
  }
  return context;
};
