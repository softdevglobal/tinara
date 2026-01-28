import { z } from "zod";

// ============================================
// ENUMS & CONSTANTS
// ============================================

export type TaxType = "VAT" | "GST" | "SALES_TAX" | "NONE";
export type PricingMode = "INCLUSIVE" | "EXCLUSIVE";
export type RoundingMode = "PER_LINE" | "PER_INVOICE";
export type CustomerType = "BUSINESS" | "INDIVIDUAL";

export type TaxCategory = 
  | "STANDARD"
  | "REDUCED"
  | "ZERO"
  | "EXEMPT"
  | "OUT_OF_SCOPE"
  | "DIGITAL_SERVICE"
  | "PHYSICAL_GOODS"
  | "LABOR_SERVICE"
  | "SHIPPING";

export const TAX_CATEGORY_LABELS: Record<TaxCategory, string> = {
  STANDARD: "Standard Rate",
  REDUCED: "Reduced Rate",
  ZERO: "Zero Rated",
  EXEMPT: "Exempt",
  OUT_OF_SCOPE: "Out of Scope",
  DIGITAL_SERVICE: "Digital Service",
  PHYSICAL_GOODS: "Physical Goods",
  LABOR_SERVICE: "Labor/Service",
  SHIPPING: "Shipping",
};

// Tax ID labels by country
export const TAX_ID_LABELS: Record<string, { label: string; placeholder: string }> = {
  AU: { label: "ABN/GST", placeholder: "12 345 678 901" },
  GB: { label: "VAT Number", placeholder: "GB123456789" },
  DE: { label: "USt-IdNr", placeholder: "DE123456789" },
  FR: { label: "TVA Number", placeholder: "FR12345678901" },
  US: { label: "EIN (optional)", placeholder: "12-3456789" },
  NZ: { label: "GST Number", placeholder: "123-456-789" },
  CA: { label: "GST/HST Number", placeholder: "123456789RT0001" },
  IE: { label: "VAT Number", placeholder: "IE1234567AB" },
  DEFAULT: { label: "Tax ID", placeholder: "Enter tax ID" },
};

// EU member states for reverse charge
export const EU_COUNTRIES = [
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR",
  "DE", "GR", "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL",
  "PL", "PT", "RO", "SK", "SI", "ES", "SE"
];

// ============================================
// TAX REGISTRATION
// ============================================

export interface TaxRegistration {
  id: string;
  countryCode: string;
  regionCode?: string;
  taxIdLabel: string;
  taxIdValue: string;
  effectiveFrom: string; // ISO date
  effectiveTo?: string;  // ISO date, null = current
  isActive: boolean;
}

export const taxRegistrationSchema = z.object({
  id: z.string(),
  countryCode: z.string().length(2),
  regionCode: z.string().max(10).optional(),
  taxIdLabel: z.string().min(1).max(50),
  taxIdValue: z.string().min(1).max(50),
  effectiveFrom: z.string(),
  effectiveTo: z.string().optional(),
  isActive: z.boolean(),
});

// ============================================
// TAX RATE
// ============================================

export interface TaxRate {
  id: string;
  schemeId: string;
  name: string;
  ratePercent: number;         // e.g., 10 for 10%
  taxCategory: TaxCategory;
  effectiveFrom: string;
  effectiveTo?: string;
  isDefault: boolean;
}

export const taxRateSchema = z.object({
  id: z.string(),
  schemeId: z.string(),
  name: z.string().min(1).max(100),
  ratePercent: z.number().min(0).max(100),
  taxCategory: z.enum([
    "STANDARD", "REDUCED", "ZERO", "EXEMPT", "OUT_OF_SCOPE",
    "DIGITAL_SERVICE", "PHYSICAL_GOODS", "LABOR_SERVICE", "SHIPPING"
  ]),
  effectiveFrom: z.string(),
  effectiveTo: z.string().optional(),
  isDefault: z.boolean(),
});

// ============================================
// TAX SCHEME
// ============================================

