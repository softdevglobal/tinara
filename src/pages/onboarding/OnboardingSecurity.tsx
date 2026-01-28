import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { useOnboarding } from "@/context/OnboardingContext";
import {
  Shield,
  Smartphone,
  Monitor,
  AlertCircle,
  Loader2,
  ArrowRight,
  Check,
  Send,
} from "lucide-react";

export default function OnboardingSecurity() {
  const {
    staffUser,
    sendOtp,
    verifyOtp,
    enableTwoFactor,
    addTrustedDevice,
    goToStep,
    isLoading,
    error,
  } = useOnboarding();

  const [enable2FA, setEnable2FA] = useState(true);
  const [phone, setPhone] = useState(staffUser?.phone || "");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [trustDevice, setTrustDevice] = useState(true);
  const [phoneError, setPhoneError] = useState("");

  const validatePhone = (): boolean => {
    if (!phone.trim()) {
      setPhoneError("Phone number is required for 2FA");
      return false;
    }
    if (!/^[+]?[\d\s\-().]{7,20}$/.test(phone)) {
      setPhoneError("Please enter a valid phone number");
      return false;
    }
    setPhoneError("");
    return true;
  };

  const handleSendOtp = async () => {
    if (!validatePhone()) return;

    const success = await sendOtp(phone);
    if (success) {
      setOtpSent(true);
    }
  };

  const handleVerifyOtp = async () => {
    if (otpCode.length !== 6) return;

    const success = await verifyOtp(phone, otpCode);
    if (success) {
      setOtpVerified(true);
    } else {
      setOtpCode("");
    }
  };

  const handleFinish = async () => {
    // Enable 2FA if opted in and verified
    if (enable2FA && otpVerified) {
      await enableTwoFactor(phone);
    }

    // Add trusted device if opted in
    if (trustDevice) {
      await addTrustedDevice();
    }

    goToStep("finish");
  };

  const canProceed = !enable2FA || otpVerified;

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
      title="Secure Your Account"
      description="Set up additional security for your account"
    >
      {/* 2FA Section */}
      <div className="p-4 rounded-lg border mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Smartphone className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Two-Factor Authentication</h3>
              <p className="text-sm text-muted-foreground">
                Add an extra layer of security
              </p>
            </div>
          </div>
          <Switch
            checked={enable2FA}
            onCheckedChange={(checked) => {
              setEnable2FA(checked);
              if (!checked) {
                setOtpSent(false);
                setOtpVerified(false);
                setOtpCode("");
              }
            }}
            disabled={otpVerified}
          />
        </div>

        {enable2FA && (
          <div className="space-y-4 pt-4 border-t">
            {!otpVerified ? (
              <>
                {/* Phone Input */}
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="flex gap-2">
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        if (phoneError) setPhoneError("");
                      }}
                      className={phoneError ? "border-destructive" : ""}
                      disabled={otpSent || isLoading}
                    />
                    <Button
                      type="button"
                      variant={otpSent ? "secondary" : "default"}
                      onClick={handleSendOtp}
                      disabled={isLoading || otpSent}
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : otpSent ? (
                        "Sent"
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-1" />
                          Send OTP
                        </>
                      )}
                    </Button>
                  </div>
                  {phoneError && (
                    <p className="text-xs text-destructive">{phoneError}</p>
                  )}
                </div>

                {/* OTP Input */}
                {otpSent && (
                  <div className="space-y-2">
                    <Label>Enter Verification Code</Label>
                    <div className="flex flex-col items-center gap-4">
                      <InputOTP
                        maxLength={6}
                        value={otpCode}
                        onChange={setOtpCode}
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                      <Button
                        type="button"
                        onClick={handleVerifyOtp}
                        disabled={otpCode.length !== 6 || isLoading}
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : null}
                        Verify Code
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        For testing, use code: <strong>123456</strong>
                      </p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400">
                <Check className="h-5 w-5" />
                <span className="font-medium">
                  Two-factor authentication verified!
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Trusted Device Section */}
      <div className="p-4 rounded-lg border mb-6">
        <div className="flex items-start space-x-3">
          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
            <Monitor className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Trust This Device</h3>
              <Checkbox
                id="trustDevice"
                checked={trustDevice}
                onCheckedChange={(checked) => setTrustDevice(checked === true)}
              />
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Skip 2FA on this device for 30 days. You can revoke this anytime
              from your account settings.
            </p>
          </div>
        </div>
      </div>

      {/* Security Tips */}
      <Alert className="mb-6">
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Security Tip:</strong> Enable 2FA to protect your account from
          unauthorized access. We'll send a verification code to your phone each
          time you sign in from a new device.
        </AlertDescription>
      </Alert>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button
        className="w-full"
        size="lg"
        onClick={handleFinish}
        disabled={isLoading || !canProceed}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Finishing...
          </>
        ) : (
          <>
            Finish Setup
            <ArrowRight className="h-4 w-4 ml-2" />
          </>
        )}
      </Button>

      {!canProceed && (
        <p className="text-xs text-center text-muted-foreground mt-2">
          Please complete 2FA verification or disable it to continue
        </p>
      )}
    </OnboardingLayout>
  );
}
