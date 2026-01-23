import { cn } from "@/lib/utils";
import { Invoice } from "@/data/invoices";
import { InvoiceStatusBadge } from "./InvoiceStatusBadge";
import { Calendar, ChevronRight } from "lucide-react";

interface InvoiceListItemProps {
  invoice: Invoice;
  onClick?: () => void;
}

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
    month: "short",
  });
}

export function InvoiceListItem({ invoice, onClick }: InvoiceListItemProps) {
  const isOverdue = invoice.status === "Overdue";

  return (
    <button
      onClick={onClick}
      className="w-full invoice-card p-4 flex items-center gap-4 text-left transition-all hover:border-primary/20 group"
    >
      {/* Invoice Number */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-mono text-sm font-medium text-foreground">
            #{invoice.number}
          </p>
          <InvoiceStatusBadge
            status={invoice.status}
            isOverdue={isOverdue}
          />
        </div>
        <p className="text-sm text-foreground truncate">{invoice.clientName}</p>
        {invoice.projectName && (
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {invoice.projectName}
          </p>
        )}
      </div>

      {/* Date */}
      <div className="hidden sm:flex items-center gap-1.5 text-muted-foreground">
        <Calendar className="h-3.5 w-3.5" />
        <span className="text-xs">{formatDate(invoice.dueDate)}</span>
      </div>

      {/* Amount */}
      <div className="text-right">
        <p className={cn("font-semibold", isOverdue ? "text-destructive" : "text-foreground")}>
          {formatCurrency(invoice.total, invoice.currency)}
        </p>
        {isOverdue && (
          <p className="text-xs text-destructive">{invoice.dueLabel}</p>
        )}
      </div>

      {/* Arrow */}
      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
    </button>
  );
}
