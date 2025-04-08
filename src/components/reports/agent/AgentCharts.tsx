
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { formatCurrency } from "@/utils/formatting";
import { Meeting, Order, Contact, Task } from "@/types";

interface AgentChartsProps {
  filteredOrders: Order[];
  filteredMeetings: Meeting[];
  filteredContacts: Contact[];
  filteredTasks: Task[];
  selectedAgentName: string;
}

export const AgentCharts = ({ 
  filteredOrders, 
  filteredMeetings, 
  filteredContacts, 
  filteredTasks,
  selectedAgentName
}: AgentChartsProps) => {
  // Colors for pie charts
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];
  
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
    // Ensure proper date comparison by converting month-year strings to Date objects
    const aMonthYear = a.name.split(' ');
    const bMonthYear = b.name.split(' ');
    
    const aDate = new Date(`${aMonthYear[0]} 1, ${aMonthYear[1]}`);
    const bDate = new Date(`${bMonthYear[0]} 1, ${bMonthYear[1]}`);
    
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
  
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Sales Overview</CardTitle>
          <CardDescription>Sales for {selectedAgentName} over time</CardDescription>
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
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
      
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Contact Sources</CardTitle>
          <CardDescription>Where {selectedAgentName}'s contacts come from</CardDescription>
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
    </>
  );
};
