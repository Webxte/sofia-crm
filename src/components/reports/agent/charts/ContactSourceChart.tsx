
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Contact } from "@/types";
import { useMemo } from "react";

interface ContactSourceChartProps {
  contacts: Contact[];
  agentName: string;
}

export const ContactSourceChart = ({ contacts, agentName }: ContactSourceChartProps) => {
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];
  
  // Prepare data for contact sources chart
  const contactSourcesChartData = useMemo(() => {
    const contactSourcesData = contacts.reduce((acc, contact) => {
      const source = contact.source || "Unknown";
      
      // Handle multiple sources separated by commas
      source.split(',').forEach(src => {
        const trimmedSource = src.trim();
        if (!acc[trimmedSource]) {
          acc[trimmedSource] = { name: trimmedSource, value: 0 };
        }
        acc[trimmedSource].value += 1;
      });
      
      return acc;
    }, {} as Record<string, { name: string, value: number }>);
    
    return Object.values(contactSourcesData);
  }, [contacts]);

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Contact Sources</CardTitle>
        <CardDescription>Where {agentName}'s contacts come from</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          {contactSourcesChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={contactSourcesChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {contactSourcesChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, "Contacts"]} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              No contact source data available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
