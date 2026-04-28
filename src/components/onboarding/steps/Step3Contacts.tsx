import { useRef, useState } from "react";
import { useContacts } from "@/context/ContactsContext";
import { Button } from "@/components/ui/button";
import { Users, Upload, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface Step3Props {
  onNext: () => void;
  onSkip: () => void;
}

export const Step3Contacts = ({ onNext, onSkip }: Step3Props) => {
  const { contacts, importContactsFromCsv } = useContacts();
  const fileRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [importedCount, setImportedCount] = useState(0);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const count = await importContactsFromCsv(file);
      setImportedCount((prev) => prev + (count || 0));
      toast.success(`${count} contacts imported`);
    } catch (err: any) {
      toast.error(err?.message || "Import failed");
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 mb-1">
        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
          <Users className="h-5 w-5 text-green-600" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">Import your contacts</h3>
          <p className="text-sm text-muted-foreground">Upload a CSV to bring in your existing customer list</p>
        </div>
      </div>

      {contacts.length > 0 || importedCount > 0 ? (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
          <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
          {contacts.length} contact{contacts.length !== 1 ? "s" : ""} in your CRM
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
          <Users className="h-8 w-8 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-4">
            CSV columns: <code className="bg-gray-100 px-1 rounded text-xs">full_name, company, email, phone, address</code>
          </p>
          <Button
            variant="outline"
            onClick={() => fileRef.current?.click()}
            disabled={importing}
          >
            <Upload className="h-4 w-4 mr-2" />
            {importing ? "Importing…" : "Choose CSV file"}
          </Button>
        </div>
      )}

      {(contacts.length > 0 || importedCount > 0) && (
        <Button variant="outline" onClick={() => fileRef.current?.click()} disabled={importing} className="w-full">
          <Upload className="h-4 w-4 mr-2" />Import more contacts
        </Button>
      )}
      <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFile} />

      <div className="flex gap-2">
        <Button variant="ghost" onClick={onSkip} className="flex-1">Skip for now</Button>
        <Button onClick={onNext} className="flex-1">Continue</Button>
      </div>
    </div>
  );
};
