import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { useOnboarding } from "@/context/OnboardingContext";
import {
  SUPPORTED_LANGUAGES,
  COMMON_TIMEZONES,
  ProfileUpdatePayload,
} from "@/types/onboarding";
import { AlertCircle, Loader2, ArrowRight, User } from "lucide-react";

export default function OnboardingProfile() {
  const { staffUser, updateProfile, goToStep, isLoading, error } =
    useOnboarding();

  const [formData, setFormData] = useState<ProfileUpdatePayload>({
    displayName: staffUser?.displayName || "",
    phone: staffUser?.phone || "",
    preferredLanguage: staffUser?.preferredLanguage || "en",
    timezone: staffUser?.timezone || "America/New_York",
  });

  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.displayName.trim()) {
      errors.displayName = "Full name is required";
    } else if (formData.displayName.length < 2) {
      errors.displayName = "Name must be at least 2 characters";
    } else if (formData.displayName.length > 100) {
      errors.displayName = "Name must be less than 100 characters";
    }

    if (formData.phone && !/^[+]?[\d\s\-().]{7,20}$/.test(formData.phone)) {
      errors.phone = "Please enter a valid phone number";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const success = await updateProfile(formData);
    if (success) {
      goToStep("permissions");
    }
  };

  const handleChange = (field: keyof ProfileUpdatePayload, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  if (!staffUser) {
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
      title="Set Up Your Profile"
      description="Tell us a bit about yourself"
    >
      <div className="flex justify-center mb-6">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="h-8 w-8 text-primary" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Full Name */}
        <div className="space-y-2">
          <Label htmlFor="displayName">
            Full Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="displayName"
            type="text"
            placeholder="John Doe"
            value={formData.displayName}
            onChange={(e) => handleChange("displayName", e.target.value)}
            className={validationErrors.displayName ? "border-destructive" : ""}
            disabled={isLoading}
          />
          {validationErrors.displayName && (
            <p className="text-xs text-destructive">
              {validationErrors.displayName}
            </p>
          )}
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone">
            Phone Number{" "}
            <span className="text-muted-foreground text-xs">(recommended)</span>
          </Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+1 (555) 123-4567"
            value={formData.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            className={validationErrors.phone ? "border-destructive" : ""}
            disabled={isLoading}
          />
          {validationErrors.phone && (
            <p className="text-xs text-destructive">{validationErrors.phone}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Used for two-factor authentication and notifications
          </p>
        </div>

        {/* Language & Timezone */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="language">Preferred Language</Label>
            <Select
              value={formData.preferredLanguage}
              onValueChange={(value) => handleChange("preferredLanguage", value)}
              disabled={isLoading}
            >
              <SelectTrigger id="language">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Select
              value={formData.timezone}
              onValueChange={(value) => handleChange("timezone", value)}
              disabled={isLoading}
            >
              <SelectTrigger id="timezone">
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                {COMMON_TIMEZONES.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
          disabled={isLoading || !formData.displayName.trim()}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Saving...
            </>
          ) : (
            <>
              Save & Continue
              <ArrowRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </form>
    </OnboardingLayout>
  );
}
