import React, { useState } from "react";
import { Settings as Cog, Upload, Save } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";
import { useProducts } from "@/context/ProductsContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProductImporter from "@/components/orders/ProductImporter";
import UserManagement from "@/components/settings/UserManagement";

const Settings = () => {
  const { settings, updateSettings } = useSettings();
  const { importProductsFromFile } = useProducts();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({ ...settings });
  const [fileImportLoading, setFileImportLoading] = useState(false);
  
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
    updateSettings(formData);
    toast({
      title: "Settings Saved",
      description: "Your settings have been updated successfully",
    });
  };
  
  const handleFileDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    if (e.dataTransfer.files.length) {
      const file = e.dataTransfer.files[0];
      
      if (file.type === "text/csv" || file.name.endsWith(".csv")) {
        setFileImportLoading(true);
        
        try {
          await importProductsFromFile(file);
          toast({
            title: "Products Imported",
            description: "Products have been imported successfully",
          });
        } catch (error) {
          toast({
            title: "Import Failed",
            description: "There was an error importing products",
            variant: "destructive",
          });
        } finally {
          setFileImportLoading(false);
        }
      } else {
        toast({
          title: "Invalid File",
          description: "Please upload a CSV file",
          variant: "destructive",
        });
      }
    }
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your application settings
        </p>
      </div>
      
      <Tabs defaultValue="company">
        <TabsList className="mb-4">
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="terms">Terms & Conditions</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>
        
        <TabsContent value="company">
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
        </TabsContent>
        
        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Product Import</CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                className="border-2 border-dashed rounded-lg p-8 text-center mb-6"
                onDrop={handleFileDrop}
                onDragOver={handleDragOver}
              >
                <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                <h3 className="text-lg font-medium mb-1">Drag & Drop CSV File</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Or paste your CSV data below
                </p>
                <Button disabled={fileImportLoading}>
                  {fileImportLoading ? "Importing..." : "Choose File"}
                </Button>
              </div>
              
              <div className="bg-muted p-4 rounded-lg mb-6">
                <h4 className="font-medium mb-2">CSV Format Example</h4>
                <code className="text-xs block whitespace-pre">
                  code,description,price,cost,vat<br />
                  P001,Product One,10.99,6.50,20<br />
                  P002,Product Two,24.99,12.75,20
                </code>
              </div>
              
              <ProductImporter />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="terms">
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
        </TabsContent>
        
        <TabsContent value="users">
          <UserManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
