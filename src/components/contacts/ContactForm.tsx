
import {
  Form,
} from "@/components/ui/form";
import BasicInfoFields from "./form/BasicInfoFields";
import ContactInfoFields from "./form/ContactInfoFields";
import AdditionalFields from "./form/AdditionalFields";
import { useContactForm } from "./form/useContactForm";
import { ContactFormProps } from "./form/types";
import FormSubmitButton from "./form/FormSubmitButton";
import { useIsMobile } from "@/hooks/use-mobile";
import { Contact } from "@/types";

interface ExtendedContactFormProps extends Omit<ContactFormProps, 'onContactCreated'> {
  onContactCreated?: (contact: Contact) => void;
}

const ContactForm = ({ initialData, contact, isEditing = false, onContactCreated }: ExtendedContactFormProps) => {
  const { form, onSubmit } = useContactForm({ initialData, contact, isEditing, onContactCreated });
  const isMobile = useIsMobile();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8 max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-950 rounded-lg p-3 sm:p-6 shadow-sm border">
          <BasicInfoFields form={form} isMobile={isMobile} />
          <ContactInfoFields form={form} isMobile={isMobile} />
          <AdditionalFields form={form} isMobile={isMobile} />
          <div className="mt-8 flex justify-end">
            <FormSubmitButton isEditing={isEditing} />
          </div>
        </div>
      </form>
    </Form>
  );
};

export default ContactForm;
