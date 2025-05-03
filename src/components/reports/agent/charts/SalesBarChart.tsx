
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/utils/formatting";
import { Order } from "@/types";
import { useMemo } from "react";

interface SalesBarChartProps {
  orders: Order[];
  agentName: string;
}

export const SalesBarChart = ({ orders, agentName }: SalesBarChartProps) => {
  // Prepare data for sales chart
  const salesChartData = useMemo(() => {
    const salesData = orders.reduce((acc, order) => {
      const date = new Date(order.date);
      const key = format(date, "MMM yyyy");
      
      if (!acc[key]) {
        acc[key] = { name: key, value: 0 };
      }
      
      acc[key].value += order.total;
      return acc;
    }, {} as Record<string, { name: string, value: number }>);
    
    return Object.values(salesData).sort((a, b) => {
      // Ensure proper date comparison by converting month-year strings to Date objects
      const aMonthYear = a.name.split(' ');
      const bMonthYear = b.name.split(' ');
      
      const aDate = new Date(`${aMonthYear[0]} 1, ${aMonthYear[1]}`);
      const bDate = new Date(`${bMonthYear[0]} 1, ${bMonthYear[1]}`);
      
      return aDate.getTime() - bDate.getTime();
    });
  }, [orders]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales Overview</CardTitle>
        <CardDescription>Sales for {agentName} over time</CardDescription>
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
  );
};
