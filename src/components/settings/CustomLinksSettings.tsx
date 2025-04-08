
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, CustomLink } from "@/types";
import { Save } from "lucide-react";

interface CustomLinksSettingsProps {
  initialSettings: Settings;
  onSubmit: (settings: Partial<Settings>) => Promise<void>;
}

const CustomLinksSettings = ({ initialSettings, onSubmit }: CustomLinksSettingsProps) => {
  const [customLinks, setCustomLinks] = useState<CustomLink[]>(
    initialSettings.customLinks || Array(10).fill({ url: "", description: "" })
  );

  const handleLinkChange = (index: number, field: 'url' | 'description', value: string) => {
    const updatedLinks = [...customLinks];
    updatedLinks[index] = { 
      ...updatedLinks[index],
      [field]: value 
    };
    setCustomLinks(updatedLinks);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ customLinks });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Custom Links</CardTitle>
        <CardDescription>
          Configure custom links that can be included in emails to contacts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {Array.from({ length: 10 }).map((_, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b pb-4 mb-4 last:border-0">
              <div className="space-y-2">
                <Label htmlFor={`link-${index + 1}`}>Link {index + 1}</Label>
                <Input
                  id={`link-${index + 1}`}
                  placeholder="https://example.com/resource"
                  value={customLinks[index]?.url || ""}
                  onChange={(e) => handleLinkChange(index, 'url', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`description-${index + 1}`}>Description</Label>
                <Input
                  id={`description-${index + 1}`}
                  placeholder="Product catalog, Price list, etc."
                  value={customLinks[index]?.description || ""}
                  onChange={(e) => handleLinkChange(index, 'description', e.target.value)}
                />
              </div>
            </div>
          ))}
          
          <Button type="submit">
            <Save className="mr-2 h-4 w-4" /> Save Links
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CustomLinksSettings;
