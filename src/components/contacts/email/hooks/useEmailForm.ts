
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
  
  const safeUrl = (url: string | undefined, fallback: string): string => {
    if (!url) return fallback;
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'https:' || parsed.protocol === 'http:' ? url : fallback;
    } catch {
      return fallback;
    }
  };

  const getDefaultMessage = () => {
    const defaultTemplate = settings.defaultContactEmailMessage ||
      `Dear [Name],

Thank you for your time during our recent meeting. As discussed, I've attached the links to our product catalog and price list.

Catalog: [Catalog URL]
Price List: [Price List URL]

Please don't hesitate to reach out if you have any questions.

Best regards,
[Company Name]`;

    const values: Record<string, string> = {
      '[Name]': contact.fullName || 'valued customer',
      '[Company Name]': settings.companyName || 'The Team',
      '[Catalog URL]': safeUrl(settings.catalogUrl, '[Catalog URL]'),
      '[Price List URL]': safeUrl(settings.priceListUrl, '[Price List URL]'),
    };

    return defaultTemplate.replace(/\[Name\]|\[Company Name\]|\[Catalog URL\]|\[Price List URL\]/g, (match) => values[match] ?? match);
  };
  
  const form = useForm<EmailFormValues>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: {
      to: contact.email || "",
      cc: ["office@tastewithgusto.ie"],
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
