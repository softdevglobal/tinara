import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { useToast } from "@/hooks/use-toast";
import {
  Users,
  UserPlus,
  Mail,
  MoreHorizontal,
  Shield,
  Clock,
  CheckCircle2,
  XCircle,
  Copy,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { StaffRole, ROLE_LABELS } from "@/types/onboarding";

// Mock team members data
const mockTeamMembers = [
  {
    id: "1",
    displayName: "John Smith",
    email: "john.smith@example.com",
    role: "ADMIN" as StaffRole,
    status: "active",
    twoFactorEnabled: true,
    joinedAt: "2025-12-15T10:00:00Z",
  },
  {
    id: "2",
    displayName: "Sarah Johnson",
    email: "sarah.j@example.com",
    role: "ACCOUNTANT" as StaffRole,
    status: "active",
    twoFactorEnabled: true,
    joinedAt: "2026-01-10T14:30:00Z",
  },
  {
    id: "3",
    displayName: "Mike Davis",
    email: "mike.d@example.com",
    role: "SALES" as StaffRole,
    status: "active",
    twoFactorEnabled: false,
    joinedAt: "2026-01-20T09:15:00Z",
  },
];

// Mock pending invites
const mockPendingInvites = [
  {
    id: "inv-1",
    email: "newuser@example.com",
    role: "STAFF" as StaffRole,
    status: "PENDING",
    expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "inv-2",
    email: "viewer@example.com",
    role: "VIEWER" as StaffRole,
    status: "EXPIRED",
    expiresAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export default function TeamManagement() {
  const { toast } = useToast();
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<StaffRole>("STAFF");
  const [teamMembers] = useState(mockTeamMembers);
  const [pendingInvites, setPendingInvites] = useState(mockPendingInvites);

  const handleSendInvite = () => {
    if (!inviteEmail) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    // Generate mock invite token
    const inviteToken = `INVITE-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const inviteUrl = `${window.location.origin}/onboarding?token=${inviteToken}`;

    // Add to pending invites
    const newInvite = {
      id: `inv-${Date.now()}`,
      email: inviteEmail,
      role: inviteRole,
      status: "PENDING",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
    };

    setPendingInvites((prev) => [newInvite, ...prev]);

    // Copy invite link to clipboard
    navigator.clipboard.writeText(inviteUrl);

    toast({
      title: "Invite Sent",
      description: `Invite link copied to clipboard for ${inviteEmail}`,
    });

    setInviteEmail("");
    setInviteRole("STAFF");
    setIsInviteDialogOpen(false);
  };

  const handleResendInvite = (invite: typeof pendingInvites[0]) => {
    const inviteUrl = `${window.location.origin}/onboarding?token=INVITE-${invite.id.split("-")[1].toUpperCase()}`;
    navigator.clipboard.writeText(inviteUrl);
    
    toast({
      title: "Invite Link Copied",
      description: `Invite link for ${invite.email} copied to clipboard`,
    });
  };

  const handleRevokeInvite = (inviteId: string) => {
    setPendingInvites((prev) => prev.filter((i) => i.id !== inviteId));
    toast({
      title: "Invite Revoked",
      description: "The invitation has been cancelled",
    });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getInviteStatusBadge = (status: string, expiresAt: string) => {
    const isExpired = new Date(expiresAt) < new Date();
    
    if (status === "PENDING" && !isExpired) {
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
          <Clock className="h-3 w-3 mr-1" />
          Pending
        </Badge>
      );
    }
    
    if (isExpired || status === "EXPIRED") {
      return (
        <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
          <XCircle className="h-3 w-3 mr-1" />
          Expired
        </Badge>
      );
    }

    return null;
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Team Management</h1>
            <p className="text-muted-foreground">
              Manage your team members and send invitations
            </p>
          </div>
          
          <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Invite Staff
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite New Team Member</DialogTitle>
                <DialogDescription>
                  Send an invitation to join your team. They'll receive a link to complete their onboarding.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="colleague@company.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as StaffRole)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADMIN">Administrator</SelectItem>
                      <SelectItem value="ACCOUNTANT">Accountant</SelectItem>
                      <SelectItem value="SALES">Sales Representative</SelectItem>
                      <SelectItem value="STAFF">Staff Member</SelectItem>
                      <SelectItem value="VIEWER">Viewer (Read-only)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    The role determines what permissions the user will have
                  </p>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSendInvite}>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Invite
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teamMembers.length}</div>
              <p className="text-xs text-muted-foreground">Active team members</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Invites</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {pendingInvites.filter((i) => i.status === "PENDING" && new Date(i.expiresAt) > new Date()).length}
              </div>
              <p className="text-xs text-muted-foreground">Awaiting acceptance</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">2FA Enabled</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {teamMembers.filter((m) => m.twoFactorEnabled).length}/{teamMembers.length}
              </div>
              <p className="text-xs text-muted-foreground">Members with 2FA</p>
            </CardContent>
          </Card>
        </div>

        {/* Team Members Table */}
        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>
              View and manage your current team members
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>2FA</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teamMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.displayName}</TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{ROLE_LABELS[member.role]}</Badge>
                    </TableCell>
                    <TableCell>
                      {member.twoFactorEnabled ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-muted-foreground" />
                      )}
                    </TableCell>
                    <TableCell>{formatDate(member.joinedAt)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Edit Role</DropdownMenuItem>
                          <DropdownMenuItem>View Permissions</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            Remove from Team
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Pending Invites Table */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Invitations</CardTitle>
            <CardDescription>
              Manage outstanding invitations to your team
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pendingInvites.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No pending invitations</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sent</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingInvites.map((invite) => (
                    <TableRow key={invite.id}>
                      <TableCell className="font-medium">{invite.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{ROLE_LABELS[invite.role]}</Badge>
                      </TableCell>
                      <TableCell>
                        {getInviteStatusBadge(invite.status, invite.expiresAt)}
                      </TableCell>
                      <TableCell>{formatDate(invite.createdAt)}</TableCell>
                      <TableCell>{formatDate(invite.expiresAt)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleResendInvite(invite)}
                            title="Copy invite link"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRevokeInvite(invite.id)}
                            title="Revoke invite"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
