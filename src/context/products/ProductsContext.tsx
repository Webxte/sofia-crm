
import React, { ReactNode } from "react";
import { SafeProductsWrapper } from "./SafeProductsWrapper";

export const ProductsProvider = ({ children }: { children: ReactNode }) => {
  return (
    <SafeProductsWrapper>
      {children}
    </SafeProductsWrapper>
  );
};

// Re-export useProducts from ActualProductsProvider
export { useProducts } from "./ActualProductsProvider";
