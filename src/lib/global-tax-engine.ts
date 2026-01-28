/**
 * Global Tax Engine
 * 
 * Worldwide-ready tax resolution and calculation engine.
 * Supports VAT, GST, Sales Tax with proper handling for:
 * - B2B vs B2C transactions
 * - Cross-border EU reverse charge
 * - Export zero-rating
 * - Multiple tax rates per document
 */

import {
  TaxCategory,
  TaxScheme,
  TaxRate,
  CustomerTaxProfile,
  CompanySettings,
  PricingMode,
  EU_COUNTRIES,
  TAX_CATEGORY_LABELS,
} from "@/types/tax-settings";

// ============================================
// TYPES
// ============================================

export interface TaxApplication {
  taxCategory: TaxCategory;
  taxRatePercent: number;
  taxName: string;
  isReverseCharge: boolean;
  reverseChargeNote?: string;
  explanation: string;
}

export interface LineItemTaxInput {
  unitPriceCents: number;
  qty: number;
  discountType: "NONE" | "PERCENT" | "AMOUNT";
  discountValue: number;
  taxCategory: TaxCategory;
  taxRatePercent: number;
  isReverseCharge: boolean;
}

export interface LineItemTaxResult {
  baseCents: number;
  discountCents: number;
  netCents: number;
  taxCents: number;
  totalCents: number;
  taxRateApplied: number;
  isReverseCharge: boolean;
}

export interface TaxBreakdownItem {
  taxName: string;
  taxCategory: TaxCategory;
  taxRatePercent: number;
  taxableCents: number;
  taxCents: number;
  isReverseCharge: boolean;
}

export interface DocumentTaxSummary {
  subtotalCents: number;
  totalDiscountCents: number;
  totalTaxCents: number;
  totalCents: number;
  breakdown: TaxBreakdownItem[];
  hasReverseCharge: boolean;
  hasMixedTaxRates: boolean;
}

// ============================================
// TAX RESOLUTION
// ============================================

/**
 * Resolve the applicable tax treatment for a line item based on:
 * - Company settings (country, tax scheme)
 * - Customer profile (type, country, tax ID validation)
 * - Item category
 */
export function resolveTaxForLine(
  itemTaxCategory: TaxCategory,
  companySettings: CompanySettings,
  customerProfile?: CustomerTaxProfile
): TaxApplication {
  const scheme = companySettings.taxSchemes.find(
    s => s.id === companySettings.activeTaxSchemeId
  );

  if (!scheme) {
    return {
      taxCategory: "OUT_OF_SCOPE",
      taxRatePercent: 0,
      taxName: "No Tax",
      isReverseCharge: false,
      explanation: "No active tax scheme configured",
    };
  }

  // Get the rate for this category
  const applicableRate = findApplicableRate(scheme, itemTaxCategory);

  // Check for special tax treatments
  if (customerProfile) {
    // Export / Zero-rating check
    if (
      scheme.exportZeroRatedSupported &&
      customerProfile.billingAddress.countryCode !== companySettings.countryCode
    ) {
      // Check if it's a B2B EU transaction (reverse charge)
      if (
        scheme.reverseChargeSupported &&
        isEUCrossBorderB2B(companySettings.countryCode, customerProfile)
      ) {
        return {
          taxCategory: itemTaxCategory,
          taxRatePercent: 0,
          taxName: `${applicableRate.name} (Reverse Charge)`,
          isReverseCharge: true,
          reverseChargeNote: "VAT reverse charge applies - customer to account for VAT",
          explanation: "EU B2B cross-border transaction with valid VAT ID",
        };
      }

      // Non-EU export - zero rated
      if (!EU_COUNTRIES.includes(customerProfile.billingAddress.countryCode)) {
        return {
          taxCategory: "ZERO",
          taxRatePercent: 0,
          taxName: `${scheme.taxType} Zero-rated Export`,
          isReverseCharge: false,
          explanation: "Export to non-EU country",
        };
      }
    }

    // Check for exemption
    if (customerProfile.exemptionReason) {
      return {
        taxCategory: "EXEMPT",
        taxRatePercent: 0,
        taxName: `${scheme.taxType} Exempt`,
        isReverseCharge: false,
        explanation: `Exemption: ${customerProfile.exemptionReason}`,
      };
    }
  }

  // Standard tax application
  return {
    taxCategory: itemTaxCategory,
    taxRatePercent: applicableRate.ratePercent,
    taxName: applicableRate.name,
    isReverseCharge: false,
    explanation: `Standard ${applicableRate.name} rate`,
  };
}

