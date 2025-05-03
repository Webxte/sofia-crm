
import { Contact } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Building } from 'lucide-react';

interface ContactInformationProps {
  contact: Contact;
  formatLocation: () => React.ReactNode;
}

export const ContactInformation = ({ contact, formatLocation }: ContactInformationProps) => {
  return (
    <Card className="lg:col-span-2">
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Header with name/company */}
          <div>
            <h1 className="text-2xl font-bold">
              {contact.fullName || 'Unnamed Contact'}
            </h1>
            {contact.company && (
              <p className="text-lg text-muted-foreground mt-1">
                {contact.company}
              </p>
            )}
            {contact.position && (
              <p className="text-sm text-muted-foreground">
                {contact.position}
              </p>
            )}
            
            {contact.source && (
              <div className="mt-2">
                {contact.source.split(',').map((src) => (
                  <Badge key={src.trim()} variant="outline" className="mr-1">
                    {src.trim()}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          
          <Separator />
          
          {/* Contact information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Communication */}
            <div className="space-y-4">
              <h3 className="font-medium">Contact Information</h3>
              {(contact.email || contact.phone || contact.mobile) ? (
                <div className="space-y-2">
                  {contact.email && (
                    <p className="text-sm">
                      <span className="text-muted-foreground mr-2">Email:</span>
                      <a href={`mailto:${contact.email}`} className="text-primary hover:underline">
                        {contact.email}
                      </a>
                    </p>
                  )}
                  {contact.phone && (
                    <p className="text-sm">
                      <span className="text-muted-foreground mr-2">Phone:</span>
                      <a href={`tel:${contact.phone}`} className="text-primary hover:underline">
                        {contact.phone}
                      </a>
                    </p>
                  )}
                  {contact.mobile && (
                    <p className="text-sm">
                      <span className="text-muted-foreground mr-2">Mobile:</span>
                      <a href={`tel:${contact.mobile}`} className="text-primary hover:underline">
                        {contact.mobile}
                      </a>
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No contact information provided</p>
              )}
            </div>
            
            {/* Address */}
            <div className="space-y-4">
              <h3 className="font-medium">Address</h3>
              {contact.address ? (
                <p className="text-sm">
                  {formatLocation()}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">No address provided</p>
              )}
            </div>
          </div>
          
          {/* Notes */}
          {contact.notes && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="font-medium">Notes</h3>
                <p className="text-sm whitespace-pre-line">{contact.notes}</p>
              </div>
            </>
          )}
          
          <ContactAdditionalActions contact={contact} />
        </div>
      </CardContent>
    </Card>
  );
};

interface ContactAdditionalActionsProps {
  contact: Contact;
}

const ContactAdditionalActions = ({ contact }: ContactAdditionalActionsProps) => {
  const navigate = useNavigate();

  const handleScheduleMeeting = () => {
    navigate(`/meetings/new?contactId=${contact.id}`);
  };

  const handleCreateTask = () => {
    navigate(`/tasks/new?contactId=${contact.id}`);
  };

  const handleCreateOrder = () => {
    navigate(`/orders/new?contactId=${contact.id}`);
  };
  
  return (
    <div className="pt-4">
      <h3 className="font-medium mb-3">Actions</h3>
      <div className="flex flex-wrap gap-2">
        <Button onClick={handleScheduleMeeting} variant="outline" size="sm">
          <Clock className="h-4 w-4 mr-2" /> Schedule Meeting
        </Button>
        <Button onClick={handleCreateTask} variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" /> Create Task
        </Button>
        <Button onClick={handleCreateOrder} variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" /> Create Order
        </Button>
      </div>
    </div>
  );
};

import { Clock, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
