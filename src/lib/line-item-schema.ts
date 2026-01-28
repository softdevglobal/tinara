import { z } from "zod";
import { TaxCode } from "./tax-utils";

/**
 * Discount types for line items
 */
export type DiscountType = "NONE" | "PERCENT" | "AMOUNT";

/**
 * DocumentLineItem represents an immutable snapshot of an item
 * as it was added to an invoice or quote.
 * 
 * Key principle: Changes to the Item catalogue do NOT affect
 * existing line items in documents. This preserves pricing integrity.
 */
export interface DocumentLineItem {
  id: string;
  documentId: string;
  sourceItemId?: string;              // Link back to catalogue item (nullable for manual entries)
  nameSnapshot: string;
  descriptionSnapshot?: string;
  unitSnapshot: string;
  unitPriceCentsSnapshot: number;     // Price in cents at time of creation
  qty: number;
  discountType: DiscountType;
  discountValue: number;              // Percent (0-100) or cents depending on type
  taxCodeSnapshot: TaxCode;
  sortOrder: number;
}

/**
 * Zod schema for DocumentLineItem validation
 */
export const documentLineItemSchema = z.object({
  id: z.string(),
  documentId: z.string(),
  sourceItemId: z.string().optional(),
  nameSnapshot: z.string().min(1, "Description is required").max(200),
  descriptionSnapshot: z.string().max(500).optional(),
  unitSnapshot: z.string().min(1).max(50),
  unitPriceCentsSnapshot: z.number().int().min(0).max(99999999),
  qty: z.number().min(0.01, "Quantity must be greater than 0").max(99999),
  discountType: z.enum(["NONE", "PERCENT", "AMOUNT"]),
  discountValue: z.number().min(0),
  taxCodeSnapshot: z.enum(["GST", "GST_FREE", "NONE"]),
  sortOrder: z.number().int().min(0),
});

/**
 * Simple LineItem for backwards compatibility
 * Used in legacy forms that haven't migrated to DocumentLineItem
 */
export interface SimpleLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;  // In dollars (not cents) for backwards compat
  taxCode?: TaxCode;
  discountType?: DiscountType;
  discountValue?: number;
}

/**
 * Convert a SimpleLineItem to DocumentLineItem format
 */
export function simpleToDocumentLineItem(
  simple: SimpleLineItem,
  documentId: string,
  sortOrder: number
): DocumentLineItem {
  return {
    id: simple.id,
    documentId,
    nameSnapshot: simple.description,
    unitSnapshot: "unit",
    unitPriceCentsSnapshot: Math.round(simple.unitPrice * 100),
    qty: simple.quantity,
    discountType: simple.discountType || "NONE",
    discountValue: simple.discountValue || 0,
    taxCodeSnapshot: simple.taxCode || "GST",
    sortOrder,
  };
}