/**
 * Find the applicable tax rate for a category
 */
function findApplicableRate(scheme: TaxScheme, category: TaxCategory): TaxRate {
  const now = new Date().toISOString();
  
  // Find rate matching category that's currently effective
  let rate = scheme.rates.find(
    r => r.taxCategory === category &&
         r.effectiveFrom <= now &&
         (!r.effectiveTo || r.effectiveTo > now)
  );

  // Fallback to default rate
  if (!rate) {
    rate = scheme.rates.find(r => r.isDefault);
  }

  // Ultimate fallback
  if (!rate) {
    return {
      id: "fallback",
      schemeId: scheme.id,
      name: `${scheme.taxType} Standard`,
      ratePercent: scheme.taxType === "GST" ? 10 : scheme.taxType === "VAT" ? 20 : 0,
      taxCategory: "STANDARD",
      effectiveFrom: "2000-01-01",
      isDefault: true,
    };
  }

  return rate;
}

/**
 * Check if transaction qualifies for EU reverse charge
 */
function isEUCrossBorderB2B(
  companyCountry: string,
  customer: CustomerTaxProfile
): boolean {
  return (
    customer.customerType === "BUSINESS" &&
    customer.taxIdValidated &&
    EU_COUNTRIES.includes(companyCountry) &&
    EU_COUNTRIES.includes(customer.billingAddress.countryCode) &&
    companyCountry !== customer.billingAddress.countryCode
  );
}

// ============================================
// TAX CALCULATION
// ============================================

/**
 * Calculate tax for a single line item
 * Applies discount first, then calculates tax on net amount
 * Rounds at line level for accuracy
 */
export function calculateLineItemTax(
  input: LineItemTaxInput,
  roundingPrecision: number = 2
): LineItemTaxResult {
  const baseCents = input.qty * input.unitPriceCents;
  
  // Calculate discount
  let discountCents = 0;
  if (input.discountType === "PERCENT" && input.discountValue > 0) {
    discountCents = Math.round(baseCents * (input.discountValue / 100));
  } else if (input.discountType === "AMOUNT" && input.discountValue > 0) {
    discountCents = input.discountValue;
  }
  
  const netCents = Math.max(0, baseCents - discountCents);
  
  // Calculate tax (0 for reverse charge)
  const effectiveRate = input.isReverseCharge ? 0 : input.taxRatePercent;
  const taxCents = Math.round(netCents * (effectiveRate / 100));
  
  const totalCents = netCents + taxCents;
  
  return {
    baseCents,
    discountCents,
    netCents,
    taxCents,
    totalCents,
    taxRateApplied: effectiveRate,
    isReverseCharge: input.isReverseCharge,
  };
}

/**
 * Calculate document totals with tax breakdown by rate
 */
