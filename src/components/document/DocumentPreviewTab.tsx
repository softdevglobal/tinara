import { format } from "date-fns";
import { DocumentType, ClientSnapshot, DepositRequest } from "@/types/document";
import { DocumentLineItem } from "@/lib/line-item-schema";
import { TAX_RATES } from "@/lib/tax-utils";
import { BrandingSettings } from "@/types/branding";

interface DocumentPreviewTabProps {
  type: DocumentType;
  documentNumber: string;
  clientSnapshot?: ClientSnapshot;
  date: Date;
  dueDate?: Date;
  validUntil?: Date;
  lineItems: DocumentLineItem[];
  currency: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  depositRequest?: DepositRequest;
  clientNotes?: string;
  paymentInstructions?: string;
  brandingSettings?: BrandingSettings;
}

export function DocumentPreviewTab({
  type,
  documentNumber,
  clientSnapshot,
  date,
  dueDate,
  validUntil,
  lineItems,
  currency,
  subtotal,
  discount,
  tax,
  total,
  depositRequest,
  clientNotes,
  paymentInstructions,
  brandingSettings,
}: DocumentPreviewTabProps) {
  const typeLabel = type === "invoice" ? "INVOICE" : "ESTIMATE";

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: currency || "AUD",
    }).format(amount);
  };

  const depositAmount = depositRequest
    ? depositRequest.type === "percent"
      ? (total * depositRequest.value) / 100
      : depositRequest.value
    : 0;

  return (
    <div className="bg-card border rounded-lg overflow-hidden shadow-sm">
      {/* Header with brand color */}
      <div 
        className="h-20 px-8 flex items-center justify-between"
        style={{ 
          background: brandingSettings?.primaryColor 
            ? `linear-gradient(135deg, ${brandingSettings.primaryColor}, ${brandingSettings.primaryColor}dd)`
            : "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.8))"
        }}
      >
        <div className="text-white">
          <h1 className="text-2xl font-bold tracking-wide">{typeLabel}</h1>
        </div>
        <div className="text-white text-right">
          <p className="text-sm opacity-80">#{documentNumber || "NEW"}</p>
          <p className="text-sm opacity-80">{format(date, "dd MMM yyyy")}</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        {/* Client info */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-xs uppercase text-muted-foreground mb-2">Bill To</h3>
            <p className="font-semibold">
              {clientSnapshot?.company || clientSnapshot?.name || "Select a client"}
            </p>
            {clientSnapshot?.email && (
              <p className="text-sm text-muted-foreground">{clientSnapshot.email}</p>
            )}
            {clientSnapshot?.billingAddress && (
              <div className="text-sm text-muted-foreground mt-1">
                {clientSnapshot.billingAddress.street && (
                  <p>{clientSnapshot.billingAddress.street}</p>
                )}
                <p>
                  {[
                    clientSnapshot.billingAddress.city,
                    clientSnapshot.billingAddress.state,
                    clientSnapshot.billingAddress.postcode,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </p>
                <p>{clientSnapshot.billingAddress.country}</p>
              </div>
            )}
          </div>
          <div className="text-right">
            <h3 className="text-xs uppercase text-muted-foreground mb-2">
              {type === "invoice" ? "Due Date" : "Valid Until"}
            </h3>
            <p className="font-semibold">
              {type === "invoice" && dueDate
                ? format(dueDate, "dd MMM yyyy")
                : validUntil
                ? format(validUntil, "dd MMM yyyy")
                : "-"}
            </p>
          </div>
        </div>

        {/* Line items table */}
        <div className="border rounded-lg overflow-hidden mb-8">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left py-3 px-4 font-medium">Description</th>
                <th className="text-center py-3 px-4 font-medium w-20">Qty</th>
                <th className="text-right py-3 px-4 font-medium w-28">Price</th>
                <th className="text-right py-3 px-4 font-medium w-28">Total</th>
              </tr>
            </thead>
            <tbody>
              {lineItems.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-muted-foreground">
                    No items added yet
                  </td>
                </tr>
              ) : (
                lineItems.map((item, index) => {
                  const unitPrice = (item.unitPriceCentsSnapshot ?? 0) / 100;
                  const baseTotal = item.qty * unitPrice;
                  const discountAmt =
                    item.discountType === "PERCENT"
                      ? baseTotal * ((item.discountValue ?? 0) / 100)
                      : (item.discountValue ?? 0) / 100; // Convert cents to dollars
                  const lineTotal = baseTotal - discountAmt;

                  return (
                    <tr key={item.id || index} className="border-t">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{item.nameSnapshot || "-"}</p>
                          {item.descriptionSnapshot && (
                            <p className="text-xs text-muted-foreground">
                              {item.descriptionSnapshot}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="text-center py-3 px-4">{item.qty}</td>
                      <td className="text-right py-3 px-4">
                        {formatCurrency(unitPrice)}
                      </td>
                      <td className="text-right py-3 px-4 font-medium">
                        {formatCurrency(lineTotal)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Discount</span>
                <span className="text-green-600">-{formatCurrency(discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax (GST)</span>
              <span>{formatCurrency(tax)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>

            {depositAmount > 0 && (
              <>
                <div className="flex justify-between text-sm pt-2 border-t text-primary">
                  <span>Deposit Required</span>
                  <span className="font-semibold">{formatCurrency(depositAmount)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Balance Due</span>
                  <span>{formatCurrency(total - depositAmount)}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Notes */}
        {(clientNotes || paymentInstructions) && (
          <div className="mt-8 pt-6 border-t space-y-4">
            {clientNotes && (
              <div>
                <h4 className="text-xs uppercase text-muted-foreground mb-1">Notes</h4>
                <p className="text-sm whitespace-pre-wrap">{clientNotes}</p>
              </div>
            )}
            {paymentInstructions && (
              <div>
                <h4 className="text-xs uppercase text-muted-foreground mb-1">
                  Payment Instructions
                </h4>
                <p className="text-sm whitespace-pre-wrap">{paymentInstructions}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
