import { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LineItem } from "@/lib/invoice-schema";
import { centsToDisplay } from "@/lib/money-utils";

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
  const { subtotal, taxAmount, total, hasDiscount, totalDiscount } = useMemo(() => {
    let subtotal = 0;
    let totalDiscount = 0;
    
    for (const item of lineItems) {
      const lineBase = item.quantity * item.unitPrice;
      subtotal += lineBase;
      
      // Check for extended line items with discount
      const extendedItem = item as any;
      if (extendedItem.discountType === "PERCENT" && extendedItem.discountValue > 0) {
        totalDiscount += lineBase * (extendedItem.discountValue / 100);
      } else if (extendedItem.discountType === "AMOUNT" && extendedItem.discountValue > 0) {
        totalDiscount += extendedItem.discountValue;
      }
    }
    
    const netAmount = subtotal - totalDiscount;
    const taxAmount = netAmount * (taxRate / 100);
    const total = netAmount + taxAmount;
    
    return { 
      subtotal, 
      taxAmount, 
      total, 
      hasDiscount: totalDiscount > 0,
      totalDiscount 
    };
  }, [lineItems, taxRate]);

  return (
    <div className="bg-secondary/50 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Subtotal</span>
        <span className="font-medium text-foreground">
          {formatCurrency(subtotal)}
        </span>
      </div>

      {hasDiscount && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Discount</span>
          <span className="font-medium text-green-600">
            -{formatCurrency(totalDiscount)}
          </span>
        </div>
      )}

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <Label htmlFor="taxRate" className="text-muted-foreground">
            Tax (GST)
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
