
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface MeetingFormActionsProps {
  isEdit: boolean;
}

export const MeetingFormActions = ({ isEdit }: MeetingFormActionsProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex gap-4">
      <Button type="submit">
        {isEdit ? "Update Meeting" : "Create Meeting"}
      </Button>
      <Button 
        type="button" 
        variant="outline" 
        onClick={() => navigate("/meetings")}
      >
        Cancel
      </Button>
    </div>
  );
};
