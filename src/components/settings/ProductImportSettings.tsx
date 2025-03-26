
import React, { useState, useRef } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProductImporter from "@/components/orders/ProductImporter";
import { useToast } from "@/hooks/use-toast";

interface ProductImportSettingsProps {
  importProductsFromFile: (file: File) => Promise<void>;
}

const ProductImportSettings = ({ importProductsFromFile }: ProductImportSettingsProps) => {
  const [fileImportLoading, setFileImportLoading] = useState(false);
  const [lastImportedFile, setLastImportedFile] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const handleFileDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    if (e.dataTransfer.files.length) {
      const file = e.dataTransfer.files[0];
      
      if (file.type === "text/csv" || file.name.endsWith(".csv")) {
        await processFile(file);
      } else {
        toast({
          title: "Invalid File Type",
          description: "Please upload a CSV file",
          variant: "destructive",
        });
      }
    }
  };
  
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      if (file.type === "text/csv" || file.name.endsWith(".csv")) {
        await processFile(file);
      } else {
        toast({
          title: "Invalid File Type",
          description: "Please upload a CSV file",
          variant: "destructive",
        });
      }
      
      // Reset the file input so the same file can be selected again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };
  
  const processFile = async (file: File) => {
    try {
      setFileImportLoading(true);
      // Store the name of the imported file
      setLastImportedFile(file.name);
      
      await importProductsFromFile(file);
      
      toast({
        title: "Success",
        description: `File "${file.name}" imported successfully`,
      });
    } catch (error) {
      console.error("Error importing file:", error);
      toast({
        title: "Import Failed",
        description: "There was an error importing the file",
        variant: "destructive",
      });
    } finally {
      setFileImportLoading(false);
    }
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };
  
  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Import</CardTitle>
      </CardHeader>
      <CardContent>
        <div 
          className="border-2 border-dashed rounded-lg p-8 text-center mb-6"
          onDrop={handleFileDrop}
          onDragOver={handleDragOver}
        >
          <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
          <h3 className="text-lg font-medium mb-1">Drag & Drop CSV File</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Or paste your CSV data below
          </p>
          
          {/* Hidden file input */}
          <input 
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept=".csv"
            className="hidden"
          />
          
          <Button 
            onClick={handleButtonClick}
            disabled={fileImportLoading}
          >
            {fileImportLoading ? "Importing..." : "Choose File"}
          </Button>
          
          {lastImportedFile && (
            <p className="mt-2 text-sm text-muted-foreground">
              Last imported: {lastImportedFile}
            </p>
          )}
        </div>
        
        <div className="bg-muted p-4 rounded-lg mb-6">
          <h4 className="font-medium mb-2">CSV Format Example</h4>
          <code className="text-xs block whitespace-pre">
            code,description,price,cost,vat,caseQuantity,firstOrderCommission,nextOrdersCommission<br />
            P001,Product One,10.99,6.50,20,24,5,2.5<br />
            P002,Product Two,24.99,12.75,20,12,5,2.5
          </code>
        </div>
        
        <ProductImporter />
      </CardContent>
    </Card>
  );
};

export default ProductImportSettings;
