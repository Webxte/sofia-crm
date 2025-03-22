
import { useState } from "react";
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
import { Plus } from "lucide-react";

interface ProductSelectorProps {
  onAddItem: (item: OrderItem) => void;
}

const ProductSelector = ({ onAddItem }: ProductSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [productCode, setProductCode] = useState("");
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const { products, getProductByCode } = useProducts();
  const { createOrderItem } = useOrders();

  const handleCodeSearch = () => {
    const foundProduct = getProductByCode(productCode);
    setProduct(foundProduct || null);
  };

  const handleAddItem = () => {
    if (product) {
      const item = createOrderItem(product.id, quantity);
      
      if (item) {
        onAddItem(item);
        setIsOpen(false);
        resetForm();
      }
    }
  };

  const resetForm = () => {
    setProductCode("");
    setProduct(null);
    setQuantity(1);
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
              Search
            </Button>
          </div>
          
          {product ? (
            <div className="border rounded-lg p-4 space-y-4">
              <div>
                <Label className="block text-sm text-muted-foreground">Description</Label>
                <p>{product.description}</p>
              </div>
              
              <div>
                <Label className="block text-sm text-muted-foreground">Price</Label>
                <p>${product.price.toFixed(2)}</p>
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
                <p className="font-medium">${(product.price * quantity).toFixed(2)}</p>
              </div>
            </div>
          ) : (
            productCode && (
              <div className="text-center p-4 border border-dashed rounded-lg">
                <p className="text-muted-foreground">No product found with code "{productCode}"</p>
              </div>
            )
          )}

          {products.length === 0 && (
            <div className="text-center p-4 border border-dashed rounded-lg">
              <p className="text-muted-foreground">No products available</p>
              <p className="text-sm text-muted-foreground mt-1">
                Ask an admin to upload products first
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
            disabled={!product || quantity < 1}
          >
            Add to Order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProductSelector;
