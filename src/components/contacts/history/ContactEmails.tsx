import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { Mail, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface EmailLog {
  id: string;
  type: "order" | "contact";
  to_email: string;
  subject: string;
  body_preview: string | null;
  sent_by_name: string | null;
  order_id: string | null;
  created_at: string;
}

interface ContactEmailsProps {
  contactId: string;
}

export const ContactEmails: React.FC<ContactEmailsProps> = ({ contactId }) => {
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("email_logs")
        .select("*")
        .eq("contact_id", contactId)
        .order("created_at", { ascending: false });
      setLogs((data as EmailLog[]) || []);
      setLoading(false);
    };
    fetch();
  }, [contactId]);

  if (loading) {
    return (
      <div className="space-y-2 py-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-14 bg-muted animate-pulse rounded" />
        ))}
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No emails sent to this contact yet.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {logs.map((log) => (
        <div key={log.id} className="border rounded-lg overflow-hidden">
          <button
            className="w-full flex items-start gap-3 p-3 text-left hover:bg-muted/50 transition-colors"
            onClick={() => setExpanded(expanded === log.id ? null : log.id)}
          >
            <Mail className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-sm truncate">{log.subject}</span>
                <Badge variant={log.type === "order" ? "outline" : "secondary"} className="text-xs shrink-0">
                  {log.type === "order" ? "Order" : "Contact"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                To: {log.to_email}
                {log.sent_by_name && ` · by ${log.sent_by_name}`}
                {" · "}
                {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
              </p>
            </div>
            {expanded === log.id ? (
              <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
            )}
          </button>
          {expanded === log.id && log.body_preview && (
            <div className="px-4 pb-3 pt-0 border-t bg-muted/30">
              <p className="text-sm text-muted-foreground whitespace-pre-line">{log.body_preview}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
