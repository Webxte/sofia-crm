
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, CheckSquare, ShoppingCart } from "lucide-react";
import { useContacts } from "@/context/contacts/ContactsContext";
import { useMeetings } from "@/context/meetings";
import { useTasks } from "@/context/tasks";
import { useOrders } from "@/context/orders/OrdersContext";
import { Link } from "react-router-dom";
import { subWeeks, subMonths, startOfWeek, startOfMonth, isFuture, isAfter, isBefore } from "date-fns";

export function DashboardStats() {
  const { contacts } = useContacts();
  const { meetings } = useMeetings();
  const { tasks } = useTasks();
  const { orders } = useOrders();

  const now = new Date();
  const startOfThisWeek = startOfWeek(now);
  const startOfThisMonth = startOfMonth(now);
  const oneWeekAgo = subWeeks(now, 1);
  const oneMonthAgo = subMonths(now, 1);

  // Contact statistics
  const totalContacts = contacts.length;
  const contactsThisWeek = contacts.filter(contact => 
    isAfter(contact.createdAt, startOfThisWeek)
  ).length;
  const contactsThisMonth = contacts.filter(contact => 
    isAfter(contact.createdAt, startOfThisMonth)
  ).length;
  const contactsLastWeek = contacts.filter(contact => 
    isAfter(contact.createdAt, oneWeekAgo) && isBefore(contact.createdAt, startOfThisWeek)
  ).length;
  const contactsLastMonth = contacts.filter(contact => 
    isAfter(contact.createdAt, oneMonthAgo) && isBefore(contact.createdAt, startOfThisMonth)
  ).length;

  // Meeting statistics
  const totalMeetings = meetings.length;
  const meetingsLastWeek = meetings.filter(meeting => 
    isAfter(new Date(meeting.date), oneWeekAgo) && isBefore(new Date(meeting.date), startOfThisWeek)
  ).length;
  const meetingsLastMonth = meetings.filter(meeting => 
    isAfter(new Date(meeting.date), oneMonthAgo) && isBefore(new Date(meeting.date), startOfThisMonth)
  ).length;
  const futureMeetings = meetings.filter(meeting => 
    isFuture(new Date(meeting.date))
  ).length;

  // Task statistics - using correct status values
  const activeTasks = tasks.filter(task => 
    task.status !== "completed" && task.status !== "cancelled"
  );

  // Order statistics
  const draftOrders = orders.filter(order => order.status === "draft").length;
  const confirmedOrders = orders.filter(order => order.status === "confirmed").length;
  const deliveredOrders = orders.filter(order => order.status === "delivered").length;
  const paidOrders = orders.filter(order => order.status === "paid").length;

  const stats = [
    {
      title: "Contacts",
      value: totalContacts,
      icon: Users,
      description: `This week: ${contactsThisWeek} | This month: ${contactsThisMonth} | Last week: ${contactsLastWeek} | Last month: ${contactsLastMonth}`,
      link: "/contacts"
    },
    {
      title: "Meetings",
      value: totalMeetings,
      icon: Calendar,
      description: `Future: ${futureMeetings} | Last week: ${meetingsLastWeek} | Last month: ${meetingsLastMonth}`,
      link: "/meetings"
    },
    {
      title: "Active Tasks",
      value: activeTasks.length,
      icon: CheckSquare,
      description: "Tasks to complete",
      link: "/tasks"
    },
    {
      title: "Orders",
      value: orders.length,
      icon: ShoppingCart,
      description: `Draft: ${draftOrders} | Confirmed: ${confirmedOrders} | Delivered: ${deliveredOrders} | Paid: ${paidOrders}`,
      link: "/orders"
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Link key={stat.title} to={stat.link} className="block">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
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
        </Link>
      ))}
    </div>
  );
}
