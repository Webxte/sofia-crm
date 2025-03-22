
import { useState, useEffect } from "react";
import { useProducts } from "@/context/ProductsContext";
import { useOrders } from "@/context/OrdersContext";
import { Product, OrderItem } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Search, Edit } from "lucide-react";

interface ProductSelectorProps {
  onAddItem: (item: OrderItem) => void;
}

const ProductSelector = ({ onAddItem }: ProductSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [productCode, setProductCode] = useState("");
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isManualMode, setIsManualMode] = useState(false);
  
  // Editable fields for manual mode
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number>(0);
  
  const { products, getProductByCode } = useProducts();
  const { createOrderItem } = useOrders();

  // Update editable fields when product changes
  useEffect(() => {
    if (product) {
      setDescription(product.description);
      setPrice(product.price);
    } else {
      setDescription("");
      setPrice(0);
    }
  }, [product]);

  const handleCodeSearch = () => {
    if (!productCode.trim()) return;
    
    const foundProduct = getProductByCode(productCode);
    setProduct(foundProduct || null);
    
    if (!foundProduct && !isManualMode) {
      // If product not found and not in manual mode, switch to manual mode
      setIsManualMode(true);
    }
  };
  
  const toggleManualMode = () => {
    setIsManualMode(!isManualMode);
    if (!isManualMode && !product) {
      // Clear fields when switching to manual mode without a product
      setDescription("");
      setPrice(0);
    }
  };

  const handleAddItem = () => {
    if (product || isManualMode) {
      let item: OrderItem;
      
      if (product && !isManualMode) {
        // Use existing product with system-calculated subtotal
        item = createOrderItem(product.id, quantity) as OrderItem;
      } else {
        // Create a custom item with manual data
        item = {
          id: Math.random().toString(36).substring(2, 9),
          productId: product?.id || Math.random().toString(36).substring(2, 9),
          code: productCode,
          description: description,
          price: price,
          quantity: quantity,
          subtotal: price * quantity,
          product: product || {
            id: Math.random().toString(36).substring(2, 9),
            code: productCode,
            description: description,
            price: price,
            cost: price * 0.7, // Estimate cost as 70% of price
            createdAt: new Date(),
            updatedAt: new Date()
          }
        };
      }
      
      onAddItem(item);
      setIsOpen(false);
      resetForm();
    }
  };

  const resetForm = () => {
    setProductCode("");
    setProduct(null);
    setQuantity(1);
    setDescription("");
    setPrice(0);
    setIsManualMode(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add Item
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Product to Order</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Label htmlFor="productCode" className="mb-2 block">
                Product Code
              </Label>
              <Input
                id="productCode"
                placeholder="Enter product code"
                value={productCode}
                onChange={(e) => setProductCode(e.target.value)}
              />
            </div>
            <Button type="button" onClick={handleCodeSearch}>
              <Search className="mr-2 h-4 w-4" /> Search
            </Button>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">
              {product ? "Product found" : "Product details"}
            </span>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={toggleManualMode}
              className="text-xs"
            >
              <Edit className="mr-1 h-3 w-3" />
              {isManualMode ? "Auto mode" : "Manual edit"}
            </Button>
          </div>
          
          <div className="border rounded-lg p-4 space-y-4">
            <div>
              <Label htmlFor="description" className="mb-2 block">
                Description
              </Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={!isManualMode && !!product}
              />
            </div>
            
            <div>
              <Label htmlFor="price" className="mb-2 block">
                Price (€)
              </Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                disabled={!isManualMode && !!product}
              />
            </div>
            
            <div>
              <Label htmlFor="quantity" className="mb-2 block">
                Quantity
              </Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />
            </div>
            
            <div>
              <Label className="block text-sm text-muted-foreground">Subtotal</Label>
              <p className="font-medium">€{((price || 0) * quantity).toFixed(2)}</p>
            </div>
          </div>

          {products.length === 0 && !isManualMode && (
            <div className="text-center p-4 border border-dashed rounded-lg">
              <p className="text-muted-foreground">No products available</p>
              <p className="text-sm text-muted-foreground mt-1">
                Use manual mode to add product details
              </p>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setIsOpen(false);
              resetForm();
            }}
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={handleAddItem}
            disabled={(!product && !isManualMode) || (isManualMode && (!description || price <= 0)) || quantity < 1}
          >
            Add to Order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProductSelector;
