
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Calendar, ListTodo } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Meeting } from '@/types';
import { Order } from '@/types';
import { format } from 'date-fns';
import { formatCurrency } from '@/utils/formatting';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';

interface ContactMeetingsProps {
  meetings: Meeting[];
}

export const ContactMeetings: React.FC<ContactMeetingsProps> = ({ meetings }) => {
  const navigate = useNavigate();
  
  if (meetings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Meeting History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <p>No meetings found for this contact.</p>
            <Button variant="outline" className="mt-2" onClick={() => navigate('/meetings/new')}>
              <Calendar className="mr-2 h-4 w-4" />
              Schedule Meeting
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Meeting History</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Follow-up</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {meetings.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((meeting) => (
              <TableRow key={meeting.id}>
                <TableCell>
                  {format(new Date(meeting.date), 'MMM d, yyyy')}
                  {meeting.time && <span className="text-sm text-muted-foreground"> at {meeting.time}</span>}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{meeting.type}</Badge>
                </TableCell>
                <TableCell>
                  {meeting.followUpScheduled ? (
                    <Badge variant="secondary">
                      {meeting.followUpDate && format(new Date(meeting.followUpDate), 'MMM d, yyyy')}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">None</span>
                  )}
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" onClick={() => navigate(`/meetings/${meeting.id}`)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

interface ContactOrdersProps {
  orders: Order[];
}

export const ContactOrders: React.FC<ContactOrdersProps> = ({ orders }) => {
  const navigate = useNavigate();
  
  if (orders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Order History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <p>No orders found for this contact.</p>
            <Button variant="outline" className="mt-2" onClick={() => navigate('/orders/new')}>
              <ListTodo className="mr-2 h-4 w-4" />
              Create Order
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Order History</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Reference</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((order) => (
              <TableRow key={order.id}>
                <TableCell>{format(new Date(order.date), 'MMM d, yyyy')}</TableCell>
                <TableCell>{order.reference || `#${order.id.slice(0, 8)}`}</TableCell>
                <TableCell>
                  <OrderStatusBadge status={order.status} />
                </TableCell>
                <TableCell>{formatCurrency(order.total)}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" onClick={() => navigate(`/orders/${order.id}`)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
