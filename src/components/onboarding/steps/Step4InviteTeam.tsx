import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface Step4Props {
  onFinish: () => void;
}

export const Step4InviteTeam = ({ onFinish }: Step4Props) => {
  const { createUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [invited, setInvited] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "agent" as "admin" | "agent" });

  const handleInvite = async () => {
    if (!form.name || !form.email || !form.password) {
      toast.error("Please fill in all fields");
      return;
    }
    setSaving(true);
    try {
      await createUser(form.name, form.email, form.password, form.role);
      setInvited(true);
      toast.success(`${form.name} has been added`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to create user");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 mb-1">
        <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
          <UserPlus className="h-5 w-5 text-orange-600" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">Invite your team</h3>
          <p className="text-sm text-muted-foreground">Add your first agent or admin (optional)</p>
        </div>
      </div>

      {invited ? (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
          <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
          {form.name} added successfully!
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Full name</Label>
              <Input placeholder="John Smith" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as "admin" | "agent" })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="agent">Agent</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Email address</Label>
            <Input type="email" placeholder="john@company.com" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Temporary password</Label>
            <Input type="password" placeholder="They can change it on first login" value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          <Button onClick={handleInvite} disabled={saving} variant="outline" className="w-full">
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <UserPlus className="h-4 w-4 mr-2" />}
            Add team member
          </Button>
        </div>
      )}

      <Button onClick={onFinish} className="w-full">
        {invited ? "Finish setup →" : "Skip & Finish"}
      </Button>
    </div>
  );
};
