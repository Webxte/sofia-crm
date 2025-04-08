
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMeetings } from "@/context/meetings";
import { useOrders } from "@/context/OrdersContext";
import { useContacts } from "@/context/ContactsContext";
import { useTasks } from "@/context/TasksContext";
import { format, subMonths } from "date-fns";
import { Download } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import AgentReports from "@/components/reports/AgentReports";
import OverviewCards from "@/components/reports/OverviewCards";
import SalesChart from "@/components/reports/SalesChart";
import { ActivitiesCharts, StatusChart } from "@/components/reports/DistributionCharts";

const Reports = () => {
  const [timeFrame, setTimeFrame] = useState<"30" | "90" | "365" | "all">("30");
  const { meetings } = useMeetings();
  const { orders } = useOrders();
  const { contacts } = useContacts();
  const { tasks } = useTasks();
  const { user } = useAuth();
  
  // Get date threshold based on selected time frame
  const getDateThreshold = () => {
    if (timeFrame === "all") return new Date(0);
    const days = parseInt(timeFrame);
    return subMonths(new Date(), days / 30);
  };
  
  const dateThreshold = getDateThreshold();
  
  // Filter data based on selected time frame
  const filteredMeetings = meetings.filter(m => new Date(m.createdAt) >= dateThreshold);
  const filteredOrders = orders.filter(o => new Date(o.createdAt) >= dateThreshold);
  const filteredContacts = contacts.filter(c => new Date(c.createdAt) >= dateThreshold);
  const filteredTasks = tasks.filter(t => new Date(t.createdAt) >= dateThreshold);
  
  // Prepare data for meeting types chart
  const meetingTypesData = filteredMeetings.reduce((acc, meeting) => {
    if (!acc[meeting.type]) {
      acc[meeting.type] = { name: meeting.type, value: 0 };
    }
    
    acc[meeting.type].value += 1;
    return acc;
  }, {} as Record<string, { name: string, value: number }>);
  
  const meetingTypesChartData = Object.values(meetingTypesData);
  
  // Prepare data for order status chart
  const orderStatusData = filteredOrders.reduce((acc, order) => {
    if (!acc[order.status]) {
      acc[order.status] = { name: order.status.charAt(0).toUpperCase() + order.status.slice(1), value: 0 };
    }
    
    acc[order.status].value += 1;
    return acc;
  }, {} as Record<string, { name: string, value: number }>);
  
  const orderStatusChartData = Object.values(orderStatusData);
  
  // Prepare data for task priority chart
  const taskPriorityData = filteredTasks.reduce((acc, task) => {
    if (!acc[task.priority]) {
      acc[task.priority] = { name: task.priority.charAt(0).toUpperCase() + task.priority.slice(1), value: 0 };
    }
    
    acc[task.priority].value += 1;
    return acc;
  }, {} as Record<string, { name: string, value: number }>);
  
  const taskPriorityChartData = Object.values(taskPriorityData);
  
  // Check if user is admin - THIS WAS THE ISSUE: was checking wrong property
  const isAdmin = user?.role === "admin";
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground mt-1">Analyze your business performance</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeFrame} onValueChange={(value) => setTimeFrame(value as any)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Time frame" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 3 months</SelectItem>
              <SelectItem value="365">Last 12 months</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="agents">Agent Performance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          {/* Overview Cards */}
          <OverviewCards 
            data={{
              orders: filteredOrders,
              contacts: filteredContacts,
              meetings: filteredMeetings,
              tasks: filteredTasks
            }}
          />
          
          {/* Charts */}
          <Tabs defaultValue="sales">
            <TabsList>
              <TabsTrigger value="sales">Sales</TabsTrigger>
              <TabsTrigger value="activities">Activities</TabsTrigger>
              <TabsTrigger value="status">Status</TabsTrigger>
            </TabsList>
            <TabsContent value="sales" className="space-y-4">
              <SalesChart orders={filteredOrders} />
            </TabsContent>
            <TabsContent value="activities" className="space-y-4">
              <ActivitiesCharts 
                meetingTypes={meetingTypesChartData}
                taskPriorities={taskPriorityChartData}
              />
            </TabsContent>
            <TabsContent value="status" className="space-y-4">
              <StatusChart orderStatuses={orderStatusChartData} />
            </TabsContent>
          </Tabs>
        </TabsContent>
        
        <TabsContent value="agents">
          <AgentReports />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
