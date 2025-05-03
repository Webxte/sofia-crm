
import { useState } from "react";
import { useOrganizations } from "@/context/organizations/OrganizationsContext";
import { useAuth } from "@/context/AuthContext";
import { useAnalytics } from "@/hooks/use-analytics";
import { OrganizationMember } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserPlus, MoreHorizontal, X } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const inviteSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  role: z.enum(["admin", "manager", "member", "guest"]),
});

type InviteFormValues = z.infer<typeof inviteSchema>;

export const OrganizationMembers = () => {
  const { members, invites, inviteMember, removeMember, updateMemberRole, getUserRole, canUserPerformAction } = useOrganizations();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const { trackEvent } = useAnalytics();
  
  const userRole = getUserRole();
  const canInvite = canUserPerformAction('invite');
  const canRemove = canUserPerformAction('delete');
  
  // Form for inviting members
  const form = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: "",
      role: "member",
    },
  });
  
  const onInviteSubmit = async (values: InviteFormValues) => {
    try {
      setIsSubmitting(true);
      
      const success = await inviteMember(values.email, values.role as OrganizationMember['role']);
      
      if (success) {
        trackEvent('member_invited', { email: values.email, role: values.role });
        form.reset();
        setInviteDialogOpen(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleRemoveMember = async (memberId: string) => {
    if (confirm("Are you sure you want to remove this member?")) {
      const success = await removeMember(memberId);
      if (success) {
        trackEvent('member_removed', { memberId });
      }
    }
  };
  
  const handleUpdateRole = async (memberId: string, role: OrganizationMember['role']) => {
    const success = await updateMemberRole(memberId, role);
    if (success) {
      trackEvent('member_role_updated', { memberId, role });
    }
  };
  
  // Get role display name
  const getRoleDisplayName = (role: string): string => {
    const roleMap: Record<string, string> = {
      owner: "Owner",
      admin: "Admin",
      manager: "Manager",
      member: "Member",
      guest: "Guest",
    };
    return roleMap[role] || role;
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>
            Manage your organization members and pending invites.
          </CardDescription>
        </div>
        {canInvite && (
          <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
                <DialogDescription>
                  Send an invitation to join your organization.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onInviteSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="teammate@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="manager">Manager</SelectItem>
                            <SelectItem value="member">Member</SelectItem>
                            <SelectItem value="guest">Guest (View Only)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Sending..." : "Send Invitation"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => {
              const isCurrentUser = member.userId === user?.id;
              const isOwner = member.role === 'owner';
              
              return (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">
                    {member.userId}
                    {isCurrentUser && " (You)"}
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">
                      {getRoleDisplayName(member.role)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {!isOwner && (userRole === 'owner' || (userRole === 'admin' && member.role !== 'admin')) && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {!isCurrentUser && userRole === 'owner' && (
                            <>
                              <DropdownMenuItem
                                onClick={() => handleUpdateRole(member.userId, 'admin')}
                                disabled={member.role === 'admin'}
                              >
                                Make Admin
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleUpdateRole(member.userId, 'manager')}
                                disabled={member.role === 'manager'}
                              >
                                Make Manager
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleUpdateRole(member.userId, 'member')}
                                disabled={member.role === 'member'}
                              >
                                Make Member
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleUpdateRole(member.userId, 'guest')}
                                disabled={member.role === 'guest'}
                              >
                                Make Guest
                              </DropdownMenuItem>
                            </>
                          )}
                          {!isCurrentUser && canRemove && (
                            <DropdownMenuItem
                              onClick={() => handleRemoveMember(member.userId)}
                              className="text-red-600"
                            >
                              Remove
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
            
            {/* Pending invites */}
            {invites.map((invite) => (
              <TableRow key={invite.id} className="text-muted-foreground">
                <TableCell className="font-medium">
                  {invite.email} (Invited)
                </TableCell>
                <TableCell>{getRoleDisplayName(invite.role)}</TableCell>
                <TableCell className="text-right">
                  {canRemove && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMember(invite.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
