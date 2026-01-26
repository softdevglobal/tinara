export interface Quote {
  id: string;
  number: string;
  clientName: string;
  projectName: string;
  date: string;
  validUntil: string;
  validDaysRemaining: number;
  validLabel: string;
  status: "Draft" | "Sent" | "Accepted" | "Expired" | "Converted";
  total: number;
  currency: string;
  acceptedDate?: string;
}

export type QuoteSortOption = "date-desc" | "date-asc" | "accepted-desc" | "accepted-asc" | "amount-desc" | "amount-asc";

export const quotes: Quote[] = [
  {
    id: "quote_Q12345001",
    number: "Q12345001",
    clientName: "SECURITY CAMERAS PTY",
    projectName: "New Camera System",
    date: "2026-01-20",
    validUntil: "2026-02-20",
    validDaysRemaining: 25,
    validLabel: "Valid for 25 days",
    status: "Sent",
    total: 4500.0,
    currency: "AUD"
  },
  {
    id: "quote_Q12345002",
    number: "Q12345002",
    clientName: "TECH SOLUTIONS INC",
    projectName: "Server Upgrade",
    date: "2026-01-15",
    validUntil: "2026-02-15",
    validDaysRemaining: 20,
    validLabel: "Valid for 20 days",
    status: "Draft",
    total: 8750.0,
    currency: "AUD"
  },
  {
    id: "quote_Q12345003",
    number: "Q12345003",
    clientName: "MELBOURNE RETAIL CO",
    projectName: "Inventory System",
    date: "2026-01-10",
    validUntil: "2026-01-25",
    validDaysRemaining: 0,
    validLabel: "",
    status: "Accepted",
    acceptedDate: "2026-01-18",
    total: 3200.0,
    currency: "AUD"
  },
];
