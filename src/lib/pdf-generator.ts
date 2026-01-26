import jsPDF from "jspdf";
import { Invoice } from "@/data/invoices";
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

function generateModernTemplate(
  doc: jsPDF,
  invoice: Invoice,
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
  doc.text(branding.companyName || "INVOICE", 20, 30);

  // Invoice label
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Invoice #${invoice.number}`, pageWidth - 20, 25, { align: "right" });

  // Status badge
  const statusColor =
    invoice.status === "Paid"
      ? [34, 197, 94]
      : invoice.status === "Overdue"
      ? [239, 68, 68]
      : [255, 255, 255];
  doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.text(invoice.status.toUpperCase(), pageWidth - 20, 35, { align: "right" });

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
  doc.text(formatDate(invoice.date), pageWidth - 70, yPos + 5);

  doc.setTextColor(100);
  doc.text("Due Date", pageWidth - 70, yPos + 15);
  doc.setTextColor(0);
  doc.text(formatDate(invoice.dueDate), pageWidth - 70, yPos + 20);

  yPos = 110;

  // Bill to section with accent
  doc.setFillColor(accentRgb[0], accentRgb[1], accentRgb[2]);
  doc.rect(20, yPos, 3, 25, "F");

  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text("BILL TO", 28, yPos + 5);
  doc.setTextColor(0);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(invoice.clientName, 28, yPos + 15);
  if (invoice.projectName) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text(invoice.projectName, 28, yPos + 22);
  }

  // Amount section
  yPos = 160;
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text("AMOUNT DUE", 20, yPos);

  doc.setFontSize(32);
  doc.setTextColor(primaryRgb[0], primaryRgb[1], primaryRgb[2]);
  doc.setFont("helvetica", "bold");
  doc.text(formatCurrency(invoice.total, invoice.currency), 20, yPos + 18);

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
  invoice: Invoice,
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

  // Invoice title on right
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0);
  doc.text("INVOICE", pageWidth - 20, 30, { align: "right" });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text(`#${invoice.number}`, pageWidth - 20, 38, { align: "right" });

  // Horizontal line
  doc.setDrawColor(200);
  doc.setLineWidth(0.5);
  doc.line(20, 55, pageWidth - 20, 55);

  // Two column layout
  yPos = 70;

  // Bill To
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text("BILL TO", 20, yPos);
  doc.setTextColor(0);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(invoice.clientName, 20, yPos + 8);
  if (invoice.projectName) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text(invoice.projectName, 20, yPos + 14);
  }

  // Dates
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text("ISSUE DATE", pageWidth - 70, yPos);
  doc.setTextColor(0);
  doc.text(formatDate(invoice.date), pageWidth - 70, yPos + 6);

  doc.setTextColor(100);
  doc.text("DUE DATE", pageWidth - 70, yPos + 16);
  doc.setTextColor(0);
  doc.text(formatDate(invoice.dueDate), pageWidth - 70, yPos + 22);

  doc.setTextColor(100);
  doc.text("STATUS", pageWidth - 70, yPos + 32);
  const statusColor =
    invoice.status === "Paid"
      ? [34, 197, 94]
      : invoice.status === "Overdue"
      ? [239, 68, 68]
      : [100, 100, 100];
  doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.setFont("helvetica", "bold");
  doc.text(invoice.status.toUpperCase(), pageWidth - 70, yPos + 38);

  // Amount box
  yPos = 140;
  doc.setFillColor(245, 245, 245);
  doc.roundedRect(20, yPos, pageWidth - 40, 40, 3, 3, "F");

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.setFont("helvetica", "normal");
  doc.text("Amount Due", 30, yPos + 15);

  doc.setFontSize(24);
  doc.setTextColor(primaryRgb[0], primaryRgb[1], primaryRgb[2]);
  doc.setFont("helvetica", "bold");
  doc.text(formatCurrency(invoice.total, invoice.currency), 30, yPos + 30);

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
  invoice: Invoice,
  branding: BrandingSettings
): void {
  const pageWidth = doc.internal.pageSize.getWidth();

  // Simple header
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(150);
  doc.text("INVOICE", 20, 25);

  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0);
  doc.text(`#${invoice.number}`, 20, 38);

  // Company name subtle
  if (branding.companyName) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text(branding.companyName, pageWidth - 20, 25, { align: "right" });
  }

  // Status
  const statusColor =
    invoice.status === "Paid"
      ? [34, 197, 94]
      : invoice.status === "Overdue"
      ? [239, 68, 68]
      : [150, 150, 150];
  doc.setFontSize(9);
  doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.text(invoice.status.toUpperCase(), pageWidth - 20, 32, { align: "right" });

  // Thin line
  doc.setDrawColor(230);
  doc.setLineWidth(0.3);
  doc.line(20, 50, pageWidth - 20, 50);

  // Content
  let yPos = 70;

  doc.setFontSize(9);
  doc.setTextColor(150);
  doc.text("Bill to", 20, yPos);
  doc.setTextColor(0);
  doc.setFontSize(11);
  doc.text(invoice.clientName, 20, yPos + 8);
  if (invoice.projectName) {
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(invoice.projectName, 20, yPos + 14);
  }

  // Dates right aligned
  doc.setFontSize(9);
  doc.setTextColor(150);
  doc.text("Issued", pageWidth - 60, yPos);
  doc.setTextColor(0);
  doc.text(formatDate(invoice.date), pageWidth - 60, yPos + 6);

  doc.setTextColor(150);
  doc.text("Due", pageWidth - 60, yPos + 16);
  doc.setTextColor(0);
  doc.text(formatDate(invoice.dueDate), pageWidth - 60, yPos + 22);

  // Amount
  yPos = 130;
  doc.setFontSize(9);
  doc.setTextColor(150);
  doc.text("Total", 20, yPos);

  doc.setFontSize(28);
  doc.setTextColor(0);
  doc.setFont("helvetica", "bold");
  doc.text(formatCurrency(invoice.total, invoice.currency), 20, yPos + 15);

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

  switch (branding.template) {
    case "classic":
      generateClassicTemplate(doc, invoice, branding);
      break;
    case "minimal":
      generateMinimalTemplate(doc, invoice, branding);
      break;
    case "modern":
    default:
      generateModernTemplate(doc, invoice, branding);
      break;
  }

  doc.save(`invoice-${invoice.number}.pdf`);
}
