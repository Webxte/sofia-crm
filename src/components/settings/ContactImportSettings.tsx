
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useContacts } from "@/context/ContactsContext";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";

const ContactImportSettings = () => {
  const { importContactsFromCsv } = useContacts();
  const [isUploading, setIsUploading] = useState(false);
  const [lastImported, setLastImported] = useState<string | null>(null);
  const [defaultSource, setDefaultSource] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user, isAdmin } = useAuth();

  // Only admins should be able to access this component
  if (!isAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Import Contacts</CardTitle>
          <CardDescription>
            You need administrator access to import contacts.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

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
      // If there's a default source specified, rename the file to use that source
      // This ensures the source is used when no source column exists in the CSV
      let fileToUpload = file;
      if (defaultSource) {
        // Create a new file with the default source name (will be used if no source column)
        fileToUpload = new File([file], `${defaultSource}.csv`, { type: file.type });
      }
      
      await importContactsFromCsv(fileToUpload);
      setLastImported(file.name);
      
      toast({
        title: "Contacts imported successfully",
        description: defaultSource 
          ? `Contacts tagged with source: ${defaultSource}`
          : "Contacts have been imported with their specified sources",
      });
    } catch (error) {
      console.error('Error importing file:', error);
      toast({
        title: "Import failed",
        description: "There was an error importing the contacts",
        variant: "destructive"
      });
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
        <CardDescription>
          Import contacts from a CSV file. All contacts will be accessible to everyone, but can be filtered by source/agent tag.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Label htmlFor="default-source">Default Source/Agent Tag</Label>
          <div className="flex gap-2 mt-1">
            <Input 
              id="default-source"
              value={defaultSource} 
              onChange={(e) => setDefaultSource(e.target.value)}
              placeholder={user?.name || "Enter source or agent name"}
            />
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            <Info className="inline w-4 h-4 mr-1" />
            If your CSV doesn't have a "source" column, this value will be used to tag all imported contacts.
          </p>
        </div>
        
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
          <p className="text-sm text-muted-foreground mt-2 flex items-start">
            <Info className="inline-block flex-shrink-0 w-4 h-4 mr-1 mt-0.5" />
            <span>
              The "source" column is optional. If provided, it will be used as a tag for filtering contacts.
              If not provided, the default source above will be used (or the filename without extension if no default is set).
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContactImportSettings;
