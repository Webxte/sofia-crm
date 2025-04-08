
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { Order } from "@/types";

interface SalesChartProps {
  orders: Order[];
}

interface ChartDataItem {
  name: string;
  value: number;
}

const SalesChart: React.FC<SalesChartProps> = ({ orders }) => {
  // Prepare data for sales chart
  const salesData = orders.reduce<Record<string, ChartDataItem>>((acc, order) => {
    // Use month-year as key
    const date = new Date(order.date);
    const key = format(date, "MMM yyyy");
    
    if (!acc[key]) {
      acc[key] = { name: key, value: 0 };
    }
    
    acc[key].value += order.total;
    return acc;
  }, {});
  
  const salesChartData = Object.values(salesData).sort((a, b) => {
    // Ensure we're comparing Date objects properly by parsing the month-year format
    const aMonthYear = a.name.split(' ');
    const bMonthYear = b.name.split(' ');
    
    const aDate = new Date(`${aMonthYear[0]} 1, ${aMonthYear[1]}`);
    const bDate = new Date(`${bMonthYear[0]} 1, ${bMonthYear[1]}`);
    
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
