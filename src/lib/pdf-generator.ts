import jsPDF from "jspdf";
import { Invoice } from "@/data/invoices";

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

export function generateInvoicePdf(invoice: Invoice): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("INVOICE", 20, 30);
  
  // Invoice Number
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text(`#${invoice.number}`, 20, 40);
  
  // Status
  doc.setFontSize(10);
  const statusColor = invoice.status === "Paid" ? [34, 197, 94] : 
                      invoice.status === "Overdue" ? [239, 68, 68] : [100, 100, 100];
  doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.text(invoice.status.toUpperCase(), pageWidth - 20, 30, { align: "right" });
  
  // Reset color
  doc.setTextColor(0);
  
  // Client info
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text("BILL TO", 20, 60);
  doc.setTextColor(0);
  doc.setFontSize(12);
  doc.text(invoice.clientName, 20, 68);
  if (invoice.projectName) {
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(invoice.projectName, 20, 76);
  }
  
  // Dates
  doc.setTextColor(100);
  doc.setFontSize(10);
  doc.text("ISSUE DATE", pageWidth - 70, 60);
  doc.text("DUE DATE", pageWidth - 70, 80);
  
  doc.setTextColor(0);
  doc.text(formatDate(invoice.date), pageWidth - 70, 68);
  doc.text(formatDate(invoice.dueDate), pageWidth - 70, 88);
  
  // Divider
  doc.setDrawColor(230);
  doc.line(20, 100, pageWidth - 20, 100);
  
  // Amount section
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text("AMOUNT DUE", 20, 120);
  
  doc.setFontSize(28);
  doc.setTextColor(0);
  doc.setFont("helvetica", "bold");
  doc.text(formatCurrency(invoice.total, invoice.currency), 20, 135);
  
  // Footer
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(150);
  doc.text("Thank you for your business!", pageWidth / 2, 280, { align: "center" });
  
  // Save
  doc.save(`invoice-${invoice.number}.pdf`);
}
