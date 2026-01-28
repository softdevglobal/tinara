import {
  TaxScheme,
  TaxRate,
  TaxCategory,
  CustomerTaxProfile,
  CompanySettings,
  PricingMode,
  EnhancedDocumentLineItem,
  EU_COUNTRIES,
} from "@/types/tax-settings";

// ============================================
// MONEY UTILITIES
// ============================================

export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100);
}

export function centsToDollars(cents: number): number {
  return cents / 100;
}

export function formatCurrency(cents: number, currencyCode: string = "AUD"): string {
  const dollars = centsToDollars(cents);
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 2,
  }).format(dollars);
}

// ============================================
// TAX RESOLUTION ENGINE
// ============================================

export interface TaxResolutionContext {
  companySettings: CompanySettings;
  customerProfile: CustomerTaxProfile;
  itemTaxCategory: TaxCategory;
  transactionDate: Date;
}

export interface ResolvedTax {
  ratePercent: number;
  taxCategory: TaxCategory;
  isReverseCharge: boolean;
  isExportZeroRated: boolean;
  reason: string;
  legalNote?: string;
}

/**
 * Resolve the applicable tax rate based on jurisdiction rules
 */
export function resolveTaxRate(ctx: TaxResolutionContext): ResolvedTax {
  const { companySettings, customerProfile, itemTaxCategory, transactionDate } = ctx;
  
  const scheme = companySettings.taxSchemes.find(
    s => s.id === companySettings.activeTaxSchemeId && s.isActive
  );
  
  if (!scheme) {
    return {
      ratePercent: 0,
      taxCategory: itemTaxCategory,
      isReverseCharge: false,
      isExportZeroRated: false,
      reason: "No active tax scheme",
    };
  }

  // Check for export zero-rated
  if (scheme.exportZeroRatedSupported && 
      customerProfile.billingAddress.countryCode !== companySettings.countryCode) {
    return {
      ratePercent: 0,
      taxCategory: "ZERO",
      isReverseCharge: false,
      isExportZeroRated: true,
      reason: "Export zero-rated: customer in different country",
    };
  }

  // Check for EU reverse charge
  if (scheme.taxType === "VAT" && 
      scheme.reverseChargeSupported &&
      customerProfile.customerType === "BUSINESS" &&
      customerProfile.taxIdValidated &&
      customerProfile.billingAddress.countryCode !== companySettings.countryCode &&
      EU_COUNTRIES.includes(companySettings.countryCode) &&
      EU_COUNTRIES.includes(customerProfile.billingAddress.countryCode)) {
    return {
      ratePercent: 0,
      taxCategory: itemTaxCategory,
      isReverseCharge: true,
      isExportZeroRated: false,
      reason: "EU reverse charge: B2B cross-border with valid VAT ID",
      legalNote: "Reverse charge: VAT to be accounted for by the recipient as per Article 196 of Council Directive 2006/112/EC",
    };
  }

  // Check for tax exemption
  if (customerProfile.exemptionReason) {
    return {
      ratePercent: 0,
      taxCategory: "EXEMPT",
      isReverseCharge: false,
      isExportZeroRated: false,
      reason: `Customer exempt: ${customerProfile.exemptionReason}`,
    };
  }

  // Find applicable rate for the tax category
  const applicableRate = findApplicableRate(scheme, itemTaxCategory, transactionDate);
  
  return {
    ratePercent: applicableRate?.ratePercent ?? 0,
    taxCategory: itemTaxCategory,
    isReverseCharge: false,
    isExportZeroRated: false,
    reason: applicableRate ? `Standard rate: ${applicableRate.name}` : "No applicable rate found",
  };
}

/**
 * Find the applicable tax rate for a category at a given date
 */
function findApplicableRate(
  scheme: TaxScheme, 
  category: TaxCategory, 
  date: Date
): TaxRate | undefined {
  const dateStr = date.toISOString().split("T")[0];
  
  return scheme.rates.find(rate => {
    if (rate.taxCategory !== category) return false;
    if (rate.effectiveFrom > dateStr) return false;
    if (rate.effectiveTo && rate.effectiveTo < dateStr) return false;
    return true;
  });
}

// ============================================
// LINE ITEM CALCULATION
// ============================================

export interface LineCalculation {
  baseCents: number;
  discountCents: number;
  netCents: number;
  taxCents: number;
  totalCents: number;
}

/**
 * Calculate a single line item with tax
 */
export function calculateEnhancedLineItem(
  unitPriceCents: number,
  qty: number,
  taxRatePercent: number,
  pricingMode: PricingMode,
  discountType: "NONE" | "PERCENT" | "AMOUNT" = "NONE",
  discountValue: number = 0
): LineCalculation {
  const baseCents = Math.round(unitPriceCents * qty);
  
  // Calculate discount
  let discountCents = 0;
  if (discountType === "PERCENT" && discountValue > 0) {
    discountCents = Math.round(baseCents * (discountValue / 100));
  } else if (discountType === "AMOUNT") {
    discountCents = discountValue;
  }
  
  const netBeforeTax = Math.max(0, baseCents - discountCents);
  
  // Calculate tax based on pricing mode
  let taxCents: number;
  let netCents: number;
  
  if (pricingMode === "INCLUSIVE") {
    // Price includes tax, extract it
    taxCents = Math.round(netBeforeTax - (netBeforeTax / (1 + taxRatePercent / 100)));
    netCents = netBeforeTax - taxCents;
  } else {
    // Price excludes tax, add it
    netCents = netBeforeTax;
    taxCents = Math.round(netCents * (taxRatePercent / 100));
  }
  
  const totalCents = netCents + taxCents;
  
  return { baseCents, discountCents, netCents, taxCents, totalCents };
}

// ============================================
// DOCUMENT TOTALS
// ============================================

export interface DocumentTotals {
  subtotalCents: number;
  discountCents: number;
  taxCents: number;
  totalCents: number;
  taxBreakdown: Record<string, { label: string; amountCents: number }>;
}

/**
 * Calculate document totals from enhanced line items
 */
export function calculateEnhancedDocumentTotals(
  lineItems: EnhancedDocumentLineItem[]
): DocumentTotals {
  let subtotalCents = 0;
  let discountCents = 0;
  let taxCents = 0;
  const taxBreakdown: Record<string, { label: string; amountCents: number }> = {};

  for (const line of lineItems) {
    subtotalCents += line.unitPriceCentsSnapshot * line.qty;
    discountCents += line.discountAmountCentsSnapshot;
    taxCents += line.taxAmountCentsSnapshot;
    
    // Build tax breakdown
    const key = `${line.taxCategorySnapshot}_${line.taxRateSnapshot}`;
    if (!taxBreakdown[key]) {
      taxBreakdown[key] = {
        label: `${line.taxCategorySnapshot} (${line.taxRateSnapshot}%)`,
        amountCents: 0,
      };
    }
    taxBreakdown[key].amountCents += line.taxAmountCentsSnapshot;
  }

  const totalCents = subtotalCents - discountCents + taxCents;

  return { subtotalCents, discountCents, taxCents, totalCents, taxBreakdown };
}

/**
 * Apply rounding based on mode
 */
export function applyRounding(
  value: number,
  precision: number,
  mode: "PER_LINE" | "PER_INVOICE"
): number {
  if (mode === "PER_LINE") {
    // Round to nearest cent at line level (already done)
    return Math.round(value);
  }
  // For per-invoice, we sum first then round at the end
  return Math.round(value * Math.pow(10, precision)) / Math.pow(10, precision);
}
