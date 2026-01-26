import { Invoice } from "@/data/invoices";
import { Client } from "@/data/clients";
import { Quote } from "@/data/quotes";

function escapeCSV(value: string | number | undefined): string {
  if (value === undefined || value === null) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

export function exportInvoicesToCSV(invoices: Invoice[]) {
  const headers = [
    "Invoice Number",
    "Client Name",
    "Project Name",
    "Issue Date",
    "Due Date",
    "Status",
    "Total",
    "Currency",
  ];

  const rows = invoices.map((inv) => [
    escapeCSV(inv.number),
    escapeCSV(inv.clientName),
    escapeCSV(inv.projectName),
    escapeCSV(inv.date),
    escapeCSV(inv.dueDate),
    escapeCSV(inv.status),
    escapeCSV(inv.total.toFixed(2)),
    escapeCSV(inv.currency),
  ]);

  const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
  const date = new Date().toISOString().split("T")[0];
  downloadCSV(csv, `invoices-export-${date}.csv`);
}

export function exportClientsToCSV(clients: Client[]) {
  const headers = [
    "Client Name",
    "Email",
    "Company",
    "Phone",
  ];

  const rows = clients.map((client) => [
    escapeCSV(client.name),
    escapeCSV(client.email),
    escapeCSV(client.company),
    escapeCSV(client.phone),
  ]);

  const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
  const date = new Date().toISOString().split("T")[0];
  downloadCSV(csv, `clients-export-${date}.csv`);
}

export function exportQuotesToCSV(quotes: Quote[]) {
  const headers = [
    "Quote Number",
    "Client Name",
    "Project Name",
    "Issue Date",
    "Valid Until",
    "Status",
    "Total",
    "Currency",
  ];

  const rows = quotes.map((quote) => [
    escapeCSV(quote.number),
    escapeCSV(quote.clientName),
    escapeCSV(quote.projectName),
    escapeCSV(quote.date),
    escapeCSV(quote.validUntil),
    escapeCSV(quote.status),
    escapeCSV(quote.total.toFixed(2)),
    escapeCSV(quote.currency),
  ]);

  const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
  const date = new Date().toISOString().split("T")[0];
  downloadCSV(csv, `quotes-export-${date}.csv`);
}
