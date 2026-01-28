import { format } from "date-fns";
import { CalendarIcon, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DocumentType,
  PaymentTerms,
  PAYMENT_TERMS_LABELS,
  calculateDueDate,
} from "@/types/document";

interface DocumentDetailsPanelProps {
  type: DocumentType;
  documentNumber: string;
  status: string;
  date: Date;
  dueDate?: Date;
  validUntil?: Date;
  paymentTerms: PaymentTerms;
  currency: string;
  poNumber?: string;
  onDateChange: (date: Date) => void;
  onDueDateChange?: (date: Date) => void;
  onValidUntilChange?: (date: Date) => void;
  onPaymentTermsChange: (terms: PaymentTerms) => void;
  onCurrencyChange: (currency: string) => void;
  onPoNumberChange?: (poNumber: string) => void;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  depositAmount?: number;
}

export function DocumentDetailsPanel({
  type,
  documentNumber,
  status,
  date,
  dueDate,
  validUntil,
  paymentTerms,
  currency,
  poNumber,
  onDateChange,
  onDueDateChange,
  onValidUntilChange,
  onPaymentTermsChange,
  onCurrencyChange,
  onPoNumberChange,
  subtotal,
  discount,
  tax,
  total,
  depositAmount,
}: DocumentDetailsPanelProps) {
  const typeLabel = type === "invoice" ? "Invoice" : "Estimate";
  const isInvoice = type === "invoice";

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: currency || "AUD",
    }).format(amount);
  };

  // Handle payment terms change for invoices
  const handleTermsChange = (terms: PaymentTerms) => {
    onPaymentTermsChange(terms);
    if (isInvoice && terms !== "custom" && onDueDateChange) {
      const newDueDate = calculateDueDate(date, terms);
      onDueDateChange(newDueDate);
    }
  };

  return (
    <div className="space-y-4">
      {/* Document Info Card */}
      <div className="bg-card border rounded-lg p-4">
        <h3 className="font-medium mb-1">{typeLabel}</h3>
        <p className="text-lg font-semibold">
          # {documentNumber || "NEW"}
        </p>
        <span className="inline-block mt-2 px-2 py-0.5 text-xs bg-muted rounded">
          {status}
        </span>

        <div className="mt-4 space-y-3 text-sm">
          {/* Date */}
          <div className="flex items-center justify-between">
            <Label className="text-muted-foreground">
              {isInvoice ? "Invoice Date" : "Quote Date"}
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-auto p-0 font-normal hover:bg-transparent",
                    !date && "text-muted-foreground"
                  )}
                >
                  {date ? format(date, "dd MMM yyyy") : "Select date"}
                  <CalendarIcon className="ml-2 h-3 w-3 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-card" align="end">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => d && onDateChange(d)}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Payment Terms (Invoice) or Valid Until (Quote) */}
          {isInvoice ? (
            <>
              <div className="flex items-center justify-between">
                <Label className="text-muted-foreground">Terms</Label>
                <Select value={paymentTerms} onValueChange={handleTermsChange}>
                  <SelectTrigger className="w-28 h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PAYMENT_TERMS_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-muted-foreground">Due Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 font-normal hover:bg-transparent"
                    >
                      {dueDate ? format(dueDate, "dd MMM yyyy") : "Select date"}
                      <CalendarIcon className="ml-2 h-3 w-3 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-card" align="end">
                    <Calendar
                      mode="single"
                      selected={dueDate}
                      onSelect={(d) => d && onDueDateChange?.(d)}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-between">
              <Label className="text-muted-foreground">Valid Until</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 font-normal hover:bg-transparent"
                  >
                    {validUntil ? format(validUntil, "dd MMM yyyy") : "Select date"}
                    <CalendarIcon className="ml-2 h-3 w-3 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-card" align="end">
                  <Calendar
                    mode="single"
                    selected={validUntil}
                    onSelect={(d) => d && onValidUntilChange?.(d)}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          {/* Currency */}
          <div className="flex items-center justify-between">
            <Label className="text-muted-foreground">Currency</Label>
            <Select value={currency} onValueChange={onCurrencyChange}>
              <SelectTrigger className="w-20 h-7 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AUD">AUD</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="GBP">GBP</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="NZD">NZD</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* PO Number */}
          {onPoNumberChange && (
            <div className="flex items-center justify-between">
              <Label className="text-muted-foreground">PO Number</Label>
              <Input
                value={poNumber || ""}
                onChange={(e) => onPoNumberChange(e.target.value)}
                placeholder="Optional"
                className="w-28 h-7 text-xs text-right"
              />
            </div>
          )}
        </div>
      </div>

      {/* Totals Card */}
      <div className="bg-card border rounded-lg p-4">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">{formatCurrency(subtotal)}</span>
          </div>
          
          {discount > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Discount</span>
              <span className="text-green-600">-{formatCurrency(discount)}</span>
            </div>
          )}
          
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tax (GST)</span>
            <span className="font-medium">{formatCurrency(tax)}</span>
          </div>
          
          <div className="flex justify-between pt-2 border-t">
            <span className="font-semibold">Total</span>
            <span className="text-xl font-bold">{formatCurrency(total)}</span>
          </div>

          {depositAmount !== undefined && depositAmount > 0 && (
            <>
              <div className="flex justify-between pt-2 border-t text-primary">
                <span>Deposit required</span>
                <span className="font-semibold">{formatCurrency(depositAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Balance on completion</span>
                <span>{formatCurrency(total - depositAmount)}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
