
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FollowUpSectionProps {
  isEdit: boolean;
  onFollowUpChange: (data: { schedule: boolean; date: string; time: string }) => void;
}

export const FollowUpSection = ({ isEdit, onFollowUpChange }: FollowUpSectionProps) => {
  const [scheduleFollowUp, setScheduleFollowUp] = useState(false);
  const [followUpDate, setFollowUpDate] = useState("");
  const [followUpTime, setFollowUpTime] = useState("");

  const handleFollowUpChange = (checked: boolean | "indeterminate") => {
    const isChecked = checked === true;
    setScheduleFollowUp(isChecked);
    onFollowUpChange({
      schedule: isChecked,
      date: followUpDate,
      time: followUpTime,
    });
  };

  const handleDateChange = (date: string) => {
    setFollowUpDate(date);
    onFollowUpChange({
      schedule: scheduleFollowUp,
      date,
      time: followUpTime,
    });
  };

  const handleTimeChange = (time: string) => {
    setFollowUpTime(time);
    onFollowUpChange({
      schedule: scheduleFollowUp,
      date: followUpDate,
      time,
    });
  };

  if (isEdit) return null;

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="scheduleFollowUp"
          checked={scheduleFollowUp}
          onCheckedChange={handleFollowUpChange}
        />
        <Label htmlFor="scheduleFollowUp" className="text-sm font-medium">
          Schedule Follow-up Meeting
        </Label>
      </div>
      
      {scheduleFollowUp && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="followUpDate" className="text-sm">Follow-up Date</Label>
            <Input
              id="followUpDate"
              type="date"
              value={followUpDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="followUpTime" className="text-sm">Follow-up Time</Label>
            <Input
              id="followUpTime"
              type="time"
              value={followUpTime}
              onChange={(e) => handleTimeChange(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>
      )}
    </div>
  );
};
