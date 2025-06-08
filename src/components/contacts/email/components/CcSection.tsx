
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";

interface CcSectionProps {
  newCc: string;
  setNewCc: (value: string) => void;
  ccEmails: string[];
  onAddCc: () => void;
  onRemoveCc: (email: string) => void;
}

export const CcSection = ({
  newCc,
  setNewCc,
  ccEmails,
  onAddCc,
  onRemoveCc,
}: CcSectionProps) => {
  return (
    <div>
      <Label>CC</Label>
      <div className="flex space-x-2 mb-2">
        <Input 
          placeholder="Add CC email" 
          value={newCc} 
          onChange={(e) => setNewCc(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              onAddCc();
            }
          }}
        />
        <Button 
          type="button" 
          variant="outline" 
          onClick={onAddCc}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      {ccEmails.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {ccEmails.map((email) => (
            <div 
              key={email} 
              className="bg-muted text-sm rounded-full px-3 py-1 flex items-center"
            >
              <span className="mr-1">{email}</span>
              <button 
                type="button" 
                onClick={() => onRemoveCc(email)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
