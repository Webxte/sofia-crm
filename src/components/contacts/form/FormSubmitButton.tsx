
import { Button } from "@/components/ui/button";
import { SaveIcon } from "lucide-react";

interface FormSubmitButtonProps {
  isEditing: boolean;
}

const FormSubmitButton = ({ isEditing }: FormSubmitButtonProps) => {
  return (
    <Button type="submit" className="w-full sm:w-auto flex items-center gap-2">
      <SaveIcon className="h-4 w-4" />
      {isEditing ? "Update" : "Create"} Contact
    </Button>
  );
};

export default FormSubmitButton;
