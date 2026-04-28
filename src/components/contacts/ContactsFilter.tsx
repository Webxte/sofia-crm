
import { Search, RefreshCw, List, Grid as GridIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface ContactsFilterProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  showAllContacts: boolean;
  onShowAllContactsChange: (value: boolean) => void;
  selectedSource: string | null;
  onSourceChange: (value: string | null) => void;
  sources: string[];
  selectedType: string | null;
  onTypeChange: (value: string | null) => void;
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
  selectedType,
  onTypeChange,
  viewMode,
  onViewModeChange,
  onRefresh,
  isRefreshing
}: ContactsFilterProps) => {
  return (
    <div className="flex flex-col space-y-4">
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
          <Select
            value={selectedType || "all"}
            onValueChange={(value) => onTypeChange(value === "all" ? null : value)}
          >
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="lead">Lead</SelectItem>
              <SelectItem value="prospect">Prospect</SelectItem>
              <SelectItem value="customer">Customer</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={selectedSource || "all"}
            onValueChange={(value) => onSourceChange(value === "all" ? null : value)}
          >
            <SelectTrigger className="w-full sm:w-[160px]">
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
      
      <div className="flex items-center space-x-2">
        <Switch
          id="show-all-contacts"
          checked={showAllContacts}
          onCheckedChange={onShowAllContactsChange}
        />
        <Label htmlFor="show-all-contacts">Show all contacts (including those from other agents)</Label>
      </div>
    </div>
  );
};
