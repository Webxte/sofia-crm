
import React, { useState } from "react";
import { Save } from "lucide-react";
import { Settings } from "@/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TermsSettingsProps {
  initialSettings: Settings;
  onSubmit: (settings: Partial<Settings>) => Promise<void>;
}

const TermsSettings = ({ initialSettings, onSubmit }: TermsSettingsProps) => {
  const [formData, setFormData] = useState({ ...initialSettings });
  
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Default Terms & Conditions</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="defaultTermsAndConditions">
              These terms will be included on all orders
            </Label>
            <Textarea
              id="defaultTermsAndConditions"
              name="defaultTermsAndConditions"
              rows={8}
              value={formData.defaultTermsAndConditions}
              onChange={handleChange}
              className="font-mono text-sm"
            />
          </div>
          
          <Button type="submit">
            <Save className="mr-2 h-4 w-4" /> Save Terms
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default TermsSettings;
