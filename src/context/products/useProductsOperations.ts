
import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types";

export const useProductsOperations = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchProducts = useCallback(async () => {
    try {
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
      toast({
        title: "Error",
        description: "Failed to load products. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

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
      
      toast({
        title: "Success",
        description: "Product added successfully",
      });

      return newProduct;
    } catch (error) {
      console.error("Error adding product:", error);
      toast({
        title: "Error",
        description: "Failed to add product",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

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
      
      toast({
        title: "Success",
        description: "Product updated successfully",
      });

      return updatedProduct;
    } catch (error) {
      console.error("Error updating product:", error);
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const deleteProduct = useCallback(async (id: string) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setProducts(prev => prev.filter(p => p.id !== id));
      
      toast({
        title: "Success",
        description: "Product deleted successfully",
      });

      return true;
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

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
    console.log("Import products from file:", file.name);
    toast({
      title: "Info",
      description: "Product import functionality not implemented yet",
    });
  }, [toast]);

  const importProductsFromCsv = useCallback(async (file: File) => {
    await importProductsFromFile(file);
  }, [importProductsFromFile]);

  const importProducts = useCallback(async (csvData: string) => {
    console.log("Import products from CSV data:", csvData);
    toast({
      title: "Info",
      description: "CSV import functionality not implemented yet",
    });
  }, [toast]);

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
