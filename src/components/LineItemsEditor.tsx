import { useState } from "react";
import { Plus, Trash2, Link, ChevronDown, ChevronUp } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { InvoiceFormData, LineItem } from "@/lib/invoice-schema";
import { SmartItemInput } from "@/components/SmartItemInput";
import { QuickAddItemForm } from "@/components/QuickAddItemForm";
import { Item } from "@/data/items";
import { centsToDollars } from "@/lib/money-utils";
import { TaxCode, TAX_CODE_LABELS, TAX_RATES } from "@/lib/tax-utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

// Note: LineItem from invoice-schema now includes all extended fields
// This type alias is kept for backwards compatibility
type ExtendedLineItem = LineItem;

interface LineItemsEditorProps {
  form: UseFormReturn<InvoiceFormData>;
  lineItems: LineItem[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, field: keyof LineItem, value: LineItem[keyof LineItem]) => void;
  onAddFromCatalog?: (item: Item) => void;
  showValidationErrors?: boolean;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function LineItemsEditor({
  lineItems,
  onAdd,
  onRemove,
  onUpdate,
  onAddFromCatalog,
  showValidationErrors = false,
}: LineItemsEditorProps) {
  const [quickAddIndex, setQuickAddIndex] = useState<number | null>(null);
  const [quickAddName, setQuickAddName] = useState("");
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const toggleRowExpanded = (index: number) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const handleItemSelect = (index: number, item: Item) => {
    // Auto-fill from selected catalog item including extended properties
    onUpdate(index, "description", item.name);
    onUpdate(index, "unitPrice", centsToDollars(item.unitPriceCents));
    onUpdate(index, "quantity", item.defaultQty);
    onUpdate(index, "itemCode", item.sku || "");
    onUpdate(index, "sourceItemId", item.id);
    onUpdate(index, "unit", item.unit);
    onUpdate(index, "taxCode", item.taxCode || "NONE");
    onUpdate(index, "itemType", item.category === "Labor" ? "labor" : "parts");
  };

  const handleAddNewItem = (index: number, searchText: string) => {
    setQuickAddIndex(index);
    setQuickAddName(searchText);
  };

  const handleQuickAddComplete = (index: number, item: Item) => {
    // Populate line item with the newly created item including extended properties
    onUpdate(index, "description", item.name);
    onUpdate(index, "unitPrice", centsToDollars(item.unitPriceCents));
    onUpdate(index, "quantity", item.defaultQty);
    onUpdate(index, "itemCode", item.sku || "");
    onUpdate(index, "sourceItemId", item.id);
    onUpdate(index, "unit", item.unit);
    onUpdate(index, "taxCode", item.taxCode || "NONE");
    onUpdate(index, "itemType", item.category === "Labor" ? "labor" : "parts");
    setQuickAddIndex(null);
    setQuickAddName("");
  };

  const handleQuickAddCancel = () => {
    setQuickAddIndex(null);
    setQuickAddName("");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">Line Items</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onAdd}
          className="h-8"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Line
        </Button>
      </div>

      {/* Header */}
      <div className="hidden sm:grid sm:grid-cols-12 gap-3 text-xs font-medium text-muted-foreground uppercase tracking-wider px-1">
        <div className="col-span-2">Item Code</div>
        <div className="col-span-4">Description</div>
        <div className="col-span-1 text-center">Qty</div>
        <div className="col-span-2 text-right">Unit Price</div>
        <div className="col-span-2 text-right">Total</div>
        <div className="col-span-1"></div>
      </div>

      {/* Items */}
      <div className="space-y-3">
        {lineItems.map((item, index) => {
          const extendedItem = item as ExtendedLineItem;
          const isFromCatalog = !!extendedItem.sourceItemId;
          const hasDescriptionError = showValidationErrors && !item.description.trim();
          const hasQuantityError = showValidationErrors && item.quantity <= 0;
          const isQuickAddOpen = quickAddIndex === index;
          const isExpanded = expandedRows.has(index);
          
          // Calculate line total with tax and discount
          const baseTotal = item.quantity * item.unitPrice;
          const discountAmount = extendedItem.discountType === "PERCENT" 
            ? baseTotal * ((extendedItem.discountValue || 0) / 100)
            : (extendedItem.discountValue || 0);
          const netAmount = Math.max(0, baseTotal - discountAmount);
          const taxRate = TAX_RATES[extendedItem.taxCode || "NONE"];
          const taxAmount = netAmount * taxRate;
          const lineTotal = netAmount + taxAmount;
          
          return (
            <div key={item.id} className="space-y-0">
              <div
                className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-3 rounded-t-lg bg-secondary/50 items-center"
              >
                {/* Item Code */}
                <div className="sm:col-span-2">
                  <label className="text-xs text-muted-foreground sm:hidden mb-1 block">
                    Item Code
                  </label>
                  <Input
                    placeholder="SKU/Code"
                    value={extendedItem.itemCode || ""}
                    onChange={(e) => onUpdate(index, "itemCode", e.target.value)}
                    className="bg-card text-sm"
                  />
                </div>
                {/* Description */}
                <div className="sm:col-span-4">
                  <label className="text-xs text-muted-foreground sm:hidden mb-1 block">
                    Description
                  </label>
                  <div className="relative">
                    <SmartItemInput
                      value={item.description}
                      onChange={(value) => onUpdate(index, "description", value)}
                      onItemSelect={(catalogItem) => handleItemSelect(index, catalogItem)}
                      onAddNewItem={(searchText) => handleAddNewItem(index, searchText)}
                      placeholder="Type item name or code..."
                      className={`bg-card ${isFromCatalog ? "pr-8" : ""}`}
                      hasError={hasDescriptionError}
                    />
                    {isFromCatalog && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                              <Link className="h-3.5 w-3.5 text-muted-foreground" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">
                              From catalog{extendedItem.unit ? ` • per ${extendedItem.unit}` : ""}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </div>
                {/* Quantity */}
                <div className="sm:col-span-1">
                  <label className="text-xs text-muted-foreground sm:hidden mb-1 block">
                    Qty
                  </label>
                  <Input
                    type="number"
                    min={1}
                    placeholder="1"
                    value={item.quantity || ""}
                    onChange={(e) =>
                      onUpdate(index, "quantity", parseInt(e.target.value) || 0)
                    }
                    className={`bg-card text-center ${hasQuantityError ? "border-destructive focus-visible:ring-destructive" : ""}`}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs text-muted-foreground sm:hidden mb-1 block">
                    Unit Price
                  </label>
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    placeholder="0.00"
                    value={item.unitPrice || ""}
                    onChange={(e) =>
                      onUpdate(index, "unitPrice", parseFloat(e.target.value) || 0)
                    }
                    className="bg-card text-right"
                  />
                </div>
                <div className="sm:col-span-2 text-right">
                  <label className="text-xs text-muted-foreground sm:hidden mb-1 block">
                    Total
                  </label>
                  <span className="font-medium text-foreground">
                    {formatCurrency(lineTotal)}
                  </span>
                </div>
                <div className="sm:col-span-1 flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemove(index)}
                    disabled={lineItems.length === 1}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* GST, Parts/Labor, Discount - Collapsible */}
              <Collapsible open={isExpanded} onOpenChange={() => toggleRowExpanded(index)}>
                <CollapsibleTrigger asChild>
                  <button
                    type="button"
                    className="w-full flex items-center gap-1 px-3 py-1.5 text-xs text-primary hover:text-primary/80 bg-secondary/30 rounded-b-lg border-t border-border/50 transition-colors"
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-3 w-3" />
                    ) : (
                      <ChevronDown className="h-3 w-3" />
                    )}
                    <span>GST, parts or labor, discount</span>
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-3 py-3 bg-secondary/20 rounded-b-lg border-t border-border/30 space-y-3">
                    {/* GST Row */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={`gst-${index}`}
                          checked={extendedItem.taxCode === "GST"}
                          onCheckedChange={(checked) => {
                            onUpdate(index, "taxCode" as keyof LineItem, checked ? "GST" : "NONE");
                          }}
                        />
                        <label htmlFor={`gst-${index}`} className="text-sm cursor-pointer">
                          GST
                        </label>
                      </div>
                      <Select
                        value={extendedItem.taxCode === "GST" ? "10" : "0"}
                        onValueChange={(value) => {
                          if (value === "10") {
                            onUpdate(index, "taxCode" as keyof LineItem, "GST");
                          } else {
                            onUpdate(index, "taxCode" as keyof LineItem, "NONE");
                          }
                        }}
                        disabled={extendedItem.taxCode !== "GST"}
                      >
                        <SelectTrigger className="w-20 h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10">10%</SelectItem>
                          <SelectItem value="0">0%</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Parts or Labor Row */}
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground w-24">Parts or labor</span>
                      <Select
                        value={extendedItem.itemType || "parts"}
                        onValueChange={(value) => {
                          onUpdate(index, "itemType" as keyof LineItem, value);
                        }}
                      >
                        <SelectTrigger className="w-24 h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="parts">Parts</SelectItem>
                          <SelectItem value="labor">Labor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Discount Row */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={`discount-${index}`}
                          checked={(extendedItem.discountValue || 0) > 0}
                          onCheckedChange={(checked) => {
                            if (!checked) {
                              onUpdate(index, "discountValue" as keyof LineItem, 0);
                            }
                          }}
                        />
                        <label htmlFor={`discount-${index}`} className="text-sm cursor-pointer">
                          Discount
                        </label>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant={extendedItem.discountType === "PERCENT" ? "default" : "outline"}
                          size="sm"
                          className="h-7 w-7 p-0 text-xs"
                          onClick={() => onUpdate(index, "discountType" as keyof LineItem, "PERCENT")}
                        >
                          %
                        </Button>
                        <Button
                          type="button"
                          variant={extendedItem.discountType === "AMOUNT" ? "default" : "outline"}
                          size="sm"
                          className="h-7 w-7 p-0 text-xs"
                          onClick={() => onUpdate(index, "discountType" as keyof LineItem, "AMOUNT")}
                        >
                          $
                        </Button>
                      </div>
                      <Input
                        type="number"
                        min={0}
                        step={extendedItem.discountType === "PERCENT" ? 1 : 0.01}
                        max={extendedItem.discountType === "PERCENT" ? 100 : undefined}
                        placeholder="0"
                        value={extendedItem.discountValue || ""}
                        onChange={(e) => {
                          onUpdate(index, "discountValue" as keyof LineItem, parseFloat(e.target.value) || 0);
                        }}
                        className="w-20 h-8 text-xs text-right"
                      />
                      {extendedItem.discountType === "PERCENT" && (
                        <span className="text-xs text-muted-foreground">%</span>
                      )}
                    </div>

                    {/* Summary of adjustments */}
                    {(taxAmount > 0 || discountAmount > 0) && (
                      <div className="pt-2 border-t border-border/30 text-xs text-muted-foreground space-y-1">
                        {discountAmount > 0 && (
                          <div className="flex justify-between">
                            <span>Discount:</span>
                            <span className="text-destructive">-{formatCurrency(discountAmount)}</span>
                          </div>
                        )}
                        {taxAmount > 0 && (
                          <div className="flex justify-between">
                            <span>GST (10%):</span>
                            <span>{formatCurrency(taxAmount)}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Quick Add Form - appears below the line item */}
              {isQuickAddOpen && (
                <div className="ml-0 sm:ml-3 mt-2">
                  <QuickAddItemForm
                    initialName={quickAddName}
                    onAdd={(newItem) => handleQuickAddComplete(index, newItem)}
                    onCancel={handleQuickAddCancel}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
