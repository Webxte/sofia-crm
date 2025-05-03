
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useOrganizations } from "@/context/organizations/OrganizationsContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Copy, Check, UserPlus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const OrganizationMembers = () => {
  const { orgSlug } = useParams();
  const { user, isAdmin } = useAuth();
  const {
    organization,
    members,
    inviteMember,
    updateMemberRole,
    removeMember,
    getOrganizationBySlug,
    getOrganizationMembers,
  } = useOrganizations();
  const { toast } = useToast();
  const [inviteEmail, setInviteEmail] = useState("");
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orgSlug) {
      const fetchData = async () => {
        setLoading(true);
        try {
          await getOrganizationBySlug(orgSlug);
          await getOrganizationMembers(orgSlug);
        } catch (error) {
          console.error("Error fetching organization data:", error);
          toast({
            title: "Error",
            description: "Failed to load organization data.",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [orgSlug, getOrganizationBySlug, getOrganizationMembers, toast]);

  const handleInvite = async () => {
    if (!inviteEmail) {
      toast({
        title: "Error",
        description: "Please enter an email address.",
        variant: "destructive",
      });
      return;
    }

    setIsInviting(true);
    try {
      if (orgSlug) {
        await inviteMember(orgSlug, inviteEmail, "member");
        toast({
          title: "Invite Sent",
          description: `Invite sent to ${inviteEmail}.`,
        });
        setInviteEmail("");
        setIsInviteDialogOpen(false);
      }
    } catch (error) {
      console.error("Error inviting member:", error);
      toast({
        title: "Error",
        description: "Failed to send invite.",
        variant: "destructive",
      });
    } finally {
      setIsInviting(false);
    }
  };

  const handleMemberRoleChange = async (memberId: string, role: "owner" | "admin" | "member" | "manager" | "guest") => {
    try {
      if (orgSlug) {
        await updateMemberRole(orgSlug, memberId, role);
        toast({
          title: "Role Updated",
          description: `Member role updated to ${role}.`,
        });
      }
    } catch (error) {
      console.error("Error updating member role:", error);
      toast({
        title: "Error",
        description: "Failed to update member role.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      if (orgSlug) {
        await removeMember(orgSlug, memberId);
        toast({
          title: "Member Removed",
          description: "Member removed from organization.",
        });
      }
    } catch (error) {
      console.error("Error removing member:", error);
      toast({
        title: "Error",
        description: "Failed to remove member.",
        variant: "destructive",
      });
    }
  };

  const handleCopyInviteLink = () => {
    if (organization) {
      const inviteLink = `${window.location.origin}/orgs/join/${organization.slug}`;
      navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return <div>Loading organization members...</div>;
  }

  if (!organization) {
    return <div>Organization not found.</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">{organization.name} Members</h1>
          <p className="text-muted-foreground">
            Manage members and their roles within the organization
          </p>
        </div>
        <div>
          <Button variant="outline" onClick={handleCopyInviteLink} disabled={copied}>
            {copied ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Copy Invite Link
              </>
            )}
          </Button>
          <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="default" className="ml-2">
                <UserPlus className="mr-2 h-4 w-4" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Invite New Member</DialogTitle>
                <DialogDescription>
                  Enter the email address of the person you want to invite to
                  the organization.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    Email
                  </Label>
                  <Input
                    type="email"
                    id="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="col-span-3"
                  />
                </div>
              </div>
              <Button type="submit" onClick={handleInvite} disabled={isInviting}>
                {isInviting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Inviting...
                  </>
                ) : (
                  "Invite Member"
                )}
              </Button>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableCaption>
            A list of all members within your organization.
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id}>
                <TableCell>{member.userId}</TableCell>
                <TableCell>{member.userId}</TableCell>
                <TableCell>{member.role}</TableCell>
                <TableCell className="text-right">
                  {member.role !== "owner" && (
                    <>
                      {member.role !== "admin" && (
                        <Button onClick={() => handleMemberRoleChange(member.id, "admin")} size="sm" variant="outline" className="ml-2">
                          Make Admin
                        </Button>
                      )}
                      {member.role === "admin" && (
                        <Button onClick={() => handleMemberRoleChange(member.id, "member")} size="sm" variant="outline" className="ml-2">
                          Make Member
                        </Button>
                      )}
                      {member.role !== "manager" && (
                        <Button onClick={() => handleMemberRoleChange(member.id, "manager")} size="sm" variant="outline" className="ml-2">
                          Make Manager
                        </Button>
                      )}
                      {member.role === "manager" && (
                        <Button onClick={() => handleMemberRoleChange(member.id, "member")} size="sm" variant="outline" className="ml-2">
                          Make Member
                        </Button>
                      )}
                      {member.role !== "guest" && (
                        <Button onClick={() => handleMemberRoleChange(member.id, "guest")} size="sm" variant="outline" className="ml-2">
                          Make Guest
                        </Button>
                      )}
                      {member.role === "guest" && (
                        <Button onClick={() => handleMemberRoleChange(member.id, "member")} size="sm" variant="outline" className="ml-2">
                          Make Member
                        </Button>
                      )}
                      <Button
                        onClick={() => handleRemoveMember(member.id)}
                        size="sm"
                        variant="destructive"
                        className="ml-2"
                      >
                        Remove
                      </Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default OrganizationMembers;
