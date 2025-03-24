
import { Users, MessagesSquare, ClipboardList, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { StatCard } from "@/components/dashboard/StatCard";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { useContacts } from "@/context/ContactsContext";
import { useMeetings } from "@/context/MeetingsContext";
import { useTasks } from "@/context/TasksContext";
import { useOrders } from "@/context/OrdersContext";

const Dashboard = () => {
  // Get actual counts from contexts
  const { contacts } = useContacts();
  const { meetings } = useMeetings();
  const { tasks } = useTasks();
  const { orders } = useOrders();

  // Use real data for stats
  const stats = [
    { title: "Contacts", value: contacts.length, icon: <Users size={24} />, link: "/contacts" },
    { title: "Meetings", value: meetings.length, icon: <MessagesSquare size={24} />, link: "/meetings" },
    { title: "Tasks", value: tasks.length, icon: <ClipboardList size={24} />, link: "/tasks" },
    { title: "Orders", value: orders.length, icon: <ShoppingCart size={24} />, link: "/orders" },
  ];

  // Filter for upcoming meetings (today or later)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcomingMeetings = meetings
    .filter(meeting => new Date(meeting.date) >= today)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  // Filter for active tasks
  const pendingTasks = tasks
    .filter(task => task.status === "active")
    .sort((a, b) => {
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      return a.dueDate ? -1 : (b.dueDate ? 1 : 0);
    })
    .slice(0, 3);

  // Get recent orders
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Manage your CRM activities and stay organized</p>
      </div>
      
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Link to={stat.link} key={stat.title} className="block">
            <StatCard
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              viewAllLink={stat.link}
              animationDelay={index * 100}
            />
          </Link>
        ))}
      </div>
      
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <DashboardCard 
          title="Upcoming Meetings" 
          viewAllLink="/meetings" 
          animationDelay={50}
        >
          {upcomingMeetings.length > 0 ? (
            <div className="space-y-4">
              {upcomingMeetings.map(meeting => (
                <Link key={meeting.id} to={`/meetings/edit/${meeting.id}`} className="block">
                  <div className="border rounded-lg p-3 hover:border-primary transition-colors">
                    <p className="font-medium">{meeting.type.charAt(0).toUpperCase() + meeting.type.slice(1)}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(meeting.date).toLocaleDateString()} at {meeting.time}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<MessagesSquare size={40} />}
              title="No upcoming meetings"
              actionLink="/meetings/new"
              actionText="Add a meeting →"
            />
          )}
        </DashboardCard>
        
        <DashboardCard 
          title="Pending Tasks" 
          viewAllLink="/tasks"
          animationDelay={100}
        >
          {pendingTasks.length > 0 ? (
            <div className="space-y-4">
              {pendingTasks.map(task => (
                <Link key={task.id} to={`/tasks/edit/${task.id}`} className="block">
                  <div className="border rounded-lg p-3 hover:border-primary transition-colors">
                    <p className="font-medium">{task.title}</p>
                    {task.dueDate && (
                      <p className="text-sm text-muted-foreground">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<ClipboardList size={40} />}
              title="No pending tasks"
              actionLink="/tasks/new"
              actionText="Create a task →"
            />
          )}
        </DashboardCard>
      </div>
      
      <DashboardCard 
        title="Recent Orders" 
        viewAllLink="/orders"
        animationDelay={150}
        className="col-span-full"
      >
        {recentOrders.length > 0 ? (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {recentOrders.map(order => (
              <Link key={order.id} to={`/orders/edit/${order.id}`} className="block">
                <div className="border rounded-lg p-4 hover:border-primary transition-colors">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium">Order #{order.reference || order.id.slice(0, 6).toUpperCase()}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.date).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="font-medium">€{order.total.toFixed(2)}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<ShoppingCart size={40} />}
            title="No recent orders"
            description="Start creating orders to track your sales and deliveries."
            actionLink="/orders/new"
            actionText="Create an order →"
          />
        )}
      </DashboardCard>
    </div>
  );
};

export default Dashboard;
