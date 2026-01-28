import { DocumentLineItem } from "./line-item-schema";

/**
 * Tax code rates for Australian GST system
 */
export type TaxCode = "GST" | "GST_FREE" | "NONE";

export const TAX_RATES: Record<TaxCode, number> = {
  GST: 0.10,      // 10%
  GST_FREE: 0,
  NONE: 0,
};

export const TAX_CODE_LABELS: Record<TaxCode, string> = {
  GST: "GST (10%)",
  GST_FREE: "GST Free",
  NONE: "No Tax",
};

export interface LineItemCalculation {
  baseCents: number;
  discountCents: number;
  netCents: number;
  taxCents: number;
  totalCents: number;
}

/**
 * Calculate all values for a single line item
 * Applies discount first, then calculates tax on the net amount
 * Rounds at the line level to ensure consistent totals
 */
export function calculateLineItem(line: DocumentLineItem): LineItemCalculation {
  const baseCents = line.qty * line.unitPriceCentsSnapshot;
  
  let discountCents = 0;
  if (line.discountType === "PERCENT" && line.discountValue > 0) {
    discountCents = Math.round(baseCents * (line.discountValue / 100));
  } else if (line.discountType === "AMOUNT" && line.discountValue > 0) {
    discountCents = line.discountValue;
  }
  
  const netCents = Math.max(0, baseCents - discountCents);
  const taxRate = TAX_RATES[line.taxCodeSnapshot];
  const taxCents = Math.round(netCents * taxRate);
  const totalCents = netCents + taxCents;
  
  return { baseCents, discountCents, netCents, taxCents, totalCents };
}

/**
 * Calculate document totals from an array of line items
 */
export function calculateDocumentTotals(lineItems: DocumentLineItem[]): {
  subtotalCents: number;
  discountCents: number;
  taxCents: number;
  totalCents: number;
  taxBreakdown: Record<TaxCode, number>;
} {
  let subtotalCents = 0;
  let discountCents = 0;
  let taxCents = 0;
  const taxBreakdown: Record<TaxCode, number> = {
    GST: 0,
    GST_FREE: 0,
    NONE: 0,
  };

  for (const line of lineItems) {
    const calc = calculateLineItem(line);
    subtotalCents += calc.baseCents;
    discountCents += calc.discountCents;
    taxCents += calc.taxCents;
    taxBreakdown[line.taxCodeSnapshot] += calc.taxCents;
  }

  const totalCents = subtotalCents - discountCents + taxCents;

  return {
    subtotalCents,
    discountCents,
    taxCents,
    totalCents,
    taxBreakdown,
  };
}

/**
 * Calculate tax for a simple line (for backwards compatibility)
 * Used when we don't have a full DocumentLineItem
 */
export function calculateSimpleTax(
  netCents: number,
  taxCode: TaxCode
): number {
  const taxRate = TAX_RATES[taxCode];
  return Math.round(netCents * taxRate);
}
