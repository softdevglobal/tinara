import { ArrowLeft, CreditCard, Save, ExternalLink, Check, X } from "lucide-react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useSettings } from "@/context/SettingsContext";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle } from "lucide-react";

const PaymentSettings = () => {
  const { 
    paymentSettings, 
    updatePaymentSettings, 
    hasUnsavedChanges,
    setHasUnsavedChanges,
    addAuditLog,
  } = useSettings();
  const { toast } = useToast();

  const handleSave = () => {
    addAuditLog("PAYMENT_SETTINGS_UPDATED", "Payment settings updated");
    setHasUnsavedChanges(false);
    toast({
      title: "Settings saved",
      description: "Your payment settings have been updated.",
    });
  };

  const handleConnectStripe = () => {
    toast({
      title: "Connect Stripe",
      description: "Stripe connection flow would open here.",
    });
  };

  const handleConnectPayPal = () => {
    toast({
      title: "Connect PayPal",
      description: "PayPal connection flow would open here.",
    });
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
            <h1 className="text-xl font-semibold text-foreground">Payment Options</h1>
            <p className="text-sm text-muted-foreground">
              Connect payment providers and configure payment methods
            </p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={!hasUnsavedChanges}>
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>

      {/* Warning Banner */}
      <Alert className="mb-6 border-amber-500/50 bg-amber-500/10">
        <AlertTriangle className="h-4 w-4 text-amber-500" />
        <AlertDescription className="text-amber-700 dark:text-amber-400">
          Changes apply to <strong>new documents only</strong>. 
          Payment options on existing invoices remain unchanged.
        </AlertDescription>
      </Alert>

      <div className="space-y-6">
        {/* Stripe */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#635BFF]/10">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#635BFF">
                    <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.594-7.305h.003z"/>
                  </svg>
                </div>
                <div>
                  <CardTitle className="text-base">Stripe</CardTitle>
                  <CardDescription>Accept credit cards and other payment methods</CardDescription>
                </div>
              </div>
              <Switch
                checked={paymentSettings.stripeEnabled}
                onCheckedChange={(checked) => updatePaymentSettings({ stripeEnabled: checked })}
              />
            </div>
          </CardHeader>
          {paymentSettings.stripeEnabled && (
            <CardContent className="pt-0">
              <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-3">
                  {paymentSettings.stripeConnected ? (
                    <>
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/10">
                        <Check className="h-4 w-4 text-green-500" />
                      </div>
                      <div>
                        <p className="font-medium text-green-600 dark:text-green-400">Connected</p>
                        <p className="text-sm text-muted-foreground">
                          Account ID: {paymentSettings.stripeAccountId || "acct_xxxxx"}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/10">
                        <X className="h-4 w-4 text-amber-500" />
                      </div>
                      <div>
                        <p className="font-medium text-amber-600 dark:text-amber-400">Not Connected</p>
                        <p className="text-sm text-muted-foreground">
                          Connect your Stripe account to accept payments
                        </p>
                      </div>
                    </>
                  )}
                </div>
                <Button 
                  variant={paymentSettings.stripeConnected ? "outline" : "default"}
                  onClick={handleConnectStripe}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  {paymentSettings.stripeConnected ? "Manage" : "Connect Stripe"}
                </Button>
              </div>
            </CardContent>
          )}
        </Card>

        {/* PayPal */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#003087]/10">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#003087">
                    <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c1.109 5.09-1.11 7.624-6.049 7.624h-1.84a1.282 1.282 0 0 0-1.265 1.082l-1.35 8.575-.383 2.433a.641.641 0 0 0 .633.74h4.604c.524 0 .968-.383 1.05-.901l.868-5.497a1.282 1.282 0 0 1 1.265-1.082h.792c5.227 0 9.317-2.125 10.516-8.269.476-2.439.119-4.415-1.234-5.764z"/>
                  </svg>
                </div>
                <div>
                  <CardTitle className="text-base">PayPal</CardTitle>
                  <CardDescription>Accept PayPal payments from customers</CardDescription>
                </div>
              </div>
              <Switch
                checked={paymentSettings.paypalEnabled}
                onCheckedChange={(checked) => updatePaymentSettings({ paypalEnabled: checked })}
              />
            </div>
          </CardHeader>
          {paymentSettings.paypalEnabled && (
            <CardContent className="pt-0">
              <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-3">
                  {paymentSettings.paypalConnected ? (
                    <>
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/10">
                        <Check className="h-4 w-4 text-green-500" />
                      </div>
                      <div>
                        <p className="font-medium text-green-600 dark:text-green-400">Connected</p>
                        <p className="text-sm text-muted-foreground">
                          {paymentSettings.paypalEmail || "business@example.com"}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/10">
                        <X className="h-4 w-4 text-amber-500" />
                      </div>
                      <div>
                        <p className="font-medium text-amber-600 dark:text-amber-400">Not Connected</p>
                        <p className="text-sm text-muted-foreground">
                          Connect your PayPal business account
                        </p>
                      </div>
                    </>
                  )}
                </div>
                <Button 
                  variant={paymentSettings.paypalConnected ? "outline" : "default"}
                  onClick={handleConnectPayPal}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  {paymentSettings.paypalConnected ? "Manage" : "Connect PayPal"}
                </Button>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Bank Transfer */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <CardTitle className="text-base">Bank Transfer</CardTitle>
                  <CardDescription>Show bank details on invoices for direct transfer</CardDescription>
                </div>
              </div>
              <Switch
                checked={paymentSettings.bankTransferEnabled}
                onCheckedChange={(checked) => updatePaymentSettings({ bankTransferEnabled: checked })}
              />
            </div>
          </CardHeader>
          {paymentSettings.bankTransferEnabled && (
            <CardContent className="pt-0">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Bank Name</Label>
                    <Input
                      placeholder="Commonwealth Bank"
                      value={paymentSettings.bankDetails?.bankName || ""}
                      onChange={(e) => updatePaymentSettings({
                        bankDetails: { ...paymentSettings.bankDetails!, bankName: e.target.value }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Account Name</Label>
                    <Input
                      placeholder="My Business Pty Ltd"
                      value={paymentSettings.bankDetails?.accountName || ""}
                      onChange={(e) => updatePaymentSettings({
                        bankDetails: { ...paymentSettings.bankDetails!, accountName: e.target.value }
                      })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>BSB</Label>
                    <Input
                      placeholder="062-000"
                      value={paymentSettings.bankDetails?.bsb || ""}
                      onChange={(e) => updatePaymentSettings({
                        bankDetails: { ...paymentSettings.bankDetails!, bsb: e.target.value }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Account Number</Label>
                    <Input
                      placeholder="12345678"
                      value={paymentSettings.bankDetails?.accountNumber || ""}
                      onChange={(e) => updatePaymentSettings({
                        bankDetails: { ...paymentSettings.bankDetails!, accountNumber: e.target.value }
                      })}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </AppLayout>
  );
};

export default PaymentSettings;
