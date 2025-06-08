
import { Search, Calendar, SortDesc, List, Grid3X3 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
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
  viewMode,
  onViewModeChange,
  showAllMeetings,
  onShowAllMeetingsChange,
}: MeetingsFilterProps) => {
  const { user } = useAuth();

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <div className="flex flex-col sm:flex-row gap-4 flex-1">
        <div className="relative min-w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
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
            <SelectItem value="sales">Sales</SelectItem>
            <SelectItem value="follow-up">Follow-up</SelectItem>
            <SelectItem value="support">Support</SelectItem>
            <SelectItem value="demo">Demo</SelectItem>
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

        {/* Show the toggle for all authenticated users */}
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

      <div className="flex gap-2">
        <Button
          variant={viewMode === "list" ? "default" : "outline"}
          size="sm"
          onClick={() => onViewModeChange("list")}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant={viewMode === "grid" ? "default" : "outline"}
          size="sm"
          onClick={() => onViewModeChange("grid")}
        >
          <Grid3X3 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
