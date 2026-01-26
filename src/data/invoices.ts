export interface Invoice {
  id: string;
  number: string;
  clientName: string;
  projectName: string;
  date: string;
  dueDate: string;
  dueDaysOverdue: number;
  dueLabel: string;
  status: "Opened" | "Paid" | "Overdue";
  total: number;
  currency: string;
  paidDate?: string;
}

export type InvoiceSortOption = "date-desc" | "date-asc" | "paid-desc" | "paid-asc" | "amount-desc" | "amount-asc";

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
    currency: "AUD"
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
    currency: "AUD"
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
    currency: "AUD"
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
    currency: "AUD"
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
    currency: "AUD"
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
    currency: "AUD"
  },
];
