
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { formatCurrency } from "@/utils/formatting";
import { Meeting, Order, Contact, Task } from "@/types";
import { SalesBarChart } from "./charts/SalesBarChart";
import { MeetingTypePieChart } from "./charts/MeetingTypePieChart";
import { TaskPriorityChart } from "./charts/TaskPriorityChart";
import { ContactSourceChart } from "./charts/ContactSourceChart";

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
  return (
    <>
      <SalesBarChart 
        orders={filteredOrders} 
        agentName={selectedAgentName} 
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <MeetingTypePieChart meetings={filteredMeetings} />
        <TaskPriorityChart tasks={filteredTasks} />
      </div>
      
      <ContactSourceChart 
        contacts={filteredContacts} 
        agentName={selectedAgentName} 
      />
    </>
  );
};
