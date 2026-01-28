import { useState } from "react";
import { ArrowLeft, Shield, Smartphone, Monitor, Trash2, AlertCircle, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useSettings } from "@/context/SettingsContext";
import { useToast } from "@/hooks/use-toast";

const SecuritySettings = () => {
  const { 
    securitySettings, 
    updateSecuritySettings,
    removeTrustedDevice,
    removeAllTrustedDevices,
    addAuditLog,
  } = useSettings();
  const { toast } = useToast();
  
  const [showEnableDialog, setShowEnableDialog] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [step, setStep] = useState<"phone" | "verify">("phone");

  const handleEnable2FA = () => {
    if (step === "phone") {
      if (!phoneNumber) {
        toast({ title: "Phone required", description: "Please enter your phone number.", variant: "destructive" });
        return;
      }
      // Simulate sending code
      toast({ title: "Code sent", description: "A verification code has been sent to your phone." });
      setStep("verify");
    } else {
      if (verificationCode.length !== 6) {
        toast({ title: "Invalid code", description: "Please enter the 6-digit code.", variant: "destructive" });
        return;
      }
      // Simulate verification
      updateSecuritySettings({ 
        twoFactorEnabled: true, 
        twoFactorMethod: "sms",
        phoneNumber: phoneNumber,
      });
      addAuditLog("SECURITY_2FA_ENABLED", "Two-factor authentication enabled");
      toast({ title: "2FA enabled", description: "Two-factor authentication is now active." });
      setShowEnableDialog(false);
      setStep("phone");
      setPhoneNumber("");
      setVerificationCode("");
    }
  };

  const handleDisable2FA = () => {
    updateSecuritySettings({ twoFactorEnabled: false, twoFactorMethod: undefined });
    addAuditLog("SECURITY_2FA_DISABLED", "Two-factor authentication disabled");
    toast({ title: "2FA disabled", description: "Two-factor authentication has been turned off." });
  };

  const handleRemoveDevice = (deviceId: string) => {
    removeTrustedDevice(deviceId);
    addAuditLog("SECURITY_DEVICE_REMOVED", "Trusted device removed");
    toast({ title: "Device removed", description: "The device has been removed from trusted devices." });
  };

  const handleRemoveAllDevices = () => {
    removeAllTrustedDevices();
    addAuditLog("SECURITY_DEVICE_REMOVED", "All trusted devices removed");
    toast({ title: "All devices removed", description: "All trusted devices have been removed except current." });
  };

  // Mock trusted devices
  const trustedDevices = [
    {
      id: "device_1",
      deviceName: "Chrome on MacBook Pro",
      browser: "Chrome 120",
      lastUsed: new Date().toISOString(),
      ipAddress: "192.168.1.1",
      isCurrent: true,
    },
    {
      id: "device_2",
      deviceName: "Safari on iPhone",
      browser: "Safari 17",
      lastUsed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      ipAddress: "192.168.1.2",
      isCurrent: false,
    },
  ];

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link to="/settings" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-foreground">Security</h1>
          <p className="text-sm text-muted-foreground">
            Two-factor authentication and trusted devices
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Two-Factor Authentication */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Two-factor authentication
            </CardTitle>
            <CardDescription>
              Add an extra layer of security to your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Two-factor authentication</p>
                    <p className="text-sm text-muted-foreground">
                      Get an SMS code to log in
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-sm font-medium ${securitySettings.twoFactorEnabled ? "text-green-600" : "text-muted-foreground"}`}>
                  {securitySettings.twoFactorEnabled ? "ON" : "OFF"}
                </span>
                {securitySettings.twoFactorEnabled ? (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">Disable</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Disable Two-Factor Authentication?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will make your account less secure. You can re-enable 2FA at any time.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDisable2FA}>Disable 2FA</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                ) : (
                  <Button size="sm" onClick={() => setShowEnableDialog(true)}>Enable</Button>
                )}
              </div>
            </div>

            <Alert className="border-blue-500/50 bg-blue-500/10">
              <AlertCircle className="h-4 w-4 text-blue-500" />
              <AlertDescription className="text-blue-700 dark:text-blue-400">
                To help keep your account info safe, we may occasionally send a security 
                code to your phone number to confirm your identity.{" "}
                <a href="#" className="underline">Learn more</a>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Trusted Devices */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Trusted devices</CardTitle>
              <CardDescription>
                You don't need to verify your identity each time you log in on a trusted device
              </CardDescription>
            </div>
            {trustedDevices.filter(d => !d.isCurrent).length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="link" className="text-destructive">
                    Remove all
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remove all trusted devices?</AlertDialogTitle>
                    <AlertDialogDescription>
                      You'll need to verify your identity when you next log in from these devices.
                      Your current device will remain trusted.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleRemoveAllDevices}>Remove all</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </CardHeader>
          <CardContent>
            {trustedDevices.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No trusted devices yet.
              </p>
            ) : (
              <div className="space-y-3">
                {trustedDevices.map((device) => (
                  <div
                    key={device.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                        {device.deviceName.includes("iPhone") || device.deviceName.includes("Android") ? (
                          <Smartphone className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <Monitor className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{device.deviceName}</p>
                          {device.isCurrent && (
                            <span className="text-xs bg-green-500/10 text-green-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Check className="h-3 w-3" />
                              Current
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Last used: {new Date(device.lastUsed).toLocaleDateString()} • {device.ipAddress}
                        </p>
                      </div>
                    </div>
                    {!device.isCurrent && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveDevice(device.id)}
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Enable 2FA Dialog */}
      <Dialog open={showEnableDialog} onOpenChange={setShowEnableDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enable Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              {step === "phone" 
                ? "Enter your phone number to receive verification codes."
                : "Enter the 6-digit code sent to your phone."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {step === "phone" ? (
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input
                  type="tel"
                  placeholder="+61 400 123 456"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Verification Code</Label>
                <Input
                  type="text"
                  placeholder="123456"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                />
                <p className="text-sm text-muted-foreground">
                  Sent to {phoneNumber}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowEnableDialog(false);
              setStep("phone");
            }}>
              Cancel
            </Button>
            <Button onClick={handleEnable2FA}>
              {step === "phone" ? "Send Code" : "Verify & Enable"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default SecuritySettings;
