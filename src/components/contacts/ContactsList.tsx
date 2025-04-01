
import { Contact } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface ContactsListProps {
  contacts: Contact[];
  onScheduleMeeting: (contactId: string) => void;
  onCreateTask: (contactId: string) => void;
  onCreateOrder: (contactId: string) => void;
}

export const ContactsList = ({ contacts, onScheduleMeeting, onCreateTask, onCreateOrder }: ContactsListProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="border rounded-md overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Company</TableHead>
            <TableHead className="hidden md:table-cell">Email</TableHead>
            <TableHead className="hidden md:table-cell">Phone</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contacts.map((contact) => (
            <TableRow key={contact.id}>
              <TableCell className="font-medium">{contact.fullName || "-"}</TableCell>
              <TableCell>{contact.company || "-"}</TableCell>
              <TableCell className="hidden md:table-cell">{contact.email || "-"}</TableCell>
              <TableCell className="hidden md:table-cell">{contact.phone || "-"}</TableCell>
              <TableCell>{contact.source || "-"}</TableCell>
              <TableCell>
                <div className="flex flex-wrap items-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => navigate(`/contacts/${contact.id}`)}
                  >
                    View
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onScheduleMeeting(contact.id)}
                  >
                    Meeting
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onCreateTask(contact.id)}
                  >
                    Task
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onCreateOrder(contact.id)}
                  >
                    Order
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
