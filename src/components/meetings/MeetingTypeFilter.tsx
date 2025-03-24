
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
  value: string;
  onValueChange: (value: string) => void;
}

export const MeetingTypeFilter = ({ value, onValueChange }: MeetingTypeFilterProps) => {
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
  const selectedType = types.find((type) => type.id === value) || types[0];
  const Icon = selectedType.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-9">
          <Icon className="mr-1 h-4 w-4" />
          {selectedType.name}
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
                onClick={() => onValueChange(type.id)}
                className="cursor-pointer"
              >
                <TypeIcon className="mr-2 h-4 w-4" />
                <span>{type.name}</span>
                {value === type.id && (
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
