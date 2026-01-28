import { useState } from "react";
import { ArrowLeft, Plus, Trash2, AlertTriangle, Save, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { Separator } from "@/components/ui/separator";
import { useSettings } from "@/context/SettingsContext";
import { useToast } from "@/hooks/use-toast";
import { COUNTRIES, getRegionsByCountry, CURRENCIES } from "@/data/countries";
import { TAX_ID_LABELS, TaxRegistration, TaxScheme, TaxRate, TaxCategory, TAX_CATEGORY_LABELS } from "@/types/tax-settings";

const TaxSettings = () => {
  const { 
    companySettings, 
    updateCompanySettings, 
    addTaxRegistration, 
    removeTaxRegistration,
    addTaxScheme,
    updateTaxScheme,
    addTaxRate,
    removeTaxRate,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    addAuditLog,
  } = useSettings();
  const { toast } = useToast();
  
  const [showAddRegistration, setShowAddRegistration] = useState(false);
  const [showAddScheme, setShowAddScheme] = useState(false);
  const [showAddRate, setShowAddRate] = useState(false);
  const [selectedSchemeId, setSelectedSchemeId] = useState<string | null>(null);
  
  // Form states
  const [newRegistration, setNewRegistration] = useState<Partial<TaxRegistration>>({
    countryCode: companySettings.countryCode,
    effectiveFrom: new Date().toISOString().split("T")[0],
    isActive: true,
  });
  
  const [newScheme, setNewScheme] = useState<Partial<TaxScheme>>({
    taxType: "GST",
    pricingModeDefault: "EXCLUSIVE",
    roundingMode: "PER_LINE",
    roundingPrecision: 2,
    reverseChargeSupported: false,
    exportZeroRatedSupported: true,
    withholdingTaxSupported: false,
    rates: [],
    isActive: true,
  });
  
  const [newRate, setNewRate] = useState<Partial<TaxRate>>({
    ratePercent: 0,
    taxCategory: "STANDARD",
    effectiveFrom: new Date().toISOString().split("T")[0],
    isDefault: false,
  });

  const selectedCountry = COUNTRIES.find(c => c.code === companySettings.countryCode);
  const regions = getRegionsByCountry(companySettings.countryCode);
  const taxIdConfig = TAX_ID_LABELS[companySettings.countryCode] || TAX_ID_LABELS.DEFAULT;
  
  const handleSave = () => {
    addAuditLog("SETTINGS_UPDATED", "Tax settings updated");
    setHasUnsavedChanges(false);
    toast({
      title: "Settings saved",
      description: "Your tax settings have been updated.",
    });
  };

  const handleAddRegistration = () => {
    if (!newRegistration.taxIdValue || !newRegistration.countryCode) {
      toast({ title: "Missing fields", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }
    
    const registration: TaxRegistration = {
      id: `reg_${Date.now()}`,
      countryCode: newRegistration.countryCode!,
      regionCode: newRegistration.regionCode,
      taxIdLabel: TAX_ID_LABELS[newRegistration.countryCode!]?.label || "Tax ID",
      taxIdValue: newRegistration.taxIdValue!,
      effectiveFrom: newRegistration.effectiveFrom!,
      effectiveTo: newRegistration.effectiveTo,
      isActive: true,
    };
    
    addTaxRegistration(registration);
    addAuditLog("TAX_REGISTRATION_ADDED", `Added tax registration: ${registration.taxIdValue}`);
    setShowAddRegistration(false);
    setNewRegistration({
      countryCode: companySettings.countryCode,
      effectiveFrom: new Date().toISOString().split("T")[0],
      isActive: true,
    });
  };

  const handleAddScheme = () => {
    if (!newScheme.name || !newScheme.countryCode) {
      toast({ title: "Missing fields", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }
    
    const scheme: TaxScheme = {
      id: `scheme_${Date.now()}`,
      name: newScheme.name!,
      taxType: newScheme.taxType!,
      countryCode: newScheme.countryCode!,
      pricingModeDefault: newScheme.pricingModeDefault!,
      roundingMode: newScheme.roundingMode!,
      roundingPrecision: newScheme.roundingPrecision!,
      reverseChargeSupported: newScheme.reverseChargeSupported!,
      exportZeroRatedSupported: newScheme.exportZeroRatedSupported!,
      withholdingTaxSupported: newScheme.withholdingTaxSupported!,
      rates: [],
      isActive: true,
    };
    
    addTaxScheme(scheme);
    addAuditLog("TAX_SCHEME_CREATED", `Created tax scheme: ${scheme.name}`);
    setShowAddScheme(false);
    setNewScheme({
      taxType: "GST",
      pricingModeDefault: "EXCLUSIVE",
      roundingMode: "PER_LINE",
      roundingPrecision: 2,
      reverseChargeSupported: false,
      exportZeroRatedSupported: true,
      withholdingTaxSupported: false,
      rates: [],
      isActive: true,
    });
  };

  const handleAddRate = () => {
    if (!selectedSchemeId || !newRate.name) {
      toast({ title: "Missing fields", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }
    
    const rate: TaxRate = {
      id: `rate_${Date.now()}`,
      schemeId: selectedSchemeId,
      name: newRate.name!,
      ratePercent: newRate.ratePercent!,
      taxCategory: newRate.taxCategory!,
      effectiveFrom: newRate.effectiveFrom!,
      effectiveTo: newRate.effectiveTo,
      isDefault: newRate.isDefault!,
    };
    
    addTaxRate(selectedSchemeId, rate);
    setShowAddRate(false);
    setNewRate({
      ratePercent: 0,
      taxCategory: "STANDARD",
      effectiveFrom: new Date().toISOString().split("T")[0],
      isDefault: false,
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
            <h1 className="text-xl font-semibold text-foreground">Tax Settings & Currency</h1>
            <p className="text-sm text-muted-foreground">
              Configure tax rates, registrations, and base currency
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
          Changes to tax settings apply to <strong>new documents only</strong>. 
          Existing invoices and quotes retain their original tax calculations.
        </AlertDescription>
      </Alert>

      <div className="space-y-6">
        {/* Basic Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Business Location & Currency</CardTitle>
            <CardDescription>
              Set your primary business location and base currency
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Country</Label>
                <Select
                  value={companySettings.countryCode}
                  onValueChange={(value) => {
                    updateCompanySettings({ countryCode: value, regionCode: undefined });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedCountry?.hasRegions && regions.length > 0 && (
                <div className="space-y-2">
                  <Label>State / Region</Label>
                  <Select
                    value={companySettings.regionCode || ""}
                    onValueChange={(value) => updateCompanySettings({ regionCode: value || undefined })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      {regions.map((region) => (
                        <SelectItem key={region.code} value={region.code}>
                          {region.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label>Base Currency</Label>
                <Select
                  value={companySettings.baseCurrency}
                  onValueChange={(value) => updateCompanySettings({ baseCurrency: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code}>
                        {currency.code} - {currency.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Pricing Mode</Label>
                <Select
                  value={companySettings.pricingMode}
                  onValueChange={(value: "INCLUSIVE" | "EXCLUSIVE") => 
                    updateCompanySettings({ pricingMode: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EXCLUSIVE">Tax Exclusive (add tax to prices)</SelectItem>
                    <SelectItem value="INCLUSIVE">Tax Inclusive (prices include tax)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Rounding</Label>
                <Select
                  value={companySettings.roundingMode}
                  onValueChange={(value: "PER_LINE" | "PER_INVOICE") => 
                    updateCompanySettings({ roundingMode: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PER_LINE">Round per line item</SelectItem>
                    <SelectItem value="PER_INVOICE">Round per invoice total</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4">
              <div className="space-y-0.5">
                <Label>Withholding Tax</Label>
                <p className="text-sm text-muted-foreground">
                  Enable withholding tax calculations (advanced)
                </p>
              </div>
              <Switch
                checked={companySettings.withholdingTaxEnabled}
                onCheckedChange={(checked) => updateCompanySettings({ withholdingTaxEnabled: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Tax Registrations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Tax Registrations</CardTitle>
              <CardDescription>
                Your tax registration numbers by jurisdiction
              </CardDescription>
            </div>
            <Dialog open={showAddRegistration} onOpenChange={setShowAddRegistration}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Registration
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Tax Registration</DialogTitle>
                  <DialogDescription>
                    Add a new tax registration for a jurisdiction
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Country</Label>
                    <Select
                      value={newRegistration.countryCode}
                      onValueChange={(value) => setNewRegistration({ ...newRegistration, countryCode: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRIES.map((country) => (
                          <SelectItem key={country.code} value={country.code}>
                            {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{TAX_ID_LABELS[newRegistration.countryCode || "DEFAULT"]?.label || "Tax ID"}</Label>
                    <Input
                      placeholder={TAX_ID_LABELS[newRegistration.countryCode || "DEFAULT"]?.placeholder}
                      value={newRegistration.taxIdValue || ""}
                      onChange={(e) => setNewRegistration({ ...newRegistration, taxIdValue: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Effective From</Label>
                    <Input
                      type="date"
                      value={newRegistration.effectiveFrom}
                      onChange={(e) => setNewRegistration({ ...newRegistration, effectiveFrom: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddRegistration(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddRegistration}>Add Registration</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {companySettings.taxRegistrations.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No tax registrations yet. Add one to get started.
              </p>
            ) : (
              <div className="space-y-3">
                {companySettings.taxRegistrations.map((reg) => (
                  <div
                    key={reg.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-sm font-medium">
                        {reg.countryCode}
                      </div>
                      <div>
                        <p className="font-medium">{reg.taxIdLabel}: {reg.taxIdValue}</p>
                        <p className="text-sm text-muted-foreground">
                          From {new Date(reg.effectiveFrom).toLocaleDateString()}
                          {reg.effectiveTo && ` to ${new Date(reg.effectiveTo).toLocaleDateString()}`}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        removeTaxRegistration(reg.id);
                        addAuditLog("TAX_REGISTRATION_REMOVED", `Removed tax registration: ${reg.taxIdValue}`);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tax Schemes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Tax Schemes</CardTitle>
              <CardDescription>
                Configure tax types and rates for different jurisdictions
              </CardDescription>
            </div>
            <Dialog open={showAddScheme} onOpenChange={setShowAddScheme}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Scheme
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Add Tax Scheme</DialogTitle>
                  <DialogDescription>
                    Create a new tax scheme with rates and rules
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Scheme Name</Label>
                      <Input
                        placeholder="e.g., Australian GST"
                        value={newScheme.name || ""}
                        onChange={(e) => setNewScheme({ ...newScheme, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Tax Type</Label>
                      <Select
                        value={newScheme.taxType}
                        onValueChange={(value: "VAT" | "GST" | "SALES_TAX" | "NONE") => 
                          setNewScheme({ ...newScheme, taxType: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="GST">GST</SelectItem>
                          <SelectItem value="VAT">VAT</SelectItem>
                          <SelectItem value="SALES_TAX">Sales Tax</SelectItem>
                          <SelectItem value="NONE">None</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Country</Label>
                    <Select
                      value={newScheme.countryCode || ""}
                      onValueChange={(value) => setNewScheme({ ...newScheme, countryCode: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRIES.map((country) => (
                          <SelectItem key={country.code} value={country.code}>
                            {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Separator />
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Reverse Charge Supported</Label>
                        <p className="text-xs text-muted-foreground">For B2B cross-border EU transactions</p>
                      </div>
                      <Switch
                        checked={newScheme.reverseChargeSupported}
                        onCheckedChange={(checked) => 
                          setNewScheme({ ...newScheme, reverseChargeSupported: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Export Zero-Rated</Label>
                        <p className="text-xs text-muted-foreground">0% tax on exports to other countries</p>
                      </div>
                      <Switch
                        checked={newScheme.exportZeroRatedSupported}
                        onCheckedChange={(checked) => 
                          setNewScheme({ ...newScheme, exportZeroRatedSupported: checked })
                        }
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddScheme(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddScheme}>Create Scheme</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {companySettings.taxSchemes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No tax schemes yet. Add one to configure tax rates.
              </p>
            ) : (
              <div className="space-y-4">
                {companySettings.taxSchemes.map((scheme) => (
                  <div key={scheme.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{scheme.name}</span>
                          <span className="text-xs bg-secondary px-2 py-0.5 rounded">
                            {scheme.taxType}
                          </span>
                        </div>
                        {scheme.id === companySettings.activeTaxSchemeId && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {scheme.id !== companySettings.activeTaxSchemeId && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateCompanySettings({ activeTaxSchemeId: scheme.id })}
                          >
                            Set Active
                          </Button>
                        )}
                        <Dialog 
                          open={showAddRate && selectedSchemeId === scheme.id} 
                          onOpenChange={(open) => {
                            setShowAddRate(open);
                            if (open) setSelectedSchemeId(scheme.id);
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button size="sm" variant="ghost">
                              <Plus className="h-4 w-4 mr-1" />
                              Add Rate
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Add Tax Rate</DialogTitle>
                              <DialogDescription>
                                Add a new rate to {scheme.name}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label>Rate Name</Label>
                                  <Input
                                    placeholder="e.g., Standard Rate"
                                    value={newRate.name || ""}
                                    onChange={(e) => setNewRate({ ...newRate, name: e.target.value })}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Rate (%)</Label>
                                  <Input
                                    type="number"
                                    min={0}
                                    max={100}
                                    step={0.01}
                                    value={newRate.ratePercent || 0}
                                    onChange={(e) => setNewRate({ ...newRate, ratePercent: parseFloat(e.target.value) || 0 })}
                                  />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label>Tax Category</Label>
                                <Select
                                  value={newRate.taxCategory}
                                  onValueChange={(value: TaxCategory) => 
                                    setNewRate({ ...newRate, taxCategory: value })
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {(Object.entries(TAX_CATEGORY_LABELS) as [TaxCategory, string][]).map(([key, label]) => (
                                      <SelectItem key={key} value={key}>
                                        {label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label>Effective From</Label>
                                  <Input
                                    type="date"
                                    value={newRate.effectiveFrom}
                                    onChange={(e) => setNewRate({ ...newRate, effectiveFrom: e.target.value })}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Effective To (optional)</Label>
                                  <Input
                                    type="date"
                                    value={newRate.effectiveTo || ""}
                                    onChange={(e) => setNewRate({ ...newRate, effectiveTo: e.target.value || undefined })}
                                  />
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={newRate.isDefault}
                                  onCheckedChange={(checked) => setNewRate({ ...newRate, isDefault: checked })}
                                />
                                <Label>Default rate for this category</Label>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setShowAddRate(false)}>
                                Cancel
                              </Button>
                              <Button onClick={handleAddRate}>Add Rate</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                    
                    {/* Rates Table */}
                    {scheme.rates.length > 0 && (
                      <div className="bg-secondary/30 rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-border">
                              <th className="text-left p-2 font-medium">Name</th>
                              <th className="text-left p-2 font-medium">Category</th>
                              <th className="text-right p-2 font-medium">Rate</th>
                              <th className="text-left p-2 font-medium">Effective</th>
                              <th className="w-10"></th>
                            </tr>
                          </thead>
                          <tbody>
                            {scheme.rates.map((rate) => (
                              <tr key={rate.id} className="border-b border-border last:border-0">
                                <td className="p-2">
                                  {rate.name}
                                  {rate.isDefault && (
                                    <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded ml-2">
                                      Default
                                    </span>
                                  )}
                                </td>
                                <td className="p-2 text-muted-foreground">
                                  {TAX_CATEGORY_LABELS[rate.taxCategory]}
                                </td>
                                <td className="p-2 text-right font-mono">{rate.ratePercent}%</td>
                                <td className="p-2 text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(rate.effectiveFrom).toLocaleDateString()}
                                  </div>
                                </td>
                                <td className="p-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => removeTaxRate(scheme.id, rate.id)}
                                  >
                                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default TaxSettings;
