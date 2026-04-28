
import { Contact } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Mail, Calendar, ListTodo, Eye, ShoppingCart } from "lucide-react";
import { ContactEmailDialog } from "./ContactEmailDialog";
import { ContactTypeBadge } from "./ContactTypeBadge";
import { useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ContactsListProps {
  contacts: Contact[];
  onScheduleMeeting: (contactId: string) => void;
  onCreateTask: (contactId: string) => void;
  onCreateOrder: (contactId: string) => void;
}

export const ContactsList = ({ contacts, onScheduleMeeting, onCreateTask, onCreateOrder }: ContactsListProps) => {
  const navigate = useNavigate();
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  
  const handleEmailContact = (contact: Contact) => {
    setSelectedContact(contact);
    setShowEmailDialog(true);
  };
  
  const getDisplayName = (contact: Contact) => {
    if (contact.company) {
      return contact.fullName ? `${contact.company} (${contact.fullName})` : contact.company;
    }
    return contact.fullName || "Unnamed Contact";
  };
  
  return (
    <>
      <div className="border rounded-md overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company/Contact</TableHead>
              <TableHead className="hidden sm:table-cell">Status</TableHead>
              <TableHead className="hidden md:table-cell">Email</TableHead>
              <TableHead className="hidden md:table-cell">Phone</TableHead>
              <TableHead className="hidden lg:table-cell">Source</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contacts.map((contact) => (
              <TableRow key={contact.id}>
                <TableCell className="font-medium">{getDisplayName(contact)}</TableCell>
                <TableCell className="hidden sm:table-cell">
                  <ContactTypeBadge type={contact.contactType} />
                </TableCell>
                <TableCell className="hidden md:table-cell">{contact.email || "-"}</TableCell>
                <TableCell className="hidden md:table-cell">{contact.phone || "-"}</TableCell>
                <TableCell className="hidden lg:table-cell">{contact.source || "-"}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => navigate(`/contacts/${contact.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>View Details</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    {contact.email && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEmailContact(contact)}
                            >
                              <Mail className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Send Email</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => onScheduleMeeting(contact.id)}
                          >
                            <Calendar className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Schedule Meeting</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => onCreateTask(contact.id)}
                          >
                            <ListTodo className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Create Task</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => onCreateOrder(contact.id)}
                          >
                            <ShoppingCart className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Create Order</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {selectedContact && (
        <ContactEmailDialog
          contact={selectedContact}
          open={showEmailDialog}
          onOpenChange={setShowEmailDialog}
        />
      )}
    </>
  );
};
