import React, { useState, useMemo } from "react";
import { Contact } from "@/types";
import { useContacts } from "@/context/contacts/ContactsContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Check, ChevronRight, Merge } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

type Step = "pick" | "fields" | "confirm";

const FIELDS: { key: keyof Contact; label: string }[] = [
  { key: "fullName",  label: "Full Name" },
  { key: "company",   label: "Company" },
  { key: "email",     label: "Email" },
  { key: "phone",     label: "Phone" },
  { key: "mobile",    label: "Mobile" },
  { key: "position",  label: "Position" },
  { key: "address",   label: "Address" },
  { key: "source",    label: "Source" },
  { key: "category",  label: "Category" },
  { key: "notes",     label: "Notes" },
];

export function ContactMergeDialog({ open, onOpenChange }: Props) {
  const { contacts, updateContact, deleteContact } = useContacts();

  const [step, setStep] = useState<Step>("pick");
  const [primaryId, setPrimaryId]   = useState<string>("");
  const [secondaryId, setSecondaryId] = useState<string>("");
  const [query, setQuery] = useState("");
  // which contact's value wins per field: "primary" | "secondary"
  const [fieldChoice, setFieldChoice] = useState<Record<string, "primary" | "secondary">>({});
  const [loading, setLoading] = useState(false);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return contacts.slice(0, 8);
    return contacts.filter(c =>
      c.fullName?.toLowerCase().includes(q) ||
      c.company?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [contacts, query]);

  const primary   = contacts.find(c => c.id === primaryId);
  const secondary = contacts.find(c => c.id === secondaryId);

  const diffFields = FIELDS.filter(f => {
    const pv = primary?.[f.key] ?? "";
    const sv = secondary?.[f.key] ?? "";
    return pv !== sv && (pv || sv);
  });

  const handlePickContact = (id: string) => {
    if (!primaryId) { setPrimaryId(id); return; }
    if (id === primaryId) { setPrimaryId(""); return; }
    setSecondaryId(id);
  };

  const handleNext = () => {
    if (!primary || !secondary) return;
    // default: primary wins all
    const defaults: Record<string, "primary" | "secondary"> = {};
    diffFields.forEach(f => { defaults[f.key as string] = "primary"; });
    setFieldChoice(defaults);
    setStep("fields");
  };

  const handleMerge = async () => {
    if (!primary || !secondary) return;
    setLoading(true);
    try {
      // Build merged field values
      const merged: Partial<Contact> = {};
      diffFields.forEach(f => {
        const winner = fieldChoice[f.key as string] === "secondary" ? secondary : primary;
        (merged as any)[f.key] = winner[f.key];
      });

      // Re-assign related records from secondary → primary
      await Promise.all([
        supabase.from("orders").update({ contact_id: primary.id }).eq("contact_id", secondary.id),
        supabase.from("meetings").update({ contact_id: primary.id }).eq("contact_id", secondary.id),
        supabase.from("tasks").update({ contact_id: primary.id }).eq("contact_id", secondary.id),
      ]);

      // Update primary with merged values
      await updateContact(primary.id, merged);

      // Delete secondary
      await deleteContact(secondary.id);

      toast.success("Contacts merged", {
        description: `${secondary.company || secondary.fullName} was merged into ${primary.company || primary.fullName}.`,
      });
      handleClose();
    } catch (e) {
      console.error(e);
      toast.error("Merge failed", { description: "Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep("pick");
    setPrimaryId("");
    setSecondaryId("");
    setQuery("");
    setFieldChoice({});
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Merge className="h-5 w-5" /> Merge Contacts
          </DialogTitle>
          <DialogDescription>
            {step === "pick"    && "Select two contacts to merge. The first is the primary (kept); the second is deleted."}
            {step === "fields"  && "Choose which value to keep for each differing field."}
            {step === "confirm" && "Review and confirm the merge."}
          </DialogDescription>
        </DialogHeader>

        {step === "pick" && (
          <div className="space-y-4">
            <div className="flex gap-3 text-sm">
              <div className={cn("flex-1 p-2 rounded border text-center", primaryId ? "border-primary bg-primary/5" : "border-dashed border-muted-foreground/40 text-muted-foreground")}>
                {primary ? (primary.company || primary.fullName || primary.email) : "Primary (kept)"}
              </div>
              <div className={cn("flex-1 p-2 rounded border text-center", secondaryId ? "border-red-400 bg-red-50 dark:bg-red-900/10" : "border-dashed border-muted-foreground/40 text-muted-foreground")}>
                {secondary ? (secondary.company || secondary.fullName || secondary.email) : "Secondary (deleted)"}
              </div>
            </div>

            <Input
              placeholder="Search contacts…"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />

            <div className="space-y-1 max-h-64 overflow-y-auto">
              {filtered.map(c => {
                const isPrimary   = c.id === primaryId;
                const isSecondary = c.id === secondaryId;
                return (
                  <button
                    key={c.id}
                    onClick={() => handlePickContact(c.id)}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-md text-sm transition-colors hover:bg-accent",
                      isPrimary   && "bg-primary/10 ring-1 ring-primary",
                      isSecondary && "bg-red-50 dark:bg-red-900/10 ring-1 ring-red-400"
                    )}
                  >
                    <span className="font-medium">{c.company || c.fullName || "—"}</span>
                    {c.company && c.fullName && <span className="text-muted-foreground ml-2">{c.fullName}</span>}
                    {c.email && <span className="text-muted-foreground ml-2 text-xs">{c.email}</span>}
                    {isPrimary   && <Badge className="ml-2 text-xs" variant="default">Primary</Badge>}
                    {isSecondary && <Badge className="ml-2 text-xs bg-red-500 text-white">Secondary</Badge>}
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
              <Button onClick={handleNext} disabled={!primaryId || !secondaryId}>
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {step === "fields" && primary && secondary && (
          <div className="space-y-4">
            {diffFields.length === 0 ? (
              <p className="text-sm text-muted-foreground">These contacts have identical field values — nothing to choose.</p>
            ) : (
              <div className="space-y-3">
                {diffFields.map(f => {
                  const pv = String(primary[f.key] ?? "");
                  const sv = String(secondary[f.key] ?? "");
                  const choice = fieldChoice[f.key as string] ?? "primary";
                  return (
                    <div key={f.key as string} className="space-y-1">
                      <Label className="text-xs text-muted-foreground uppercase tracking-wide">{f.label}</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setFieldChoice(prev => ({ ...prev, [f.key as string]: "primary" }))}
                          className={cn(
                            "p-2 rounded border text-sm text-left transition-colors",
                            choice === "primary" ? "border-primary bg-primary/5 font-medium" : "border-border hover:bg-accent"
                          )}
                        >
                          {choice === "primary" && <Check className="h-3 w-3 inline mr-1 text-primary" />}
                          {pv || <span className="text-muted-foreground italic">empty</span>}
                          <span className="block text-xs text-muted-foreground">Primary</span>
                        </button>
                        <button
                          onClick={() => setFieldChoice(prev => ({ ...prev, [f.key as string]: "secondary" }))}
                          className={cn(
                            "p-2 rounded border text-sm text-left transition-colors",
                            choice === "secondary" ? "border-red-400 bg-red-50 dark:bg-red-900/10 font-medium" : "border-border hover:bg-accent"
                          )}
                        >
                          {choice === "secondary" && <Check className="h-3 w-3 inline mr-1 text-red-500" />}
                          {sv || <span className="text-muted-foreground italic">empty</span>}
                          <span className="block text-xs text-muted-foreground">Secondary</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => setStep("pick")}>Back</Button>
              <Button onClick={() => setStep("confirm")}>
                Review <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {step === "confirm" && primary && secondary && (
          <div className="space-y-4">
            <div className="rounded-md border border-amber-200 bg-amber-50 dark:bg-amber-900/10 p-4 text-sm space-y-1">
              <p className="font-medium text-amber-800 dark:text-amber-300">This action cannot be undone.</p>
              <ul className="text-amber-700 dark:text-amber-400 list-disc list-inside space-y-0.5">
                <li>All orders, meetings and tasks from <strong>{secondary.company || secondary.fullName}</strong> will be reassigned to <strong>{primary.company || primary.fullName}</strong>.</li>
                <li>The secondary contact will be permanently deleted.</li>
              </ul>
            </div>

            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => setStep("fields")}>Back</Button>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={handleMerge}
                disabled={loading}
              >
                {loading ? "Merging…" : "Merge & Delete Secondary"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
