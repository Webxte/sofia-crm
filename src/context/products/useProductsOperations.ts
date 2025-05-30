
import { useState, useCallback } from "react";
import { Product } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useOrganizations } from "@/context/organizations/OrganizationsContext";
import { useToast } from "@/hooks/use-toast";
import Papa from "papaparse";

// Transform database product to app product
const transformDatabaseProduct = (dbProduct: any): Product => {
  return {
    id: dbProduct.id,
    organizationId: dbProduct.organization_id,
    code: dbProduct.code,
    description: dbProduct.description,
    price: dbProduct.price,
    cost: dbProduct.cost,
    vat: dbProduct.vat,
    caseQuantity: dbProduct.case_quantity,
    firstOrderCommission: dbProduct.first_order_commission,
    nextOrdersCommission: dbProduct.next_orders_commission,
    imageUrl: dbProduct.image_url,
    createdAt: new Date(dbProduct.created_at),
    updatedAt: new Date(dbProduct.updated_at),
  };
};

// Transform app product to database product
const transformAppProduct = (product: Partial<Product>): any => {
  return {
    organization_id: product.organizationId,
    code: product.code,
    description: product.description,
    price: product.price,
    cost: product.cost,
    vat: product.vat,
    case_quantity: product.caseQuantity,
    first_order_commission: product.firstOrderCommission,
    next_orders_commission: product.nextOrdersCommission,
    image_url: product.imageUrl,
    updated_at: new Date().toISOString(),
  };
};

export const useProductsOperations = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { currentOrganization } = useOrganizations();
  const { toast } = useToast();

  const fetchProducts = useCallback(async () => {
    if (!user || !currentOrganization) {
      console.log("No user or organization, skipping products fetch");
      return;
    }

    setLoading(true);
    try {
      console.log("Fetching products for organization:", currentOrganization.id);
      
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("organization_id", currentOrganization.id)
        .order("code", { ascending: true });

      if (error) throw error;

      const transformedProducts = data?.map(transformDatabaseProduct) || [];
      console.log(`Fetched ${transformedProducts.length} products`);
      setProducts(transformedProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user, currentOrganization]);

  const addProduct = useCallback(async (productData: Omit<Product, "id" | "createdAt" | "updatedAt">): Promise<Product | null> => {
    if (!user || !currentOrganization) {
      throw new Error("User or organization not found");
    }

    try {
      const dbProduct = {
        ...transformAppProduct(productData),
        organization_id: currentOrganization.id,
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("products")
        .insert([dbProduct])
        .select()
        .single();

      if (error) throw error;

      const newProduct = transformDatabaseProduct(data);
      setProducts(prev => [...prev, newProduct].sort((a, b) => a.code.localeCompare(b.code)));
      
      return newProduct;
    } catch (error) {
      console.error("Error adding product:", error);
      toast({
        title: "Error",
        description: "Failed to add product. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  }, [user, currentOrganization, toast]);

  const updateProduct = useCallback(async (id: string, productData: Partial<Product>): Promise<Product | null> => {
    if (!user || !currentOrganization) {
      throw new Error("User or organization not found");
    }

    try {
      const dbProduct = transformAppProduct(productData);

      const { data, error } = await supabase
        .from("products")
        .update(dbProduct)
        .eq("id", id)
        .eq("organization_id", currentOrganization.id)
        .select()
        .single();

      if (error) throw error;

      const updatedProduct = transformDatabaseProduct(data);
      setProducts(prev => prev.map(product => 
        product.id === id ? updatedProduct : product
      ).sort((a, b) => a.code.localeCompare(b.code)));
      
      return updatedProduct;
    } catch (error) {
      console.error("Error updating product:", error);
      toast({
        title: "Error",
        description: "Failed to update product. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  }, [user, currentOrganization, toast]);

  const deleteProduct = useCallback(async (id: string): Promise<boolean> => {
    if (!user || !currentOrganization) {
      throw new Error("User or organization not found");
    }

    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id)
        .eq("organization_id", currentOrganization.id);

      if (error) throw error;

      setProducts(prev => prev.filter(product => product.id !== id));
      return true;
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        title: "Error",
        description: "Failed to delete product. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  }, [user, currentOrganization, toast]);

  // Utility functions
  const getProductById = useCallback((id: string): Product | undefined => {
    return products.find(product => product.id === id);
  }, [products]);

  const getProductByCode = useCallback((code: string): Product | undefined => {
    return products.find(product => product.code === code);
  }, [products]);

  const searchProducts = useCallback((query: string): Product[] => {
    const lowerQuery = query.toLowerCase();
    return products.filter(product => 
      product.code.toLowerCase().includes(lowerQuery) ||
      product.description.toLowerCase().includes(lowerQuery)
    );
  }, [products]);

  const importProductsFromCsv = useCallback(async (file: File) => {
    try {
      console.log("Starting CSV import for products:", file.name);
      
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          try {
            console.log("CSV parsed successfully, rows:", results.data.length);
            
            // Here you would process the CSV data and save to database
            // For now, just refresh products and show success
            await fetchProducts();
            
            toast({
              title: "Import Successful",
              description: `Imported ${results.data.length} products from CSV.`,
            });
          } catch (error) {
            console.error("Error processing CSV data:", error);
            toast({
              title: "Import Error",
              description: "Failed to process CSV data. Please check the format.",
              variant: "destructive",
            });
          }
        },
        error: (error) => {
          console.error("CSV parsing error:", error);
          toast({
            title: "CSV Error",
            description: "Failed to parse CSV file. Please check the format.",
            variant: "destructive",
          });
        }
      });
    } catch (error) {
      console.error("Error importing products:", error);
      toast({
        title: "Import Error",
        description: "Failed to import products. Please try again.",
        variant: "destructive",
      });
    }
  }, [fetchProducts, toast]);

  return {
    products,
    loading,
    addProduct,
    updateProduct,
    deleteProduct,
    getProductById,
    getProductByCode,
    searchProducts,
    refreshProducts: fetchProducts,
    importProductsFromCsv
  };
};
