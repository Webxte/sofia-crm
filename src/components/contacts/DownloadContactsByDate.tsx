
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Download } from "lucide-react";
import { format } from "date-fns";
import { useContacts } from "@/context/ContactsContext";
import { toast } from "sonner";

const DownloadContactsByDate = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [open, setOpen] = useState(false);
  const { contacts } = useContacts();

  const handleDownload = () => {
    if (!date) return;

    const selectedDate = format(date, "yyyy-MM-dd");
    const filtered = contacts.filter(c => {
      const created = format(new Date(c.createdAt), "yyyy-MM-dd");
      return created === selectedDate;
    });

    if (filtered.length === 0) {
      toast.info("No contacts found", {
        description: `No contacts were created on ${format(date, "dd/MM/yyyy")}.`,
      });
      return;
    }

    const headers = ["Full Name", "Company", "Email", "Phone", "Mobile", "Position", "Category", "Source", "Address"];
    const csvContent = [
      headers.join(","),
      ...filtered.map(contact => [
        contact.fullName || "",
        contact.company || "",
        contact.email || "",
        contact.phone || "",
        contact.mobile || "",
        contact.position || "",
        contact.category || "",
        contact.source || "",
        contact.address || "",
      ].map(field => `"${field.replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `contacts-${selectedDate}.csv`;
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Download Complete", {
      description: `Downloaded ${filtered.length} contact(s) from ${format(date, "dd/MM/yyyy")}.`,
    });
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Download by Date
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <div className="p-3 space-y-3">
          <p className="text-sm font-medium">Select a date to download contacts</p>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            initialFocus
          />
          <Button onClick={handleDownload} className="w-full" disabled={!date}>
            Download {date ? format(date, "dd/MM/yyyy") : ""}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default DownloadContactsByDate;
