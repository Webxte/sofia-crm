
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useMeetings } from "@/context/meetings";
import { useOrders } from "@/context/OrdersContext";
import { useContacts } from "@/context/ContactsContext";
import { useTasks } from "@/context/TasksContext";
import { formatCurrency } from "@/utils/formatting";
import { format, subMonths } from "date-fns";

const AgentReports = () => {
  const [timeFrame, setTimeFrame] = useState<"30" | "90" | "365" | "all">("30");
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const { meetings } = useMeetings();
  const { orders } = useOrders();
  const { contacts } = useContacts();
  const { tasks } = useTasks();
  const [agents, setAgents] = useState<{id: string, name: string}[]>([]);
  
  // Extract unique agents from data
  useEffect(() => {
    const uniqueAgents = new Map<string, {id: string, name: string}>();
    
    // Get agents from meetings
    meetings.forEach(meeting => {
      if (meeting.agentId && meeting.agentName) {
        uniqueAgents.set(meeting.agentId, {id: meeting.agentId, name: meeting.agentName});
      }
    });
    
    // Get agents from orders
    orders.forEach(order => {
      if (order.agentId && order.agentName) {
        uniqueAgents.set(order.agentId, {id: order.agentId, name: order.agentName});
      }
    });
    
    // Get agents from contacts
    contacts.forEach(contact => {
      if (contact.agentId && contact.agentName) {
        uniqueAgents.set(contact.agentId, {id: contact.agentId, name: contact.agentName});
      }
    });
    
    // Get agents from tasks
    tasks.forEach(task => {
      if (task.agentId && task.agentName) {
        uniqueAgents.set(task.agentId, {id: task.agentId, name: task.agentName});
      }
    });
    
    const agentsList = Array.from(uniqueAgents.values());
    setAgents(agentsList);
    
    // Set first agent as default if there are agents and none is selected
    if (agentsList.length > 0 && !selectedAgent) {
      setSelectedAgent(agentsList[0].id);
    }
  }, [meetings, orders, contacts, tasks, selectedAgent]);
  
  // Get date threshold based on selected time frame
  const getDateThreshold = () => {
    if (timeFrame === "all") return new Date(0);
    const days = parseInt(timeFrame);
    return subMonths(new Date(), days / 30);
  };
  
  const dateThreshold = getDateThreshold();
  
  // Filter data based on selected time frame and agent
  const filteredMeetings = meetings.filter(m => 
    new Date(m.createdAt) >= dateThreshold && 
    (selectedAgent ? m.agentId === selectedAgent : true)
  );
  
  const filteredOrders = orders.filter(o => 
    new Date(o.createdAt) >= dateThreshold && 
    (selectedAgent ? o.agentId === selectedAgent : true)
  );
  
  const filteredContacts = contacts.filter(c => 
    new Date(c.createdAt) >= dateThreshold && 
    (selectedAgent ? c.agentId === selectedAgent : true)
  );
  
  const filteredTasks = tasks.filter(t => 
    new Date(t.createdAt) >= dateThreshold && 
    (selectedAgent ? t.agentId === selectedAgent : true)
  );
  
  // Prepare data for sales chart
  const salesData = filteredOrders.reduce((acc, order) => {
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
  
  // Prepare data for contact sources chart
  const contactSourcesData = filteredContacts.reduce((acc, contact) => {
    const source = contact.source || "Unknown";
    
    if (!acc[source]) {
      acc[source] = { name: source, value: 0 };
    }
    
    acc[source].value += 1;
    return acc;
  }, {} as Record<string, { name: string, value: number }>);
  
  const contactSourcesChartData = Object.values(contactSourcesData);
  
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
  
  // Get the selected agent name
  const getSelectedAgentName = () => {
    if (!selectedAgent) return "All Agents";
    const agent = agents.find(a => a.id === selectedAgent);
    return agent ? agent.name : "Unknown Agent";
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Agent Performance</h2>
          <p className="text-muted-foreground">Track individual agent metrics and performance</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={selectedAgent || ""} onValueChange={setSelectedAgent}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select agent" />
            </SelectTrigger>
            <SelectContent>
              {agents.map(agent => (
                <SelectItem key={agent.id} value={agent.id}>
                  {agent.name}
                </SelectItem>
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
      
      {/* Agent Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(filteredOrders.reduce((total, order) => total + order.total, 0))}
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
      
      <Tabs defaultValue="sales">
        <TabsList>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
        </TabsList>
        
        <TabsContent value="sales" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sales Overview</CardTitle>
              <CardDescription>Sales for {getSelectedAgentName()} over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {salesChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={salesChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [formatCurrency(value as number), "Sales"]} />
                      <Legend />
                      <Bar dataKey="value" name="Sales" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    No sales data available
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
        
        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contact Sources</CardTitle>
              <CardDescription>Where {getSelectedAgentName()}'s contacts come from</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {contactSourcesChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={contactSourcesChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {contactSourcesChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [value, "Contacts"]} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    No contact source data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AgentReports;