export function calculateDocumentTaxSummary(
  lineItems: Array<{
    unitPriceCents: number;
    qty: number;
    discountType: "NONE" | "PERCENT" | "AMOUNT";
    discountValue: number;
    taxCategory: TaxCategory;
    taxRatePercent: number;
    taxName: string;
    isReverseCharge: boolean;
  }>,
  roundingPrecision: number = 2
): DocumentTaxSummary {
  let subtotalCents = 0;
  let totalDiscountCents = 0;
  let totalTaxCents = 0;
  
  // Group by tax rate for breakdown
  const taxGroups = new Map<string, TaxBreakdownItem>();
  
  for (const item of lineItems) {
    const result = calculateLineItemTax(item, roundingPrecision);
    
    subtotalCents += result.baseCents;
    totalDiscountCents += result.discountCents;
    totalTaxCents += result.taxCents;
    
    // Build breakdown key
    const key = `${item.taxName}-${item.taxRatePercent}-${item.isReverseCharge}`;
    
    if (taxGroups.has(key)) {
      const group = taxGroups.get(key)!;
      group.taxableCents += result.netCents;
      group.taxCents += result.taxCents;
    } else {
      taxGroups.set(key, {
        taxName: item.taxName,
        taxCategory: item.taxCategory,
        taxRatePercent: item.taxRatePercent,
        taxableCents: result.netCents,
        taxCents: result.taxCents,
        isReverseCharge: item.isReverseCharge,
      });
    }
  }
  
  const breakdown = Array.from(taxGroups.values());
  const uniqueRates = new Set(breakdown.map(b => b.taxRatePercent));
  
  return {
    subtotalCents,
    totalDiscountCents,
    totalTaxCents,
    totalCents: subtotalCents - totalDiscountCents + totalTaxCents,
    breakdown,
    hasReverseCharge: breakdown.some(b => b.isReverseCharge),
    hasMixedTaxRates: uniqueRates.size > 1,
  };
}

// ============================================
// HELPERS
// ============================================

/**
 * Get tax category label for display
 */
export function getTaxCategoryLabel(category: TaxCategory): string {
  return TAX_CATEGORY_LABELS[category] || category;
}

/**
 * Format tax rate for display
 */
export function formatTaxRate(ratePercent: number, isReverseCharge: boolean): string {
  if (isReverseCharge) {
    return "RC 0%";
  }
  return `${ratePercent}%`;
}

/**
 * Check if a tax category is taxable (has positive rate)
 */
export function isTaxableCategory(category: TaxCategory): boolean {
  return !["ZERO", "EXEMPT", "OUT_OF_SCOPE"].includes(category);
}

/**
 * Get default tax categories for UI dropdown
 */
export function getDefaultTaxCategories(): Array<{
  value: TaxCategory;
  label: string;
  description: string;
}> {
  return [
    { value: "STANDARD", label: "Standard Rate", description: "Standard tax rate applies" },
    { value: "REDUCED", label: "Reduced Rate", description: "Reduced tax rate applies" },
    { value: "ZERO", label: "Zero Rated", description: "0% tax for exports" },
    { value: "EXEMPT", label: "Exempt", description: "Tax exempt transaction" },
    { value: "OUT_OF_SCOPE", label: "Out of Scope", description: "Not subject to tax" },
  ];
}

/**
 * Create a default Australian GST tax scheme
 */
export function createDefaultGSTScheme(): TaxScheme {
  return {
    id: "gst_au_default",
    name: "Australian GST",
    taxType: "GST",
    countryCode: "AU",
    pricingModeDefault: "EXCLUSIVE",
    roundingMode: "PER_LINE",
    roundingPrecision: 2,
    reverseChargeSupported: false,
    exportZeroRatedSupported: true,
    withholdingTaxSupported: false,
    rates: [
      {
        id: "gst_standard",
        schemeId: "gst_au_default",
        name: "GST",
        ratePercent: 10,
        taxCategory: "STANDARD",
        effectiveFrom: "2000-07-01",
        isDefault: true,
      },
      {
        id: "gst_free",
        schemeId: "gst_au_default",
        name: "GST Free",
        ratePercent: 0,
        taxCategory: "ZERO",
        effectiveFrom: "2000-07-01",
        isDefault: false,
      },
    ],
    isActive: true,
  };
}
