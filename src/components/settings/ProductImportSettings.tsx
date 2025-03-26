
import React, { useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProductImporter from "@/components/orders/ProductImporter";

interface ProductImportSettingsProps {
  importProductsFromFile: (file: File) => Promise<void>;
}

const ProductImportSettings = ({ importProductsFromFile }: ProductImportSettingsProps) => {
  const [fileImportLoading, setFileImportLoading] = useState(false);
  
  const handleFileDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    if (e.dataTransfer.files.length) {
      const file = e.dataTransfer.files[0];
      
      if (file.type === "text/csv" || file.name.endsWith(".csv")) {
        setFileImportLoading(true);
        
        try {
          await importProductsFromFile(file);
        } finally {
          setFileImportLoading(false);
        }
      }
    }
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
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
          <Button disabled={fileImportLoading}>
            {fileImportLoading ? "Importing..." : "Choose File"}
          </Button>
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
