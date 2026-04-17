import { useMemo } from "react";
import { useTasks } from "@/context/tasks";
import { useOrders } from "@/context/orders/OrdersContext";
import { useMeetings } from "@/context/meetings";

export interface Agent {
  id: string;
  name: string;
}

export const useAgents = (): Agent[] => {
  const { tasks } = useTasks();
  const { orders } = useOrders();
  const { meetings } = useMeetings();

  return useMemo(() => {
    const map = new Map<string, string>();
    [...tasks, ...orders, ...meetings].forEach((r: any) => {
      if (r.agentId && r.agentName && !map.has(r.agentId)) {
        map.set(r.agentId, r.agentName);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [tasks, orders, meetings]);
};
