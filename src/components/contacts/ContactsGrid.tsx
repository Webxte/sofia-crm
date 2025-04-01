
import { Contact } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ContactCard from "./ContactCard";

interface ContactsGridProps {
  groupedContacts: Record<string, Contact[]>;
  sortedGroups: string[];
  onScheduleMeeting: (contactId: string) => void;
  onCreateTask: (contactId: string) => void;
  onCreateOrder: (contactId: string) => void;
}

export const ContactsGrid = ({ groupedContacts, sortedGroups, onScheduleMeeting, onCreateTask, onCreateOrder }: ContactsGridProps) => {
  return (
    <div className="space-y-6">
      {sortedGroups.map(group => (
        <Card key={group}>
          <CardHeader className="py-3">
            <CardTitle className="text-sm text-muted-foreground">{group}</CardTitle>
            <CardDescription>
              {groupedContacts[group].length} contact{groupedContacts[group].length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
            {groupedContacts[group].map(contact => (
              <ContactCard 
                key={contact.id} 
                contact={contact} 
                onScheduleMeeting={onScheduleMeeting}
                onCreateTask={onCreateTask}
                onCreateOrder={onCreateOrder}
              />
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
