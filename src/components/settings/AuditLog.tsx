import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type AuditEntry = {
  id: string;
  table_name: string;
  record_id: string;
  action: "INSERT" | "UPDATE" | "DELETE";
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  changed_by: string | null;
  changed_at: string;
};

const ACTION_COLORS = {
  INSERT: "bg-green-100 text-green-800",
  UPDATE: "bg-blue-100 text-blue-800",
  DELETE: "bg-red-100 text-red-800",
};

const PAGE_SIZE = 25;

const AuditLog: React.FC = () => {
  const { isAdmin } = useAuth();
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [tableFilter, setTableFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin) return;
    fetchEntries();
  }, [page, tableFilter, actionFilter, isAdmin]);

  const fetchEntries = async () => {
    setLoading(true);
    let query = supabase
      .from("audit_logs")
      .select("*", { count: "exact" })
      .order("changed_at", { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (tableFilter !== "all") query = query.eq("table_name", tableFilter);
    if (actionFilter !== "all") query = query.eq("action", actionFilter);

    const { data, count, error } = await query;
    if (!error) {
      setEntries((data as AuditEntry[]) ?? []);
      setTotal(count ?? 0);
    }
    setLoading(false);
  };

  const summary = (entry: AuditEntry): string => {
    const src = entry.action === "DELETE" ? entry.old_data : entry.new_data;
    const name = (src?.full_name ?? src?.name ?? src?.title ?? src?.reference ?? entry.record_id.slice(0, 8)) as string;
    return name;
  };

  if (!isAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Audit Log</CardTitle>
          <CardDescription>You need administrator access to view the audit log.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Audit Log</CardTitle>
        <CardDescription>All changes to contacts, meetings, orders, tasks and products.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-3 mb-4">
          <Select value={tableFilter} onValueChange={(v) => { setTableFilter(v); setPage(0); }}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Table" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All tables</SelectItem>
              <SelectItem value="contacts">Contacts</SelectItem>
              <SelectItem value="meetings">Meetings</SelectItem>
              <SelectItem value="orders">Orders</SelectItem>
              <SelectItem value="tasks">Tasks</SelectItem>
              <SelectItem value="products">Products</SelectItem>
            </SelectContent>
          </Select>

          <Select value={actionFilter} onValueChange={(v) => { setActionFilter(v); setPage(0); }}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All actions</SelectItem>
              <SelectItem value="INSERT">Insert</SelectItem>
              <SelectItem value="UPDATE">Update</SelectItem>
              <SelectItem value="DELETE">Delete</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground py-8 text-center">Loading…</p>
        ) : entries.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">No audit entries found.</p>
        ) : (
          <div className="space-y-1">
            {entries.map((entry) => (
              <div key={entry.id} className="border rounded-lg overflow-hidden">
                <button
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-muted/50 transition-colors"
                  onClick={() => setExpanded(expanded === entry.id ? null : entry.id)}
                >
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded ${ACTION_COLORS[entry.action]}`}>
                    {entry.action}
                  </span>
                  <span className="text-xs text-muted-foreground w-20 shrink-0">{entry.table_name}</span>
                  <span className="text-sm font-medium flex-1 truncate">{summary(entry)}</span>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {formatDistanceToNow(new Date(entry.changed_at), { addSuffix: true })}
                  </span>
                </button>

                {expanded === entry.id && (
                  <div className="border-t bg-muted/30 px-4 py-3 space-y-2 text-xs">
                    <p><span className="font-medium">Record ID:</span> {entry.record_id}</p>
                    <p><span className="font-medium">Time:</span> {new Date(entry.changed_at).toLocaleString()}</p>
                    {entry.action === "UPDATE" && entry.old_data && entry.new_data && (
                      <div>
                        <p className="font-medium mb-1">Changed fields:</p>
                        <ul className="space-y-0.5">
                          {Object.keys(entry.new_data).filter(
                            (k) => JSON.stringify(entry.old_data![k]) !== JSON.stringify(entry.new_data![k])
                          ).map((k) => (
                            <li key={k} className="flex gap-2">
                              <span className="font-medium w-28 shrink-0">{k}:</span>
                              <span className="line-through text-red-600 truncate max-w-xs">{String(entry.old_data![k] ?? "")}</span>
                              <span className="text-green-700 truncate max-w-xs">{String(entry.new_data![k] ?? "")}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {entry.action === "DELETE" && (
                      <pre className="text-xs bg-background rounded p-2 overflow-auto max-h-40">
                        {JSON.stringify(entry.old_data, null, 2)}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-3 border-t">
            <p className="text-sm text-muted-foreground">
              Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} of {total}
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={page === 0}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">Page {page + 1} of {totalPages}</span>
              <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AuditLog;