export interface TaxScheme {
  id: string;
  name: string;                    // e.g., "Australian GST", "EU VAT"
  taxType: TaxType;
  countryCode: string;
  pricingModeDefault: PricingMode;
  roundingMode: RoundingMode;
  roundingPrecision: number;       // decimal places (typically 2)
  reverseChargeSupported: boolean;
  exportZeroRatedSupported: boolean;
  withholdingTaxSupported: boolean;
  rates: TaxRate[];
  isActive: boolean;
}

export const taxSchemeSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100),
  taxType: z.enum(["VAT", "GST", "SALES_TAX", "NONE"]),
  countryCode: z.string().length(2),
  pricingModeDefault: z.enum(["INCLUSIVE", "EXCLUSIVE"]),
  roundingMode: z.enum(["PER_LINE", "PER_INVOICE"]),
  roundingPrecision: z.number().int().min(0).max(4),
  reverseChargeSupported: z.boolean(),
  exportZeroRatedSupported: z.boolean(),
  withholdingTaxSupported: z.boolean(),
  rates: z.array(taxRateSchema),
  isActive: z.boolean(),
});

// ============================================
// CUSTOMER TAX PROFILE
// ============================================

export interface Address {
  street?: string;
  city?: string;
  region?: string;
  postalCode?: string;
  countryCode: string;
}

export interface CustomerTaxProfile {
  customerId: string;
  customerType: CustomerType;
  billingAddress: Address;
  shippingAddress?: Address;
  taxIdValue?: string;
  taxIdValidated: boolean;
  taxIdValidatedAt?: string;
  exemptionReason?: string;
  exemptionCertificateId?: string;
}

export const addressSchema = z.object({
  street: z.string().max(255).optional(),
  city: z.string().max(100).optional(),
  region: z.string().max(100).optional(),
  postalCode: z.string().max(20).optional(),
  countryCode: z.string().length(2),
});

export const customerTaxProfileSchema = z.object({
  customerId: z.string(),
  customerType: z.enum(["BUSINESS", "INDIVIDUAL"]),
  billingAddress: addressSchema,
  shippingAddress: addressSchema.optional(),
  taxIdValue: z.string().max(50).optional(),
  taxIdValidated: z.boolean(),
  taxIdValidatedAt: z.string().optional(),
  exemptionReason: z.string().max(200).optional(),
  exemptionCertificateId: z.string().max(100).optional(),
});

// ============================================
// COMPANY SETTINGS
// ============================================

export interface CompanySettings {
  id: string;
  companyName: string;
  countryCode: string;
  regionCode?: string;
  baseCurrency: string;           // ISO 4217
  pricingMode: PricingMode;
  roundingMode: RoundingMode;
  roundingPrecision: number;
  withholdingTaxEnabled: boolean;
  taxRegistrations: TaxRegistration[];
  taxSchemes: TaxScheme[];
  activeTaxSchemeId?: string;
  updatedAt: string;
}

export const companySettingsSchema = z.object({
  id: z.string(),
  companyName: z.string().min(1).max(200),
  countryCode: z.string().length(2),
  regionCode: z.string().max(10).optional(),
  baseCurrency: z.string().length(3),
  pricingMode: z.enum(["INCLUSIVE", "EXCLUSIVE"]),
  roundingMode: z.enum(["PER_LINE", "PER_INVOICE"]),
  roundingPrecision: z.number().int().min(0).max(4),
  withholdingTaxEnabled: z.boolean(),
  taxRegistrations: z.array(taxRegistrationSchema),
  taxSchemes: z.array(taxSchemeSchema),
  activeTaxSchemeId: z.string().optional(),
  updatedAt: z.string(),
});

// ============================================
// DOCUMENT TAX SNAPSHOTS
// ============================================

export interface CompanyTaxSnapshot {
  companyName: string;
  countryCode: string;
  regionCode?: string;
  taxIdLabel: string;
  taxIdValue: string;
  taxSchemeId: string;
  taxSchemeName: string;
  taxType: TaxType;
}

export interface CustomerTaxSnapshot {
  customerType: CustomerType;
  countryCode: string;
  regionCode?: string;
  taxIdValue?: string;
  taxIdValidated: boolean;
  exemptionReason?: string;
}

