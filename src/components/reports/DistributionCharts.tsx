
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface ChartData {
  name: string;
  value: number;
}

interface DistributionChartProps {
  title: string;
  description: string;
  data: ChartData[];
  emptyMessage?: string;
}

// Colors for pie charts
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

const DistributionChart: React.FC<DistributionChartProps> = ({ 
  title, 
  description, 
  data, 
  emptyMessage = "No data available" 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, title]} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              {emptyMessage}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Parent component to arrange distribution charts
export const ActivitiesCharts: React.FC<{
  meetingTypes: ChartData[];
  taskPriorities: ChartData[];
}> = ({ meetingTypes, taskPriorities }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <DistributionChart
        title="Meeting Types"
        description="Distribution of meeting types"
        data={meetingTypes}
        emptyMessage="No meeting data available"
      />
      <DistributionChart
        title="Task Priorities"
        description="Distribution of task priorities"
        data={taskPriorities}
        emptyMessage="No task data available"
      />
    </div>
  );
};

// Status chart component
export const StatusChart: React.FC<{
  orderStatuses: ChartData[];
}> = ({ orderStatuses }) => {
  return (
    <DistributionChart
      title="Order Status"
      description="Distribution of order statuses"
      data={orderStatuses}
      emptyMessage="No order data available"
    />
  );
};

export default DistributionChart;
