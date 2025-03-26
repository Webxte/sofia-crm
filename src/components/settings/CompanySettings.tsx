
import React, { useState } from "react";
import { Save } from "lucide-react";
import { Settings } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CompanySettingsProps {
  initialSettings: Settings;
  onSubmit: (settings: Partial<Settings>) => Promise<void>;
}

const CompanySettings = ({ initialSettings, onSubmit }: CompanySettingsProps) => {
  const [formData, setFormData] = useState({ ...initialSettings });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: parseFloat(value) }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Company Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="companyEmail">Company Email</Label>
              <Input
                id="companyEmail"
                name="companyEmail"
                type="email"
                value={formData.companyEmail}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="companyAddress">Company Address</Label>
            <Textarea
              id="companyAddress"
              name="companyAddress"
              value={formData.companyAddress}
              onChange={handleChange}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="companyPhone">Company Phone</Label>
              <Input
                id="companyPhone"
                name="companyPhone"
                value={formData.companyPhone}
                onChange={handleChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="defaultVatRate">Default VAT Rate (%)</Label>
              <Input
                id="defaultVatRate"
                name="defaultVatRate"
                type="number"
                min="0"
                step="0.01"
                value={formData.defaultVatRate}
                onChange={handleNumberChange}
              />
            </div>
          </div>
          
          <Button type="submit" className="mt-4">
            <Save className="mr-2 h-4 w-4" /> Save Settings
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CompanySettings;
