
import { Button } from "@/components/ui/button";
import { PlusCircle, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import DownloadContactsByDate from "./DownloadContactsByDate";
import { Contact } from "@/types";
import { downloadCSV } from "@/lib/exportCSV";
import { toast } from "sonner";

interface ContactsHeaderProps {
  onImportClick: () => void;
  filteredContacts: Contact[];
}

export const ContactsHeader = ({ onImportClick, filteredContacts }: ContactsHeaderProps) => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const handleExport = () => {
    if (filteredContacts.length === 0) {
      toast.error("Nothing to export", { description: "No contacts match the current filters." });
      return;
    }
    const headers = ["Full Name", "Company", "Email", "Phone", "Mobile", "Position", "Category", "Source", "Address", "Notes", "Agent", "Created"];
    const rows = filteredContacts.map(c => [
      c.fullName || '',
      c.company || '',
      c.email || '',
      c.phone || '',
      c.mobile || '',
      c.position || '',
      c.category || '',
      c.source || '',
      c.address || '',
      c.notes || '',
      c.agentName || '',
      c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '',
    ]);
    downloadCSV([headers, ...rows], `contacts_${new Date().toISOString().split('T')[0]}.csv`);
    toast.success("Export complete", { description: `${filteredContacts.length} contact(s) exported.` });
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Contacts</h1>
        <p className="text-muted-foreground">
          Manage your contacts and leads
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4 mr-1" /> Export
        </Button>
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
