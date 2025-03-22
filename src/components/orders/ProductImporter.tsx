
import { useState } from "react";
import { useProducts } from "@/context/ProductsContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Upload } from "lucide-react";

interface ProductImporterProps {
  onClose?: () => void;
}

const ProductImporter = ({ onClose }: ProductImporterProps) => {
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
      setCsvData("");
      if (onClose) onClose();
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
    <div className="space-y-4">
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
      
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="button" onClick={handleImport} disabled={isImporting}>
          {isImporting ? "Importing..." : "Import Products"}
          {!isImporting && <Upload className="ml-2 h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
};

export default ProductImporter;
