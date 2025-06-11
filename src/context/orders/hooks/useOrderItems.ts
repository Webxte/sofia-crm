
import { OrderItem, Product } from "@/types";
import { useProducts } from "@/context/products/ProductsContext";
import { useSettings } from "@/context/settings";

export const useOrderItems = () => {
  const { getProductById } = useProducts();
  const { settings } = useSettings();

  const createOrderItem = (productId: string, quantity: number): OrderItem | undefined => {
    const product = getProductById(productId);
    
    if (!product) return undefined;
    
    // Use product VAT if available, otherwise use settings default VAT rate (should be 0%)
    const vatRate = product.vat !== undefined ? product.vat : (settings?.defaultVatRate || 0);
    
    console.log("useOrderItems: Creating order item for product", product.code, "with VAT rate:", vatRate);
    
    return {
      id: Math.random().toString(36).substring(2, 9),
      productId: product.id,
      code: product.code,
      description: product.description,
      price: product.price,
      quantity,
      vat: vatRate,
      subtotal: product.price * quantity,
      product,
    };
  };

  return {
    createOrderItem
  };
};
