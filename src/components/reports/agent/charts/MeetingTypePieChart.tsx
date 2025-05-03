
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Meeting } from "@/types";
import { useMemo } from "react";

interface MeetingTypePieChartProps {
  meetings: Meeting[];
}

export const MeetingTypePieChart = ({ meetings }: MeetingTypePieChartProps) => {
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];
  
  // Prepare data for meeting types chart
  const meetingTypesChartData = useMemo(() => {
    const meetingTypesData = meetings.reduce((acc, meeting) => {
      if (!acc[meeting.type]) {
        acc[meeting.type] = { name: meeting.type, value: 0 };
      }
      
      acc[meeting.type].value += 1;
      return acc;
    }, {} as Record<string, { name: string, value: number }>);
    
    return Object.values(meetingTypesData);
  }, [meetings]);

  return (
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
  );
};
