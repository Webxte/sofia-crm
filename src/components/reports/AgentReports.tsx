
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMeetings } from "@/context/meetings";
import { useOrders } from "@/context/orders/OrdersContext";
import { useContacts } from "@/context/contacts/ContactsContext";
import { useTasks } from "@/context/tasks";
import { subMonths } from "date-fns";
import { AgentFilter } from "./agent/AgentFilter";
import { AgentOverviewCards } from "./agent/AgentOverviewCards";
import { AgentCharts } from "./agent/AgentCharts";

const AgentReports = () => {
  const [timeFrame, setTimeFrame] = useState<"30" | "90" | "365" | "all">("30");
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
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
  
  // Get the selected agent name
  const getSelectedAgentName = () => {
    if (!selectedAgent) return "All Agents";
    const agent = meetings.find(m => m.agentId === selectedAgent)?.agentName || 
                 orders.find(o => o.agentId === selectedAgent)?.agentName || 
                 contacts.find(c => c.agentId === selectedAgent)?.agentName || 
                 tasks.find(t => t.agentId === selectedAgent)?.agentName;
    return agent || "Unknown Agent";
  };
  
  const selectedAgentName = getSelectedAgentName();
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Agent Performance</h2>
          <p className="text-muted-foreground">Track individual agent metrics and performance</p>
        </div>
        
        <AgentFilter
          selectedAgent={selectedAgent}
          setSelectedAgent={setSelectedAgent}
          timeFrame={timeFrame}
          setTimeFrame={setTimeFrame}
        />
      </div>
      
      {/* Agent Overview Cards */}
      <AgentOverviewCards
        filteredOrders={filteredOrders}
        filteredContacts={filteredContacts} 
        filteredMeetings={filteredMeetings}
        filteredTasks={filteredTasks}
      />
      
      <Tabs defaultValue="sales">
        <TabsList>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
        </TabsList>
        
        <TabsContent value="sales" className="space-y-4">
          <AgentCharts
            filteredOrders={filteredOrders}
            filteredMeetings={filteredMeetings}
            filteredContacts={filteredContacts}
            filteredTasks={filteredTasks}
            selectedAgentName={selectedAgentName}
          />
        </TabsContent>
        
        <TabsContent value="activities" className="space-y-4">
          <AgentCharts
            filteredOrders={filteredOrders}
            filteredMeetings={filteredMeetings}
            filteredContacts={filteredContacts}
            filteredTasks={filteredTasks}
            selectedAgentName={selectedAgentName}
          />
        </TabsContent>
        
        <TabsContent value="customers" className="space-y-4">
          <AgentCharts
            filteredOrders={filteredOrders}
            filteredMeetings={filteredMeetings}
            filteredContacts={filteredContacts}
            filteredTasks={filteredTasks}
            selectedAgentName={selectedAgentName}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AgentReports;
