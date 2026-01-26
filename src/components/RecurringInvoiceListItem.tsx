import { MoreHorizontal, Repeat, Play, Pause, Trash2, Edit } from "lucide-react";
import { RecurringInvoice, getFrequencyLabel } from "@/data/recurring-invoices";
import { formatCurrency } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";

interface RecurringInvoiceListItemProps {
  recurring: RecurringInvoice;
  onToggleActive: (id: string) => void;
  onEdit: (recurring: RecurringInvoice) => void;
  onDelete: (id: string) => void;
  onGenerateNow: (recurring: RecurringInvoice) => void;
}

export function RecurringInvoiceListItem({
  recurring,
  onToggleActive,
  onEdit,
  onDelete,
  onGenerateNow,
}: RecurringInvoiceListItemProps) {
  const total = recurring.lineItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );
  const taxAmount = total * (recurring.taxRate / 100);
  const grandTotal = total + taxAmount;

  return (
    <div className="invoice-card p-4 hover:bg-secondary/30 transition-colors">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${
            recurring.isActive ? "bg-primary/10" : "bg-muted"
          }`}>
            <Repeat className={`h-4 w-4 ${
              recurring.isActive ? "text-primary" : "text-muted-foreground"
            }`} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-foreground truncate">
                {recurring.clientName}
              </p>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                recurring.isActive 
                  ? "bg-emerald-500/10 text-emerald-600" 
                  : "bg-muted text-muted-foreground"
              }`}>
                {recurring.isActive ? "Active" : "Paused"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {recurring.projectName || "No project name"}
            </p>
          </div>
        </div>

        <div className="hidden sm:flex flex-col items-end gap-0.5">
          <span className="text-xs font-medium text-primary">
            {getFrequencyLabel(recurring.frequency)}
          </span>
          <span className="text-xs text-muted-foreground">
            Next: {format(new Date(recurring.nextDueDate), "MMM d, yyyy")}
          </span>
        </div>

        <div className="flex flex-col items-end gap-0.5">
          <span className="text-sm font-semibold text-foreground">
            {formatCurrency(grandTotal, recurring.currency)}
          </span>
          <span className="text-xs text-muted-foreground">per cycle</span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-2 rounded-lg hover:bg-secondary transition-colors">
              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => onGenerateNow(recurring)}>
              <Repeat className="h-4 w-4 mr-2" />
              Generate Now
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onToggleActive(recurring.id)}>
              {recurring.isActive ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Resume
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(recurring)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(recurring.id)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
