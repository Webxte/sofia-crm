
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
  const dbUpdates: any = {};
  
  // Only include fields that are actually present in the updates object
  if (updates.companyName !== undefined) dbUpdates.company_name = updates.companyName;
  if (updates.companyEmail !== undefined) dbUpdates.company_email = updates.companyEmail;
  if (updates.companyPhone !== undefined) dbUpdates.company_phone = updates.companyPhone;
  if (updates.companyAddress !== undefined) dbUpdates.company_address = updates.companyAddress;
  if (updates.terms !== undefined) dbUpdates.default_terms_and_conditions = updates.terms;
  if (updates.termsEnabled !== undefined) dbUpdates.terms_enabled = updates.termsEnabled;
  if (updates.customLinks !== undefined) dbUpdates.custom_links = JSON.stringify(updates.customLinks || []);
  
  // Explicitly handle all email-related fields - making sure they're included
  if (updates.emailFooter !== undefined) dbUpdates.email_footer = updates.emailFooter;
  if (updates.emailSenderName !== undefined) dbUpdates.email_sender_name = updates.emailSenderName;
  if (updates.defaultEmailSubject !== undefined) dbUpdates.default_email_subject = updates.defaultEmailSubject;
  if (updates.defaultEmailMessage !== undefined) dbUpdates.default_email_message = updates.defaultEmailMessage;
  if (updates.defaultContactEmailMessage !== undefined) dbUpdates.default_contact_email_message = updates.defaultContactEmailMessage;
  if (updates.catalogUrl !== undefined) dbUpdates.catalog_url = updates.catalogUrl;
  if (updates.priceListUrl !== undefined) dbUpdates.price_list_url = updates.priceListUrl;
  
  // Explicitly handle the VAT rate
  if (updates.defaultVatRate !== undefined) {
    dbUpdates.default_vat_rate = String(updates.defaultVatRate);
  }
  
  console.log("Prepared DB updates:", dbUpdates);
  return dbUpdates;
};
