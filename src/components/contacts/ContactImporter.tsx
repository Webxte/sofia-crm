
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useContacts } from "@/context/contacts/ContactsContext";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ContactImporter = () => {
  const { importContactsFromCsv } = useContacts();
  const [isUploading, setIsUploading] = useState(false);
  const [lastImported, setLastImported] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV file",
        variant: "destructive",
      });
      return;
    }

    await importFile(file);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    
    const files = event.dataTransfer.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV file",
        variant: "destructive",
      });
      return;
    }

    await importFile(file);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const importFile = async (file: File) => {
    setIsUploading(true);
    try {
      await importContactsFromCsv(file);
      setLastImported(file.name);
    } catch (error) {
      console.error('Error importing file:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import Contacts</CardTitle>
      </CardHeader>
      <CardContent>
        <div 
          className="border-2 border-dashed rounded-lg p-8 text-center"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
          <h3 className="text-lg font-medium mb-1">Drag & Drop CSV File</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Or use the button below to select a file
          </p>
          
          <input 
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".csv"
            className="hidden"
          />
          
          <Button 
            onClick={handleButtonClick}
            disabled={isUploading}
          >
            {isUploading ? "Importing..." : "Choose File"}
          </Button>
          
          {lastImported && (
            <p className="mt-2 text-sm text-muted-foreground">
              Last imported: {lastImported}
            </p>
          )}
        </div>

        <div className="mt-6 bg-muted p-4 rounded-lg">
          <h4 className="font-medium mb-2">CSV Format Example</h4>
          <div className="overflow-auto">
            <code className="text-xs block whitespace-pre">
              name,company,email,phone,mobile,address,position,notes,source<br/>
              John Doe,Acme Inc,john@example.com,555-1234,555-5678,123 Main St,Manager,Notes here,Office1<br/>
              Jane Smith,XYZ Corp,jane@example.com,555-8765,555-4321,456 Elm St,Director,More notes,Office2
            </code>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            The "source" column will be used as a tag for filtering contacts. If not provided, 
            the filename (without extension) will be used as the source.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContactImporter;
