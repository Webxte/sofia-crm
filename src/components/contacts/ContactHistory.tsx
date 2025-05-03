
import React from "react";
import { Contact } from "@/types";
import { ContactMeetings } from "./history/ContactMeetings";
import { ContactOrders } from "./history/ContactOrders";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarClock, ShoppingBag } from "lucide-react";
import { useMeetings } from "@/context/meetings";
import { useOrders } from "@/context/OrdersContext";

interface ContactHistoryProps {
  contact: Contact;
}

const ContactHistory: React.FC<ContactHistoryProps> = ({ contact }) => {
  const { meetings } = useMeetings();
  const { orders } = useOrders();
  
  const contactMeetings = meetings.filter(meeting => meeting.contactId === contact.id);
  const contactOrders = orders.filter(order => order.contactId === contact.id);
  
  const sortedMeetings = [...contactMeetings].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  const sortedOrders = [...contactOrders].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  const meetingsEmpty = sortedMeetings.length === 0;
  const ordersEmpty = sortedOrders.length === 0;
  
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Contact History</h2>
      
      <Tabs defaultValue="meetings">
        <TabsList>
          <TabsTrigger value="meetings" className="flex items-center">
            <CalendarClock className="mr-2 h-4 w-4" />
            Meetings ({sortedMeetings.length})
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center">
            <ShoppingBag className="mr-2 h-4 w-4" />
            Orders ({sortedOrders.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="meetings">
          {meetingsEmpty ? (
            <div className="text-center py-8 text-muted-foreground">
              No meetings recorded with this contact yet.
            </div>
          ) : (
            <ContactMeetings meetings={sortedMeetings} />
          )}
        </TabsContent>
        
        <TabsContent value="orders">
          {ordersEmpty ? (
            <div className="text-center py-8 text-muted-foreground">
              No orders recorded with this contact yet.
            </div>
          ) : (
            <ContactOrders orders={sortedOrders} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContactHistory;
