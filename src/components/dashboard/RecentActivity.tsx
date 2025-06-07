
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useContacts } from "@/context/contacts/ContactsContext";
import { useMeetings } from "@/context/meetings";
import { useTasks } from "@/context/tasks";
import { format } from "date-fns";
import { Users, Calendar, CheckSquare } from "lucide-react";
import { Link } from "react-router-dom";

export function RecentActivity() {
  const { contacts } = useContacts();
  const { meetings } = useMeetings();
  const { tasks } = useTasks();

  // Get recent items (last 5 of each)
  const recentContacts = contacts
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const upcomingMeetings = meetings
    .filter(meeting => new Date(meeting.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  const activeTasks = tasks
    .filter(task => task.status !== "completed" && task.status !== "cancelled")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg">Recent Contacts</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentContacts.length > 0 ? (
              recentContacts.map((contact) => (
                <Link
                  key={contact.id}
                  to={`/contacts/${contact.id}`}
                  className="block hover:bg-muted/50 p-2 rounded transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{contact.fullName}</p>
                      <p className="text-sm text-muted-foreground">{contact.email}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(contact.createdAt, 'MMM d')}
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No recent contacts</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg">Upcoming Meetings</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {upcomingMeetings.length > 0 ? (
              upcomingMeetings.map((meeting) => (
                <Link
                  key={meeting.id}
                  to={`/meetings/${meeting.id}`}
                  className="block hover:bg-muted/50 p-2 rounded transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{meeting.contactName}</p>
                      <p className="text-sm text-muted-foreground">
                        {meeting.type.charAt(0).toUpperCase() + meeting.type.slice(1)}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(meeting.date), 'MMM d')}
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No upcoming meetings</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg">Active Tasks</CardTitle>
          <CheckSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {activeTasks.length > 0 ? (
              activeTasks.map((task) => (
                <Link
                  key={task.id}
                  to={`/tasks/${task.id}`}
                  className="block hover:bg-muted/50 p-2 rounded transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{task.title}</p>
                      <p className="text-sm text-muted-foreground">
                        Priority: {task.priority}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {task.dueDate ? format(new Date(task.dueDate), 'MMM d') : 'No due date'}
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No active tasks</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
