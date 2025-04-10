
export interface ContactEmailRequest {
  to: string;
  subject: string;
  message: string;
  contactId?: string;
  contactName?: string;
  contactCompany?: string;
  fromName?: string;
  fromEmail?: string;
  cc?: string[];
  bcc?: string[]; // Added BCC support
}

export interface Settings {
  email_sender_name?: string;
  email_footer?: string;
  show_footer_in_emails?: boolean;
}
