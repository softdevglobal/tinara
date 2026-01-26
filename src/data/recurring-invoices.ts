import { LineItem } from "@/lib/invoice-schema";

export type RecurrenceFrequency = "weekly" | "monthly" | "quarterly";

export interface RecurringInvoice {
  id: string;
  clientName: string;
  clientEmail: string;
  projectName?: string;
  lineItems: LineItem[];
  taxRate: number;
  currency: string;
  frequency: RecurrenceFrequency;
  nextDueDate: string;
  daysBefore: number; // Generate invoice X days before due date
  isActive: boolean;
  createdAt: string;
  lastGeneratedAt?: string;
  notes?: string;
}

export const recurringInvoices: RecurringInvoice[] = [
  {
    id: "rec_001",
    clientName: "TECH SOLUTIONS INC",
    clientEmail: "billing@techsolutions.com",
    projectName: "Monthly IT Support",
    lineItems: [
      { id: "li_001", description: "IT Support Retainer", quantity: 1, unitPrice: 2500 },
      { id: "li_002", description: "Cloud Hosting", quantity: 1, unitPrice: 350 },
    ],
    taxRate: 10,
    currency: "AUD",
    frequency: "monthly",
    nextDueDate: "2026-02-15",
    daysBefore: 7,
    isActive: true,
    createdAt: "2026-01-01",
    lastGeneratedAt: "2026-01-08",
  },
  {
    id: "rec_002",
    clientName: "GLOBAL LOGISTICS",
    clientEmail: "accounts@globallogistics.com",
    projectName: "Quarterly Maintenance",
    lineItems: [
      { id: "li_003", description: "System Maintenance", quantity: 1, unitPrice: 5000 },
    ],
    taxRate: 10,
    currency: "AUD",
    frequency: "quarterly",
    nextDueDate: "2026-04-01",
    daysBefore: 14,
    isActive: true,
    createdAt: "2026-01-01",
  },
];

export function getFrequencyLabel(frequency: RecurrenceFrequency): string {
  switch (frequency) {
    case "weekly": return "Weekly";
    case "monthly": return "Monthly";
    case "quarterly": return "Quarterly";
  }
}

export function getNextRecurrenceDate(currentDate: string, frequency: RecurrenceFrequency): string {
  const date = new Date(currentDate);
  switch (frequency) {
    case "weekly":
      date.setDate(date.getDate() + 7);
      break;
    case "monthly":
      date.setMonth(date.getMonth() + 1);
      break;
    case "quarterly":
      date.setMonth(date.getMonth() + 3);
      break;
  }
  return date.toISOString().split("T")[0];
}
