
import { createContext, useContext, useState, ReactNode } from "react";
import { Product } from "@/types";

interface ProductsContextType {
  products: Product[];
  addProduct: (product: Omit<Product, "id">) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  getProductById: (id: string) => Product | undefined;
  getProductByCode: (code: string) => Product | undefined;
  importProducts: (csvData: string) => void;
  importProductsFromFile: (file: File) => Promise<void>;
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export const ProductsProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);

  const addProduct = (productData: Omit<Product, "id">) => {
    const newProduct: Product = {
      ...productData,
      id: Math.random().toString(36).substring(2, 9),
    };
    
    setProducts(prevProducts => [...prevProducts, newProduct]);
  };

  const updateProduct = (id: string, productData: Partial<Product>) => {
    setProducts(prevProducts => 
      prevProducts.map(product => 
        product.id === id 
          ? { ...product, ...productData } 
          : product
      )
    );
  };

  const deleteProduct = (id: string) => {
    setProducts(prevProducts => prevProducts.filter(product => product.id !== id));
  };

  const getProductById = (id: string) => {
    return products.find(product => product.id === id);
  };

  // Updated to be case-insensitive
  const getProductByCode = (code: string) => {
    return products.find(product => 
      product.code.toLowerCase() === code.toLowerCase()
    );
  };

  const importProducts = (csvData: string) => {
    try {
      // Parse CSV data (simple implementation)
      const lines = csvData.trim().split('\n');
      
      // Skip header row if it exists
      const startIndex = lines[0].toLowerCase().includes('code') ? 1 : 0;
      
      const importedProducts: Product[] = [];
      
      for (let i = startIndex; i < lines.length; i++) {
        const values = lines[i].split(',');
        
        if (values.length >= 4) {
          const [code, description, priceStr, costStr, vatStr] = values;
          
          const price = parseFloat(priceStr.trim());
          const cost = parseFloat(costStr.trim());
          const vat = vatStr ? parseFloat(vatStr.trim()) : 0;
          
          if (!isNaN(price) && !isNaN(cost)) {
            // Add createdAt and updatedAt to match Product interface
            importedProducts.push({
              id: Math.random().toString(36).substring(2, 9),
              code: code.trim(),
              description: description.trim(),
              price,
              cost,
              vat,
              createdAt: new Date(),
              updatedAt: new Date()
            });
          }
        }
      }
      
      setProducts(prevProducts => [...prevProducts, ...importedProducts]);
    } catch (error) {
      console.error("Error importing products:", error);
      throw new Error("Failed to import products");
    }
  };

  const importProductsFromFile = async (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const csvData = e.target?.result as string;
          importProducts(csvData);
          resolve();
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = (error) => {
        reject(error);
      };
      
      reader.readAsText(file);
    });
  };

  return (
    <ProductsContext.Provider
      value={{
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        getProductById,
        getProductByCode,
        importProducts,
        importProductsFromFile,
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
