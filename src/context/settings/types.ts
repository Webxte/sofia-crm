
import { CustomLink } from "@/types";

export interface Settings {
  id: string;
  userId: string;
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  companyAddress: string;
  defaultEmailSubject: string;
  defaultEmailMessage: string;
  defaultContactEmailMessage: string;
  defaultTermsAndConditions: string;
  customLinks: CustomLink[];
  catalogUrl: string;
  priceListUrl: string;
  emailFooter: string;
  emailSenderName: string;
  termsEnabled: boolean;
  defaultVatRate: number;
  bulkEmailTemplate: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SettingsContextType {
  settings: Settings | null;
  loading: boolean;
  updateSettings: (settings: Partial<Settings>) => Promise<Settings>;
  refreshSettings: () => Promise<void>;
}
