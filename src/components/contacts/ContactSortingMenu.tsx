
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowDownUp } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SortField, SortDirection } from "@/hooks/use-contact-sorting";

interface ContactSortingMenuProps {
  sortField: SortField;
  sortDirection: SortDirection;
  onSortChange: (field: SortField) => void;
}

export const ContactSortingMenu: React.FC<ContactSortingMenuProps> = ({ 
  sortField, 
  sortDirection, 
  onSortChange 
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <ArrowDownUp className="h-4 w-4 mr-2" />
          Sort: {sortField === "company" ? "Company" : 
                sortField === "fullName" ? "Name" : 
                sortField === "email" ? "Email" :
                sortField === "phone" ? "Phone" : "Source"}
          {sortDirection === "asc" ? " (A-Z)" : " (Z-A)"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onSortChange("company")}>
          Sort by Company
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onSortChange("fullName")}>
          Sort by Name
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onSortChange("email")}>
          Sort by Email
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onSortChange("phone")}>
          Sort by Phone
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onSortChange("source")}>
          Sort by Source
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
