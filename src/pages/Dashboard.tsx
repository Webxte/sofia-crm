
import { Users, MessagesSquare, ClipboardList, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { StatCard } from "@/components/dashboard/StatCard";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { useContacts } from "@/context/ContactsContext";
import { useMeetings } from "@/context/meetings";
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

  // Map contacts to their IDs for quick lookup
  const contactsMap = contacts.reduce((map, contact) => {
    map[contact.id] = contact;
    return map;
  }, {} as Record<string, typeof contacts[0]>);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Manage your CRM activities and stay organized</p>
      </div>
      
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <div key={stat.title} className="block">
            <StatCard
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              viewAllLink={stat.link}
              animationDelay={index * 100}
            />
          </div>
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
              {upcomingMeetings.map(meeting => {
                const contactInfo = contactsMap[meeting.contactId];
                return (
                  <Link key={meeting.id} to={`/meetings/edit/${meeting.id}`} className="block">
                    <div className="border rounded-lg p-3 hover:border-primary transition-colors">
                      <p className="font-medium">{meeting.type.charAt(0).toUpperCase() + meeting.type.slice(1)}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(meeting.date).toLocaleDateString()} at {meeting.time}
                      </p>
                      <p className="text-sm mt-1 font-medium">
                        {contactInfo ? (contactInfo.company || contactInfo.fullName) : meeting.contactName || "Unknown Contact"}
                      </p>
                      {meeting.location && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Location: {meeting.location}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
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
              {pendingTasks.map(task => {
                const contactInfo = task.contactId ? contactsMap[task.contactId] : null;
                return (
                  <Link key={task.id} to={`/tasks/edit/${task.id}`} className="block">
                    <div className="border rounded-lg p-3 hover:border-primary transition-colors">
                      <p className="font-medium">{task.title}</p>
                      {task.dueDate && (
                        <p className="text-sm text-muted-foreground">
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </p>
                      )}
                      {contactInfo && (
                        <p className="text-sm mt-1">
                          For: {contactInfo.company || contactInfo.fullName}
                        </p>
                      )}
                      {task.priority && (
                        <p className="text-xs mt-1">
                          <span className={`px-2 py-0.5 rounded-full text-white ${
                            task.priority === 'high' ? 'bg-red-500' : 
                            task.priority === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                          }`}>
                            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                          </span>
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
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
            {recentOrders.map(order => {
              const contactInfo = contactsMap[order.contactId];
              return (
                <Link key={order.id} to={`/orders/edit/${order.id}`} className="block">
                  <div className="border rounded-lg p-4 hover:border-primary transition-colors">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium">Order #{order.reference || order.id.slice(0, 6).toUpperCase()}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.date).toLocaleDateString()}
                        </p>
                        {contactInfo && (
                          <p className="text-sm mt-1">
                            {contactInfo.company || contactInfo.fullName}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-medium">€{order.total.toFixed(2)}</p>
                        <p className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full mt-1 inline-block">
                          {order.status}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
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
