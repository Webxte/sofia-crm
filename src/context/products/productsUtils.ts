
import { Product } from "@/types";
import { supabase } from "@/integrations/supabase/client";

export const formatProduct = (data: any): Product => {
  return {
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
};

export const fetchProducts = async () => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('code', { ascending: true });
  
  if (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
  
  return data.map(formatProduct);
};

export const parseProductCSV = (csvData: string) => {
  const lines = csvData.trim().split('\n');
  const startIndex = lines[0].toLowerCase().includes('code') ? 1 : 0;
  const products = [];
  
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
        products.push({
          code: code.trim(),
          description: description.trim(),
          price,
          cost,
          vat,
          case_quantity: caseQuantity,
          first_order_commission: firstOrderCommission,
          next_orders_commission: nextOrdersCommission,
        });
      }
    }
  }
  
  return products;
};
