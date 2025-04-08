
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { useMeetings } from "@/context/meetings";
import { useOrders } from "@/context/OrdersContext";
import { useContacts } from "@/context/ContactsContext";
import { useTasks } from "@/context/TasksContext";
import { format, subMonths } from "date-fns";
import { Download } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import AgentReports from "@/components/reports/AgentReports";
import { formatCurrency } from "@/utils/formatting";

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
  
  // Prepare data for sales chart
  const salesData = filteredOrders.reduce((acc, order) => {
    // Use month-year as key
    const date = new Date(order.date);
    const key = format(date, "MMM yyyy");
    
    if (!acc[key]) {
      acc[key] = { name: key, value: 0 };
    }
    
    acc[key].value += order.total;
    return acc;
  }, {} as Record<string, { name: string, value: number }>);
  
  const salesChartData = Object.values(salesData).sort((a, b) => {
    const aDate = new Date(a.name);
    const bDate = new Date(b.name);
    return aDate.getTime() - bDate.getTime();
  });
  
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
  
  // Colors for pie charts
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];
  
  // Check if user is admin
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
          {isAdmin && <TabsTrigger value="agents">Agent Performance</TabsTrigger>}
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  €{filteredOrders.reduce((total, order) => total + order.total, 0).toFixed(2)}
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
                  {filteredMeetings.filter(m => m.followUpScheduled).length} with follow-ups
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
                  {filteredTasks.filter(t => t.status === "active").length} active
                </p>
              </CardContent>
            </Card>
          </div>
          
          {/* Charts */}
          <Tabs defaultValue="sales">
            <TabsList>
              <TabsTrigger value="sales">Sales</TabsTrigger>
              <TabsTrigger value="activities">Activities</TabsTrigger>
              <TabsTrigger value="status">Status</TabsTrigger>
            </TabsList>
            <TabsContent value="sales" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Sales Overview</CardTitle>
                  <CardDescription>Total sales over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={salesChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`€${value}`, "Sales"]} />
                        <Legend />
                        <Bar dataKey="value" name="Sales" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="activities" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Meeting Types</CardTitle>
                    <CardDescription>Distribution of meeting types</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      {meetingTypesChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={meetingTypesChartData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {meetingTypesChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => [value, "Meetings"]} />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground">
                          No meeting data available
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Task Priorities</CardTitle>
                    <CardDescription>Distribution of task priorities</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      {taskPriorityChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={taskPriorityChartData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {taskPriorityChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => [value, "Tasks"]} />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground">
                          No task data available
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="status" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Order Status</CardTitle>
                  <CardDescription>Distribution of order statuses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    {orderStatusChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={orderStatusChartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {orderStatusChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [value, "Orders"]} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground">
                        No order data available
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>
        
        {isAdmin && (
          <TabsContent value="agents">
            <AgentReports />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default Reports;
