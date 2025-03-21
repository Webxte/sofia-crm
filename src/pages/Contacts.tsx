
import { useState } from "react";
import { Plus, Search, UserPlus, Users } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Contacts = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const contacts = []; // This would be populated from your backend
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Contacts</h1>
          <p className="text-muted-foreground mt-1">
            Manage your contacts and their information
          </p>
        </div>
        <Button className="sm:w-auto w-full">
          <UserPlus className="mr-2 h-4 w-4" /> Add Contact
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search contacts..."
            className="w-full pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 sm:ml-auto">
          <Button variant="outline" size="sm">
            Filter
          </Button>
          <Button variant="outline" size="sm">
            Export
          </Button>
        </div>
      </div>

      {contacts.length === 0 ? (
        <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
          <EmptyState
            icon={<Users size={40} />}
            title="No contacts found"
            description="Get started by creating your first contact."
            actionText="Add Contact"
          />
        </div>
      ) : (
        <div className="rounded-lg border border-dashed">
          {/* Contact table would go here */}
        </div>
      )}
    </div>
  );
};

export default Contacts;
