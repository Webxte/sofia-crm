
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useMeetings } from "@/context/meetings";
import { useOrders } from "@/context/OrdersContext";
import { useContacts } from "@/context/ContactsContext";
import { useTasks } from "@/context/TasksContext";
import { format, subMonths } from "date-fns";
import { formatCurrency } from "@/utils/formatting";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Colors for charts
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

const AgentReports = () => {
  const [timeFrame, setTimeFrame] = useState<"30" | "90" | "365" | "all">("30");
  const [selectedAgent, setSelectedAgent] = useState<string>("all");
  
  const { meetings } = useMeetings();
  const { orders } = useOrders();
  const { contacts } = useContacts();
  const { tasks } = useTasks();
  
  // Get date threshold based on selected time frame
  const getDateThreshold = () => {
    if (timeFrame === "all") return new Date(0);
    const days = parseInt(timeFrame);
    return subMonths(new Date(), days / 30);
  };
  
  const dateThreshold = getDateThreshold();
  
  // Get unique agents from data
  const agents = useMemo(() => {
    const agentSet = new Set<string>();
    
    // Add agents from meetings
    meetings.forEach(meeting => {
      if (meeting.agentName) agentSet.add(meeting.agentName);
    });
    
    // Add agents from orders
    orders.forEach(order => {
      if (order.agentName) agentSet.add(order.agentName);
    });
    
    // Add agents from contacts
    contacts.forEach(contact => {
      if (contact.agentName) agentSet.add(contact.agentName);
    });
    
    // Add agents from tasks
    tasks.forEach(task => {
      if (task.agentName) agentSet.add(task.agentName);
    });
    
    return Array.from(agentSet);
  }, [meetings, orders, contacts, tasks]);
  
  // Filter data based on selected agent and time frame
  const filteredData = useMemo(() => {
    const filteredMeetings = meetings.filter(m => {
      const dateCondition = new Date(m.createdAt) >= dateThreshold;
      const agentCondition = selectedAgent === "all" || m.agentName === selectedAgent;
      return dateCondition && agentCondition;
    });
    
    const filteredOrders = orders.filter(o => {
      const dateCondition = new Date(o.createdAt) >= dateThreshold;
      const agentCondition = selectedAgent === "all" || o.agentName === selectedAgent;
      return dateCondition && agentCondition;
    });
    
    const filteredContacts = contacts.filter(c => {
      const dateCondition = new Date(c.createdAt) >= dateThreshold;
      const agentCondition = selectedAgent === "all" || c.agentName === selectedAgent;
      return dateCondition && agentCondition;
    });
    
    const filteredTasks = tasks.filter(t => {
      const dateCondition = new Date(t.createdAt) >= dateThreshold;
      const agentCondition = selectedAgent === "all" || t.agentName === selectedAgent;
      return dateCondition && agentCondition;
    });
    
    return { filteredMeetings, filteredOrders, filteredContacts, filteredTasks };
  }, [meetings, orders, contacts, tasks, selectedAgent, dateThreshold]);
  
  // Prepare data for sales chart
  const salesData = useMemo(() => {
    const salesByMonth = filteredData.filteredOrders.reduce((acc, order) => {
      // Use month-year as key
      const date = new Date(order.date);
      const key = format(date, "MMM yyyy");
      
      if (!acc[key]) {
        acc[key] = { name: key, value: 0 };
      }
      
      acc[key].value += order.total;
      return acc;
    }, {} as Record<string, { name: string, value: number }>);
    
    return Object.values(salesByMonth).sort((a, b) => {
      const aDate = new Date(a.name);
      const bDate = new Date(b.name);
      return aDate.getTime() - bDate.getTime();
    });
  }, [filteredData.filteredOrders]);
  
  // Prepare data for meeting types chart
  const meetingTypesData = useMemo(() => {
    const typeCount = filteredData.filteredMeetings.reduce((acc, meeting) => {
      if (!acc[meeting.type]) {
        acc[meeting.type] = { name: meeting.type, value: 0 };
      }
      
      acc[meeting.type].value += 1;
      return acc;
    }, {} as Record<string, { name: string, value: number }>);
    
    return Object.values(typeCount);
  }, [filteredData.filteredMeetings]);
  
  // Prepare data for task priority chart
  const taskPriorityData = useMemo(() => {
    const priorityCount = filteredData.filteredTasks.reduce((acc, task) => {
      if (!acc[task.priority]) {
        acc[task.priority] = { 
          name: task.priority.charAt(0).toUpperCase() + task.priority.slice(1), 
          value: 0 
        };
      }
      
      acc[task.priority].value += 1;
      return acc;
    }, {} as Record<string, { name: string, value: number }>);
    
    return Object.values(priorityCount);
  }, [filteredData.filteredTasks]);
  
  // Calculate total sales
  const totalSales = filteredData.filteredOrders.reduce((total, order) => total + order.total, 0);
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Agent Performance</h2>
          <p className="text-muted-foreground mt-1">View performance metrics by agent</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={selectedAgent} onValueChange={setSelectedAgent}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select agent" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Agents</SelectItem>
              {agents.map(agent => (
                <SelectItem key={agent} value={agent}>{agent}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
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
        </div>
      </div>
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalSales)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {filteredData.filteredOrders.length} orders
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Contacts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredData.filteredContacts.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {filteredData.filteredContacts.filter(c => c.company).length} companies
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Meetings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredData.filteredMeetings.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {filteredData.filteredMeetings.filter(m => m.followUpScheduled).length} with follow-ups
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredData.filteredTasks.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {filteredData.filteredTasks.filter(t => t.status === "active").length} active
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts */}
      <Tabs defaultValue="sales">
        <TabsList>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
        </TabsList>
        <TabsContent value="sales" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sales Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {salesData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${formatCurrency(value as number)}`, "Sales"]} />
                      <Legend />
                      <Bar dataKey="value" name="Sales" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    No sales data available for selected criteria
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="activities" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Meeting Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  {meetingTypesData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={meetingTypesData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {meetingTypesData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [value, "Meetings"]} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      No meeting data available for selected criteria
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Task Priorities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  {taskPriorityData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={taskPriorityData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {taskPriorityData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [value, "Tasks"]} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      No task data available for selected criteria
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AgentReports;
