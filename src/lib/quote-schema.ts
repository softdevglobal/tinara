import { z } from "zod";

export const quoteLineItemSchema = z.object({
  id: z.string(),
  description: z.string().min(1, "Description is required").max(200),
  quantity: z.number().min(1, "Quantity must be at least 1").max(9999),
  unitPrice: z.number().min(0, "Price must be positive").max(999999),
});

export const quoteFormSchema = z.object({
  clientName: z.string().min(1, "Client name is required").max(100),
  clientEmail: z.string().email("Invalid email address").max(255),
  projectName: z.string().max(100).optional(),
  issueDate: z.date({ required_error: "Issue date is required" }),
  validUntil: z.date({ required_error: "Valid until date is required" }),
  lineItems: z.array(quoteLineItemSchema).min(1, "At least one line item is required"),
  taxRate: z.number().min(0).max(100),
  notes: z.string().max(500).optional(),
});

export type QuoteLineItem = z.infer<typeof quoteLineItemSchema>;
export type QuoteFormData = z.infer<typeof quoteFormSchema>;
