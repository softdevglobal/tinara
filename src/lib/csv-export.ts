import { Invoice, getInvoiceTotal } from "@/data/invoices";
import { Client } from "@/data/clients";
import { Quote, getQuoteTotal } from "@/data/quotes";
import { DocumentLineItem } from "@/lib/line-item-schema";
import { centsToInputValue } from "./money-utils";

function escapeCSV(value: string | number | undefined | null): string {
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

/**
 * Format tax breakdown for CSV export
 */
function formatTaxBreakdown(taxBreakdown: { taxName: string; taxRatePercent: number; taxCents: number }[] | undefined, taxCents: number): string {
  if (!taxBreakdown || taxBreakdown.length === 0) {
    // Fallback: show total tax
    return `Tax: ${centsToInputValue(taxCents)}`;
  }
  return taxBreakdown
    .map((tb) => `${tb.taxName} ${tb.taxRatePercent}%: ${centsToInputValue(tb.taxCents)}`)
    .join("; ");
}

/**
 * Format line items for CSV export (semicolon separated for readability)
 */
function formatLineItems(lineItems: DocumentLineItem[]): string {
  if (!lineItems || lineItems.length === 0) return "(legacy - no line items)";
  
  return lineItems
    .map((li) => {
      const name = li.nameSnapshot || "Item";
      const qty = li.qty;
      const price = centsToInputValue(li.unitPriceCentsSnapshot);
      return `${name} x${qty} @ ${price}`;
    })
    .join("; ");
}

/**
 * Export invoices with full snapshot data for accounting compliance
 * Includes: line items, tax breakdown, currency, status timestamps
 */
export function exportInvoicesToCSV(invoices: Invoice[]) {
  const headers = [
    "Invoice Number",
    "Client Name",
    "Client Email",
    "Project Name",
    "Issue Date",
    "Due Date",
    "Status",
    "Currency",
    // Snapshot totals (stored values, not recalculated)
    "Subtotal",
    "Discount",
    "Tax",
    "Total",
    "Paid Amount",
    "Balance",
    // Tax breakdown
    "Tax Breakdown",
    // Line items summary
    "Line Items",
    "Line Items Count",
    // Status timestamps
    "Paid Date",
    "Payment Method",
    "Payment Reference",
    // Audit timestamps
    "Created At",
    "Updated At",
    "Sent At",
    // References
    "PO Number",
    "Source Quote ID",
    "Notes",
  ];

  const rows = invoices.map((inv) => [
    escapeCSV(inv.number),
    escapeCSV(inv.clientName),
    escapeCSV(inv.clientEmail || inv.clientSnapshot?.email),
    escapeCSV(inv.projectName),
    escapeCSV(inv.date),
    escapeCSV(inv.dueDate),
    escapeCSV(inv.status),
    escapeCSV(inv.currency),
    // Use stored snapshot values (cents converted to dollars)
    escapeCSV(centsToInputValue(inv.totals.subtotalCents)),
    escapeCSV(centsToInputValue(inv.totals.discountCents)),
    escapeCSV(centsToInputValue(inv.totals.taxCents)),
    escapeCSV(centsToInputValue(inv.totals.totalCents)),
    escapeCSV(inv.totals.paidCents !== undefined ? centsToInputValue(inv.totals.paidCents) : ""),
    escapeCSV(inv.totals.balanceCents !== undefined ? centsToInputValue(inv.totals.balanceCents) : ""),
    // Tax breakdown from snapshot
    escapeCSV(formatTaxBreakdown(inv.totals.taxBreakdown, inv.totals.taxCents)),
    // Line items from snapshot
    escapeCSV(formatLineItems(inv.lineItems)),
    escapeCSV(inv.lineItems?.length || 0),
    // Status timestamps
    escapeCSV(inv.paidDate),
    escapeCSV(inv.paymentMethod),
    escapeCSV(inv.paymentReference),
    // Audit timestamps
    escapeCSV(inv.auditMeta?.createdAt),
    escapeCSV(inv.auditMeta?.updatedAt),
    escapeCSV(inv.auditMeta?.sentAt),
    // References
    escapeCSV(inv.poNumber),
    escapeCSV(inv.quoteId),
    escapeCSV(inv.notes),
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
    "Mobile",
    "Website",
    "Customer Type",
    "Tax Number",
    "Tax ID Validated",
    "Tax Treatment",
    "Country",
    "State",
    "City",
    "Postal Code",
    "Street",
    "Payment Terms",
    "Notes",
    "Created At",
  ];

  const rows = clients.map((client) => [
    escapeCSV(client.name),
    escapeCSV(client.email),
    escapeCSV(client.company),
    escapeCSV(client.phone),
    escapeCSV(client.mobile),
    escapeCSV(client.website),
    escapeCSV(client.customerType),
    escapeCSV(client.taxNumber),
    escapeCSV(client.taxIdValidated ? "Yes" : ""),
    escapeCSV(client.taxTreatment),
    escapeCSV(client.billingAddress?.country),
    escapeCSV(client.billingAddress?.state),
    escapeCSV(client.billingAddress?.city),
    escapeCSV(client.billingAddress?.postalCode),
    escapeCSV(client.billingAddress?.street),
    escapeCSV(client.paymentTerms),
    escapeCSV(client.notes),
    escapeCSV(client.createdAt),
  ]);

  const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
  const date = new Date().toISOString().split("T")[0];
  downloadCSV(csv, `clients-export-${date}.csv`);
}

/**
 * Export quotes with full snapshot data for accounting compliance
 * Includes: line items, tax breakdown, currency, status timestamps
 */
export function exportQuotesToCSV(quotes: Quote[]) {
  const headers = [
    "Quote Number",
    "Client Name",
    "Project Name",
    "Issue Date",
    "Valid Until",
    "Status",
    "Currency",
    // Snapshot totals (stored values, not recalculated)
    "Subtotal",
    "Discount",
    "Tax",
    "Total",
    // Tax breakdown
    "Tax Breakdown",
    // Line items summary
    "Line Items",
    "Line Items Count",
    // Status timestamps
    "Accepted Date",
    // Audit timestamps
    "Created At",
    "Updated At",
    "Sent At",
    // Deposit info
    "Deposit Type",
    "Deposit Value",
    "Deposit Due Date",
    "Deposit Amount Paid",
    // References
    "PO Number",
    "Converted To Invoice ID",
    "Comments",
  ];

  const rows = quotes.map((quote) => [
    escapeCSV(quote.number),
    escapeCSV(quote.clientName),
    escapeCSV(quote.projectName),
    escapeCSV(quote.date),
    escapeCSV(quote.validUntil),
    escapeCSV(quote.status),
    escapeCSV(quote.currency),
    // Use stored snapshot values (cents converted to dollars)
    escapeCSV(centsToInputValue(quote.totals.subtotalCents)),
    escapeCSV(centsToInputValue(quote.totals.discountCents)),
    escapeCSV(centsToInputValue(quote.totals.taxCents)),
    escapeCSV(centsToInputValue(quote.totals.totalCents)),
    // Tax breakdown from snapshot
    escapeCSV(formatTaxBreakdown(quote.totals.taxBreakdown, quote.totals.taxCents)),
    // Line items from snapshot
    escapeCSV(formatLineItems(quote.lineItems)),
    escapeCSV(quote.lineItems?.length || 0),
    // Status timestamps
    escapeCSV(quote.acceptedDate),
    // Audit timestamps
    escapeCSV(quote.auditMeta?.createdAt),
    escapeCSV(quote.auditMeta?.updatedAt),
    escapeCSV(quote.auditMeta?.sentAt),
    // Deposit info
    escapeCSV(quote.depositRequest?.type),
    escapeCSV(quote.depositRequest?.value),
    escapeCSV(quote.depositRequest?.dueDate),
    escapeCSV(quote.depositRequest?.amountPaid),
    // References
    escapeCSV(quote.poNumber),
    escapeCSV(quote.convertedToInvoiceId),
    escapeCSV(quote.comments),
  ]);

  const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
  const date = new Date().toISOString().split("T")[0];
  downloadCSV(csv, `quotes-export-${date}.csv`);
}

/**
 * Export detailed line items as separate rows (for detailed accounting)
 */
export function exportInvoiceLineItemsToCSV(invoices: Invoice[]) {
  const headers = [
    "Invoice Number",
    "Invoice Date",
    "Client Name",
    "Invoice Status",
    "Currency",
    // Line item details
    "Item Code",
    "Item Name",
    "Description",
    "Quantity",
    "Unit",
    "Unit Price",
    "Tax Code",
    "Tax Rate %",
    "Tax Amount",
    "Discount Type",
    "Discount Value",
    "Line Total",
  ];

  const rows: string[][] = [];

  for (const inv of invoices) {
    if (!inv.lineItems || inv.lineItems.length === 0) {
      // Add a row indicating legacy invoice
      rows.push([
        escapeCSV(inv.number),
        escapeCSV(inv.date),
        escapeCSV(inv.clientName),
        escapeCSV(inv.status),
        escapeCSV(inv.currency),
        "", "", "(Legacy invoice - no line items)", "", "", 
        escapeCSV(getInvoiceTotal(inv).toFixed(2)),
        "", "", "", "", "", "",
      ]);
      continue;
    }

    for (const li of inv.lineItems) {
      const unitPriceDollars = li.unitPriceCentsSnapshot / 100;
      const lineTotal = li.lineTotalCentsSnapshot !== undefined 
        ? li.lineTotalCentsSnapshot / 100
        : li.qty * unitPriceDollars;

      rows.push([
        escapeCSV(inv.number),
        escapeCSV(inv.date),
        escapeCSV(inv.clientName),
        escapeCSV(inv.status),
        escapeCSV(inv.currency),
        escapeCSV(li.itemCode),
        escapeCSV(li.nameSnapshot),
        escapeCSV(li.descriptionSnapshot),
        escapeCSV(li.qty),
        escapeCSV(li.unitSnapshot),
        escapeCSV(unitPriceDollars.toFixed(2)),
        escapeCSV(li.taxCodeSnapshot || li.taxNameSnapshot),
        escapeCSV(li.taxRateSnapshot),
        escapeCSV(li.taxAmountCentsSnapshot !== undefined ? (li.taxAmountCentsSnapshot / 100).toFixed(2) : ""),
        escapeCSV(li.discountType),
        escapeCSV(li.discountValue),
        escapeCSV(lineTotal.toFixed(2)),
      ]);
    }
  }

  const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
  const date = new Date().toISOString().split("T")[0];
  downloadCSV(csv, `invoice-line-items-${date}.csv`);
}
