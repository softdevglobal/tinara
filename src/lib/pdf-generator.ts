import jsPDF from "jspdf";
import { Invoice } from "@/data/invoices";
import { Quote } from "@/data/quotes";
import { BrandingSettings, defaultBrandingSettings } from "@/types/branding";

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : [0, 0, 0];
}

// Shared document data structure
interface DocumentData {
  number: string;
  clientName: string;
  projectName: string;
  date: string;
  secondaryDate: string;
  secondaryDateLabel: string;
  status: string;
  total: number;
  currency: string;
  documentType: "INVOICE" | "QUOTE";
  amountLabel: string;
}

function invoiceToDocData(invoice: Invoice): DocumentData {
  return {
    number: invoice.number,
    clientName: invoice.clientName,
    projectName: invoice.projectName,
    date: invoice.date,
    secondaryDate: invoice.dueDate,
    secondaryDateLabel: "Due Date",
    status: invoice.status,
    total: invoice.total,
    currency: invoice.currency,
    documentType: "INVOICE",
    amountLabel: "AMOUNT DUE",
  };
}

function quoteToDocData(quote: Quote): DocumentData {
  return {
    number: quote.number,
    clientName: quote.clientName,
    projectName: quote.projectName,
    date: quote.date,
    secondaryDate: quote.validUntil,
    secondaryDateLabel: "Valid Until",
    status: quote.status,
    total: quote.total,
    currency: quote.currency,
    documentType: "QUOTE",
    amountLabel: "QUOTED AMOUNT",
  };
}

function getStatusColor(status: string): [number, number, number] {
  switch (status) {
    case "Paid":
    case "Accepted":
      return [34, 197, 94];
    case "Overdue":
    case "Expired":
      return [239, 68, 68];
    case "Converted":
      return [139, 92, 246];
    case "Sent":
      return [59, 130, 246];
    default:
      return [150, 150, 150];
  }
}

function generateModernTemplate(
  doc: jsPDF,
  data: DocumentData,
  branding: BrandingSettings
): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  const primaryRgb = hexToRgb(branding.primaryColor);
  const accentRgb = hexToRgb(branding.accentColor);

  // Header background with gradient effect
  doc.setFillColor(primaryRgb[0], primaryRgb[1], primaryRgb[2]);
  doc.rect(0, 0, pageWidth, 50, "F");

  // Company name in header
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text(branding.companyName || data.documentType, 20, 30);

  // Document label
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`${data.documentType} #${data.number}`, pageWidth - 20, 25, { align: "right" });

  // Status badge
  const statusColor = getStatusColor(data.status);
  doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.text(data.status.toUpperCase(), pageWidth - 20, 35, { align: "right" });

  // Reset for body
  doc.setTextColor(0);
  let yPos = 70;

  // Company contact info
  doc.setFontSize(9);
  doc.setTextColor(100);
  if (branding.companyEmail) {
    doc.text(branding.companyEmail, 20, yPos);
    yPos += 5;
  }
  if (branding.companyPhone) {
    doc.text(branding.companyPhone, 20, yPos);
    yPos += 5;
  }
  if (branding.companyAddress) {
    doc.text(branding.companyAddress, 20, yPos);
    yPos += 5;
  }

  yPos = 70;
  // Dates on right
  doc.setTextColor(100);
  doc.text("Issue Date", pageWidth - 70, yPos);
  doc.setTextColor(0);
  doc.text(formatDate(data.date), pageWidth - 70, yPos + 5);

  doc.setTextColor(100);
  doc.text(data.secondaryDateLabel, pageWidth - 70, yPos + 15);
  doc.setTextColor(0);
  doc.text(formatDate(data.secondaryDate), pageWidth - 70, yPos + 20);

  yPos = 110;

  // Bill to section with accent
  doc.setFillColor(accentRgb[0], accentRgb[1], accentRgb[2]);
  doc.rect(20, yPos, 3, 25, "F");

  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text(data.documentType === "QUOTE" ? "PREPARED FOR" : "BILL TO", 28, yPos + 5);
  doc.setTextColor(0);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(data.clientName, 28, yPos + 15);
  if (data.projectName) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text(data.projectName, 28, yPos + 22);
  }

  // Amount section
  yPos = 160;
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(data.amountLabel, 20, yPos);

  doc.setFontSize(32);
  doc.setTextColor(primaryRgb[0], primaryRgb[1], primaryRgb[2]);
  doc.setFont("helvetica", "bold");
  doc.text(formatCurrency(data.total, data.currency), 20, yPos + 18);

  // Footer
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(150);
  doc.text(branding.footerText || "Thank you for your business!", pageWidth / 2, 280, {
    align: "center",
  });
}

