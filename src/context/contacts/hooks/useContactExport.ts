
import * as React from "react";
import { Contact } from "@/types";
import Papa from "papaparse";

export const useContactExport = (contacts: Contact[]) => {
  const exportContactsToCsv = React.useCallback(() => {
    // Convert contacts to CSV format
    const data = contacts.map(contact => ({
      Name: contact.fullName,
      Company: contact.company,
      Email: contact.email,
      Phone: contact.phone,
      Mobile: contact.mobile,
      Position: contact.position,
      Address: contact.address,
      Source: contact.source,
      Notes: contact.notes
    }));

    // Generate CSV
    const csv = Papa.unparse(data);
    
    // Create a blob with the CSV data
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // Create a link element to trigger download
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `contacts_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    
    // Trigger download and clean up
    link.click();
    document.body.removeChild(link);
  }, [contacts]);

  return { exportContactsToCsv };
};
