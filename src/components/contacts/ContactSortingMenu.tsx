
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ArrowDown, ArrowUp, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SortField, SortDirection } from "@/hooks/use-contact-sorting";
import { cn } from "@/lib/utils";

interface ContactSortingMenuProps {
  sortField: SortField;
  sortDirection: SortDirection;
  onSortChange: (field: SortField) => void;
}

export const ContactSortingMenu = ({
  sortField,
  sortDirection,
  onSortChange,
}: ContactSortingMenuProps) => {
  // Helper function to get field display name
  const getFieldDisplayName = (field: SortField) => {
    switch (field) {
      case "fullName":
        return "Name";
      case "company":
        return "Company";
      case "email":
        return "Email";
      case "phone":
        return "Phone";
      case "source":
        return "Source";
      case "createdAt":
        return "Created Date";
      case "updatedAt":
        return "Modified Date";
      default:
        return field;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center">
          <span className="mr-1">Sort by {getFieldDisplayName(sortField)}</span>
          {sortDirection === "asc" ? (
            <ArrowUp className="h-4 w-4" />
          ) : (
            <ArrowDown className="h-4 w-4" />
          )}
          <ChevronDown className="ml-1 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Sort Contacts</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {(["company", "fullName", "email", "phone", "source", "createdAt", "updatedAt"] as SortField[]).map(
            (field) => (
              <DropdownMenuItem
                key={field}
                className={cn(
                  "flex items-center cursor-pointer",
                  sortField === field && "font-medium"
                )}
                onClick={() => onSortChange(field)}
              >
                <span className="flex-1">{getFieldDisplayName(field)}</span>
                {sortField === field && (
                  sortDirection === "asc" ? (
                    <ArrowUp className="h-4 w-4 ml-2" />
                  ) : (
                    <ArrowDown className="h-4 w-4 ml-2" />
                  )
                )}
              </DropdownMenuItem>
            )
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
