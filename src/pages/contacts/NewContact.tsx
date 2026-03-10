
import { useState } from "react";
import ContactForm from "@/components/contacts/ContactForm";
import { BusinessCardScanner } from "@/components/contacts/BusinessCardScanner";
import CreateMeetingDialog from "@/components/contacts/CreateMeetingDialog";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Contact } from "@/types";
import { useNavigate } from "react-router-dom";

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
  const [key, setKey] = useState(0);
  const [showMeetingDialog, setShowMeetingDialog] = useState(false);
  const [createdContact, setCreatedContact] = useState<Contact | null>(null);
  const navigate = useNavigate();
  
  const handleScanComplete = (data: ScanResult) => {
    setScanResult(data);
    setKey(prevKey => prevKey + 1);
  };

  const handleContactCreated = (contact: Contact) => {
    setCreatedContact(contact);
    setShowMeetingDialog(true);
  };

  const handleMeetingConfirm = () => {
    setShowMeetingDialog(false);
    if (createdContact) {
      navigate(`/meetings/new?contactId=${createdContact.id}`);
    }
  };

  const handleMeetingDecline = (open: boolean) => {
    if (!open) {
      setShowMeetingDialog(false);
      navigate("/contacts");
    }
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
        key={key}
        initialData={scanResult ? {
          fullName: scanResult.fullName || '',
          company: scanResult.company || '',
          position: scanResult.position || '',
          email: scanResult.email || '',
          phone: scanResult.phone || '',
          mobile: scanResult.mobile || '',
          address: scanResult.address || '',
        } : undefined}
        onContactCreated={handleContactCreated}
      />
      
      <BusinessCardScanner
        open={showScanner}
        onOpenChange={setShowScanner}
        onScanComplete={handleScanComplete}
      />

      <CreateMeetingDialog
        open={showMeetingDialog}
        onOpenChange={handleMeetingDecline}
        onConfirm={handleMeetingConfirm}
        contactName={createdContact?.fullName || ''}
      />
    </div>
  );
};

export default NewContact;
