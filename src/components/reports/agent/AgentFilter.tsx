
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMeetings } from "@/context/meetings";
import { useOrders } from "@/context/OrdersContext";
import { useContacts } from "@/context/ContactsContext";
import { useTasks } from "@/context/TasksContext";

interface AgentFilterProps {
  selectedAgent: string | null;
  setSelectedAgent: (agentId: string | null) => void;
  timeFrame: string;
  setTimeFrame: (timeFrame: any) => void;
}

export const AgentFilter = ({ 
  selectedAgent, 
  setSelectedAgent, 
  timeFrame, 
  setTimeFrame 
}: AgentFilterProps) => {
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
  }, [meetings, orders, contacts, tasks, selectedAgent, setSelectedAgent]);
  
  return (
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
      
      <Select value={timeFrame} onValueChange={(value) => setTimeFrame(value)}>
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
  );
};
