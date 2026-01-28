import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { useOnboarding } from "@/context/OnboardingContext";
import { Users, AlertCircle, Loader2 } from "lucide-react";

export default function OnboardingEntry() {
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState("");
  const { verifyToken, goToStep, isLoading, error, setError } = useOnboarding();

  // Auto-read token from URL
  useEffect(() => {
    const urlToken = searchParams.get("token");
    if (urlToken) {
      setToken(urlToken);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token.trim()) {
      setError("Please enter your invite code");
      return;
    }

    const success = await verifyToken(token.trim());
    if (success) {
      goToStep("invite");
    }
  };

  return (
    <OnboardingLayout
      title="Join your team"
      description="Enter the invite code sent to your email to get started"
      showProgress={false}
    >
      <div className="flex justify-center mb-6">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Users className="h-8 w-8 text-primary" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="token">Invite Code</Label>
          <Input
            id="token"
            type="text"
            placeholder="e.g., INVITE-ABC123"
            value={token}
            onChange={(e) => {
              setToken(e.target.value);
              if (error) setError(null);
            }}
            className="text-center text-lg tracking-wider uppercase"
            disabled={isLoading}
            autoFocus
          />
          <p className="text-xs text-muted-foreground text-center">
            Check your email for the invite code from your administrator
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={isLoading || !token.trim()}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Verifying...
            </>
          ) : (
            "Continue"
          )}
        </Button>
      </form>

      <div className="mt-6 pt-6 border-t">
        <p className="text-sm text-center text-muted-foreground">
          Don't have an invite code?{" "}
          <a href="mailto:support@bmspro.blue" className="text-primary hover:underline">
            Contact your administrator
          </a>
        </p>
      </div>
    </OnboardingLayout>
  );
}
