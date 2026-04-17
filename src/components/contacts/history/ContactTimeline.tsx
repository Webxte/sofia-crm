import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { CalendarClock, ShoppingBag, Mail, CheckSquare, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMeetings } from "@/context/meetings";
import { useOrders } from "@/context/orders/OrdersContext";
import { useTasks } from "@/context/tasks";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/utils/formatting";

type EventType = "meeting" | "order" | "task" | "email";

interface TimelineEvent {
  id: string;
  type: EventType;
  date: Date;
  title: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: string;
  linkTo?: string;
}

interface ContactTimelineProps {
  contactId: string;
}

const iconFor = (type: EventType) => {
  switch (type) {
    case "meeting": return <CalendarClock className="h-4 w-4" />;
    case "order":   return <ShoppingBag className="h-4 w-4" />;
    case "task":    return <CheckSquare className="h-4 w-4" />;
    case "email":   return <Mail className="h-4 w-4" />;
  }
};

const colorFor = (type: EventType) => {
  switch (type) {
    case "meeting": return "bg-blue-100 text-blue-700 border-blue-200";
    case "order":   return "bg-purple-100 text-purple-700 border-purple-200";
    case "task":    return "bg-amber-100 text-amber-700 border-amber-200";
    case "email":   return "bg-teal-100 text-teal-700 border-teal-200";
  }
};

export const ContactTimeline: React.FC<ContactTimelineProps> = ({ contactId }) => {
  const navigate = useNavigate();
  const { getMeetingsByContactId } = useMeetings();
  const { orders } = useOrders();
  const { tasks } = useTasks();
  const [emailEvents, setEmailEvents] = useState<TimelineEvent[]>([]);
  const [emailLoading, setEmailLoading] = useState(true);

  useEffect(() => {
    const fetchEmails = async () => {
      setEmailLoading(true);
      const { data } = await supabase
        .from("email_logs")
        .select("id, subject, to_email, created_at, type, order_id")
        .eq("contact_id", contactId)
        .order("created_at", { ascending: false });

      setEmailEvents(
        (data || []).map((row: any) => ({
          id: row.id,
          type: "email" as EventType,
          date: new Date(row.created_at),
          title: row.subject,
          subtitle: `To: ${row.to_email}`,
          badge: row.type === "order" ? "Order email" : "Email",
        }))
      );
      setEmailLoading(false);
    };
    fetchEmails();
  }, [contactId]);

  const meetings = getMeetingsByContactId(contactId);
  const contactOrders = orders.filter(o => o.contactId === contactId);
  const contactTasks = tasks.filter(t => t.contactId === contactId);

  const meetingEvents: TimelineEvent[] = meetings.map(m => ({
    id: m.id,
    type: "meeting",
    date: new Date(m.date),
    title: `${m.type.charAt(0).toUpperCase() + m.type.slice(1)} meeting`,
    subtitle: m.notes ? m.notes.slice(0, 80) + (m.notes.length > 80 ? "…" : "") : undefined,
    badge: "Meeting",
    linkTo: `/meetings/${m.id}`,
  }));

  const orderEvents: TimelineEvent[] = contactOrders.map(o => ({
    id: o.id,
    type: "order",
    date: new Date(o.date),
    title: `Order #${o.reference || o.id.slice(0, 8).toUpperCase()}`,
    subtitle: `${formatCurrency(o.total)} · ${o.items.length} item${o.items.length !== 1 ? "s" : ""}`,
    badge: o.status,
    linkTo: `/orders/${o.id}`,
  }));

  const taskEvents: TimelineEvent[] = contactTasks.map(t => ({
    id: t.id,
    type: "task",
    date: t.dueDate ? new Date(t.dueDate) : t.createdAt,
    title: t.title,
    subtitle: t.description ? t.description.slice(0, 80) + (t.description.length > 80 ? "…" : "") : undefined,
    badge: t.status,
    linkTo: `/tasks/${t.id}`,
  }));

  const allEvents = [...meetingEvents, ...orderEvents, ...taskEvents, ...emailEvents]
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  if (emailLoading) {
    return (
      <div className="space-y-3 py-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex gap-3">
            <div className="h-8 w-8 rounded-full bg-muted animate-pulse shrink-0" />
            <div className="flex-1 space-y-1.5 pt-1">
              <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
              <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (allEvents.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No activity recorded for this contact yet.
      </div>
    );
  }

  return (
    <div className="relative pl-6">
      {/* Vertical line */}
      <div className="absolute left-3.5 top-2 bottom-2 w-px bg-border" />

      <div className="space-y-4">
        {allEvents.map((event) => (
          <div key={`${event.type}-${event.id}`} className="relative flex gap-3">
            {/* Icon dot */}
            <div className={`absolute -left-6 flex h-7 w-7 items-center justify-center rounded-full border bg-background ${colorFor(event.type)}`}>
              {iconFor(event.type)}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pb-1">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium text-sm leading-snug">{event.title}</p>
                  {event.subtitle && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{event.subtitle}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(event.date, "d MMM yyyy")}
                    {event.badge && (
                      <Badge variant="outline" className="ml-2 text-xs py-0 h-4">
                        {event.badge}
                      </Badge>
                    )}
                  </p>
                </div>
                {event.linkTo && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0"
                    onClick={() => navigate(event.linkTo!)}
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
