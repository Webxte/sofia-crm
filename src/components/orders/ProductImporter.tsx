
import { useState } from "react";
import { useProducts } from "@/context/products/ProductsContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Upload } from "lucide-react";

interface ProductImporterProps {
  onClose?: () => void;
}

const ProductImporter = ({ onClose }: ProductImporterProps) => {
  const [open, setOpen] = useState(false);
  const [csvData, setCsvData] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { importProducts } = useProducts();
  const { toast } = useToast();

  const handleImport = () => {
    if (!csvData.trim()) {
      toast({
        title: "Error",
        description: "Please enter CSV data",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Parse CSV data
      const lines = csvData.trim().split("\n");
      
      // Import the raw CSV data which will be parsed in the context
      importProducts(csvData);
      
      // Show success message
      toast({
        title: "Success",
        description: `${lines.length} products imported`,
      });
      
      // Reset form and close dialog
      setCsvData("");
      setOpen(false);
      if (onClose) onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to parse CSV data. Please check the format.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="mr-2 h-4 w-4" /> Import Products
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Import Products</DialogTitle>
          <DialogDescription>
            Import products from CSV data.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-2">CSV Format Example</p>
            <code className="text-xs bg-muted p-2 rounded block overflow-x-auto whitespace-pre">
              code,description,price,cost,vat<br />
              P001,Product One,10.99,6.50,20<br />
              P002,Product Two,24.99,12.75,20
            </code>
          </div>
          <p className="text-sm text-muted-foreground">
            Enter or paste your CSV data below. The CSV should have the following columns: code, description, price, cost, vat
          </p>
          <Textarea
            value={csvData}
            onChange={(e) => setCsvData(e.target.value)}
            placeholder="P001,Product One,10.99,6.50,20"
            className="min-h-[200px] font-mono"
          />
        </div>
        <DialogFooter>
          <Button
            variant="default"
            onClick={handleImport}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Importing..." : "Import Products"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProductImporter;
