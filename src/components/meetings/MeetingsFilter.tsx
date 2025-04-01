
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { MeetingTypeFilter } from "./MeetingTypeFilter";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface MeetingsFilterProps {
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  selectedMeetingType: string;
  onMeetingTypeChange: (value: string) => void;
  selectedSort: string;
  onSortChange: (value: string) => void;
  viewMode: "grid" | "list";
  onViewModeChange: (value: "grid" | "list") => void;
}

export const MeetingsFilter = ({
  searchQuery,
  onSearchQueryChange,
  selectedMeetingType,
  onMeetingTypeChange,
  selectedSort,
  onSortChange,
  viewMode,
  onViewModeChange
}: MeetingsFilterProps) => {
  return (
    <>
      <div className="flex flex-col md:flex-row gap-4 items-end md:items-center">
        <div className="w-full md:w-72">
          <Input
            placeholder="Search meetings..."
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="w-full md:w-40">
            <MeetingTypeFilter
              value={selectedMeetingType}
              onValueChange={onMeetingTypeChange}
            />
          </div>
          <div className="w-full md:w-40">
            <Select value={selectedSort} onValueChange={onSortChange}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Tabs value={viewMode} onValueChange={(v) => onViewModeChange(v as "grid" | "list")} className="w-full">
        <TabsList className="grid w-full md:w-60 grid-cols-2">
          <TabsTrigger value="list">List</TabsTrigger>
          <TabsTrigger value="grid">Grid</TabsTrigger>
        </TabsList>
      </Tabs>
    </>
  );
};
