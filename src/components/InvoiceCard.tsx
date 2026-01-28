import { Calendar, Clock, FileText, User, Briefcase } from "lucide-react";
import { InvoiceStatusBadge } from "./InvoiceStatusBadge";
import { Invoice, getInvoiceTotal } from "@/data/invoices";
import { cn } from "@/lib/utils";

interface InvoiceCardProps {
  invoice: Invoice;
  className?: string;
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function InvoiceCard({ invoice, className }: InvoiceCardProps) {
  const isOverdue = invoice.dueDaysOverdue > 0;

  return (
    <div className={cn("invoice-card p-6 animate-fade-in", className)}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
            <FileText className="h-5 w-5 text-foreground" />
          </div>
          <div>
            <p className="font-mono text-sm font-medium text-foreground">
              {invoice.number}
            </p>
            <p className="text-xs text-muted-foreground">Invoice</p>
          </div>
        </div>
        <InvoiceStatusBadge status={invoice.status} isOverdue={isOverdue} />
      </div>

      {/* Client & Project */}
      <div className="space-y-4 mb-6">
        <div className="flex items-start gap-3">
          <User className="h-4 w-4 text-muted-foreground mt-0.5" />
          <div>
            <p className="label-text mb-1">Client</p>
            <p className="value-text">{invoice.clientName}</p>
          </div>
        </div>
        {invoice.projectName && (
          <div className="flex items-start gap-3">
            <Briefcase className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="label-text mb-1">Project</p>
              <p className="value-text">{invoice.projectName}</p>
            </div>
          </div>
        )}
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4 mb-6 p-4 rounded-lg bg-secondary/50">
        <div className="flex items-start gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
          <div>
            <p className="label-text mb-1">Issue Date</p>
            <p className="value-text">{formatDate(invoice.date)}</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Clock className={cn("h-4 w-4 mt-0.5", isOverdue ? "text-destructive" : "text-muted-foreground")} />
          <div>
            <p className="label-text mb-1">Due Date</p>
            <p className={cn("value-text", isOverdue && "text-destructive")}>
              {formatDate(invoice.dueDate)}
            </p>
            {isOverdue && (
              <p className="text-xs text-destructive font-medium mt-0.5">
                {invoice.dueLabel}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Total */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
        <p className="amount-display text-2xl text-foreground">
          {formatCurrency(getInvoiceTotal(invoice), invoice.currency)}
        </p>
      </div>
    </div>
  );
}
