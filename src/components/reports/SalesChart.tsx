
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format } from "date-fns";

interface SalesChartProps {
  orders: any[];
}

const SalesChart: React.FC<SalesChartProps> = ({ orders }) => {
  // Prepare data for sales chart
  const salesData = orders.reduce((acc, order) => {
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
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales Overview</CardTitle>
        <CardDescription>Total sales over time</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          {salesChartData.length > 0 ? (
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

export default SalesChart;
