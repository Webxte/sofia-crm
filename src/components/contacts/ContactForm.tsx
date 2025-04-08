
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import BasicInfoFields from "./form/BasicInfoFields";
import ContactInfoFields from "./form/ContactInfoFields";
import AdditionalFields from "./form/AdditionalFields";
import { useContactForm } from "./form/useContactForm";
import { ContactFormProps } from "./form/types";
import FormSubmitButton from "./form/FormSubmitButton";

const ContactForm = ({ initialData, contact, isEditing = false }: ContactFormProps) => {
  const { form, onSubmit } = useContactForm({ initialData, contact, isEditing });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <BasicInfoFields form={form} />
        <ContactInfoFields form={form} />
        <AdditionalFields form={form} />
        <FormSubmitButton isEditing={isEditing} />
      </form>
    </Form>
  );
};

export default ContactForm;
