import { DocumentLineItem } from "@/lib/line-item-schema";
import { 
  ClientSnapshot, 
  DocumentTaxContext, 
  DocumentAuditMeta, 
  DocumentAttachment,
  TaxBreakdownLine,
  InvoiceStatus,
} from "@/types/document";

/**
 * Payment method types for tracking how payments were received
 */
export type PaymentMethod = 
  | "cash" 
  | "card" 
  | "bank_transfer" 
  | "eftpos" 
  | "cheque" 
  | "other";

/**
 * Document totals - stored for performance, calculated from line items
 */
export interface DocumentTotals {
  subtotalCents: number;
  discountCents: number;
  taxCents: number;
  totalCents: number;
  paidCents?: number;
  balanceCents?: number;
  taxBreakdown?: TaxBreakdownLine[];
}

export interface Invoice {
  id: string;
  number: string;
  clientName: string;
  clientEmail?: string;
  projectName: string;
  date: string;
  dueDate: string;
  dueDaysOverdue: number;
  dueLabel: string;
  status: InvoiceStatus;
  currency: string;
  paidDate?: string;
  notes?: string;

  // Payment tracking
  paymentMethod?: PaymentMethod;
  paymentReference?: string;

  // Client snapshot (captured at issue time)
  clientSnapshot?: ClientSnapshot;
  
  // Tax context (captured at issue time)
  documentTaxContext?: DocumentTaxContext;

  // Line items as immutable snapshots
  lineItems: DocumentLineItem[];

  // Computed totals (stored for performance)
  totals: DocumentTotals;
  
  // Attachments
  attachments?: DocumentAttachment[];
  
  // Audit trail
  auditMeta?: DocumentAuditMeta;
  
  // References
  quoteId?: string;           // If converted from quote
  poNumber?: string;
  projectId?: string;
  tags?: string[];
  internalNotes?: string;
  paymentInstructions?: string;

  // DEPRECATED: Keep for backwards compat with legacy invoices
  total?: number;
}

export type InvoiceSortOption = "date-desc" | "date-asc" | "paid-desc" | "paid-asc" | "amount-desc" | "amount-asc";

/**
 * Helper to check if an invoice is a legacy record (no line items)
 */
export function isLegacyInvoice(invoice: Invoice): boolean {
  return !invoice.lineItems || invoice.lineItems.length === 0;
}

/**
 * Helper to get the display total (handles legacy invoices)
 */
export function getInvoiceTotal(invoice: Invoice): number {
  if (invoice.totals?.totalCents !== undefined) {
    return invoice.totals.totalCents / 100;
  }
  // Fallback for legacy invoices
  return invoice.total ?? 0;
}

/**
 * Helper to get the total in cents
 */
export function getInvoiceTotalCents(invoice: Invoice): number {
  if (invoice.totals?.totalCents !== undefined) {
    return invoice.totals.totalCents;
  }
  // Fallback for legacy invoices - convert dollars to cents
  return Math.round((invoice.total ?? 0) * 100);
}

// Legacy mock data - these represent old invoices without line items
export const invoices: Invoice[] = [
  {
    id: "inv_A53275081",
    number: "A53275081",
    clientName: "SECURITY CAMERAS PTY",
    projectName: "Office Installation",
    date: "2026-01-21",
    dueDate: "2026-01-21",
    dueDaysOverdue: 2,
    dueLabel: "2 days ago",
    status: "Overdue",
    total: 1505.9,
    currency: "AUD",
    lineItems: [],
    totals: { subtotalCents: 136900, discountCents: 0, taxCents: 13690, totalCents: 150590 },
  },
  {
    id: "inv_A53275082",
    number: "A53275082",
    clientName: "TECH SOLUTIONS INC",
    projectName: "Network Setup",
    date: "2026-01-18",
    dueDate: "2026-02-01",
    dueDaysOverdue: 0,
    dueLabel: "Due in 9 days",
    status: "Opened",
    total: 3250.0,
    currency: "AUD",
    lineItems: [],
    totals: { subtotalCents: 295455, discountCents: 0, taxCents: 29545, totalCents: 325000 },
  },
  {
    id: "inv_A53275083",
    number: "A53275083",
    clientName: "MELBOURNE RETAIL CO",
    projectName: "POS Integration",
    date: "2026-01-10",
    dueDate: "2026-01-17",
    paidDate: "2026-01-15",
    dueDaysOverdue: 0,
    dueLabel: "",
    status: "Paid",
    total: 890.5,
    currency: "AUD",
    lineItems: [],
    totals: { subtotalCents: 80955, discountCents: 0, taxCents: 8095, totalCents: 89050 },
  },
  {
    id: "inv_A53275084",
    number: "A53275084",
    clientName: "SUNRISE CAFE",
    projectName: "",
    date: "2026-01-15",
    dueDate: "2026-01-22",
    dueDaysOverdue: 1,
    dueLabel: "1 day ago",
    status: "Overdue",
    total: 450.0,
    currency: "AUD",
    lineItems: [],
    totals: { subtotalCents: 40909, discountCents: 0, taxCents: 4091, totalCents: 45000 },
  },
  {
    id: "inv_A53275085",
    number: "A53275085",
    clientName: "GLOBAL LOGISTICS",
    projectName: "Warehouse System",
    date: "2026-01-20",
    dueDate: "2026-02-05",
    dueDaysOverdue: 0,
    dueLabel: "Due in 13 days",
    status: "Opened",
    total: 7800.0,
    currency: "AUD",
    lineItems: [],
    totals: { subtotalCents: 709091, discountCents: 0, taxCents: 70909, totalCents: 780000 },
  },
  {
    id: "inv_A53275086",
    number: "A53275086",
    clientName: "DESIGN STUDIO AU",
    projectName: "Website Redesign",
    date: "2026-01-05",
    dueDate: "2026-01-12",
    paidDate: "2026-01-11",
    dueDaysOverdue: 0,
    dueLabel: "",
    status: "Paid",
    total: 2100.0,
    currency: "AUD",
    lineItems: [],
    totals: { subtotalCents: 190909, discountCents: 0, taxCents: 19091, totalCents: 210000 },
  },
];
