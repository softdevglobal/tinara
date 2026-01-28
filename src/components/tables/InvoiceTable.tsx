import { useState } from "react";
import { format } from "date-fns";
import { MoreHorizontal, ArrowUpDown, ClipboardList } from "lucide-react";
import { Link } from "react-router-dom";
import { Invoice, InvoiceSortOption } from "@/data/invoices";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useApp } from "@/context/AppContext";

interface InvoiceTableProps {
  invoices: Invoice[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onEdit?: (invoice: Invoice) => void;
  onDelete?: (invoice: Invoice) => void;
  onMarkAsPaid?: (invoice: Invoice) => void;
  onDownloadPdf?: (invoice: Invoice) => void;
  sortOption: InvoiceSortOption;
  onSortChange: (option: InvoiceSortOption) => void;
}

export function InvoiceTable({
  invoices,
  selectedIds,
  onSelectionChange,
  onEdit,
  onDelete,
  onMarkAsPaid,
  onDownloadPdf,
  sortOption,
  onSortChange,
}: InvoiceTableProps) {
  const { quotes } = useApp();
  const allSelected = invoices.length > 0 && selectedIds.length === invoices.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < invoices.length;

  // Helper to find source quote for an invoice
  const getSourceQuote = (quoteId: string | undefined) => {
    if (!quoteId) return null;
    return quotes.find((q) => q.id === quoteId);
  };

  const handleSelectAll = () => {
    if (allSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(invoices.map((inv) => inv.id));
    }
  };

  const handleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((i) => i !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getStatusBadge = (status: Invoice["status"]) => {
    const styles = {
      Opened: "status-badge-opened",
      Paid: "status-badge-paid",
      Overdue: "status-badge-overdue",
    };
    return (
      <span className={cn("status-badge", styles[status])}>
        {status}
      </span>
    );
  };

  const toggleSort = (field: "date" | "amount") => {
    if (field === "date") {
      onSortChange(sortOption === "date-desc" ? "date-asc" : "date-desc");
    } else {
      onSortChange(sortOption === "amount-desc" ? "amount-asc" : "amount-desc");
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-12">
              <Checkbox
                checked={allSelected}
                ref={(ref) => {
                  if (ref) {
                    (ref as HTMLButtonElement & { indeterminate?: boolean }).indeterminate = someSelected;
                  }
                }}
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
            <TableHead>Number</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>
              <button
                onClick={() => toggleSort("date")}
                className="flex items-center gap-1 hover:text-foreground"
              >
                Date
                <ArrowUpDown className="h-3 w-3" />
              </button>
            </TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">
              <button
                onClick={() => toggleSort("amount")}
                className="flex items-center gap-1 ml-auto hover:text-foreground"
              >
                Total
                <ArrowUpDown className="h-3 w-3" />
              </button>
            </TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                No invoices found
              </TableCell>
            </TableRow>
          ) : (
            invoices.map((invoice) => (
              <TableRow
                key={invoice.id}
                className={cn(
                  selectedIds.includes(invoice.id) && "bg-muted/50"
                )}
              >
                <TableCell>
                  <Checkbox
                    checked={selectedIds.includes(invoice.id)}
                    onCheckedChange={() => handleSelectOne(invoice.id)}
                  />
                </TableCell>
                <TableCell className="font-mono text-sm">
                  <div className="flex items-center gap-2">
                    <span>{invoice.number}</span>
                    {invoice.quoteId && (() => {
                      const sourceQuote = getSourceQuote(invoice.quoteId);
                      if (sourceQuote) {
                        return (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Link
                                to={`/quotes?edit=${sourceQuote.id}`}
                                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <ClipboardList className="h-3 w-3" />
                              </Link>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Converted from Quote #{sourceQuote.number}</p>
                            </TooltipContent>
                          </Tooltip>
                        );
                      }
                      return null;
                    })()}
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{invoice.clientName}</p>
                    {invoice.projectName && (
                      <p className="text-sm text-muted-foreground">
                        {invoice.projectName}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {format(new Date(invoice.date), "MMM d, yyyy")}
                </TableCell>
                <TableCell>
                  <div>
                    <p className={cn(invoice.status === "Overdue" && "text-destructive")}>
                      {format(new Date(invoice.dueDate), "MMM d, yyyy")}
                    </p>
                    {invoice.status === "Overdue" && invoice.dueLabel && (
                      <p className="text-xs text-destructive">{invoice.dueLabel}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(invoice.total, invoice.currency)}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit?.(invoice)}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDownloadPdf?.(invoice)}>
                        Download PDF
                      </DropdownMenuItem>
                      {invoice.status !== "Paid" && (
                        <DropdownMenuItem onClick={() => onMarkAsPaid?.(invoice)}>
                          Mark as Paid
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onDelete?.(invoice)}
                        className="text-destructive"
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
