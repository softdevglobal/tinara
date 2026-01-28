import { useMemo } from "react";
import { Info } from "lucide-react";
import { DocumentLineItem } from "@/lib/line-item-schema";
import { calculateDocumentTotals, TaxCode, TAX_CODE_LABELS } from "@/lib/tax-utils";
import { centsToDisplay } from "@/lib/money-utils";
import { DepositRequest, TaxBreakdownLine } from "@/types/document";
import { TaxCategory, TAX_CATEGORY_LABELS } from "@/types/tax-settings";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface DocumentTotalsPanelProps {
  lineItems: DocumentLineItem[];
  currency?: string;
  pricingMode?: "INCLUSIVE" | "EXCLUSIVE";
  documentDiscount?: {
    type: "percent" | "fixed";
    value: number;
  };
  depositRequest?: DepositRequest;
  paidAmount?: number;
  showDepositSection?: boolean;
}

interface TaxGroupItem {
  name: string;
  category: TaxCategory | TaxCode;
  rate: number;
  taxableCents: number;
  taxCents: number;
  isReverseCharge: boolean;
}

export function DocumentTotalsPanel({
  lineItems,
  currency = "AUD",
  pricingMode = "EXCLUSIVE",
  documentDiscount,
  depositRequest,
  paidAmount = 0,
  showDepositSection = true,
}: DocumentTotalsPanelProps) {
  // Calculate totals with tax grouping
  const { totals, taxGroups, hasReverseCharge, hasMixedRates } = useMemo(() => {
    let subtotalCents = 0;
    let totalDiscountCents = 0;
    let totalTaxCents = 0;
    const taxGroupMap = new Map<string, TaxGroupItem>();
    
    for (const line of lineItems) {
      // Base calculation
      const baseCents = line.qty * line.unitPriceCentsSnapshot;
      subtotalCents += baseCents;
      
      // Discount
      let discountCents = 0;
      if (line.discountType === "PERCENT" && line.discountValue > 0) {
        discountCents = Math.round(baseCents * (line.discountValue / 100));
      } else if (line.discountType === "AMOUNT" && line.discountValue > 0) {
        discountCents = line.discountValue;
      }
      totalDiscountCents += discountCents;
      
      const netCents = Math.max(0, baseCents - discountCents);
      
      // Get tax info - use enhanced fields if available, otherwise fallback
      const taxRate = line.taxRateSnapshot ?? (line.taxCodeSnapshot === "GST" ? 10 : 0);
      const taxName = line.taxNameSnapshot ?? TAX_CODE_LABELS[line.taxCodeSnapshot];
      const isRC = line.isReverseCharge ?? false;
      const taxCategory = line.taxCategorySnapshot ?? (line.taxCodeSnapshot === "GST" ? "STANDARD" : "ZERO");
      
      const effectiveRate = isRC ? 0 : taxRate;
      const taxCents = Math.round(netCents * (effectiveRate / 100));
      totalTaxCents += taxCents;
      
      // Group by tax
      const key = `${taxName}-${taxRate}-${isRC}`;
      if (taxGroupMap.has(key)) {
        const group = taxGroupMap.get(key)!;
        group.taxableCents += netCents;
        group.taxCents += taxCents;
      } else {
        taxGroupMap.set(key, {
          name: taxName,
          category: taxCategory,
          rate: taxRate,
          taxableCents: netCents,
          taxCents,
          isReverseCharge: isRC,
        });
      }
    }
    
    // Apply document-level discount
    let docDiscountCents = 0;
    if (documentDiscount) {
      const netSubtotal = subtotalCents - totalDiscountCents;
      if (documentDiscount.type === "percent") {
        docDiscountCents = Math.round(netSubtotal * (documentDiscount.value / 100));
      } else {
        docDiscountCents = Math.round(documentDiscount.value * 100);
      }
    }
    
    const totalCents = subtotalCents - totalDiscountCents - docDiscountCents + totalTaxCents;
    const groups = Array.from(taxGroupMap.values());
    const uniqueRates = new Set(groups.map(g => g.rate));
    
    return {
      totals: {
        subtotalCents,
        lineDiscountCents: totalDiscountCents,
        documentDiscountCents: docDiscountCents,
        taxCents: totalTaxCents,
        totalCents,
      },
      taxGroups: groups,
      hasReverseCharge: groups.some(g => g.isReverseCharge),
      hasMixedRates: uniqueRates.size > 1,
    };
  }, [lineItems, documentDiscount]);
  
  // Deposit calculations
  const depositAmountCents = useMemo(() => {
    if (!depositRequest) return 0;
    return depositRequest.type === "percent"
      ? Math.round(totals.totalCents * (depositRequest.value / 100))
      : Math.round(depositRequest.value * 100);
  }, [depositRequest, totals.totalCents]);
  
  const paidCents = Math.round(paidAmount * 100);
  const depositPaidCents = depositRequest?.amountPaid ? Math.round(depositRequest.amountPaid * 100) : 0;
  const balanceCents = totals.totalCents - paidCents - depositPaidCents;
  
  const formatAmount = (cents: number) => centsToDisplay(cents, currency);
  
  return (
    <div className="bg-secondary/50 rounded-lg p-4 space-y-3">
      {/* Pricing Mode Indicator */}
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <Info className="h-3 w-3" />
        <span>Prices are {pricingMode === "INCLUSIVE" ? "tax inclusive" : "tax exclusive"}</span>
      </div>
      
      {/* Subtotal */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Subtotal</span>
        <span className="font-medium text-foreground">
          {formatAmount(totals.subtotalCents)}
        </span>
      </div>
      
      {/* Line Discounts */}
      {totals.lineDiscountCents > 0 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Line Discounts</span>
          <span className="font-medium text-green-600">
            -{formatAmount(totals.lineDiscountCents)}
          </span>
        </div>
      )}
      
      {/* Document Discount */}
      {totals.documentDiscountCents > 0 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Discount ({documentDiscount?.type === "percent" ? `${documentDiscount.value}%` : "fixed"})
          </span>
          <span className="font-medium text-green-600">
            -{formatAmount(totals.documentDiscountCents)}
          </span>
        </div>
      )}
      
      {/* Tax Breakdown */}
      <div className="border-t border-border pt-2">
        {hasMixedRates ? (
          // Show itemized breakdown when mixed rates
          <div className="space-y-1">
            {taxGroups.map((group, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="text-muted-foreground cursor-help">
                        {group.name}
                        {group.isReverseCharge && (
                          <span className="ml-1 text-xs text-amber-600">(RC)</span>
                        )}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {group.isReverseCharge
                          ? "Reverse charge applies - customer accounts for tax"
                          : `${group.rate}% on ${formatAmount(group.taxableCents)}`}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <span className={cn(
                  "font-medium",
                  group.isReverseCharge ? "text-muted-foreground" : "text-foreground"
                )}>
                  {group.isReverseCharge ? "€0.00" : formatAmount(group.taxCents)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          // Simple single tax line
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Tax {taxGroups.length > 0 && !hasReverseCharge ? `(${taxGroups[0]?.name || "GST"})` : ""}
              {hasReverseCharge && (
                <span className="ml-1 text-xs text-amber-600">(Reverse Charge)</span>
              )}
            </span>
            <span className="font-medium text-foreground">
              {formatAmount(totals.taxCents)}
            </span>
          </div>
        )}
      </div>
      
      {/* Reverse Charge Note */}
      {hasReverseCharge && (
        <div className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/30 px-2 py-1 rounded">
          VAT reverse charge applies - customer to account for VAT
        </div>
      )}
      
      {/* Total */}
      <div className="border-t border-border pt-3 flex items-center justify-between">
        <span className="font-medium text-foreground">Total</span>
        <span className="text-xl font-bold text-foreground">
          {formatAmount(totals.totalCents)}
        </span>
      </div>
      
      {/* Deposit Section */}
      {showDepositSection && depositRequest && (
        <div className="border-t border-border pt-3 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Deposit Requested
              {depositRequest.type === "percent" && ` (${depositRequest.value}%)`}
            </span>
            <span className="font-medium text-foreground">
              {formatAmount(depositAmountCents)}
            </span>
          </div>
          
          {depositPaidCents > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Deposit Paid</span>
              <span className="font-medium text-green-600">
                -{formatAmount(depositPaidCents)}
              </span>
            </div>
          )}
        </div>
      )}
      
      {/* Paid / Balance */}
      {paidCents > 0 && (
        <div className="border-t border-border pt-3 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Paid</span>
            <span className="font-medium text-green-600">
              -{formatAmount(paidCents)}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="font-medium text-foreground">Balance Due</span>
            <span className={cn(
              "text-lg font-bold",
              balanceCents > 0 ? "text-foreground" : "text-green-600"
            )}>
              {formatAmount(balanceCents)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
