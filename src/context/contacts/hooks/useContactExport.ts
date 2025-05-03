
import { useCallback } from "react";
import { Contact } from "@/types";

export const useContactExport = (contacts: Contact[]) => {
  const exportContactsToCsv = useCallback(() => {
    if (contacts.length === 0) {
      return;
    }
    
    // Create CSV header
    const headers = [
      "Full Name",
      "Email",
      "Phone",
      "Mobile",
      "Company",
      "Position",
      "Address",
      "Notes",
      "Source"
    ].join(",");
    
    // Create CSV rows
    const rows = contacts.map(contact => {
      return [
        contact.fullName || "",
        contact.email || "",
        contact.phone || "",
        contact.mobile || "",
        contact.company || "",
        contact.position || "",
        contact.address || "",
        contact.notes || "",
        contact.source || ""
      ].map(value => `"${value.replace(/"/g, '""')}"`).join(",");
    });
    
    // Combine header and rows
    const csv = [headers, ...rows].join("\n");
    
    // Download CSV
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `contacts-${new Date().toISOString()}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [contacts]);
  
  return { exportContactsToCsv };
};
