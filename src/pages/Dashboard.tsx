
import { Users, MessagesSquare, ClipboardList, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { StatCard } from "@/components/dashboard/StatCard";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  // Mock data for demonstration
  const stats = [
    { title: "Contacts", value: 0, icon: <Users size={24} />, link: "/contacts" },
    { title: "Meetings", value: 0, icon: <MessagesSquare size={24} />, link: "/meetings" },
    { title: "Tasks", value: 0, icon: <ClipboardList size={24} />, link: "/tasks" },
    { title: "Orders", value: 0, icon: <ShoppingCart size={24} />, link: "/orders" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Manage your CRM activities and stay organized</p>
      </div>
      
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            viewAllLink={stat.link}
            animationDelay={index * 100}
          />
        ))}
      </div>
      
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <DashboardCard 
          title="Upcoming Meetings" 
          viewAllLink="/meetings" 
          animationDelay={50}
        >
          <EmptyState
            icon={<MessagesSquare size={40} />}
            title="No upcoming meetings"
            actionLink="/meetings/new"
            actionText="Schedule a meeting →"
          />
        </DashboardCard>
        
        <DashboardCard 
          title="Pending Tasks" 
          viewAllLink="/tasks"
          animationDelay={100}
        >
          <EmptyState
            icon={<ClipboardList size={40} />}
            title="No pending tasks"
            actionLink="/tasks/new"
            actionText="Create a task →"
          />
        </DashboardCard>
      </div>
      
      <DashboardCard 
        title="Recent Orders" 
        viewAllLink="/orders"
        animationDelay={150}
        className="col-span-full"
      >
        <EmptyState
          icon={<ShoppingCart size={40} />}
          title="No recent orders"
          description="Start creating orders to track your sales and deliveries."
          actionLink="/orders/new"
          actionText="Create an order →"
        />
      </DashboardCard>
    </div>
  );
};

export default Dashboard;
