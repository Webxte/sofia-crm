import { Search, List, Grid3X3, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";

interface MeetingsFilterProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  selectedMeetingType: string;
  onMeetingTypeChange: (type: string) => void;
  selectedSort: string;
  onSortChange: (sort: string) => void;
  dateFrom: string;
  onDateFromChange: (d: string) => void;
  dateTo: string;
  onDateToChange: (d: string) => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  showAllMeetings: boolean;
  onShowAllMeetingsChange: (showAll: boolean) => void;
}

export const MeetingsFilter = ({
  searchQuery,
  onSearchQueryChange,
  selectedMeetingType,
  onMeetingTypeChange,
  selectedSort,
  onSortChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  viewMode,
  onViewModeChange,
  showAllMeetings,
  onShowAllMeetingsChange,
}: MeetingsFilterProps) => {
  const { user } = useAuth();
  const hasDateFilter = dateFrom || dateTo;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1 flex-wrap">
          <div className="relative min-w-52">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search meetings..."
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={selectedMeetingType} onValueChange={onMeetingTypeChange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Meeting type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="meeting">Meeting</SelectItem>
              <SelectItem value="phone">Phone</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="online">Online</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedSort} onValueChange={onSortChange}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => onDateFromChange(e.target.value)}
              className="w-36 text-sm"
              title="From date"
            />
            <span className="text-muted-foreground text-sm">–</span>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => onDateToChange(e.target.value)}
              className="w-36 text-sm"
              title="To date"
            />
            {hasDateFilter && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => { onDateFromChange(""); onDateToChange(""); }}
                title="Clear date filter"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {user && (
            <div className="flex items-center space-x-2">
              <Switch
                id="show-all-meetings"
                checked={showAllMeetings}
                onCheckedChange={onShowAllMeetingsChange}
              />
              <Label htmlFor="show-all-meetings" className="text-sm whitespace-nowrap">
                Show all meetings
              </Label>
            </div>
          )}
        </div>

        <div className="flex gap-2 shrink-0">
          <Button variant={viewMode === "list" ? "default" : "outline"} size="sm" onClick={() => onViewModeChange("list")}>
            <List className="h-4 w-4" />
          </Button>
          <Button variant={viewMode === "grid" ? "default" : "outline"} size="sm" onClick={() => onViewModeChange("grid")}>
            <Grid3X3 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
