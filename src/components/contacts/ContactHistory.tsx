
import React from "react";
import { useMeetings } from "@/context/meetings";
import { useOrders } from "@/context/OrdersContext";
import { formatCurrency } from "@/utils/formatting";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarClock, ShoppingBag } from "lucide-react";
import { Contact } from "@/types";

interface ContactHistoryProps {
  contact: Contact;
}

const ContactHistory: React.FC<ContactHistoryProps> = ({ contact }) => {
  const { meetings } = useMeetings();
  const { orders } = useOrders();
  
  // Filter meetings and orders for this contact
  const contactMeetings = meetings.filter(meeting => meeting.contactId === contact.id);
  const contactOrders = orders.filter(order => order.contactId === contact.id);
  
  // Sort by date - most recent first
  const sortedMeetings = [...contactMeetings].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  const sortedOrders = [...contactOrders].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  // Extract notes for display (up to 2 lines)
  const formatNotes = (notes: string | null | undefined, maxLines = 2) => {
    if (!notes) return "";
    
    const lines = notes.split("\n");
    if (lines.length <= maxLines) return notes;
    
    return lines.slice(0, maxLines).join("\n") + (lines.length > maxLines ? "..." : "");
  };
  
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
            <div className="space-y-4">
              {sortedMeetings.map(meeting => (
                <Card key={meeting.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{meeting.type} Meeting</CardTitle>
                        <CardDescription>
                          {format(new Date(meeting.date), "PPP 'at' p")}
                        </CardDescription>
                      </div>
                      <Badge>{meeting.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm font-medium">Location:</p>
                        <p className="text-sm">{meeting.location}</p>
                      </div>
                      
                      {meeting.notes && (
                        <div>
                          <p className="text-sm font-medium">Notes:</p>
                          <p className="text-sm whitespace-pre-line">{formatNotes(meeting.notes, 2)}</p>
                        </div>
                      )}
                      
                      {meeting.agentName && (
                        <div>
                          <p className="text-sm font-medium">Agent:</p>
                          <p className="text-sm">{meeting.agentName}</p>
                        </div>
                      )}
                      
                      {meeting.followUpScheduled && (
                        <div className="mt-2">
                          <Badge variant="outline" className="bg-blue-50">
                            Follow-up: {format(new Date(meeting.followUpDate), "PPP")}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="orders">
          {ordersEmpty ? (
            <div className="text-center py-8 text-muted-foreground">
              No orders recorded with this contact yet.
            </div>
          ) : (
            <div className="space-y-4">
              {sortedOrders.map(order => (
                <Card key={order.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>Order #{order.reference || order.id.slice(0, 8).toUpperCase()}</CardTitle>
                        <CardDescription>
                          {format(new Date(order.date), "PPP")}
                        </CardDescription>
                      </div>
                      <Badge className={
                        order.status === "completed" ? "bg-green-100 text-green-800" :
                        order.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                        "bg-gray-100"
                      }>
                        {order.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Total Amount:</span>
                        <span className="font-bold">{formatCurrency(order.total)}</span>
                      </div>
                      
                      {order.notes && (
                        <div>
                          <p className="text-sm font-medium">Notes:</p>
                          <p className="text-sm whitespace-pre-line">{formatNotes(order.notes, 2)}</p>
                        </div>
                      )}
                      
                      {order.agentName && (
                        <div>
                          <p className="text-sm font-medium">Agent:</p>
                          <p className="text-sm">{order.agentName}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContactHistory;
