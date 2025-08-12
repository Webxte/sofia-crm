
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Package, Plus } from "lucide-react";
import { Product } from "@/types";
import { useProducts } from "@/context/products/ProductsContext";

interface ProductSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (product: Product) => void;
  selectedProducts?: Product[];
}

export const ProductSelector = ({
  open,
  onOpenChange,
  onSelect,
  selectedProducts = []
}: ProductSelectorProps) => {
  const { products, searchProducts, loading } = useProducts();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (searchQuery.trim()) {
      setFilteredProducts(searchProducts(searchQuery));
    } else {
      setFilteredProducts(products);
    }
  }, [searchQuery, products, searchProducts]);

  const isProductSelected = (product: Product) => {
    return selectedProducts.some(p => p.id === product.id);
  };

  const handleSelect = (product: Product) => {
    onSelect(product);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Select Product
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search products by code or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <ScrollArea className="h-[400px] pr-4">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery ? "No products found matching your search." : "No products available."}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className={`p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors ${
                      isProductSelected(product) ? 'bg-accent border-primary' : ''
                    }`}
                    onClick={() => handleSelect(product)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary" className="text-xs">
                            {product.code}
                          </Badge>
                          {isProductSelected(product) && (
                            <Badge variant="default" className="text-xs">
                              Selected
                            </Badge>
                          )}
                        </div>
                        <p className="font-medium truncate">{product.description}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span>Price: £{product.price.toFixed(2)}</span>
                          {product.caseQuantity && (
                            <span>Case: {product.caseQuantity}</span>
                          )}
                          {product.vat > 0 && (
                            <span>VAT: {product.vat}%</span>
                          )}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant={isProductSelected(product) ? "secondary" : "outline"}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelect(product);
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};
