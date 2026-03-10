
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CalendarPlus } from "lucide-react";

interface CreateMeetingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  contactName: string;
}

const CreateMeetingDialog = ({ open, onOpenChange, onConfirm, contactName }: CreateMeetingDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarPlus className="h-5 w-5" />
            Schedule a Meeting?
          </DialogTitle>
          <DialogDescription>
            Contact <span className="font-medium">{contactName}</span> has been created successfully. Would you like to schedule a meeting with them now?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            No, go to contacts
          </Button>
          <Button onClick={onConfirm}>
            Yes, create meeting
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateMeetingDialog;