function generateClassicTemplate(
  doc: jsPDF,
  data: DocumentData,
  branding: BrandingSettings
): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  const primaryRgb = hexToRgb(branding.primaryColor);

  // Company header
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(primaryRgb[0], primaryRgb[1], primaryRgb[2]);
  doc.text(branding.companyName || "Your Company", 20, 25);

  // Company details
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80);
  let yPos = 32;
  if (branding.companyAddress) {
    doc.text(branding.companyAddress, 20, yPos);
    yPos += 4;
  }
  if (branding.companyEmail) {
    doc.text(branding.companyEmail, 20, yPos);
    yPos += 4;
  }
  if (branding.companyPhone) {
    doc.text(branding.companyPhone, 20, yPos);
  }

  // Document title on right
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0);
  doc.text(data.documentType, pageWidth - 20, 30, { align: "right" });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text(`#${data.number}`, pageWidth - 20, 38, { align: "right" });

  // Horizontal line
  doc.setDrawColor(200);
  doc.setLineWidth(0.5);
  doc.line(20, 55, pageWidth - 20, 55);

  // Two column layout
  yPos = 70;

  // Bill To / Prepared For
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text(data.documentType === "QUOTE" ? "PREPARED FOR" : "BILL TO", 20, yPos);
  doc.setTextColor(0);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(data.clientName, 20, yPos + 8);
  if (data.projectName) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text(data.projectName, 20, yPos + 14);
  }

  // Dates
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text("ISSUE DATE", pageWidth - 70, yPos);
  doc.setTextColor(0);
  doc.text(formatDate(data.date), pageWidth - 70, yPos + 6);

  doc.setTextColor(100);
  doc.text(data.secondaryDateLabel.toUpperCase(), pageWidth - 70, yPos + 16);
  doc.setTextColor(0);
  doc.text(formatDate(data.secondaryDate), pageWidth - 70, yPos + 22);

  doc.setTextColor(100);
  doc.text("STATUS", pageWidth - 70, yPos + 32);
  const statusColor = getStatusColor(data.status);
  doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.setFont("helvetica", "bold");
  doc.text(data.status.toUpperCase(), pageWidth - 70, yPos + 38);

  // Amount box
  yPos = 140;
  doc.setFillColor(245, 245, 245);
  doc.roundedRect(20, yPos, pageWidth - 40, 40, 3, 3, "F");

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.setFont("helvetica", "normal");
  doc.text(data.amountLabel.replace("_", " "), 30, yPos + 15);

  doc.setFontSize(24);
  doc.setTextColor(primaryRgb[0], primaryRgb[1], primaryRgb[2]);
  doc.setFont("helvetica", "bold");
  doc.text(formatCurrency(data.total, data.currency), 30, yPos + 30);

  // Footer
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(150);
  doc.text(branding.footerText || "Thank you for your business!", pageWidth / 2, 280, {
    align: "center",
  });
}

function generateMinimalTemplate(
  doc: jsPDF,
  data: DocumentData,
  branding: BrandingSettings
): void {
  const pageWidth = doc.internal.pageSize.getWidth();

  // Simple header
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(150);
  doc.text(data.documentType, 20, 25);

  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0);
  doc.text(`#${data.number}`, 20, 38);

  // Company name subtle
  if (branding.companyName) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text(branding.companyName, pageWidth - 20, 25, { align: "right" });
  }

  // Status
  const statusColor = getStatusColor(data.status);
  doc.setFontSize(9);
  doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.text(data.status.toUpperCase(), pageWidth - 20, 32, { align: "right" });

  // Thin line
  doc.setDrawColor(230);
  doc.setLineWidth(0.3);
  doc.line(20, 50, pageWidth - 20, 50);

  // Content
  let yPos = 70;

  doc.setFontSize(9);
  doc.setTextColor(150);
  doc.text(data.documentType === "QUOTE" ? "Prepared for" : "Bill to", 20, yPos);
  doc.setTextColor(0);
  doc.setFontSize(11);
  doc.text(data.clientName, 20, yPos + 8);
  if (data.projectName) {
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(data.projectName, 20, yPos + 14);
  }

  // Dates right aligned
  doc.setFontSize(9);
  doc.setTextColor(150);
  doc.text("Issued", pageWidth - 60, yPos);
  doc.setTextColor(0);
  doc.text(formatDate(data.date), pageWidth - 60, yPos + 6);

  doc.setTextColor(150);
  doc.text(data.documentType === "QUOTE" ? "Valid until" : "Due", pageWidth - 60, yPos + 16);
  doc.setTextColor(0);
  doc.text(formatDate(data.secondaryDate), pageWidth - 60, yPos + 22);

  // Amount
  yPos = 130;
  doc.setFontSize(9);
  doc.setTextColor(150);
  doc.text("Total", 20, yPos);

  doc.setFontSize(28);
  doc.setTextColor(0);
  doc.setFont("helvetica", "bold");
  doc.text(formatCurrency(data.total, data.currency), 20, yPos + 15);

  // Footer
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(180);
  doc.text(branding.footerText || "Thank you for your business!", pageWidth / 2, 280, {
    align: "center",
  });
}

export function generateInvoicePdf(
  invoice: Invoice,
  branding: BrandingSettings = defaultBrandingSettings
): void {
  const doc = new jsPDF();
  const data = invoiceToDocData(invoice);

  switch (branding.template) {
    case "classic":
      generateClassicTemplate(doc, data, branding);
      break;
    case "minimal":
      generateMinimalTemplate(doc, data, branding);
      break;
    case "modern":
    default:
      generateModernTemplate(doc, data, branding);
      break;
  }

  doc.save(`invoice-${invoice.number}.pdf`);
}

export function generateQuotePdf(
  quote: Quote,
  branding: BrandingSettings = defaultBrandingSettings
): void {
  const doc = new jsPDF();
  const data = quoteToDocData(quote);

  switch (branding.template) {
    case "classic":
      generateClassicTemplate(doc, data, branding);
      break;
    case "minimal":
      generateMinimalTemplate(doc, data, branding);
      break;
    case "modern":
    default:
      generateModernTemplate(doc, data, branding);
      break;
  }

  doc.save(`quote-${quote.number}.pdf`);
}
