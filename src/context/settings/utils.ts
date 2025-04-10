
import { CustomLink } from "@/types";
import { DEFAULT_SETTINGS } from "./constants";

export const parseCustomLinks = (rawLinks: any): CustomLink[] => {
  let customLinks: CustomLink[] = [];
  
  try {
    if (typeof rawLinks === 'string') {
      customLinks = JSON.parse(rawLinks) as CustomLink[];
    } else if (Array.isArray(rawLinks)) {
      customLinks = rawLinks.map((link: any) => ({
        url: link.url || '',
        description: link.description || ''
      }));
    }
  } catch (e) {
    console.error("Failed to parse custom_links:", e);
    customLinks = [];
  }
  
  // Ensure customLinks is an array
  if (!Array.isArray(customLinks)) {
    customLinks = [];
  }
  
  return customLinks;
};

export const parseVatRate = (vatRateData: any): number => {
  let vatRate = DEFAULT_SETTINGS.defaultVatRate;
  
  if (vatRateData !== null) {
    vatRate = typeof vatRateData === 'string' 
      ? parseFloat(vatRateData) 
      : Number(vatRateData);
    
    // Handle NaN case
    if (isNaN(vatRate)) {
      vatRate = DEFAULT_SETTINGS.defaultVatRate;
    }
  }
  
  return vatRate;
};

export const prepareSettingsForDb = (updates: Partial<any>): any => {
  const dbUpdates: any = {
    company_name: updates.companyName,
    company_email: updates.companyEmail,
    company_phone: updates.companyPhone,
    company_address: updates.companyAddress,
    default_terms_and_conditions: updates.terms,
    terms_enabled: updates.termsEnabled,
    custom_links: updates.customLinks ? JSON.stringify(updates.customLinks) : JSON.stringify([]),
    email_footer: updates.emailFooter,
    email_sender_name: updates.emailSenderName,
    default_email_subject: updates.defaultEmailSubject,
    default_email_message: updates.defaultEmailMessage,
    default_contact_email_message: updates.defaultContactEmailMessage,
    catalog_url: updates.catalogUrl,
    price_list_url: updates.priceListUrl,
  };
  
  // Explicitly handle the VAT rate as a string for the database
  if (updates.defaultVatRate !== undefined) {
    // Convert the number to a string for the database using String()
    dbUpdates.default_vat_rate = String(updates.defaultVatRate);
  }
  
  return dbUpdates;
};
