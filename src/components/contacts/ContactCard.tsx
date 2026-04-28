
import { useState } from "react";
import { Contact } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Building2, Mail, MapPin, MoreVertical, Phone, Eye, Trash2, Edit, ShoppingCart, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { ContactEmailDialog } from "./email/ContactEmailDialog";
import { ContactTypeBadge } from "./ContactTypeBadge";

interface ContactCardProps {
  contact: Contact;
  onDelete: (contact: Contact) => void;
}

export const ContactCard = ({ contact, onDelete }: ContactCardProps) => {
  const [showEmailDialog, setShowEmailDialog] = useState(false);

  const handlePhoneClick = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  const handleEmailClick = (email: string) => {
    setShowEmailDialog(true);
  };

  return (
    <>
      <Card className="h-full hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg leading-tight">
                {contact.company ? (
                  <>
                    <div className="font-semibold">{contact.company}</div>
                    {contact.fullName && (
                      <div className="text-sm font-normal text-muted-foreground mt-1">
                        {contact.fullName}
                      </div>
                    )}
                  </>
                ) : (
                  contact.fullName || "Unnamed Contact"
                )}
              </CardTitle>
              {contact.position && (
                <p className="text-sm text-muted-foreground mt-1">{contact.position}</p>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 touch-manipulation">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to={`/contacts/${contact.id}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to={`/contacts/${contact.id}/edit`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to={`/orders/new?contactId=${contact.id}`}>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Create Order
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to={`/meetings/new?contactId=${contact.id}`}>
                    <Calendar className="mr-2 h-4 w-4" />
                    Schedule Meeting
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDelete(contact)}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3 pb-3">
          {contact.email && (
            <div className="flex items-center text-sm">
              <Mail className="mr-2 h-4 w-4 text-muted-foreground flex-shrink-0" />
              <button 
                onClick={() => handleEmailClick(contact.email!)}
                className="text-blue-600 hover:underline cursor-pointer truncate"
              >
                {contact.email}
              </button>
            </div>
          )}
          
          {contact.phone && (
            <div className="flex items-center text-sm">
              <Phone className="mr-2 h-4 w-4 text-muted-foreground flex-shrink-0" />
              <button 
                onClick={() => handlePhoneClick(contact.phone!)}
                className="text-blue-600 hover:underline cursor-pointer"
              >
                {contact.phone}
              </button>
            </div>
          )}
          
          {contact.mobile && (
            <div className="flex items-center text-sm">
              <Phone className="mr-2 h-4 w-4 text-muted-foreground flex-shrink-0" />
              <button 
                onClick={() => handlePhoneClick(contact.mobile!)}
                className="text-blue-600 hover:underline cursor-pointer"
              >
                {contact.mobile}
              </button>
            </div>
          )}
          
          {contact.address && (
            <div className="flex items-start text-sm">
              <MapPin className="mr-2 h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              <span className="text-muted-foreground text-xs">{contact.address}</span>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="pt-3 border-t">
          <div className="flex flex-wrap gap-1 items-center">
            <ContactTypeBadge type={contact.contactType} />
            {contact.source && (
              <Badge variant="secondary" className="text-xs">
                {contact.source}
              </Badge>
            )}
          </div>
        </CardFooter>
      </Card>

      {contact && (
        <ContactEmailDialog
          contact={contact}
          open={showEmailDialog}
          onOpenChange={setShowEmailDialog}
        />
      )}
    </>
  );
};
