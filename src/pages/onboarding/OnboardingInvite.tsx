import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { PermissionsTable } from "@/components/onboarding/PermissionsTable";
import { useOnboarding } from "@/context/OnboardingContext";
import { ROLE_LABELS } from "@/types/onboarding";
import {
  Building2,
  Mail,
  Shield,
  AlertCircle,
  Loader2,
  ArrowRight,
} from "lucide-react";

export default function OnboardingInvite() {
  const [agreedToPolicy, setAgreedToPolicy] = useState(false);
  const { inviteToken, acceptInvite, goToStep, isLoading, error } =
    useOnboarding();

  if (!inviteToken) {
    return (
      <OnboardingLayout title="Invalid Session">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No invite found. Please go back and enter your invite code.
          </AlertDescription>
        </Alert>
        <Button
          variant="outline"
          className="w-full mt-4"
          onClick={() => goToStep("entry")}
        >
          Back to Start
        </Button>
      </OnboardingLayout>
    );
  }

  const handleAccept = async () => {
    const success = await acceptInvite();
    if (success) {
      goToStep("profile");
    }
  };

  return (
    <OnboardingLayout
      title="Accept Your Invitation"
      description="Review your access details before joining the team"
    >
      {/* Tenant & Role Info */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-lg">{inviteToken.tenantName}</p>
            <p className="text-sm text-muted-foreground">Organization</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 rounded-lg border">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Invited As</p>
              <p className="text-sm font-medium truncate">
                {inviteToken.invitedEmail}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg border">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Role</p>
              <Badge variant="secondary" className="mt-0.5">
                {ROLE_LABELS[inviteToken.role]}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Permissions Preview */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold mb-3">Your Access Permissions</h3>
        <PermissionsTable permissions={inviteToken.permissions} compact />
      </div>

      {/* Policy Agreement */}
      <div className="flex items-start space-x-3 p-4 rounded-lg bg-muted/30 mb-6">
        <Checkbox
          id="policy"
          checked={agreedToPolicy}
          onCheckedChange={(checked) => setAgreedToPolicy(checked === true)}
        />
        <div className="grid gap-1.5 leading-none">
          <Label htmlFor="policy" className="cursor-pointer">
            I agree to the company policies
          </Label>
          <p className="text-xs text-muted-foreground">
            By accepting, you agree to follow the organization's data handling
            and security policies.
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button
        className="w-full"
        size="lg"
        onClick={handleAccept}
        disabled={!agreedToPolicy || isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Accepting...
          </>
        ) : (
          <>
            Accept & Continue
            <ArrowRight className="h-4 w-4 ml-2" />
          </>
        )}
      </Button>
    </OnboardingLayout>
  );
}
