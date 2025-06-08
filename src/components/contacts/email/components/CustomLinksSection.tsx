
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";

interface CustomLinksSectionProps {
  availableCustomLinks: Array<{ name?: string; description?: string; url: string; index: number }>;
  selectedCustomLink: string | null;
  setSelectedCustomLink: (value: string | null) => void;
  onAddCustomLink: () => void;
}

export const CustomLinksSection = ({
  availableCustomLinks,
  selectedCustomLink,
  setSelectedCustomLink,
  onAddCustomLink,
}: CustomLinksSectionProps) => {
  if (availableCustomLinks.length === 0) return null;

  return (
    <div className="flex items-end space-x-2">
      <div className="flex-1">
        <Label>Add Custom Link</Label>
        <Select value={selectedCustomLink || ""} onValueChange={setSelectedCustomLink}>
          <SelectTrigger>
            <SelectValue placeholder="Select a link to add" />
          </SelectTrigger>
          <SelectContent>
            {availableCustomLinks.map((link, idx) => (
              <SelectItem key={idx} value={String(link.index)}>
                {link.description || link.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button 
        type="button" 
        variant="outline" 
        onClick={onAddCustomLink}
        disabled={!selectedCustomLink}
      >
        <Plus className="h-4 w-4 mr-1" /> Add Link
      </Button>
    </div>
  );
};
