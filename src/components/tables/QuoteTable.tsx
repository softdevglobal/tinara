import { useState } from "react";
import { format } from "date-fns";
import { MoreHorizontal, ArrowUpDown } from "lucide-react";
import { Quote, QuoteSortOption } from "@/data/quotes";
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

interface QuoteTableProps {
  quotes: Quote[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onEdit?: (quote: Quote) => void;
  onDelete?: (quote: Quote) => void;
  onConvertToInvoice?: (quote: Quote) => void;
  onDownloadPdf?: (quote: Quote) => void;
  sortOption: QuoteSortOption;
  onSortChange: (option: QuoteSortOption) => void;
}

export function QuoteTable({
  quotes,
  selectedIds,
  onSelectionChange,
  onEdit,
  onDelete,
  onConvertToInvoice,
  onDownloadPdf,
  sortOption,
  onSortChange,
}: QuoteTableProps) {
  const allSelected = quotes.length > 0 && selectedIds.length === quotes.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < quotes.length;

  const handleSelectAll = () => {
    if (allSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(quotes.map((q) => q.id));
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

  const getStatusBadge = (status: Quote["status"]) => {
    const styles: Record<Quote["status"], string> = {
      Draft: "status-badge-draft",
      Sent: "status-badge-opened",
      Accepted: "status-badge-paid",
      Expired: "status-badge-overdue",
      Converted: "status-badge-paid",
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
            <TableHead>Valid Until</TableHead>
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
          {quotes.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                No quotes found
              </TableCell>
            </TableRow>
          ) : (
            quotes.map((quote) => (
              <TableRow
                key={quote.id}
                className={cn(
                  selectedIds.includes(quote.id) && "bg-muted/50"
                )}
              >
                <TableCell>
                  <Checkbox
                    checked={selectedIds.includes(quote.id)}
                    onCheckedChange={() => handleSelectOne(quote.id)}
                  />
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {quote.number}
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{quote.clientName}</p>
                    {quote.projectName && (
                      <p className="text-sm text-muted-foreground">
                        {quote.projectName}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {format(new Date(quote.date), "MMM d, yyyy")}
                </TableCell>
                <TableCell>
                  <div>
                    <p className={cn(quote.status === "Expired" && "text-destructive")}>
                      {format(new Date(quote.validUntil), "MMM d, yyyy")}
                    </p>
                    {quote.validLabel && quote.status !== "Accepted" && quote.status !== "Converted" && (
                      <p className="text-xs text-muted-foreground">{quote.validLabel}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(quote.status)}</TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(quote.total, quote.currency)}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit?.(quote)}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDownloadPdf?.(quote)}>
                        Download PDF
                      </DropdownMenuItem>
                      {(quote.status === "Sent" || quote.status === "Accepted") && (
                        <DropdownMenuItem onClick={() => onConvertToInvoice?.(quote)}>
                          Convert to Invoice
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onDelete?.(quote)}
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
