import { cn } from "@/lib/utils";
import { Invoice } from "@/data/invoices";
import { InvoiceStatusBadge } from "./InvoiceStatusBadge";
import { InvoiceActions } from "./InvoiceActions";
import { PaymentMethodBadge } from "./MarkAsPaidDialog";
import { Calendar } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface InvoiceListItemProps {
  invoice: Invoice;
  isSelectMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: () => void;
  onClick?: () => void;
  onEdit: (invoice: Invoice) => void;
  onMarkPaid: (id: string) => void;
  onSendReminder: (invoice: Invoice) => void;
  onDownloadPdf: (invoice: Invoice) => void;
  onDelete: (id: string) => void;
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

export function InvoiceListItem({
  invoice,
  isSelectMode,
  isSelected,
  onToggleSelect,
  onClick,
  onEdit,
  onMarkPaid,
  onSendReminder,
  onDownloadPdf,
  onDelete,
}: InvoiceListItemProps) {
  const isOverdue = invoice.status === "Overdue";

  const handleClick = () => {
    if (isSelectMode && onToggleSelect) {
      onToggleSelect();
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "w-full invoice-card p-4 flex items-center gap-4 text-left transition-all hover:border-primary/20 group cursor-pointer",
        isSelected && "border-primary bg-primary/5"
      )}
    >
      {/* Checkbox for select mode */}
      {isSelectMode && (
        <div onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={isSelected}
            onCheckedChange={onToggleSelect}
            className="data-[state=checked]:bg-primary"
          />
        </div>
      )}

      {/* Invoice Number */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-mono text-sm font-medium text-foreground">
            #{invoice.number}
          </p>
          <InvoiceStatusBadge status={invoice.status} isOverdue={isOverdue} />
        </div>
        <p className="text-sm text-foreground truncate">{invoice.clientName}</p>
        {invoice.projectName && (
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {invoice.projectName}
          </p>
        )}
        {invoice.status === "Paid" && invoice.paymentMethod && (
          <PaymentMethodBadge 
            method={invoice.paymentMethod} 
            reference={invoice.paymentReference}
            className="mt-1"
          />
        )}
      </div>

      {/* Date */}
      <div className="hidden sm:flex items-center gap-1.5 text-muted-foreground">
        <Calendar className="h-3.5 w-3.5" />
        <span className="text-xs">{formatDate(invoice.dueDate)}</span>
      </div>

      {/* Amount */}
      <div className="text-right">
        <p
          className={cn(
            "font-semibold",
            isOverdue ? "text-destructive" : "text-foreground"
          )}
        >
          {formatCurrency(invoice.total, invoice.currency)}
        </p>
        {isOverdue && (
          <p className="text-xs text-destructive">{invoice.dueLabel}</p>
        )}
      </div>

      {/* Actions - hide in select mode */}
      {!isSelectMode && (
        <InvoiceActions
          invoice={invoice}
          onEdit={onEdit}
          onMarkPaid={onMarkPaid}
          onSendReminder={onSendReminder}
          onDownloadPdf={onDownloadPdf}
          onDelete={onDelete}
        />
      )}
    </div>
  );
}
