import { useState } from "react";
import { useSettings } from "@/context/settings";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Building2, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Step1Props {
  onNext: () => void;
}

export const Step1CompanyInfo = ({ onNext }: Step1Props) => {
  const { settings, updateSettings } = useSettings();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    companyName:  settings?.companyName  || "",
    companyEmail: settings?.companyEmail || "",
    companyPhone: settings?.companyPhone || "",
  });

  const handleSave = async () => {
    if (!form.companyName.trim()) {
      toast.error("Company name is required");
      return;
    }
    setSaving(true);
    try {
      await updateSettings(form);
      onNext();
    } catch {
      toast.error("Failed to save — please try again");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 mb-1">
        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
          <Building2 className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">Set up your company</h3>
          <p className="text-sm text-muted-foreground">This will appear on emails and orders</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="companyName">Company name <span className="text-red-500">*</span></Label>
          <Input
            id="companyName"
            placeholder="Acme Ltd"
            value={form.companyName}
            onChange={(e) => setForm({ ...form, companyName: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="companyEmail">Company email</Label>
          <Input
            id="companyEmail"
            type="email"
            placeholder="hello@acme.com"
            value={form.companyEmail}
            onChange={(e) => setForm({ ...form, companyEmail: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="companyPhone">Phone number</Label>
          <Input
            id="companyPhone"
            placeholder="+353 1 234 5678"
            value={form.companyPhone}
            onChange={(e) => setForm({ ...form, companyPhone: e.target.value })}
          />
        </div>
      </div>

      <Button onClick={handleSave} disabled={saving} className="w-full">
        {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
        Save & Continue
      </Button>
    </div>
  );
};
