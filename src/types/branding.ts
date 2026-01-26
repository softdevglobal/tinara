export type InvoiceTemplate = "modern" | "classic" | "minimal";

export interface BrandingSettings {
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  companyAddress: string;
  logoUrl: string;
  primaryColor: string;
  accentColor: string;
  template: InvoiceTemplate;
  showLogo: boolean;
  footerText: string;
}

export const defaultBrandingSettings: BrandingSettings = {
  companyName: "Your Company",
  companyEmail: "hello@company.com",
  companyPhone: "+1 (555) 000-0000",
  companyAddress: "123 Business St, City, State 12345",
  logoUrl: "",
  primaryColor: "#0f172a",
  accentColor: "#3b82f6",
  template: "modern",
  showLogo: true,
  footerText: "Thank you for your business!",
};
