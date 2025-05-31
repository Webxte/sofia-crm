
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useContacts } from "@/context/ContactsContext";
import { useMeetings } from "@/context/meetings";
import { useTasks } from "@/context/tasks";
import { useOrders } from "@/context/OrdersContext";
import { format } from "date-fns";

export function RecentActivity() {
  const { contacts } = useContacts();
  const { meetings } = useMeetings();
  const { tasks } = useTasks();
  const { orders } = useOrders();

  // Get recent items from last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentContacts = contacts
    .filter(contact => new Date(contact.createdAt) >= sevenDaysAgo)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  const upcomingMeetings = meetings
    .filter(meeting => new Date(meeting.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  const recentTasks = tasks
    .filter(task => task.status === "active")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Recent Contacts</CardTitle>
          <CardDescription>New contacts added this week</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentContacts.length > 0 ? (
            recentContacts.map((contact) => (
              <div key={contact.id} className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{contact.fullName || contact.company}</p>
                  <p className="text-sm text-muted-foreground">{contact.email}</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(contact.createdAt), "MMM d")}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No recent contacts</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Meetings</CardTitle>
          <CardDescription>Your next scheduled meetings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {upcomingMeetings.length > 0 ? (
            upcomingMeetings.map((meeting) => (
              <div key={meeting.id} className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{meeting.contactName}</p>
                  <p className="text-sm text-muted-foreground">{meeting.type}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs">{format(new Date(meeting.date), "MMM d")}</p>
                  <p className="text-xs text-muted-foreground">{meeting.time}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No upcoming meetings</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Tasks</CardTitle>
          <CardDescription>Tasks that need attention</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentTasks.length > 0 ? (
            recentTasks.map((task) => (
              <div key={task.id} className="flex justify-between items-center">
                <div className="flex-1">
                  <p className="font-medium truncate">{task.title}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant={task.priority === "high" ? "destructive" : task.priority === "medium" ? "default" : "secondary"} className="text-xs">
                      {task.priority}
                    </Badge>
                    {task.dueDate && (
                      <p className="text-xs text-muted-foreground">
                        Due {format(new Date(task.dueDate), "MMM d")}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No active tasks</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
