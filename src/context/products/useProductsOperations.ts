import { useState, useCallback } from "react";
import { Product } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useOrganizations } from "@/context/organizations/OrganizationsContext";
import { useToast } from "@/hooks/use-toast";
import Papa from "papaparse";
import { ProductsContextType } from "./types";

export const useProductsOperations = (): ProductsContextType => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const { currentOrganization } = useOrganizations();
  const { toast } = useToast();

  const refreshProducts = useCallback(async () => {
    if (!currentOrganization) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("organization_id", currentOrganization.id)
        .order("code");

      if (error) throw error;

      const transformedProducts: Product[] = data.map(item => ({
        id: item.id,
        organizationId: item.organization_id,
        code: item.code,
        description: item.description,
        price: Number(item.price),
        cost: Number(item.cost),
        vat: item.vat ? Number(item.vat) : undefined,
        caseQuantity: item.case_quantity || undefined,
        firstOrderCommission: item.first_order_commission ? Number(item.first_order_commission) : undefined,
        nextOrdersCommission: item.next_orders_commission ? Number(item.next_orders_commission) : undefined,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at),
      }));

      setProducts(transformedProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [currentOrganization, toast]);

  const addProduct = useCallback(async (productData: Omit<Product, "id" | "createdAt" | "updatedAt">): Promise<Product | null> => {
    if (!currentOrganization) return null;

    try {
      const { data, error } = await supabase
        .from("products")
        .insert([{
          organization_id: currentOrganization.id,
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
        organizationId: data.organization_id,
        code: data.code,
        description: data.description,
        price: Number(data.price),
        cost: Number(data.cost),
        vat: data.vat ? Number(data.vat) : undefined,
        caseQuantity: data.case_quantity || undefined,
        firstOrderCommission: data.first_order_commission ? Number(data.first_order_commission) : undefined,
        nextOrdersCommission: data.next_orders_commission ? Number(data.next_orders_commission) : undefined,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };

      setProducts(prev => [...prev, newProduct]);
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
      return null;
    }
  }, [currentOrganization, toast]);

  const updateProduct = useCallback(async (id: string, productData: Partial<Product>): Promise<Product | null> => {
    try {
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
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      const updatedProduct: Product = {
        id: data.id,
        organizationId: data.organization_id,
        code: data.code,
        description: data.description,
        price: Number(data.price),
        cost: Number(data.cost),
        vat: data.vat ? Number(data.vat) : undefined,
        caseQuantity: data.case_quantity || undefined,
        firstOrderCommission: data.first_order_commission ? Number(data.first_order_commission) : undefined,
        nextOrdersCommission: data.next_orders_commission ? Number(data.next_orders_commission) : undefined,
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
      return null;
    }
  }, [toast]);

  const deleteProduct = useCallback(async (id: string): Promise<boolean> => {
    try {
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
    }
  }, [toast]);

  const getProductById = useCallback((id: string): Product | undefined => {
    return products.find(p => p.id === id);
  }, [products]);

  const getProductByCode = useCallback((code: string): Product | undefined => {
    return products.find(p => p.code === code);
  }, [products]);

  const searchProducts = useCallback((query: string): Product[] => {
    if (!query.trim()) return products;
    
    const lowercaseQuery = query.toLowerCase();
    return products.filter(product =>
      product.code.toLowerCase().includes(lowercaseQuery) ||
      product.description.toLowerCase().includes(lowercaseQuery)
    );
  }, [products]);

  const importProductsFromCsv = useCallback(async (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        complete: async (results) => {
          try {
            await importProducts(Papa.unparse(results.data));
            resolve();
          } catch (error) {
            reject(error);
          }
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  }, []);

  const importProductsFromFile = useCallback(async (file: File): Promise<void> => {
    return importProductsFromCsv(file);
  }, [importProductsFromCsv]);

  const importProducts = useCallback(async (csvData: string): Promise<void> => {
    if (!currentOrganization) {
      throw new Error("No organization selected");
    }

    try {
      const lines = csvData.trim().split("\n");
      const headers = lines[0].split(",").map(h => h.trim());
      
      // Validate headers
      const requiredHeaders = ["code", "description", "price", "cost"];
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
      
      if (missingHeaders.length > 0) {
        throw new Error(`Missing required headers: ${missingHeaders.join(", ")}`);
      }

      const productsToInsert = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map(v => v.trim());
        const productObj: any = {};
        
        headers.forEach((header, index) => {
          productObj[header] = values[index] || "";
        });

        // Validate required fields
        if (!productObj.code || !productObj.description || !productObj.price || !productObj.cost) {
          console.warn(`Skipping row ${i + 1}: Missing required fields`);
          continue;
        }

        productsToInsert.push({
          organization_id: currentOrganization.id,
          code: productObj.code,
          description: productObj.description,
          price: parseFloat(productObj.price) || 0,
          cost: parseFloat(productObj.cost) || 0,
          vat: productObj.vat ? parseFloat(productObj.vat) : null,
          case_quantity: productObj.case_quantity ? parseInt(productObj.case_quantity) : null,
          first_order_commission: productObj.first_order_commission ? parseFloat(productObj.first_order_commission) : null,
          next_orders_commission: productObj.next_orders_commission ? parseFloat(productObj.next_orders_commission) : null,
        });
      }

      if (productsToInsert.length === 0) {
        throw new Error("No valid products found in CSV data");
      }

      const { data, error } = await supabase
        .from("products")
        .insert(productsToInsert)
        .select();

      if (error) throw error;

      toast({
        title: "Success",
        description: `Imported ${data.length} products successfully`,
      });

      // Refresh the products list
      await refreshProducts();
    } catch (error) {
      console.error("Error importing products:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to import products",
        variant: "destructive",
      });
      throw error;
    }
  }, [currentOrganization, toast, refreshProducts]);

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
  };
};
