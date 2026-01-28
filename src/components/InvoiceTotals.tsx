import { useMemo } from "react";
import { DocumentLineItem } from "@/lib/line-item-schema";
import { calculateDocumentTotals, TAX_CODE_LABELS, TaxCode } from "@/lib/tax-utils";
import { centsToDisplay } from "@/lib/money-utils";

interface InvoiceTotalsProps {
  lineItems: DocumentLineItem[];
}

export function InvoiceTotals({ lineItems }: InvoiceTotalsProps) {
  const totals = useMemo(() => {
    return calculateDocumentTotals(lineItems);
  }, [lineItems]);

  // Check if we have mixed tax codes
  const taxCodesUsed = useMemo(() => {
    const codes: TaxCode[] = [];
    for (const [code, amount] of Object.entries(totals.taxBreakdown)) {
      if (amount > 0) {
        codes.push(code as TaxCode);
      }
    }
    return codes;
  }, [totals.taxBreakdown]);

  const hasMixedTaxCodes = taxCodesUsed.length > 1;
  const hasDiscount = totals.discountCents > 0;

  return (
    <div className="bg-secondary/50 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Subtotal</span>
        <span className="font-medium text-foreground">
          {centsToDisplay(totals.subtotalCents)}
        </span>
      </div>

      {hasDiscount && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Discount</span>
          <span className="font-medium text-green-600">
            -{centsToDisplay(totals.discountCents)}
          </span>
        </div>
      )}

      {/* Tax breakdown - show per-code if mixed, otherwise just total */}
      {hasMixedTaxCodes ? (
        <div className="space-y-2">
          {taxCodesUsed.map((code) => (
            <div key={code} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{TAX_CODE_LABELS[code]}</span>
              <span className="font-medium text-foreground">
                {centsToDisplay(totals.taxBreakdown[code])}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Tax {totals.taxCents > 0 ? "(GST 10%)" : ""}
          </span>
          <span className="font-medium text-foreground">
            {centsToDisplay(totals.taxCents)}
          </span>
        </div>
      )}

      <div className="border-t border-border pt-3 flex items-center justify-between">
        <span className="font-medium text-foreground">Total</span>
        <span className="text-xl font-bold text-foreground">
          {centsToDisplay(totals.totalCents)}
        </span>
      </div>
    </div>
  );
}

/**
 * Legacy InvoiceTotals that still uses the old taxRate approach
 * This is used by forms that haven't migrated to DocumentLineItem yet
 */
interface LegacyInvoiceTotalsProps {
  subtotalCents: number;
  taxRate: number;
  onTaxRateChange: (rate: number) => void;
}

export function LegacyInvoiceTotals({
  subtotalCents,
  taxRate,
  onTaxRateChange,
}: LegacyInvoiceTotalsProps) {
  const taxCents = Math.round(subtotalCents * (taxRate / 100));
  const totalCents = subtotalCents + taxCents;

  return (
    <div className="bg-secondary/50 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Subtotal</span>
        <span className="font-medium text-foreground">
          {centsToDisplay(subtotalCents)}
        </span>
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <label htmlFor="taxRate" className="text-muted-foreground">
            Tax (GST)
          </label>
          <div className="flex items-center">
            <input
              id="taxRate"
              type="number"
              min={0}
              max={100}
              step={0.5}
              value={taxRate}
              onChange={(e) => onTaxRateChange(parseFloat(e.target.value) || 0)}
              className="w-16 h-7 text-center text-xs bg-card border border-input rounded-md px-2"
            />
            <span className="ml-1 text-muted-foreground">%</span>
          </div>
        </div>
        <span className="font-medium text-foreground">
          {centsToDisplay(taxCents)}
        </span>
      </div>

      <div className="border-t border-border pt-3 flex items-center justify-between">
        <span className="font-medium text-foreground">Total</span>
        <span className="text-xl font-bold text-foreground">
          {centsToDisplay(totalCents)}
        </span>
      </div>
    </div>
  );
}
