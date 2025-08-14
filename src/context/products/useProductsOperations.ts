
import React, { useState, useCallback } from "react";
import { toast } from "@/utils/toast";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types";
import { parseProductCSV } from "./productsUtils";
import { useAuth } from "@/context/AuthContext";

export const useProductsOperations = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const { isAdmin } = useAuth();

  const fetchProducts = useCallback(async () => {
    // Prevent multiple simultaneous fetches
    if (isFetching) {
      console.log("Already fetching products, skipping...");
      return;
    }

    try {
      setIsFetching(true);
      setLoading(true);
      console.log("Fetching products...");
      
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching products:", error);
        throw error;
      }

      const formattedProducts: Product[] = (data || []).map((product) => ({
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
      console.log(`Fetched ${formattedProducts.length} products`);
    } catch (error) {
      console.error("Error in fetchProducts:", error);
      setProducts([]); // Clear products on error
      toast.error("Error", {
        description: "Failed to load products. Please check your connection.",
      });
    } finally {
      setLoading(false);
      setIsFetching(false);
    }
  }, [isFetching]);

  const addProduct = useCallback(async (productData: Omit<Product, "id" | "createdAt" | "updatedAt">) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("products")
        .insert([{
          code: productData.code,
          description: productData.description,
          price: productData.price,
          cost: productData.cost,
          vat: productData.vat,
          case_quantity: productData.caseQuantity,
          first_order_commission: productData.firstOrderCommission,
          next_orders_commission: productData.nextOrdersCommission,
        }])
        .select()
        .single();

      if (error) throw error;

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

      setProducts(prev => [newProduct, ...prev]);
      
      toast.success("Success", {
        description: "Product added successfully",
      });

      return newProduct;
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error("Error", {
        description: "Failed to add product",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProduct = useCallback(async (id: string, productData: Partial<Product>) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("products")
        .update({
          code: productData.code,
          description: productData.description,
          price: productData.price,
          cost: productData.cost,
          vat: productData.vat,
          case_quantity: productData.caseQuantity,
          first_order_commission: productData.firstOrderCommission,
          next_orders_commission: productData.nextOrdersCommission,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      const updatedProduct: Product = {
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

      setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p));
      
      toast.success("Success", {
        description: "Product updated successfully",
      });

      return updatedProduct;
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Error", {
        description: "Failed to update product",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteProduct = useCallback(async (id: string) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setProducts(prev => prev.filter(p => p.id !== id));
      
      toast.success("Success", {
        description: "Product deleted successfully",
      });

      return true;
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Error", {
        description: "Failed to delete product",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const getProductById = useCallback((id: string) => {
    return products.find(product => product.id === id);
  }, [products]);

  const getProductByCode = useCallback((code: string) => {
    return products.find(product => product.code === code);
  }, [products]);

  const searchProducts = useCallback((query: string) => {
    const lowercaseQuery = query.toLowerCase();
    return products.filter(product => 
      product.code.toLowerCase().includes(lowercaseQuery) ||
      product.description.toLowerCase().includes(lowercaseQuery)
    );
  }, [products]);

  const importProductsFromFile = useCallback(async (file: File) => {
    try {
      setLoading(true);
      console.log("Starting file import for:", file.name);
      
      const text = await file.text();
      await importProducts(text);
      
      console.log("File import completed successfully");
    } catch (error) {
      console.error("Error importing file:", error);
      toast.error("Error", {
        description: "Failed to import products from file",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const importProductsFromCsv = useCallback(async (file: File) => {
    await importProductsFromFile(file);
  }, [importProductsFromFile]);

  const importProducts = useCallback(async (csvData: string) => {
    try {
      setLoading(true);
      console.log("Starting CSV import with data length:", csvData.length);
      
      // Parse the CSV data
      const parsedProducts = parseProductCSV(csvData);
      console.log("Parsed products count:", parsedProducts.length);
      
      if (parsedProducts.length === 0) {
        toast.error("Error", {
          description: "No valid products found in CSV data",
        });
        return;
      }

      // Only admins can import products; perform upsert to avoid data loss
      if (!isAdmin) {
        toast.error("Permission denied", {
          description: "Only admins can import products.",
        });
        return;
      }

      // Upsert new/updated products in batches (conflict on code)
      const batchSize = 100;
      let insertedCount = 0;

      for (let i = 0; i < parsedProducts.length; i += batchSize) {
        const batch = parsedProducts.slice(i, i + batchSize);

        const { error: upsertError } = await supabase
          .from("products")
          .upsert(batch, { onConflict: "code" });

        if (upsertError) {
          console.error("Error upserting product batch:", upsertError);
          throw upsertError;
        }

        insertedCount += batch.length;
        console.log(`Processed batch: ${insertedCount}/${parsedProducts.length} products`);
      }

      // Refresh the products list
      await fetchProducts();
      
      toast.success("Success", {
        description: `Successfully imported ${insertedCount} products`,
      });
      
      console.log(`Import completed: ${insertedCount} products imported`);
    } catch (error) {
      console.error("Error importing products:", error);
      toast.error("Error", {
        description: "Failed to import products. Please check the CSV format.",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchProducts, isAdmin]);

  const refreshProducts = useCallback(async () => {
    await fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    addProduct,
    updateProduct,
    deleteProduct,
    getProductById,
    getProductByCode,
    searchProducts,
    refreshProducts,
    importProductsFromCsv,
    importProductsFromFile,
    importProducts,
    fetchProducts,
  };
};
