import { useDroppable } from "@dnd-kit/core";
import { Contact, PipelineStage } from "@/types";
import { PipelineCard } from "./PipelineCard";
import { Badge } from "@/components/ui/badge";

export const STAGE_CONFIG: Record<PipelineStage, { label: string; color: string; headerColor: string }> = {
  lead:           { label: "Lead",           color: "bg-slate-50  border-slate-200",  headerColor: "bg-slate-100  text-slate-700"  },
  contacted:      { label: "Contacted",      color: "bg-blue-50   border-blue-200",   headerColor: "bg-blue-100   text-blue-700"   },
  qualified:      { label: "Qualified",      color: "bg-violet-50 border-violet-200", headerColor: "bg-violet-100 text-violet-700" },
  proposal_sent:  { label: "Proposal Sent",  color: "bg-amber-50  border-amber-200",  headerColor: "bg-amber-100  text-amber-700"  },
  negotiation:    { label: "Negotiation",    color: "bg-orange-50 border-orange-200", headerColor: "bg-orange-100 text-orange-700" },
  won:            { label: "Won ✓",          color: "bg-green-50  border-green-200",  headerColor: "bg-green-100  text-green-700"  },
  lost:           { label: "Lost",           color: "bg-red-50    border-red-200",    headerColor: "bg-red-100    text-red-700"    },
};

interface PipelineColumnProps {
  stage: PipelineStage;
  contacts: Contact[];
  isOver: boolean;
}

export const PipelineColumn = ({ stage, contacts, isOver }: PipelineColumnProps) => {
  const { setNodeRef } = useDroppable({ id: stage });
  const config = STAGE_CONFIG[stage];

  return (
    <div className="flex flex-col min-w-[220px] w-[220px] flex-shrink-0">
      {/* Column header */}
      <div className={`flex items-center justify-between px-3 py-2 rounded-t-lg ${config.headerColor}`}>
        <span className="text-sm font-semibold">{config.label}</span>
        <Badge variant="secondary" className="text-xs h-5 px-1.5">
          {contacts.length}
        </Badge>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={`
          flex-1 min-h-[400px] p-2 rounded-b-lg border
          ${config.color}
          ${isOver ? "ring-2 ring-blue-400 ring-inset" : ""}
          transition-all duration-150
        `}
      >
        <div className="flex flex-col gap-2">
          {contacts.map((contact) => (
            <PipelineCard key={contact.id} contact={contact} />
          ))}
          {contacts.length === 0 && (
            <p className="text-xs text-gray-400 text-center pt-6 select-none">
              Drop here
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
