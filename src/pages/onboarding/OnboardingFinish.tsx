import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { useOnboarding } from "@/context/OnboardingContext";
import { ROLE_LABELS } from "@/types/onboarding";
import {
  CheckCircle2,
  Building2,
  Shield,
  ArrowRight,
  AlertCircle,
  Sparkles,
} from "lucide-react";

export default function OnboardingFinish() {
  const { staffUser, inviteToken, finishOnboarding, goToStep } = useOnboarding();

  if (!staffUser || !inviteToken) {
    return (
      <OnboardingLayout title="Session Error" showProgress={false}>
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
      title="You're All Set!"
      description="Your account is ready to use"
      showProgress={false}
    >
      {/* Success Icon */}
      <div className="flex justify-center mb-8">
        <div className="relative">
          <div className="h-24 w-24 rounded-full bg-green-100 dark:bg-green-950/30 flex items-center justify-center">
            <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
          </div>
          <div className="absolute -top-1 -right-1">
            <Sparkles className="h-6 w-6 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Welcome Message */}
      <div className="text-center mb-8">
        <h2 className="text-xl font-semibold mb-2">
          Welcome, {staffUser.displayName || "Team Member"}!
        </h2>
        <p className="text-muted-foreground">
          You've successfully joined the team and your account is fully
          configured.
        </p>
      </div>

      {/* Account Summary */}
      <div className="space-y-3 mb-8">
        <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
          <Building2 className="h-5 w-5 text-muted-foreground" />
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Organization</p>
            <p className="font-semibold">{inviteToken.tenantName}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
          <Shield className="h-5 w-5 text-muted-foreground" />
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Your Role</p>
            <Badge variant="default">{ROLE_LABELS[staffUser.role]}</Badge>
          </div>
        </div>

        {staffUser.twoFactorEnabled && (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900">
            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
            <span className="text-green-700 dark:text-green-400 font-medium">
              Two-factor authentication enabled
            </span>
          </div>
        )}
      </div>

      {/* Next Steps Info */}
      <Alert className="mb-6">
        <Sparkles className="h-4 w-4" />
        <AlertDescription>
          <strong>What's next?</strong> Explore the dashboard to view invoices,
          quotes, and other modules based on your permissions. Need help? Check
          the help section or contact your administrator.
        </AlertDescription>
      </Alert>

      {/* CTA Button */}
      <Button className="w-full" size="lg" onClick={finishOnboarding}>
        Go to Dashboard
        <ArrowRight className="h-4 w-4 ml-2" />
      </Button>
    </OnboardingLayout>
  );
}
