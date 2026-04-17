import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useContacts } from "@/context/contacts/ContactsContext";
import { toast } from "sonner";
import { Upload, Info, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";

type PreviewResult = {
  toImport: any[];
  duplicates: { row: any; matchedOn: string }[];
};

const ContactImportSettings = () => {
  const { previewCsvImport, executeImport } = useContacts();
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [defaultSource, setDefaultSource] = useState<string>("");
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, isAdmin } = useAuth();

  if (!isAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Import Contacts</CardTitle>
          <CardDescription>You need administrator access to import contacts.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const validateAndPreview = async (file: File) => {
    if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
      toast.error("Invalid file type", { description: "Please upload a CSV file" });
      return;
    }
    setFileName(file.name);
    setIsPreviewing(true);
    try {
      const result = await previewCsvImport(file, defaultSource || undefined);
      if (result) setPreview(result);
    } finally {
      setIsPreviewing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndPreview(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) validateAndPreview(file);
  };

  const handleConfirm = async () => {
    if (!preview) return;
    setIsImporting(true);
    try {
      await executeImport(preview.toImport);
      setPreview(null);
      setFileName("");
    } finally {
      setIsImporting(false);
    }
  };

  const handleCancel = () => {
    setPreview(null);
    setFileName("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import Contacts</CardTitle>
        <CardDescription>
          Import contacts from a CSV file. Duplicates are detected by email or name + company.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!preview ? (
          <>
            <div className="mb-4">
              <Label htmlFor="default-source">Default Source/Agent Tag</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="default-source"
                  value={defaultSource}
                  onChange={(e) => setDefaultSource(e.target.value)}
                  placeholder={user?.name || "Enter source or agent name"}
                />
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                <Info className="inline w-4 h-4 mr-1" />
                Used when the CSV has no "source" column.
              </p>
            </div>

            <div
              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
              <h3 className="text-lg font-medium mb-1">Drag & Drop CSV File</h3>
              <p className="text-sm text-muted-foreground mb-4">Or click to select a file</p>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".csv"
                className="hidden"
              />
              <Button disabled={isPreviewing} onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                {isPreviewing ? "Analysing..." : "Choose File"}
              </Button>
            </div>

            <div className="mt-6 bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">CSV Format Example</h4>
              <div className="overflow-auto">
                <code className="text-xs block whitespace-pre">
                  name,company,email,phone,mobile,address,position,notes,source{"\n"}
                  John Doe,Acme Inc,john@example.com,555-1234,555-5678,123 Main St,Manager,Notes,Office1{"\n"}
                  Jane Smith,XYZ Corp,jane@example.com,555-8765,555-4321,456 Elm St,Director,More,Office2
                </code>
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">File: <span className="font-medium">{fileName}</span></p>

            <div className="flex gap-4">
              <div className="flex-1 rounded-lg border border-green-200 bg-green-50 p-4">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-800">New contacts</span>
                </div>
                <p className="text-2xl font-bold text-green-700">{preview.toImport.length}</p>
                <p className="text-xs text-green-600 mt-1">Will be imported</p>
              </div>
              <div className="flex-1 rounded-lg border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <span className="font-medium text-amber-800">Duplicates</span>
                </div>
                <p className="text-2xl font-bold text-amber-700">{preview.duplicates.length}</p>
                <p className="text-xs text-amber-600 mt-1">Will be skipped</p>
              </div>
            </div>

            {preview.duplicates.length > 0 && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 max-h-48 overflow-y-auto">
                <p className="text-xs font-medium text-amber-800 mb-2">Skipped duplicates:</p>
                <ul className="space-y-1">
                  {preview.duplicates.map((d, i) => (
                    <li key={i} className="text-xs text-amber-700">
                      <span className="font-medium">{d.row.full_name || "(no name)"}</span>
                      {" — "}matched on {d.matchedOn}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {preview.toImport.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-2">
                All contacts in this file already exist. Nothing to import.
              </p>
            ) : null}

            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleConfirm}
                disabled={isImporting || preview.toImport.length === 0}
                className="flex-1"
              >
                {isImporting ? "Importing..." : `Import ${preview.toImport.length} contact${preview.toImport.length !== 1 ? "s" : ""}`}
              </Button>
              <Button variant="outline" onClick={handleCancel} disabled={isImporting}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ContactImportSettings;
