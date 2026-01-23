import { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LineItem } from "@/lib/invoice-schema";

interface InvoiceTotalsProps {
  lineItems: LineItem[];
  taxRate: number;
  onTaxRateChange: (rate: number) => void;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function InvoiceTotals({
  lineItems,
  taxRate,
  onTaxRateChange,
}: InvoiceTotalsProps) {
  const { subtotal, taxAmount, total } = useMemo(() => {
    const subtotal = lineItems.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount;
    return { subtotal, taxAmount, total };
  }, [lineItems, taxRate]);

  return (
    <div className="bg-secondary/50 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Subtotal</span>
        <span className="font-medium text-foreground">
          {formatCurrency(subtotal)}
        </span>
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <Label htmlFor="taxRate" className="text-muted-foreground">
            Tax
          </Label>
          <div className="flex items-center">
            <Input
              id="taxRate"
              type="number"
              min={0}
              max={100}
              step={0.5}
              value={taxRate}
              onChange={(e) => onTaxRateChange(parseFloat(e.target.value) || 0)}
              className="w-16 h-7 text-center text-xs bg-card"
            />
            <span className="ml-1 text-muted-foreground">%</span>
          </div>
        </div>
        <span className="font-medium text-foreground">
          {formatCurrency(taxAmount)}
        </span>
      </div>

      <div className="border-t border-border pt-3 flex items-center justify-between">
        <span className="font-medium text-foreground">Total</span>
        <span className="text-xl font-bold text-foreground">
          {formatCurrency(total)}
        </span>
      </div>
    </div>
  );
}