export interface DocumentTaxContext {
  companyTaxSnapshot: CompanyTaxSnapshot;
  customerTaxSnapshot: CustomerTaxSnapshot;
  pricingModeSnapshot: PricingMode;
  currencySnapshot: string;
  roundingModeSnapshot: RoundingMode;
  roundingPrecisionSnapshot: number;
  createdAt: string;
}

// ============================================
// DOCUMENT LINE ITEM (Enhanced)
// ============================================

export interface EnhancedDocumentLineItem {
  id: string;
  documentId: string;
  sourceItemId?: string;
  nameSnapshot: string;
  descriptionSnapshot?: string;
  unitSnapshot: string;
  unitPriceCentsSnapshot: number;
  qty: number;
  taxCategorySnapshot: TaxCategory;
  taxRateSnapshot: number;        // Resolved rate at creation time
  taxAmountCentsSnapshot: number; // Pre-calculated tax for this line
  discountType: "NONE" | "PERCENT" | "AMOUNT";
  discountValue: number;
  discountAmountCentsSnapshot: number;
  lineTotalCentsSnapshot: number;
  isReverseCharge: boolean;
  reverseChargeNote?: string;
  sortOrder: number;
}

// ============================================
// AUDIT LOG
// ============================================

export type AuditAction =
  | "SETTINGS_UPDATED"
  | "TAX_REGISTRATION_ADDED"
  | "TAX_REGISTRATION_REMOVED"
  | "TAX_SCHEME_CREATED"
  | "TAX_SCHEME_UPDATED"
  | "PAYMENT_SETTINGS_UPDATED"
  | "TEAM_MEMBER_INVITED"
  | "TEAM_MEMBER_REMOVED"
  | "EXPORT_INVOICES"
  | "EXPORT_CLIENTS"
  | "EXPORT_ITEMS"
  | "EXPORT_PAYMENTS"
  | "SECURITY_2FA_ENABLED"
  | "SECURITY_2FA_DISABLED"
  | "SECURITY_DEVICE_REMOVED";

export interface AuditLog {
  id: string;
  action: AuditAction;
  userId: string;
  userEmail: string;
  description: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

// ============================================
// TEAM MEMBER
// ============================================

export type TeamRole = "owner" | "admin" | "editor" | "viewer";

export interface TeamMemberPermissions {
  invoices: boolean;
  clients: boolean;
  settings: boolean;
  exports: boolean;
  payments: boolean;
}

export interface TeamMember {
  id: string;
  email: string;
  name?: string;
  role: TeamRole;
  permissions: TeamMemberPermissions;
  invitedAt: string;
  acceptedAt?: string;
  isActive: boolean;
}

// ============================================
// PAYMENT SETTINGS
// ============================================

export interface PaymentSettings {
  stripeEnabled: boolean;
  stripeConnected: boolean;
  stripeAccountId?: string;
  paypalEnabled: boolean;
  paypalConnected: boolean;
  paypalEmail?: string;
  bankTransferEnabled: boolean;
  bankDetails?: {
    bankName: string;
    accountName: string;
    bsb: string;
    accountNumber: string;
  };
}

// ============================================
// COMMUNICATION SETTINGS
// ============================================

export interface ReminderSettings {
  enabled: boolean;
  threeDaysBefore: boolean;
  onDueDate: boolean;
  threeDaysAfter: boolean;
  sevenDaysAfter: boolean;
}

export interface CommunicationSettings {
  sameMessageForAllTypes: boolean;
  defaultMessage: string;
  invoiceMessage?: string;
  quoteMessage?: string;
  reminderMessage?: string;
  ccEmails: string[];
  bccEmails: string[];
  reminders: ReminderSettings;
}

// ============================================
// SECURITY SETTINGS
// ============================================

export interface TrustedDevice {
  id: string;
  deviceName: string;
  browser: string;
  lastUsed: string;
  ipAddress: string;
  isCurrent: boolean;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  twoFactorMethod?: "sms" | "authenticator";
  phoneNumber?: string;
  trustedDevices: TrustedDevice[];
}
