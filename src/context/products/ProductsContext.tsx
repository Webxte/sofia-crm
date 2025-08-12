
import React, { ReactNode } from "react";
import { DirectProductsProvider, useProducts } from "./DirectProductsProvider";

export const ProductsProvider = ({ children }: { children: ReactNode }) => {
  return <DirectProductsProvider>{children}</DirectProductsProvider>;
};

export { useProducts };
