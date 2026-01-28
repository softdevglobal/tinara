/**
 * Document Types and Interfaces
 * 
 * Core types for invoice and quote creation workflow
 */

import { DocumentLineItem } from "@/lib/line-item-schema";
import { 
  TaxCategory, 
  CustomerType, 
  PricingMode, 
  RoundingMode,
  TaxType,
} from "@/types/tax-settings";

// ============================================
// DOCUMENT ENUMS
// ============================================

export type DocumentType = "invoice" | "quote";
export type DocumentCreationTab = "create" | "preview" | "send";

export type InvoiceStatus = "Draft" | "Sent" | "Opened" | "Paid" | "Overdue" | "Void" | "Cancelled";
export type QuoteStatus = "Draft" | "Sent" | "Opened" | "Accepted" | "Declined" | "Expired" | "Converted" | "Unsent" | "Approved";

export type PaymentTerms = "due_on_receipt" | "same_day" | "7_days" | "14_days" | "30_days" | "60_days" | "custom";

export const PAYMENT_TERMS_LABELS: Record<PaymentTerms, string> = {
  due_on_receipt: "Due on Receipt",
  same_day: "Same day",
  "7_days": "Net 7",
  "14_days": "Net 14",
  "30_days": "Net 30",
  "60_days": "Net 60",
  custom: "Custom",
};

export const PAYMENT_TERMS_DAYS: Record<Exclude<PaymentTerms, "custom">, number> = {
  due_on_receipt: 0,
  same_day: 0,
  "7_days": 7,
  "14_days": 14,
  "30_days": 30,
  "60_days": 60,
};

// ============================================
// CLIENT SNAPSHOT
// ============================================

export interface ClientSnapshot {
  id: string;
  name: string;
  company?: string;
  email: string;
  phone?: string;
  mobile?: string;
  
  // Customer type for tax purposes
  customerType?: CustomerType;
  
  // Address at time of document creation
  billingAddress?: {
    street?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
    countryCode?: string;
  };
  
  shippingAddress?: {
    street?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
    countryCode?: string;
  };
  
  // Tax ID captured at document creation
  taxId?: string;
  taxIdValidated?: boolean;
}

// ============================================
// TAX CONTEXT SNAPSHOTS
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
// DEPOSIT REQUEST
// ============================================

export interface DepositRequest {
  type: "percent" | "fixed";
  value: number;
  dueDate: string;
  amountPaid: number;
  description?: string;
  paymentMethods?: {
    stripe: boolean;
    paypal: boolean;
    bankTransfer: boolean;
  };
}

// ============================================
// ATTACHMENTS
// ============================================

export interface DocumentAttachment {
  id: string;
  filename: string;
  contentType: string;
  size: number;
  sizeBytes?: number;
  url?: string;
  uploadedBy: string;
  uploadedAt: string;
  isVisibleToClient?: boolean;
  clientVisible?: boolean;
}

// ============================================
// AUDIT METADATA
// ============================================

export interface DocumentAuditMeta {
  createdBy: string;
  createdAt: string;
  updatedBy?: string;
  updatedAt?: string;
  issuedBy?: string;
  issuedAt?: string;
  sentBy?: string;
  sentAt?: string;
  voidedBy?: string;
  voidedAt?: string;
  voidReason?: string;
}

// ============================================
// DOCUMENT TOTALS
// ============================================

export interface DocumentTotals {
  subtotalCents: number;
  discountCents: number;
  taxCents: number;
  totalCents: number;
  paidCents?: number;
  balanceCents?: number;
  depositRequestedCents?: number;
  depositPaidCents?: number;
}

export interface TaxBreakdownLine {
  taxName: string;
  taxCategory: TaxCategory;
  taxRatePercent: number;
  taxableCents: number;
  taxCents: number;
  isReverseCharge: boolean;
}

// ============================================
// DOCUMENT FORM DATA
// ============================================

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

// ============================================
// EMAIL SEND DATA
// ============================================

export interface EmailSendData {
  to: string;
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  attachPdf: boolean;
  includePaymentLink: boolean;
}

// ============================================
// HELPERS
// ============================================

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
 * Calculate quote valid until date (default 30 days)
 */
export function calculateValidUntil(issueDate: Date, daysValid: number = 30): Date {
  const valid = new Date(issueDate);
  valid.setDate(valid.getDate() + daysValid);
  return valid;
}

/**
 * Get payment terms label
 */
export function getPaymentTermsLabel(terms: PaymentTerms): string {
  return PAYMENT_TERMS_LABELS[terms] || terms;
}

/**
 * Format days label for due/overdue display
 */
export function formatDaysLabel(dueDate: Date): { days: number; label: string; isOverdue: boolean } {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  
  const diffTime = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return { days: 0, label: "Due today", isOverdue: false };
  } else if (diffDays > 0) {
    return { days: diffDays, label: `Due in ${diffDays} day${diffDays === 1 ? "" : "s"}`, isOverdue: false };
  } else {
    const overdueDays = Math.abs(diffDays);
    return { days: overdueDays, label: `${overdueDays} day${overdueDays === 1 ? "" : "s"} overdue`, isOverdue: true };
  }
}

/**
 * Check if document can be edited based on status
 */
export function canEditDocument(status: InvoiceStatus | QuoteStatus, hasPaidAmount: boolean): {
  canEdit: boolean;
  requiresWarning: boolean;
  message?: string;
} {
  // Voided documents cannot be edited
  if (status === "Void" || status === "Cancelled") {
    return {
      canEdit: false,
      requiresWarning: false,
      message: "Voided documents cannot be edited",
    };
  }
  
  // Paid invoices require credit note workflow
  if (status === "Paid" || hasPaidAmount) {
    return {
      canEdit: false,
      requiresWarning: false,
      message: "Documents with payments require credit note for changes",
    };
  }
  
  // Drafts can always be edited
  if (status === "Draft" || status === "Unsent") {
    return {
      canEdit: true,
      requiresWarning: false,
    };
  }
  
  // Sent/Issued documents can be edited with warning
  return {
    canEdit: true,
    requiresWarning: true,
    message: "This document has been sent. Changes will create a revision.",
  };
}
