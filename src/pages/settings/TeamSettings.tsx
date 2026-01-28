import { useState } from "react";
import { ArrowLeft, Users, Plus, Crown, Shield, Edit2, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";
import { useSettings } from "@/context/SettingsContext";
import { useToast } from "@/hooks/use-toast";
import { TeamMember, TeamRole, TeamMemberPermissions } from "@/types/tax-settings";

const ROLE_LABELS: Record<TeamRole, string> = {
  owner: "Owner",
  admin: "Admin",
  editor: "Editor",
  viewer: "Viewer",
};

const ROLE_ICONS: Record<TeamRole, React.ElementType> = {
  owner: Crown,
  admin: Shield,
  editor: Edit2,
  viewer: Users,
};

const TeamSettings = () => {
  const {
    teamMembers,
    addTeamMember,
    updateTeamMember,
    removeTeamMember,
    teamMembersLimit,
    addAuditLog,
  } = useSettings();
  const { toast } = useToast();
  
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newMember, setNewMember] = useState<{
    email: string;
    role: TeamRole;
    permissions: TeamMemberPermissions;
  }>({
    email: "",
    role: "viewer",
    permissions: {
      invoices: true,
      clients: true,
      settings: false,
      exports: false,
      payments: false,
    },
  });

  const owner = teamMembers.find(m => m.role === "owner");
  const otherMembers = teamMembers.filter(m => m.role !== "owner");
  const usedSlots = teamMembers.length;
  const usagePercent = (usedSlots / teamMembersLimit) * 100;

  const handleAddMember = () => {
    if (!newMember.email) {
      toast({ title: "Email required", description: "Please enter an email address.", variant: "destructive" });
      return;
    }
    
    if (usedSlots >= teamMembersLimit) {
      toast({ 
        title: "Team limit reached", 
        description: "Upgrade your plan to add more team members.", 
        variant: "destructive" 
      });
      return;
    }

    const member: TeamMember = {
      id: `member_${Date.now()}`,
      email: newMember.email,
      role: newMember.role,
      permissions: newMember.permissions,
      invitedAt: new Date().toISOString(),
      isActive: false,
    };

    addTeamMember(member);
    addAuditLog("TEAM_MEMBER_INVITED", `Invited team member: ${member.email}`);
    toast({ 
      title: "Invitation sent", 
      description: `An invitation has been sent to ${member.email}.` 
    });
    setShowAddDialog(false);
    setNewMember({
      email: "",
      role: "viewer",
      permissions: {
        invoices: true,
        clients: true,
        settings: false,
        exports: false,
        payments: false,
      },
    });
  };

  const handleRemoveMember = (member: TeamMember) => {
    removeTeamMember(member.id);
    addAuditLog("TEAM_MEMBER_REMOVED", `Removed team member: ${member.email}`);
    toast({ title: "Member removed", description: `${member.email} has been removed from the team.` });
  };

  const getInitials = (email: string, name?: string) => {
    if (name) {
      return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    }
    return email.slice(0, 2).toUpperCase();
  };

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link to="/settings" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Team Members</h1>
            <p className="text-sm text-muted-foreground">
              Manage team access and permissions
            </p>
          </div>
        </div>
        <Button onClick={() => setShowAddDialog(true)} disabled={usedSlots >= teamMembersLimit}>
          <Plus className="h-4 w-4 mr-2" />
          Add Team Member
        </Button>
      </div>

      {/* Usage */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Team Members</span>
            <span className="text-sm text-muted-foreground">
              {usedSlots} of {teamMembersLimit} used
            </span>
          </div>
          <Progress value={usagePercent} className="h-2" />
          {usedSlots >= teamMembersLimit && (
            <p className="text-sm text-amber-600 mt-2">
              You've reached your plan limit. Upgrade to add more team members.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="space-y-6">
        {/* Account Owner */}
        {owner && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Account Owner</CardTitle>
              <CardDescription>
                The owner has full access to all features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {getInitials(owner.email, owner.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{owner.name || owner.email}</p>
                    <Badge variant="secondary" className="gap-1">
                      <Crown className="h-3 w-3" />
                      Owner
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{owner.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Other Members */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Team Members</CardTitle>
            <CardDescription>
              People who have access to this account
            </CardDescription>
          </CardHeader>
          <CardContent>
            {otherMembers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No team members yet</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setShowAddDialog(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add your first team member
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {otherMembers.map((member) => {
                  const RoleIcon = ROLE_ICONS[member.role];
                  return (
                    <div
                      key={member.id}
                      className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {getInitials(member.email, member.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{member.name || member.email}</p>
                          <Badge variant="secondary" className="gap-1">
                            <RoleIcon className="h-3 w-3" />
                            {ROLE_LABELS[member.role]}
                          </Badge>
                          {!member.acceptedAt && (
                            <Badge variant="outline" className="text-amber-600">
                              Pending
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove team member?</AlertDialogTitle>
                              <AlertDialogDescription>
                                {member.email} will lose access to this account immediately.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleRemoveMember(member)}>
                                Remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Member Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
            <DialogDescription>
              Invite someone to join your team
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input
                type="email"
                placeholder="colleague@example.com"
                value={newMember.email}
                onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={newMember.role}
                onValueChange={(value: TeamRole) => setNewMember({ ...newMember, role: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin - Full access except billing</SelectItem>
                  <SelectItem value="editor">Editor - Create and edit documents</SelectItem>
                  <SelectItem value="viewer">Viewer - View only access</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-3">
              <Label>Permissions</Label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: "invoices", label: "Invoices" },
                  { key: "clients", label: "Clients" },
                  { key: "settings", label: "Settings" },
                  { key: "exports", label: "Exports" },
                  { key: "payments", label: "Payments" },
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center space-x-2">
                    <Checkbox
                      id={`perm-${key}`}
                      checked={newMember.permissions[key as keyof TeamMemberPermissions]}
                      onCheckedChange={(checked) => setNewMember({
                        ...newMember,
                        permissions: { ...newMember.permissions, [key]: !!checked },
                      })}
                    />
                    <Label htmlFor={`perm-${key}`} className="font-normal">
                      {label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddMember}>Send Invitation</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default TeamSettings;
