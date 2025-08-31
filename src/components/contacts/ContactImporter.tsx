import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useContacts } from "@/context/contacts/ContactsContext";
import { Upload, Check } from "lucide-react";

interface ContactImporterProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ContactImporter = ({ open, onOpenChange }: ContactImporterProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [hasUploaded, setHasUploaded] = useState(false);
  const { importContactsFromCsv, refreshContacts } = useContacts();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      if (!selectedFile.name.endsWith('.csv')) {
        toast.error("Invalid file format", {
          description: "Please upload a CSV file",
        });
        return;
      }
      
      setFile(selectedFile);
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast.error("No file selected", {
        description: "Please select a CSV file to import",
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      await importContactsFromCsv(file);
      await refreshContacts();
      
      setHasUploaded(true);
      toast.success("Import successful", {
        description: "Your contacts have been imported",
      });
    } catch (error) {
      console.error('Import error:', error);
      toast.error("Import failed", {
        description: "There was a problem importing your contacts",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setHasUploaded(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import Contacts</DialogTitle>
          <DialogDescription>
            Upload a CSV file to import contacts. The file should have headers matching contact fields.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="file">CSV File</Label>
              <div className="flex items-center gap-2">
                <Input 
                  id="file" 
                  type="file" 
                  accept=".csv" 
                  onChange={handleFileChange}
                  disabled={isUploading || hasUploaded}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Expected columns: full_name, email, phone, mobile, company, position, address, notes, source
              </p>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={handleClose}
            disabled={isUploading}
          >
            Cancel
          </Button>
          {hasUploaded ? (
            <Button onClick={handleClose} className="gap-2">
              <Check className="h-4 w-4" /> Done
            </Button>
          ) : (
            <Button 
              onClick={handleImport} 
              disabled={!file || isUploading}
              className="gap-2"
            >
              {isUploading ? (
                <>Importing...</>
              ) : (
                <>
                  <Upload className="h-4 w-4" /> Import
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ContactImporter;
