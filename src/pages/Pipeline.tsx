import { useState, useMemo } from "react";
import { useContacts } from "@/context/ContactsContext";
import { PipelineBoard } from "@/components/pipeline/PipelineBoard";
import { STAGE_CONFIG } from "@/components/pipeline/PipelineColumn";
import { PipelineStage } from "@/types";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const Pipeline = () => {
  const { contacts, loading } = useContacts();
  const [search, setSearch] = useState("");

  const filteredContacts = useMemo(() => {
    if (!search.trim()) return contacts;
    const q = search.toLowerCase();
    return contacts.filter(
      (c) =>
        c.company?.toLowerCase().includes(q) ||
        c.fullName?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q)
    );
  }, [contacts, search]);

  // Summary counts per stage
  const stageCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    contacts.forEach((c) => {
      const s = c.pipelineStage || "lead";
      counts[s] = (counts[s] || 0) + 1;
    });
    return counts;
  }, [contacts]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales Pipeline</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {contacts.length} contact{contacts.length !== 1 ? "s" : ""} — drag to move between stages
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search contacts..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Stage summary pills */}
      <div className="flex flex-wrap gap-2">
        {(Object.keys(STAGE_CONFIG) as PipelineStage[]).map((stage) => (
          <span
            key={stage}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${STAGE_CONFIG[stage].headerColor}`}
          >
            {STAGE_CONFIG[stage].label}
            <span className="font-bold">{stageCounts[stage] || 0}</span>
          </span>
        ))}
      </div>

      {/* Board */}
      {loading ? (
        <div className="flex gap-3 overflow-x-auto pb-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="min-w-[220px] w-[220px] flex-shrink-0 space-y-2">
              <Skeleton className="h-9 rounded-t-lg" />
              <Skeleton className="h-24 rounded-b-lg" />
            </div>
          ))}
        </div>
      ) : (
        <PipelineBoard contacts={filteredContacts} />
      )}
    </div>
  );
};

export default Pipeline;
