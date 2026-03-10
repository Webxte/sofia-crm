
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import DownloadContactsByDate from "./DownloadContactsByDate";

interface ContactsHeaderProps {
  onImportClick: () => void;
}

export const ContactsHeader = ({ onImportClick }: ContactsHeaderProps) => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Contacts</h1>
        <p className="text-muted-foreground">
          Manage your contacts and leads
        </p>
      </div>
      <div className="flex items-center gap-2">
        <DownloadContactsByDate />
        {isAdmin && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onImportClick}
          >
            Import
          </Button>
        )}
        <Button 
          onClick={() => navigate("/contacts/new")}
          size="sm"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          New Contact
        </Button>
      </div>
    </div>
  );
};
