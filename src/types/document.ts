import { DocumentLineItem } from "@/lib/line-item-schema";
import { DocumentTotals } from "@/data/invoices";

/**
 * Document type - invoice or quote
 */
export type DocumentType = "invoice" | "quote";

/**
 * Document status types
 */
export type InvoiceStatus = "Draft" | "Opened" | "Sent" | "Paid" | "Overdue" | "Void";
export type QuoteStatus = "Draft" | "Unsent" | "Sent" | "Opened" | "Approved" | "Accepted" | "Declined" | "Expired" | "Converted";

/**
 * Payment terms options
 */
export type PaymentTerms = "same_day" | "7_days" | "14_days" | "30_days" | "60_days" | "custom";

export const PAYMENT_TERMS_LABELS: Record<PaymentTerms, string> = {
  same_day: "Same day",
  "7_days": "7 days",
  "14_days": "14 days",
  "30_days": "30 days",
  "60_days": "60 days",
  custom: "Custom",
};

export const PAYMENT_TERMS_DAYS: Record<Exclude<PaymentTerms, "custom">, number> = {
  same_day: 0,
  "7_days": 7,
  "14_days": 14,
  "30_days": 30,
  "60_days": 60,
};

/**
 * Client snapshot - captured at document creation time
 * Changes to the client record won't affect issued documents
 */
export interface ClientSnapshot {
  id: string;
  name: string;
  company?: string;
  email: string;
  phone?: string;
  billingAddress?: {
    street?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country: string;
  };
  customerType?: "business" | "individual";
  taxId?: string;
  taxIdValidated?: boolean;
}

/**
 * Deposit request for quotes/invoices
 */
export interface DepositRequest {
  type: "percent" | "fixed";
  value: number;
  dueDate: string;
  amountPaid: number;
  description?: string;
}

/**
 * Attachment for documents
 */
export interface DocumentAttachment {
  id: string;
  filename: string;
  size: number;
  contentType: string;
  uploadedBy: string;
  uploadedAt: string;
  clientVisible: boolean;
  url?: string;
}

/**
 * Document creation form data
 * This is the data structure used in the form before saving
 */
export interface DocumentFormData {
  type: DocumentType;
  
  // Client
  clientId: string;
  clientSnapshot?: ClientSnapshot;
  
  // Document details
  number?: string; // Only assigned on first save/send
  date: Date;
  dueDate?: Date; // For invoices
  validUntil?: Date; // For quotes
  paymentTerms: PaymentTerms;
  currency: string;
  
  // References
  projectId?: string;
  poNumber?: string;
  assignedTo?: string;
  tags?: string[];
  
  // Line items
  lineItems: DocumentLineItem[];
  
  // Deposit
  depositRequest?: DepositRequest;
  
  // Notes
  internalNotes?: string;
  clientNotes?: string;
  paymentInstructions?: string;
  
  // Attachments
  attachments?: DocumentAttachment[];
}

/**
 * Email send data
 */
export interface EmailSendData {
  to: string;
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  attachPdf: boolean;
  includePaymentLink: boolean;
}

/**
 * Document creation tabs
 */
export type DocumentCreationTab = "create" | "preview" | "send";

/**
 * Calculate due date from issue date and payment terms
 */
export function calculateDueDate(issueDate: Date, terms: PaymentTerms, customDays?: number): Date {
  const days = terms === "custom" 
    ? (customDays ?? 14) 
    : PAYMENT_TERMS_DAYS[terms];
  
  const dueDate = new Date(issueDate);
  dueDate.setDate(dueDate.getDate() + days);
  return dueDate;
}

/**
 * Calculate valid until date for quotes (default 30 days)
 */
export function calculateValidUntil(issueDate: Date, days: number = 30): Date {
  const validUntil = new Date(issueDate);
  validUntil.setDate(validUntil.getDate() + days);
  return validUntil;
}
