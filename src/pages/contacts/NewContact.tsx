
import { useState, useEffect } from "react";
import ContactForm from "@/components/contacts/ContactForm";
import { BusinessCardScanner } from "@/components/contacts/BusinessCardScanner";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ContactFormValues } from "@/components/contacts/form/types";

interface ScanResult {
  fullName?: string;
  company?: string;
  position?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  address?: string;
}

const NewContact = () => {
  const [showScanner, setShowScanner] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [key, setKey] = useState(0); // Add a key to force re-render of the form
  
  const handleScanComplete = (data: ScanResult) => {
    console.log("Scan completed with data:", data);
    setScanResult(data);
    setKey(prevKey => prevKey + 1); // Increment key to force re-render
  };
  
  return (
    <div className="space-y-4 max-w-4xl mx-auto px-2 sm:px-4 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-xl sm:text-2xl font-bold">Add New Contact</h1>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline"
                onClick={() => setShowScanner(true)}
                className="flex items-center gap-2 w-full sm:w-auto"
              >
                <Camera className="h-4 w-4" />
                Scan Business Card
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Scan a business card to automatically fill contact details</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <ContactForm 
        key={key} // Use the key to force re-render
        initialData={scanResult ? {
          fullName: scanResult.fullName || '',
          company: scanResult.company || '',
          position: scanResult.position || '',
          email: scanResult.email || '',
          phone: scanResult.phone || '',
          mobile: scanResult.mobile || '',
          address: scanResult.address || '',
        } : undefined}
      />
      
      <BusinessCardScanner
        open={showScanner}
        onOpenChange={setShowScanner}
        onScanComplete={handleScanComplete}
      />
    </div>
  );
};

export default NewContact;
