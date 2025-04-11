
import { Contact } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Calendar, ListTodo, Mail, User, Building, Phone, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ContactEmailDialog } from "./email/ContactEmailDialog";

interface ContactCardProps {
  contact: Contact;
  onScheduleMeeting: (contactId: string) => void;
  onCreateTask: (contactId: string) => void;
  onCreateOrder: (contactId: string) => void;
}

const ContactCard = ({
  contact,
  onScheduleMeeting,
  onCreateTask,
  onCreateOrder,
}: ContactCardProps) => {
  const navigate = useNavigate();
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  
  return (
    <>
      <Card className="h-full flex flex-col">
        <CardContent className="pt-6 flex-1">
          <div className="mb-4">
            <h3 className="font-semibold text-lg truncate">
              {contact.fullName || "Unknown Contact"}
            </h3>
            {contact.company && (
              <div className="flex items-center text-muted-foreground mt-1">
                <Building className="h-4 w-4 mr-1" />
                <span className="text-sm truncate">{contact.company}</span>
              </div>
            )}
          </div>
          
          {contact.email && (
            <div className="flex items-start mt-2">
              <Mail className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
              <p className="text-sm truncate">{contact.email}</p>
            </div>
          )}
          
          {contact.phone && (
            <div className="flex items-start mt-2">
              <Phone className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
              <p className="text-sm">{contact.phone}</p>
            </div>
          )}
          
          {contact.source && (
            <div className="mt-4 pt-3 border-t">
              <div className="text-xs text-muted-foreground flex items-center">
                <span className="mr-1">Source:</span>
                <span className="font-medium">{contact.source}</span>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t bg-muted/30 p-3 flex flex-wrap gap-2 justify-end">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(`/contacts/${contact.id}`)}
          >
            <User className="h-4 w-4 mr-1" /> View
          </Button>
          
          {contact.email && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowEmailDialog(true)}
            >
              <Mail className="h-4 w-4 mr-1" /> Email
            </Button>
          )}
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onScheduleMeeting(contact.id)}
          >
            <Calendar className="h-4 w-4 mr-1" /> Meeting
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onCreateTask(contact.id)}
          >
            <ListTodo className="h-4 w-4 mr-1" /> Task
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onCreateOrder(contact.id)}
          >
            <ShoppingCart className="h-4 w-4 mr-1" /> Order
          </Button>
        </CardFooter>
      </Card>
      
      {showEmailDialog && (
        <ContactEmailDialog
          contact={contact}
          open={showEmailDialog}
          onOpenChange={setShowEmailDialog}
        />
      )}
    </>
  );
};

export default ContactCard;
