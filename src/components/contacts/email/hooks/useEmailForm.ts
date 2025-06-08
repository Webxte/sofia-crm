
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { EmailFormValues, emailFormSchema } from "../EmailForm";
import { Contact } from "@/types";
import { useSettings } from "@/context/settings";

export const useEmailForm = (contact: Contact) => {
  const { settings } = useSettings();
  const [newCc, setNewCc] = useState("");
  const [selectedCustomLink, setSelectedCustomLink] = useState<string | null>(null);
  
  const getDefaultMessage = () => {
    const defaultTemplate = settings.defaultContactEmailMessage || 
      `Dear [Name],

Thank you for your time during our recent meeting. As discussed, I've attached the links to our product catalog and price list.

Catalog: [Catalog URL]
Price List: [Price List URL]

Please don't hesitate to reach out if you have any questions.

Best regards,
[Company Name]`;
    
    return defaultTemplate
      .replace(/\[Name\]/g, contact.fullName || "valued customer")
      .replace(/\[Company Name\]/g, settings.companyName || "The Team")
      .replace(/\[Catalog URL\]/g, settings.catalogUrl || "[Catalog URL]")
      .replace(/\[Price List URL\]/g, settings.priceListUrl || "[Price List URL]");
  };
  
  const form = useForm<EmailFormValues>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: {
      to: contact.email || "",
      cc: [],
      subject: "Follow-up from our meeting",
      message: getDefaultMessage(),
    },
  });

  return {
    form,
    newCc,
    setNewCc,
    selectedCustomLink,
    setSelectedCustomLink,
  };
};
