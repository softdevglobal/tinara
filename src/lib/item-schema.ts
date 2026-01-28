import { z } from "zod";

/**
 * Validation schema for Item form
 */
export const itemFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
  category: z.enum(["Parts", "Labor", "Services", "Other"], {
    required_error: "Category is required",
  }),
  unitPriceCents: z.number().int().min(0, "Price must be 0 or greater").max(99999999, "Price too high"),
  unit: z.string().min(1, "Unit is required").max(50),
  taxCode: z.enum(["GST", "GST_FREE", "NONE"], {
    required_error: "Tax code is required",
  }),
  defaultQty: z.number().min(1, "Default quantity must be at least 1").max(9999).default(1),
  sku: z.string().max(50, "SKU must be less than 50 characters").optional(),
});

export type ItemFormData = z.infer<typeof itemFormSchema>;

/**
 * Common unit options for the unit dropdown
 */
export const UNIT_OPTIONS = [
  { value: "hour", label: "Hour" },
  { value: "unit", label: "Unit" },
  { value: "meter", label: "Meter" },
  { value: "month", label: "Month" },
  { value: "call", label: "Call" },
  { value: "session", label: "Session" },
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "kg", label: "Kilogram" },
  { value: "each", label: "Each" },
] as const;

/**
 * Category options for the category dropdown
 */
export const CATEGORY_OPTIONS = [
  { value: "Parts", label: "Parts" },
  { value: "Labor", label: "Labor" },
  { value: "Services", label: "Services" },
  { value: "Other", label: "Other" },
] as const;
