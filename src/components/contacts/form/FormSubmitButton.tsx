
import { Button } from "@/components/ui/button";

interface FormSubmitButtonProps {
  isEditing: boolean;
}

const FormSubmitButton = ({ isEditing }: FormSubmitButtonProps) => {
  return (
    <Button type="submit">{isEditing ? "Update" : "Create"} Contact</Button>
  );
};

export default FormSubmitButton;
