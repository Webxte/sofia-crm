
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { RecentActivity } from "@/components/dashboard/RecentActivity";

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your CRM dashboard. Here's an overview of your business.
        </p>
      </div>
      
      <DashboardStats />
      <RecentActivity />
    </div>
  );
};

export default Dashboard;
