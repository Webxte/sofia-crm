import { ContactType } from "@/types";
import { Badge } from "@/components/ui/badge";

interface ContactTypeBadgeProps {
  type?: ContactType | string;
}

const STYLE_MAP: Record<string, string> = {
  lead:     "bg-blue-100 text-blue-700 border-blue-200",
  prospect: "bg-yellow-100 text-yellow-700 border-yellow-200",
  customer: "bg-green-100 text-green-700 border-green-200",
};

const LABEL_MAP: Record<string, string> = {
  lead:     "Lead",
  prospect: "Prospect",
  customer: "Customer",
};

export const ContactTypeBadge = ({ type = "lead" }: ContactTypeBadgeProps) => {
  const key = type || "lead";
  return (
    <Badge
      variant="outline"
      className={`text-xs font-medium ${STYLE_MAP[key] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}
    >
      {LABEL_MAP[key] ?? key}
    </Badge>
  );
};
