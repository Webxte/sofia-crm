
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Task } from "@/types";
import { useMemo } from "react";

interface TaskPriorityChartProps {
  tasks: Task[];
}

export const TaskPriorityChart = ({ tasks }: TaskPriorityChartProps) => {
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];
  
  // Prepare data for task priority chart
  const taskPriorityChartData = useMemo(() => {
    const taskPriorityData = tasks.reduce((acc, task) => {
      if (!acc[task.priority]) {
        acc[task.priority] = { name: task.priority.charAt(0).toUpperCase() + task.priority.slice(1), value: 0 };
      }
      
      acc[task.priority].value += 1;
      return acc;
    }, {} as Record<string, { name: string, value: number }>);
    
    return Object.values(taskPriorityData);
  }, [tasks]);

  return (
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
  );
};
