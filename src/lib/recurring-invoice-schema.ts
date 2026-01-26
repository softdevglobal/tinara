import { z } from "zod";
import { lineItemSchema } from "./invoice-schema";

export const recurringInvoiceFormSchema = z.object({
  clientName: z.string().min(1, "Client name is required").max(100),
  clientEmail: z.string().email("Invalid email address").max(255),
  projectName: z.string().max(100).optional(),
  lineItems: z.array(lineItemSchema).min(1, "At least one line item is required"),
  taxRate: z.number().min(0).max(100),
  frequency: z.enum(["weekly", "monthly", "quarterly"]),
  startDate: z.date({ required_error: "Start date is required" }),
  daysBefore: z.number().min(0).max(30),
  notes: z.string().max(500).optional(),
});

export type RecurringInvoiceFormData = z.infer<typeof recurringInvoiceFormSchema>;
