
import { useState } from "react";
import { Product } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { fetchProducts, formatProduct, parseProductCSV } from "./productsUtils";

export const useProductsOperations = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const refreshProducts = async () => {
    try {
      setLoading(true);
      const formattedProducts = await fetchProducts();
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
      
      const newProduct = formatProduct(data);
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
          product.id === id ? formatProduct(data) : product
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
      // Delete existing products
      const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
      
      if (deleteError) {
        console.error('Error deleting existing products:', deleteError);
        throw new Error('Failed to delete existing products');
      }
      
      // Parse and import products
      const productsToImport = parseProductCSV(csvData);
      
      const importPromises = productsToImport.map(productData => 
        supabase
          .from('products')
          .insert(productData)
          .select('*')
      );
      
      await Promise.all(importPromises);
      await refreshProducts();
      
      toast({
        title: "Success",
        description: `${productsToImport.length} products imported successfully`,
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

  return {
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
  };
};
