
import { useEffect, useState, useRef } from "react";
import { useProducts } from "@/context/ProductsContext";
import { FormControl } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Product } from "@/types";
import { Plus, X } from "lucide-react";
import { useOrders } from "@/context/OrdersContext";

interface ProductSelectorProps {
  onProductSelected: (product: Product, quantity: number) => void;
  onTabSuccess?: () => void;
}

export const ProductSelector = ({ onProductSelected, onTabSuccess }: ProductSelectorProps) => {
  const { products } = useProducts();
  const { createOrderItem } = useOrders();
  const [code, setCode] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const codeInputRef = useRef<HTMLInputElement>(null);
  const quantityInputRef = useRef<HTMLInputElement>(null);
  const addButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (code.length >= 2) {
      const filtered = products
        .filter((product) => product.code.toLowerCase().includes(code.toLowerCase()))
        .slice(0, 10); // Limit to 10 suggestions
      setFilteredProducts(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setFilteredProducts([]);
      setShowSuggestions(false);
    }
  }, [code, products]);

  const handleSelectProduct = (product: Product) => {
    setCode("");
    setFilteredProducts([]);
    setShowSuggestions(false);
    
    // If product has caseQuantity, use it as default
    const defaultQuantity = product.caseQuantity && product.caseQuantity > 0 ? product.caseQuantity : 1;
    onProductSelected(product, defaultQuantity);
    
    // Focus back on code input for next product
    setTimeout(() => {
      if (codeInputRef.current) {
        codeInputRef.current.focus();
      }
    }, 10);
  };

  const handleAddProduct = () => {
    const product = products.find((p) => p.code.toLowerCase() === code.toLowerCase());
    if (product) {
      handleSelectProduct(product);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab') {
      if (e.currentTarget === codeInputRef.current) {
        // If we have suggestions and Tab is pressed while in code field
        if (filteredProducts.length > 0) {
          e.preventDefault();
          handleSelectProduct(filteredProducts[0]);
        } else if (code) {
          // Try to find exact match
          const product = products.find((p) => p.code.toLowerCase() === code.toLowerCase());
          if (product) {
            e.preventDefault();
            handleSelectProduct(product);
          }
        }
      } else if (e.currentTarget === quantityInputRef.current && !e.shiftKey) {
        // If Tab is pressed on the quantity field
        e.preventDefault();
        if (addButtonRef.current) {
          addButtonRef.current.focus();
        }
      }
    }
  };

  // Create a button-specific key handler that matches ButtonElement type
  const handleButtonKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault();
      handleAddProduct();
      if (codeInputRef.current) {
        codeInputRef.current.focus();
      }
      if (onTabSuccess) {
        onTabSuccess();
      }
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-start space-x-2 relative">
        <div className="flex-1 relative">
          <FormControl>
            <Input
              ref={codeInputRef}
              placeholder="Enter product code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="off"
            />
          </FormControl>
          
          {showSuggestions && (
            <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white rounded-md shadow-lg border border-border max-h-60 overflow-y-auto">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="px-4 py-2 hover:bg-muted cursor-pointer flex items-center justify-between"
                  onClick={() => handleSelectProduct(product)}
                >
                  <div>
                    <div className="font-medium">{product.code}</div>
                    <div className="text-sm text-muted-foreground truncate">{product.description}</div>
                  </div>
                  <div className="text-sm">€{product.price.toFixed(2)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <FormControl>
          <Input
            ref={quantityInputRef}
            type="number"
            min="1"
            className="w-24"
            placeholder="Qty"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
            onKeyDown={handleKeyDown}
          />
        </FormControl>
        
        <Button 
          ref={addButtonRef}
          type="button" 
          size="sm" 
          onClick={handleAddProduct}
          className="flex-shrink-0"
          tabIndex={0}
          onKeyDown={handleButtonKeyDown}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
