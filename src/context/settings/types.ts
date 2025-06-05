
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
  customLinks: any[];
  catalogUrl: string;
  priceListUrl: string;
  emailFooter: string;
  emailSenderName: string;
  termsEnabled: boolean;
  defaultVatRate: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SettingsContextType {
  settings: Settings | null;
  loading: boolean;
  updateSettings: (settings: Partial<Settings>) => Promise<Settings>;
  fetchSettings: () => Promise<void>;
}
