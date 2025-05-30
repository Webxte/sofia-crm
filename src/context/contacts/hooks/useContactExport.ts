
import { useCallback } from "react";
import { Contact } from "@/types";
import { useToast } from "@/hooks/use-toast";

export const useContactExport = (contacts: Contact[]) => {
  const { toast } = useToast();

  const exportContactsToCsv = useCallback(async () => {
    try {
      console.log("Exporting contacts to CSV, count:", contacts.length);
      
      // Create CSV content
      const headers = ["Full Name", "Company", "Email", "Phone", "Mobile", "Position", "Source", "Agent"];
      const csvContent = [
        headers.join(","),
        ...contacts.map(contact => [
          contact.fullName || "",
          contact.company || "",
          contact.email || "",
          contact.phone || "",
          contact.mobile || "",
          contact.position || "",
          contact.source || "",
          contact.agentName || ""
        ].map(field => `"${field}"`).join(","))
      ].join("\n");

      // Download file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `contacts-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Export Successful",
        description: `Exported ${contacts.length} contacts to CSV.`,
      });
    } catch (error) {
      console.error("Error exporting contacts:", error);
      toast({
        title: "Export Error",
        description: "Failed to export contacts. Please try again.",
        variant: "destructive",
      });
    }
  }, [contacts, toast]);

  return {
    exportContactsToCsv
  };
};
