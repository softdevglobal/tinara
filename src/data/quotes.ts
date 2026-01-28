import { DocumentLineItem } from "@/lib/line-item-schema";
import { DocumentTotals } from "./invoices";

export interface QuoteDepositRequest {
  type: "percent" | "fixed";
  value: number;
  dueDate: string;
  amountPaid: number;
}

export interface Quote {
  id: string;
  number: string;
  clientName: string;
  projectName: string;
  date: string;
  validUntil: string;
  validDaysRemaining: number;
  validLabel: string;
  status: "Draft" | "Sent" | "Accepted" | "Expired" | "Converted" | "Unsent" | "Opened" | "Approved";
  currency: string;
  acceptedDate?: string;
  projectId?: string;
  depositRequest?: QuoteDepositRequest;
  comments?: string;

  // Line items as immutable snapshots
  lineItems: DocumentLineItem[];

  // Computed totals (stored for performance)
  totals: DocumentTotals;

  // DEPRECATED: Keep for backwards compat with legacy quotes
  total?: number;
}

export type QuoteSortOption = "date-desc" | "date-asc" | "accepted-desc" | "accepted-asc" | "amount-desc" | "amount-asc";

/**
 * Helper to check if a quote is a legacy record (no line items)
 */
export function isLegacyQuote(quote: Quote): boolean {
  return !quote.lineItems || quote.lineItems.length === 0;
}

/**
 * Helper to get the display total (handles legacy quotes)
 */
export function getQuoteTotal(quote: Quote): number {
  if (quote.totals?.totalCents !== undefined) {
    return quote.totals.totalCents / 100;
  }
  // Fallback for legacy quotes
  return quote.total ?? 0;
}

/**
 * Helper to get the total in cents
 */
export function getQuoteTotalCents(quote: Quote): number {
  if (quote.totals?.totalCents !== undefined) {
    return quote.totals.totalCents;
  }
  // Fallback for legacy quotes - convert dollars to cents
  return Math.round((quote.total ?? 0) * 100);
}

// Legacy mock data - these represent old quotes without line items
export const quotes: Quote[] = [
  {
    id: "quote_E79882059",
    number: "E79882059",
    clientName: "Mango People",
    projectName: "",
    date: "2026-01-20",
    validUntil: "2026-02-20",
    validDaysRemaining: 25,
    validLabel: "Valid for 25 days",
    status: "Opened",
    total: 992.20,
    currency: "AUD",
    lineItems: [],
    totals: { subtotalCents: 90200, discountCents: 0, taxCents: 9020, totalCents: 99220 },
  },
  {
    id: "quote_E79882057",
    number: "E79882057",
    clientName: "Sparking Energy",
    projectName: "",
    date: "2026-01-19",
    validUntil: "2026-02-19",
    validDaysRemaining: 24,
    validLabel: "Valid for 24 days",
    status: "Opened",
    total: 1802.90,
    currency: "AUD",
    lineItems: [],
    totals: { subtotalCents: 163900, discountCents: 0, taxCents: 16390, totalCents: 180290 },
  },
  {
    id: "quote_E79882056",
    number: "E79882056",
    clientName: "SafeSpark Electrical",
    projectName: "",
    date: "2026-01-17",
    validUntil: "2026-02-17",
    validDaysRemaining: 22,
    validLabel: "",
    status: "Unsent",
    total: 5109.50,
    currency: "AUD",
    lineItems: [],
    totals: { subtotalCents: 464500, discountCents: 0, taxCents: 46450, totalCents: 510950 },
  },
  {
    id: "quote_E79882055",
    number: "E79882055",
    clientName: "SafeSpark Electrical",
    projectName: "",
    date: "2026-01-17",
    validUntil: "2026-02-17",
    validDaysRemaining: 22,
    validLabel: "",
    status: "Unsent",
    total: 3996.30,
    currency: "AUD",
    lineItems: [],
    totals: { subtotalCents: 363300, discountCents: 0, taxCents: 36330, totalCents: 399630 },
  },
  {
    id: "quote_E79882054",
    number: "E79882054",
    clientName: "Mr Raj Singh",
    projectName: "",
    date: "2026-01-16",
    validUntil: "2026-02-16",
    validDaysRemaining: 21,
    validLabel: "",
    status: "Sent",
    total: 3261.00,
    currency: "AUD",
    lineItems: [],
    totals: { subtotalCents: 296455, discountCents: 0, taxCents: 29645, totalCents: 326100 },
  },
  {
    id: "quote_E79882061",
    number: "E79882061",
    clientName: "Levtech Electrical",
    projectName: "",
    date: "2026-01-27",
    validUntil: "2026-02-27",
    validDaysRemaining: 0,
    validLabel: "",
    status: "Approved",
    acceptedDate: "2026-01-28",
    total: 2293.50,
    currency: "AUD",
    lineItems: [],
    totals: { subtotalCents: 208500, discountCents: 0, taxCents: 20850, totalCents: 229350 },
  },
  {
    id: "quote_E79882058",
    number: "E79882058",
    clientName: "Sparking Energy",
    projectName: "",
    date: "2026-01-19",
    validUntil: "2026-02-19",
    validDaysRemaining: 0,
    validLabel: "",
    status: "Approved",
    acceptedDate: "2026-01-20",
    total: 1279.30,
    currency: "AUD",
    lineItems: [],
    totals: { subtotalCents: 116300, discountCents: 0, taxCents: 11630, totalCents: 127930 },
  },
];
