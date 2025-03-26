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

  useEffect(() => {
    if (isAuthenticated) {
      refreshProducts();
    } else {
      setProducts([]);
      setLoading(false);
    }
  }, [isAuthenticated]);

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
      
      const formattedProducts: Product[] = data.map(product => ({
        id: product.id,
        code: product.code,
        description: product.description,
        price: product.price,
        cost: product.cost,
        vat: product.vat,
        caseQuantity: product.case_quantity,
        firstOrderCommission: product.first_order_commission,
        nextOrdersCommission: product.next_orders_commission,
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
      const newProductData = {
        code: productData.code,
        description: productData.description,
        price: productData.price,
        cost: productData.cost,
        vat: productData.vat,
        case_quantity: productData.caseQuantity,
        first_order_commission: productData.firstOrderCommission,
        next_orders_commission: productData.nextOrdersCommission,
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
      
      const newProduct: Product = {
        id: data.id,
        code: data.code,
        description: data.description,
        price: data.price,
        cost: data.cost,
        vat: data.vat,
        caseQuantity: data.case_quantity,
        firstOrderCommission: data.first_order_commission,
        nextOrdersCommission: data.next_orders_commission,
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
      const updateData: any = {};
      
      if (productData.code !== undefined) updateData.code = productData.code;
      if (productData.description !== undefined) updateData.description = productData.description;
      if (productData.price !== undefined) updateData.price = productData.price;
      if (productData.cost !== undefined) updateData.cost = productData.cost;
      if (productData.vat !== undefined) updateData.vat = productData.vat;
      if (productData.caseQuantity !== undefined) updateData.case_quantity = productData.caseQuantity;
      if (productData.firstOrderCommission !== undefined) updateData.first_order_commission = productData.firstOrderCommission;
      if (productData.nextOrdersCommission !== undefined) updateData.next_orders_commission = productData.nextOrdersCommission;
      
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
                caseQuantity: data.case_quantity,
                firstOrderCommission: data.first_order_commission,
                nextOrdersCommission: data.next_orders_commission,
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

  const getProductByCode = (code: string) => {
    return products.find(product => 
      product.code.toLowerCase() === code.toLowerCase()
    );
  };

  const importProducts = async (csvData: string) => {
    try {
      const lines = csvData.trim().split('\n');
      
      const startIndex = lines[0].toLowerCase().includes('code') ? 1 : 0;
      
      const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
      
      if (deleteError) {
        console.error('Error deleting existing products:', deleteError);
        throw new Error('Failed to delete existing products');
      }
      
      const importPromises = [];
      
      for (let i = startIndex; i < lines.length; i++) {
        const values = lines[i].split(',');
        
        if (values.length >= 4) {
          const [code, description, priceStr, costStr, vatStr, caseQuantityStr, firstOrderCommissionStr, nextOrdersCommissionStr] = values;
          
          const price = parseFloat(priceStr.trim());
          const cost = parseFloat(costStr.trim());
          const vat = vatStr ? parseFloat(vatStr.trim()) : 0;
          const caseQuantity = caseQuantityStr ? parseInt(caseQuantityStr.trim()) : null;
          const firstOrderCommission = firstOrderCommissionStr ? parseFloat(firstOrderCommissionStr.trim()) : null;
          const nextOrdersCommission = nextOrdersCommissionStr ? parseFloat(nextOrdersCommissionStr.trim()) : null;
          
          if (!isNaN(price) && !isNaN(cost)) {
            const productData = {
              code: code.trim(),
              description: description.trim(),
              price,
              cost,
              vat,
              case_quantity: caseQuantity,
              first_order_commission: firstOrderCommission,
              next_orders_commission: nextOrdersCommission,
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
      throw error;
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
