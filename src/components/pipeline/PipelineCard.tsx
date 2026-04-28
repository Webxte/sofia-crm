import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Contact } from "@/types";
import { Link } from "react-router-dom";
import { ContactTypeBadge } from "@/components/contacts/ContactTypeBadge";
import { Building2, User } from "lucide-react";

interface PipelineCardProps {
  contact: Contact;
}

export const PipelineCard = ({ contact }: PipelineCardProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: contact.id,
    data: { contact },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
    cursor: isDragging ? "grabbing" : "grab",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow select-none touch-manipulation"
    >
      <Link
        to={`/contacts/${contact.id}`}
        onClick={(e) => {
          // Prevent navigation when dragging
          if (isDragging) e.preventDefault();
        }}
        className="block"
      >
        <div className="flex items-start gap-2 mb-2">
          <div className="flex-1 min-w-0">
            {contact.company ? (
              <>
                <p className="font-semibold text-sm text-gray-900 truncate flex items-center gap-1">
                  <Building2 className="h-3 w-3 text-gray-400 flex-shrink-0" />
                  {contact.company}
                </p>
                {contact.fullName && (
                  <p className="text-xs text-gray-500 truncate flex items-center gap-1 mt-0.5">
                    <User className="h-3 w-3 text-gray-400 flex-shrink-0" />
                    {contact.fullName}
                  </p>
                )}
              </>
            ) : (
              <p className="font-semibold text-sm text-gray-900 truncate flex items-center gap-1">
                <User className="h-3 w-3 text-gray-400 flex-shrink-0" />
                {contact.fullName || "Unnamed"}
              </p>
            )}
          </div>
        </div>

        {contact.pipelineValue && contact.pipelineValue > 0 ? (
          <p className="text-xs font-medium text-emerald-600 mb-1">
            €{contact.pipelineValue.toLocaleString("en-IE")}
          </p>
        ) : null}

        {contact.pipelineNotes && (
          <p className="text-xs text-gray-400 truncate">{contact.pipelineNotes}</p>
        )}

        <div className="mt-2">
          <ContactTypeBadge type={contact.contactType} />
        </div>
      </Link>
    </div>
  );
};
