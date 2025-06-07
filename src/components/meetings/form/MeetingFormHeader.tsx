
interface MeetingFormHeaderProps {
  isEdit: boolean;
}

export const MeetingFormHeader = ({ isEdit }: MeetingFormHeaderProps) => {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">
        {isEdit ? "Edit Meeting" : "New Meeting"}
      </h1>
      <p className="text-muted-foreground">
        {isEdit ? "Update meeting details" : "Schedule a new meeting with a contact"}
      </p>
    </div>
  );
};
