
import React from "react";
import { useMeetings } from "@/context/meetings";
import { useOrders } from "@/context/OrdersContext";
import { formatCurrency } from "@/utils/formatting";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { CalendarClock, Eye, ShoppingBag, ShoppingCart } from "lucide-react";
import { Contact, Meeting, Order } from "@/types";
import { useNavigate } from "react-router-dom";

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
  
  const formatNotes = (notes: string | null | undefined, maxLines = 3) => {
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
                      <Badge>{meeting.followUpScheduled ? "Follow-up Scheduled" : "Completed"}</Badge>
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
                          <p className="text-sm whitespace-pre-line">{formatNotes(meeting.notes, 3)}</p>
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
                            Follow-up: {format(new Date(meeting.followUpDate || new Date()), "PPP")}
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
                        order.status === "paid" ? "bg-green-100 text-green-800" :
                        order.status === "draft" ? "bg-yellow-100 text-yellow-800" :
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
                          <p className="text-sm whitespace-pre-line">{formatNotes(order.notes, 3)}</p>
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

interface ContactDataProps {
  meetings?: Meeting[];
  orders?: Order[];
}

export const ContactMeetings: React.FC<ContactDataProps> = ({ meetings = [] }) => {
  const navigate = useNavigate();
  
  const formatNotes = (notes: string | null | undefined, maxLines = 3) => {
    if (!notes) return "";
    
    const lines = notes.split("\n");
    if (lines.length <= maxLines) return notes;
    
    return lines.slice(0, maxLines).join("\n") + (lines.length > maxLines ? "..." : "");
  };

  const meetingsEmpty = meetings.length === 0;
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center">
          <CalendarClock className="mr-2 h-5 w-5" />
          Recent Meetings
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={() => meetings.length > 0 && navigate(`/meetings/new?contactId=${meetings[0]?.contactId}`)}
        >
          <CalendarClock className="mr-2 h-4 w-4" />
          Schedule Meeting
        </Button>
      </CardHeader>
      <CardContent>
        {meetingsEmpty ? (
          <div className="text-center py-4 text-muted-foreground">
            No meetings recorded with this contact yet.
          </div>
        ) : (
          <div className="space-y-4">
            {/* Show all meetings instead of just 3 */}
            {meetings.map(meeting => (
              <Card key={meeting.id} className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium">{meeting.type} Meeting</h4>
                    <p className="text-sm text-gray-500">
                      {format(new Date(meeting.date), "PPP 'at' p")}
                    </p>
                    {meeting.agentName && (
                      <p className="text-xs text-muted-foreground">
                        Agent: {meeting.agentName}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 items-center">
                    <Badge>{meeting.followUpScheduled ? "Follow-up Scheduled" : "Completed"}</Badge>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => navigate(`/meetings/${meeting.id}`)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {meeting.notes && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 whitespace-pre-line line-clamp-3">{formatNotes(meeting.notes, 3)}</p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const ContactOrders: React.FC<ContactDataProps> = ({ orders = [] }) => {
  const navigate = useNavigate();
  
  const formatNotes = (notes: string | null | undefined, maxLines = 3) => {
    if (!notes) return "";
    
    const lines = notes.split("\n");
    if (lines.length <= maxLines) return notes;
    
    return lines.slice(0, maxLines).join("\n") + (lines.length > maxLines ? "..." : "");
  };

  const ordersEmpty = orders.length === 0;
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center">
          <ShoppingBag className="mr-2 h-5 w-5" />
          Recent Orders
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={() => orders.length > 0 && navigate(`/orders/new?contactId=${orders[0]?.contactId}`)}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Create Order
        </Button>
      </CardHeader>
      <CardContent>
        {ordersEmpty ? (
          <div className="text-center py-4 text-muted-foreground">
            No orders recorded with this contact yet.
          </div>
        ) : (
          <div className="space-y-4">
            {/* Show all orders instead of just 3 */}
            {orders.map(order => (
              <Card key={order.id} className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium">Order #{order.reference || order.id.slice(0, 8).toUpperCase()}</h4>
                    <p className="text-sm text-gray-500">
                      {format(new Date(order.date), "PPP")}
                    </p>
                    {order.agentName && (
                      <p className="text-xs text-muted-foreground">
                        Agent: {order.agentName}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 items-center">
                    <Badge className={
                      order.status === "paid" ? "bg-green-100 text-green-800" :
                      order.status === "draft" ? "bg-yellow-100 text-yellow-800" :
                      "bg-gray-100"
                    }>
                      {order.status}
                    </Badge>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => navigate(`/orders/${order.id}`)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex justify-between items-center text-sm mt-2">
                  <span className="font-medium">Total:</span>
                  <span className="font-bold">{formatCurrency(order.total)}</span>
                </div>
                
                {order.notes && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 whitespace-pre-line line-clamp-3">{formatNotes(order.notes, 3)}</p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
