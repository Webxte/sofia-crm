
import { Check, Phone, Mail, Users, Video, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MeetingTypeFilterProps {
  selectedType?: string; // Changed from 'value' to 'selectedType'
  onSelectType?: (value: string) => void; // Changed from 'onValueChange' to 'onSelectType'
  value?: string; // Keep old prop for backwards compatibility
  onValueChange?: (value: string) => void; // Keep old prop for backwards compatibility
}

export const MeetingTypeFilter = ({ 
  selectedType, 
  onSelectType, 
  value, 
  onValueChange 
}: MeetingTypeFilterProps) => {
  // Use either the new prop names or fall back to the old ones
  const actualValue = selectedType || value || "all";
  const handleValueChange = onSelectType || onValueChange || (() => {});

  const types = [
    {
      id: "all",
      name: "All Types",
      icon: MoreHorizontal,
    },
    {
      id: "meeting",
      name: "In-person Meeting",
      icon: Users,
    },
    {
      id: "phone",
      name: "Phone call",
      icon: Phone,
    },
    {
      id: "email",
      name: "Email",
      icon: Mail,
    },
    {
      id: "online",
      name: "Online",
      icon: Video,
    },
    {
      id: "other",
      name: "Other",
      icon: MoreHorizontal,
    },
  ];

  // Find the currently selected type for display
  const selectedTypeObj = types.find((type) => type.id === actualValue) || types[0];
  const Icon = selectedTypeObj.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-9">
          <Icon className="mr-1 h-4 w-4" />
          {selectedTypeObj.name}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Meeting Types</DropdownMenuLabel>
        <DropdownMenuGroup>
          {types.map((type) => {
            const TypeIcon = type.icon;
            return (
              <DropdownMenuItem
                key={type.id}
                onClick={() => handleValueChange(type.id)}
                className="cursor-pointer"
              >
                <TypeIcon className="mr-2 h-4 w-4" />
                <span>{type.name}</span>
                {actualValue === type.id && (
                  <Check className="ml-auto h-4 w-4" />
                )}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
