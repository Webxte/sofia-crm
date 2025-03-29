
import { OrderItem, Product } from "@/types";
import { useProducts } from "@/context/products/ProductsContext";

export const useOrderItems = () => {
  const { getProductById } = useProducts();

  const createOrderItem = (productId: string, quantity: number): OrderItem | undefined => {
    const product = getProductById(productId);
    
    if (!product) return undefined;
    
    return {
      id: Math.random().toString(36).substring(2, 9),
      productId: product.id,
      code: product.code,
      description: product.description,
      price: product.price,
      quantity,
      vat: product.vat || 0,
      subtotal: product.price * quantity,
      product,
    };
  };

  return {
    createOrderItem
  };
};
