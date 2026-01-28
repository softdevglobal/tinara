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
  total: number;
  currency: string;
  acceptedDate?: string;
  projectId?: string;
  depositRequest?: QuoteDepositRequest;
  comments?: string;
}

export type QuoteSortOption = "date-desc" | "date-asc" | "accepted-desc" | "accepted-asc" | "amount-desc" | "amount-asc";

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
    currency: "AUD"
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
    currency: "AUD"
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
    currency: "AUD"
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
    currency: "AUD"
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
    currency: "AUD"
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
    currency: "AUD"
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
    currency: "AUD"
  },
];
