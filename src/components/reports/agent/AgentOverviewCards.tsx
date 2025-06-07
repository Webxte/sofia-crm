
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/utils/formatting";
import { Meeting, Order, Contact, Task } from "@/types";

interface AgentOverviewCardsProps {
  filteredOrders: Order[];
  filteredContacts: Contact[];
  filteredMeetings: Meeting[];
  filteredTasks: Task[];
}

export const AgentOverviewCards = ({ 
  filteredOrders, 
  filteredContacts, 
  filteredMeetings, 
  filteredTasks 
}: AgentOverviewCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(filteredOrders.reduce((total, order) => total + order.total, 0))}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {filteredOrders.length} orders
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Contacts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {filteredContacts.length}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {filteredContacts.filter(c => c.company).length} companies
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Meetings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {filteredMeetings.length}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {filteredMeetings.filter(m => new Date(m.date) > new Date()).length} upcoming
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {filteredTasks.length}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {filteredTasks.filter(t => t.status === "pending" || t.status === "in_progress" || t.status === "active").length} active
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
