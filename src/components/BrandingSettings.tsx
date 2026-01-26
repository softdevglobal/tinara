import { useState } from "react";
import { ArrowLeft, Building2, Palette, Layout, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { BrandingSettings as BrandingSettingsType, InvoiceTemplate } from "@/types/branding";
import { cn } from "@/lib/utils";

interface BrandingSettingsProps {
  settings: BrandingSettingsType;
  onSave: (settings: BrandingSettingsType) => void;
  onBack: () => void;
}

const templates: { id: InvoiceTemplate; name: string; description: string }[] = [
  { id: "modern", name: "Modern", description: "Clean design with accent colors and gradient header" },
  { id: "classic", name: "Classic", description: "Traditional professional invoice layout" },
  { id: "minimal", name: "Minimal", description: "Simple and understated design" },
];

export function BrandingSettings({ settings, onSave, onBack }: BrandingSettingsProps) {
  const [formData, setFormData] = useState<BrandingSettingsType>(settings);
  const { toast } = useToast();

  const handleChange = (field: keyof BrandingSettingsType, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave(formData);
    toast({
      title: "Settings saved",
      description: "Your branding settings have been updated.",
    });
  };

  return (
    <div className="animate-fade-in">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Invoice Branding</h1>
          <p className="text-sm text-muted-foreground">Customize your invoice appearance</p>
        </div>
        <Button onClick={handleSave} className="gap-2">
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="company" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="company" className="gap-2">
            <Building2 className="h-4 w-4" />
            Company
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2">
            <Palette className="h-4 w-4" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="template" className="gap-2">
            <Layout className="h-4 w-4" />
            Template
          </TabsTrigger>
        </TabsList>

        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>This information will appear on your invoices</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => handleChange("companyName", e.target.value)}
                  placeholder="Your Company Name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyEmail">Email</Label>
                  <Input
                    id="companyEmail"
                    type="email"
                    value={formData.companyEmail}
                    onChange={(e) => handleChange("companyEmail", e.target.value)}
                    placeholder="hello@company.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyPhone">Phone</Label>
                  <Input
                    id="companyPhone"
                    value={formData.companyPhone}
                    onChange={(e) => handleChange("companyPhone", e.target.value)}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyAddress">Address</Label>
                <Textarea
                  id="companyAddress"
                  value={formData.companyAddress}
                  onChange={(e) => handleChange("companyAddress", e.target.value)}
                  placeholder="123 Business St, City, State 12345"
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="logoUrl">Logo URL</Label>
                <Input
                  id="logoUrl"
                  value={formData.logoUrl}
                  onChange={(e) => handleChange("logoUrl", e.target.value)}
                  placeholder="https://example.com/logo.png"
                />
                <p className="text-xs text-muted-foreground">
                  Enter a URL to your company logo (recommended: 200x60px)
                </p>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label>Show Logo on Invoice</Label>
                  <p className="text-xs text-muted-foreground">Display your company logo in the header</p>
                </div>
                <Switch
                  checked={formData.showLogo}
                  onCheckedChange={(checked) => handleChange("showLogo", checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Colors & Style</CardTitle>
              <CardDescription>Customize the look of your invoices</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={formData.primaryColor}
                      onChange={(e) => handleChange("primaryColor", e.target.value)}
                      className="w-12 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      value={formData.primaryColor}
                      onChange={(e) => handleChange("primaryColor", e.target.value)}
                      placeholder="#0f172a"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accentColor">Accent Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="accentColor"
                      type="color"
                      value={formData.accentColor}
                      onChange={(e) => handleChange("accentColor", e.target.value)}
                      className="w-12 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      value={formData.accentColor}
                      onChange={(e) => handleChange("accentColor", e.target.value)}
                      placeholder="#3b82f6"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="footerText">Footer Message</Label>
                <Input
                  id="footerText"
                  value={formData.footerText}
                  onChange={(e) => handleChange("footerText", e.target.value)}
                  placeholder="Thank you for your business!"
                />
              </div>
              <div className="rounded-lg border p-4 bg-secondary/30">
                <p className="text-sm font-medium mb-3">Preview</p>
                <div
                  className="h-24 rounded-md flex items-center justify-center text-white font-semibold"
                  style={{
                    background: `linear-gradient(135deg, ${formData.primaryColor} 0%, ${formData.accentColor} 100%)`,
                  }}
                >
                  {formData.companyName || "Your Company"}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="template">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Template</CardTitle>
              <CardDescription>Choose a layout style for your invoices</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    onClick={() => handleChange("template", template.id)}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all",
                      formData.template === template.id
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "hover:border-muted-foreground/30 hover:bg-secondary/50"
                    )}
                  >
                    <div
                      className={cn(
                        "h-4 w-4 rounded-full border-2 transition-colors",
                        formData.template === template.id
                          ? "border-primary bg-primary"
                          : "border-muted-foreground/30"
                      )}
                    />
                    <div className="flex-1">
                      <p className="font-medium">{template.name}</p>
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
