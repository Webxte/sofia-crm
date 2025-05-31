
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, CheckSquare, ShoppingCart } from "lucide-react";
import { useContacts } from "@/context/contacts/ContactsContext";
import { useMeetings } from "@/context/meetings";
import { useTasks } from "@/context/tasks";
import { useOrders } from "@/context/orders/OrdersContext";

export function DashboardStats() {
  const { contacts } = useContacts();
  const { meetings } = useMeetings();
  const { tasks } = useTasks();
  const { orders } = useOrders();

  const activeTasks = tasks.filter(task => task.status === "active");
  const draftOrders = orders.filter(order => order.status === "draft");

  const stats = [
    {
      title: "Total Contacts",
      value: contacts.length,
      icon: Users,
      description: "Contacts in your database"
    },
    {
      title: "Upcoming Meetings",
      value: meetings.filter(meeting => new Date(meeting.date) >= new Date()).length,
      icon: Calendar,
      description: "Meetings scheduled"
    },
    {
      title: "Active Tasks",
      value: activeTasks.length,
      icon: CheckSquare,
      description: "Tasks to complete"
    },
    {
      title: "Draft Orders",
      value: draftOrders.length,
      icon: ShoppingCart,
      description: "Orders in draft status"
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
