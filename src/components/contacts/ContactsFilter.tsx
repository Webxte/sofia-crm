
import { Search, RefreshCw, List, Grid as GridIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface ContactsFilterProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  showAllContacts: boolean;
  onShowAllContactsChange: (value: boolean) => void;
  selectedSource: string | null;
  onSourceChange: (value: string | null) => void;
  sources: string[];
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const ContactsFilter = ({
  searchQuery,
  onSearchChange,
  showAllContacts,
  onShowAllContactsChange,
  selectedSource,
  onSourceChange,
  sources,
  viewMode,
  onViewModeChange,
  onRefresh,
  isRefreshing
}: ContactsFilterProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-2 items-center">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search contacts..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className="flex gap-2 items-center w-full sm:w-auto">
        <div className="flex items-center gap-2 whitespace-nowrap">
          <input
            type="checkbox"
            id="showAllContacts"
            checked={showAllContacts}
            onChange={(e) => {
              onShowAllContactsChange(e.target.checked);
            }}
            className="rounded border-gray-300 text-primary focus:ring-primary"
          />
          <label htmlFor="showAllContacts" className="text-sm">
            Show all
          </label>
        </div>
        <Select 
          value={selectedSource || "all"} 
          onValueChange={(value) => onSourceChange(value === "all" ? null : value)}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="All Sources" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            {sources.map(source => (
              <SelectItem key={source} value={source}>
                {source}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex border rounded-md overflow-hidden">
        <Button 
          variant={viewMode === "grid" ? "default" : "ghost"} 
          size="sm"
          onClick={() => onViewModeChange("grid")}
          className="rounded-none"
        >
          <GridIcon className="h-4 w-4" />
        </Button>
        <Button 
          variant={viewMode === "list" ? "default" : "ghost"} 
          size="sm"
          onClick={() => onViewModeChange("list")}
          className="rounded-none"
        >
          <List className="h-4 w-4" />
        </Button>
      </div>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onRefresh}
        disabled={isRefreshing}
        className="sm:ml-2"
      >
        <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
        Refresh
      </Button>
    </div>
  );
};
