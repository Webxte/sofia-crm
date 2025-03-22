
import { useState } from "react";
import { useProducts } from "@/context/ProductsContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Upload } from "lucide-react";

const ProductImporter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [csvData, setCsvData] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const { importProducts } = useProducts();
  const { toast } = useToast();

  const handleImport = async () => {
    if (!csvData.trim()) {
      return toast({
        title: "Error",
        description: "Please enter CSV data",
        variant: "destructive",
      });
    }
    
    setIsImporting(true);
    
    try {
      importProducts(csvData);
      toast({
        title: "Success",
        description: "Products imported successfully",
      });
      setIsOpen(false);
      setCsvData("");
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to import products. Please check your CSV format.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="mr-2 h-4 w-4" /> Import Products
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import Products from CSV</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            Enter or paste your CSV data below. The CSV should have the following columns:
            code, description, price, cost
          </p>
          
          <p className="text-sm text-muted-foreground">
            Example:
            <br />
            <code>
              P001,Product One,10.99,6.50
              <br />
              P002,Product Two,24.99,12.75
            </code>
          </p>
          
          <Textarea
            placeholder="Paste your CSV data here..."
            className="min-h-[200px] font-mono"
            value={csvData}
            onChange={(e) => setCsvData(e.target.value)}
          />
        </div>
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleImport} disabled={isImporting}>
            {isImporting ? "Importing..." : "Import Products"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProductImporter;
