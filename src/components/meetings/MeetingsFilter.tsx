
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MeetingTypeFilter } from './MeetingTypeFilter';
import { Button } from '@/components/ui/button';
import { Grid3X3, List } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

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
        
        <MeetingTypeFilter
          selectedType={selectedMeetingType}
          onSelectType={onMeetingTypeChange}
        />

        <Select value={selectedSort} onValueChange={onSortChange}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
          </SelectContent>
        </Select>

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
