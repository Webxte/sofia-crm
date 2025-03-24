
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Product } from "@/types";
import { useAuth } from "./AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ProductsContextType {
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

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export const ProductsProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Fetch products when the component mounts or when user auth state changes
  useEffect(() => {
    if (isAuthenticated) {
      refreshProducts();
    } else {
      setProducts([]);
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Function to fetch products from Supabase
  const refreshProducts = async () => {
    try {
      setLoading(true);
      
      if (!isAuthenticated) {
        setProducts([]);
        return;
      }
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('code', { ascending: true });
      
      if (error) {
        console.error('Error fetching products:', error);
        toast({
          title: "Error",
          description: "Failed to load products",
          variant: "destructive",
        });
        return;
      }
      
      // Transform the Supabase data to match our Product type
      const formattedProducts: Product[] = data.map(product => ({
        id: product.id,
        code: product.code,
        description: product.description,
        price: product.price,
        cost: product.cost,
        vat: product.vat,
        createdAt: new Date(product.created_at),
        updatedAt: new Date(product.updated_at),
      }));
      
      setProducts(formattedProducts);
    } catch (err) {
      console.error('Unexpected error fetching products:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred while loading products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (productData: Omit<Product, "id" | "createdAt" | "updatedAt">) => {
    try {
      // Convert Product type to Supabase table format
      const newProductData = {
        code: productData.code,
        description: productData.description,
        price: productData.price,
        cost: productData.cost,
        vat: productData.vat,
      };
      
      const { data, error } = await supabase
        .from('products')
        .insert(newProductData)
        .select('*')
        .single();
      
      if (error) {
        console.error('Error adding product:', error);
        toast({
          title: "Error",
          description: "Failed to add product",
          variant: "destructive",
        });
        return;
      }
      
      // Transform and add the new product to state
      const newProduct: Product = {
        id: data.id,
        code: data.code,
        description: data.description,
        price: data.price,
        cost: data.cost,
        vat: data.vat,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };
      
      setProducts(prevProducts => [...prevProducts, newProduct]);
      
      toast({
        title: "Success",
        description: "Product added successfully",
      });
    } catch (err) {
      console.error('Unexpected error adding product:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const updateProduct = async (id: string, productData: Partial<Product>) => {
    try {
      // Convert Product type to Supabase table format
      const updateData: any = {};
      
      if (productData.code !== undefined) updateData.code = productData.code;
      if (productData.description !== undefined) updateData.description = productData.description;
      if (productData.price !== undefined) updateData.price = productData.price;
      if (productData.cost !== undefined) updateData.cost = productData.cost;
      if (productData.vat !== undefined) updateData.vat = productData.vat;
      
      // Add updated_at
      updateData.updated_at = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', id)
        .select('*')
        .single();
      
      if (error) {
        console.error('Error updating product:', error);
        toast({
          title: "Error",
          description: "Failed to update product",
          variant: "destructive",
        });
        return;
      }
      
      // Update the product in state
      setProducts(prevProducts => 
        prevProducts.map(product => 
          product.id === id 
            ? {
                ...product,
                code: data.code,
                description: data.description,
                price: data.price,
                cost: data.cost,
                vat: data.vat,
                updatedAt: new Date(data.updated_at)
              }
            : product
        )
      );
      
      toast({
        title: "Success",
        description: "Product updated successfully",
      });
    } catch (err) {
      console.error('Unexpected error updating product:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting product:', error);
        toast({
          title: "Error",
          description: "Failed to delete product",
          variant: "destructive",
        });
        return;
      }
      
      // Remove the product from state
      setProducts(prevProducts => prevProducts.filter(product => product.id !== id));
      
      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
    } catch (err) {
      console.error('Unexpected error deleting product:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
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

  const importProducts = async (csvData: string) => {
    try {
      // Parse CSV data (simple implementation)
      const lines = csvData.trim().split('\n');
      
      // Skip header row if it exists
      const startIndex = lines[0].toLowerCase().includes('code') ? 1 : 0;
      
      const importPromises = [];
      
      for (let i = startIndex; i < lines.length; i++) {
        const values = lines[i].split(',');
        
        if (values.length >= 4) {
          const [code, description, priceStr, costStr, vatStr] = values;
          
          const price = parseFloat(priceStr.trim());
          const cost = parseFloat(costStr.trim());
          const vat = vatStr ? parseFloat(vatStr.trim()) : 0;
          
          if (!isNaN(price) && !isNaN(cost)) {
            const productData = {
              code: code.trim(),
              description: description.trim(),
              price,
              cost,
              vat,
            };
            
            importPromises.push(
              supabase
                .from('products')
                .insert(productData)
                .select('*')
            );
          }
        }
      }
      
      await Promise.all(importPromises);
      
      // Refresh products to get updated list
      await refreshProducts();
      
      toast({
        title: "Success",
        description: `${importPromises.length} products imported successfully`,
      });
    } catch (error) {
      console.error("Error importing products:", error);
      toast({
        title: "Error",
        description: "Failed to import products",
        variant: "destructive",
      });
    }
  };

  const importProductsFromFile = async (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const csvData = e.target?.result as string;
          await importProducts(csvData);
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
