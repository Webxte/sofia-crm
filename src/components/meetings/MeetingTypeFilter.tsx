
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MeetingTypeFilterProps {
  value: string;
  onValueChange: (value: string) => void;
}

export const MeetingTypeFilter = ({ value, onValueChange }: MeetingTypeFilterProps) => {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Filter by type" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Types</SelectItem>
        <SelectItem value="meeting">In-person Meeting</SelectItem>
        <SelectItem value="online">Online Meeting</SelectItem>
        <SelectItem value="phone">Phone Call</SelectItem>
        <SelectItem value="email">Email</SelectItem>
        <SelectItem value="other">Other</SelectItem>
      </SelectContent>
    </Select>
  );
};
