
export interface SettingsData {
  id: string;
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  companyAddress: string;
  defaultEmailSubject: string;
  defaultEmailMessage: string;
  defaultContactEmailMessage: string;
  defaultTermsAndConditions: string;
  customLinks: any[];
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
  settings: SettingsData | null;
  loading: boolean;
  updateSettings: (settings: Partial<SettingsData>) => Promise<void>;
  refreshSettings: () => void;
}
