
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LayoutGrid, LayoutList, Download, Search as SearchIcon } from "lucide-react";
import { useState } from "react";

interface OrdersFilterProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  filterStatus: string;
  setFilterStatus: (value: string) => void;
  viewMode: "grid" | "list";
  setViewMode: (value: "grid" | "list") => void;
  handleExport: () => void;
  isMobile?: boolean;
}

export const OrdersFilter = ({
  searchQuery,
  setSearchQuery,
  filterStatus,
  setFilterStatus,
  viewMode,
  setViewMode,
  handleExport,
  isMobile
}: OrdersFilterProps) => {
  const [focused, setFocused] = useState(false);
  
  return (
    <div className="space-y-2">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-grow">
          <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 w-full"
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />
          {searchQuery && focused && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1 h-8 w-8 p-0"
              onClick={() => setSearchQuery("")}
            >
              ×
            </Button>
          )}
        </div>
        
        <div className="flex gap-2">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-32 sm:w-[140px]">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          
          {!isMobile && (
            <div className="flex items-center space-x-1 border rounded-md">
              <Button
                variant="ghost"
                size="icon"
                className={`rounded-l-md rounded-r-none h-9 ${
                  viewMode === "list" ? "bg-secondary" : ""
                }`}
                onClick={() => setViewMode("list")}
              >
                <LayoutList className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={`rounded-l-none rounded-r-md h-9 ${
                  viewMode === "grid" ? "bg-secondary" : ""
                }`}
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
          )}
          
          <Button variant="outline" size="icon" onClick={handleExport} title="Export Orders">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
