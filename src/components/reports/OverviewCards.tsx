
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CardsData {
  orders: any[];
  contacts: any[];
  meetings: any[];
  tasks: any[];
}

interface OverviewCardsProps {
  data: CardsData;
}

const OverviewCards: React.FC<OverviewCardsProps> = ({ data }) => {
  const { orders, contacts, meetings, tasks } = data;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            €{orders.reduce((total, order) => total + order.total, 0).toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {orders.length} orders
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Contacts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {contacts.length}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {contacts.filter(c => c.company).length} companies
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Meetings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {meetings.length}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {meetings.filter(m => new Date(m.date) > new Date()).length} upcoming
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {tasks.length}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {tasks.filter(t => t.status === "active").length} active
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default OverviewCards;
