import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { PermissionsTable } from "@/components/onboarding/PermissionsTable";
import { useOnboarding } from "@/context/OnboardingContext";
import { ROLE_LABELS } from "@/types/onboarding";
import { Shield, AlertCircle, ArrowRight, Info } from "lucide-react";

export default function OnboardingPermissions() {
  const { staffUser, inviteToken, goToStep } = useOnboarding();

  if (!staffUser || !inviteToken) {
    return (
      <OnboardingLayout title="Session Error">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No user session found. Please restart the onboarding process.
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

  return (
    <OnboardingLayout
      title="Your Permissions"
      description="Review what you can access in the system"
    >
      {/* Role Badge */}
      <div className="flex items-center justify-center gap-3 mb-6">
        <Shield className="h-5 w-5 text-primary" />
        <span className="text-sm font-medium">Your Role:</span>
        <Badge variant="default" className="text-sm">
          {ROLE_LABELS[staffUser.role]}
        </Badge>
      </div>

      {/* Permissions Table */}
      <div className="mb-6">
        <PermissionsTable permissions={staffUser.permissions} />
      </div>

      {/* Info Alert */}
      <Alert className="mb-6 bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-900">
        <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertDescription className="text-blue-800 dark:text-blue-300">
          <strong>Note:</strong> Your access is managed by the Account Owner. If
          you need additional permissions or access to restricted modules, please
          contact your administrator.
        </AlertDescription>
      </Alert>

      {/* Permission Legend */}
      <div className="mb-6 p-4 rounded-lg bg-muted/30">
        <h4 className="text-sm font-semibold mb-3">Permission Levels</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span>
              <strong>Full Access</strong> - Complete control
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span>
              <strong>Edit</strong> - Create & modify
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span>
              <strong>View Only</strong> - Read access
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-muted-foreground/30" />
            <span>
              <strong>No Access</strong> - Restricted
            </span>
          </div>
        </div>
      </div>

      <Button
        className="w-full"
        size="lg"
        onClick={() => goToStep("security")}
      >
        Continue
        <ArrowRight className="h-4 w-4 ml-2" />
      </Button>
    </OnboardingLayout>
  );
}
