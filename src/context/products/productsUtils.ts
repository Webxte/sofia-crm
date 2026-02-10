
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
  
  console.log("Processing CSV with lines:", lines.length);
  
  for (let i = startIndex; i < lines.length; i++) {
    const values = lines[i].split(',');
    
    if (values.length >= 4) {
      const [code, description, priceStr, costStr, vatStr, caseQuantityStr, firstOrderCommissionStr, nextOrdersCommissionStr] = values;
      
      // Strip currency symbols (€, $, £, etc.) before parsing
      const price = parseFloat(priceStr.trim().replace(/[€$£¥]/g, ''));
      const cost = parseFloat(costStr.trim().replace(/[€$£¥]/g, ''));
      
      // Important fix: explicitly handle VAT values - null/undefined/empty values should be stored as 0
      // Use explicit 0 instead of null for vat field to ensure consistent behavior
      let vat = 0;
      if (vatStr !== undefined && vatStr.trim() !== '') {
        const parsedVat = parseFloat(vatStr.trim());
        vat = !isNaN(parsedVat) ? parsedVat : 0;
      }
      console.log(`Product ${code}: VAT value from CSV: '${vatStr}', parsed as: ${vat}`);
      
      // Ensure case quantity is properly parsed (default to null if not provided)
      let caseQuantity = null;
      if (caseQuantityStr && caseQuantityStr.trim() !== '') {
        caseQuantity = parseInt(caseQuantityStr.trim(), 10);
      }
      
      // Parse commission values (default to null if not provided)
      let firstOrderCommission = null;
      if (firstOrderCommissionStr && firstOrderCommissionStr.trim() !== '') {
        firstOrderCommission = parseFloat(firstOrderCommissionStr.trim());
      }
      
      let nextOrdersCommission = null;
      if (nextOrdersCommissionStr && nextOrdersCommissionStr.trim() !== '') {
        nextOrdersCommission = parseFloat(nextOrdersCommissionStr.trim());
      }
      
      if (!isNaN(price) && !isNaN(cost)) {
        products.push({
          code: code.trim(),
          description: description.trim(),
          price,
          cost,
          vat,  // Specifically use our parsed vat value, which defaults to 0
          case_quantity: caseQuantity,
          first_order_commission: firstOrderCommission,
          next_orders_commission: nextOrdersCommission,
        });
      }
    }
  }
  
  console.log(`Parsed ${products.length} products from CSV`);
  return products;
};
