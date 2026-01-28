import { Plus, Trash2, Link } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { InvoiceFormData, LineItem } from "@/lib/invoice-schema";
import { ItemPicker } from "@/components/ItemPicker";
import { Item } from "@/data/items";
import { centsToDollars } from "@/lib/money-utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Extended line item that can track source item
interface ExtendedLineItem extends LineItem {
  sourceItemId?: string;
  unit?: string;
}

interface LineItemsEditorProps {
  form: UseFormReturn<InvoiceFormData>;
  lineItems: LineItem[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, field: keyof LineItem, value: string | number) => void;
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
  
  const handleCatalogSelect = (item: Item) => {
    if (onAddFromCatalog) {
      onAddFromCatalog(item);
    } else {
      // Fallback: add as regular line item with catalog values
      onAdd();
      const newIndex = lineItems.length;
      onUpdate(newIndex, "description", item.name);
      onUpdate(newIndex, "quantity", item.defaultQty);
      onUpdate(newIndex, "unitPrice", centsToDollars(item.unitPriceCents));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">Line Items</h3>
        <div className="flex items-center gap-2">
          <ItemPicker onSelect={handleCatalogSelect} />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onAdd}
            className="h-8"
          >
            <Plus className="h-4 w-4 mr-1" />
            Manual
          </Button>
        </div>
      </div>

      {/* Header */}
      <div className="hidden sm:grid sm:grid-cols-12 gap-3 text-xs font-medium text-muted-foreground uppercase tracking-wider px-1">
        <div className="col-span-5">Description</div>
        <div className="col-span-2 text-center">Qty</div>
        <div className="col-span-2 text-right">Unit Price</div>
        <div className="col-span-2 text-right">Total</div>
        <div className="col-span-1"></div>
      </div>

      {/* Items */}
      <div className="space-y-3">
        {lineItems.map((item, index) => {
          const lineTotal = item.quantity * item.unitPrice;
          const extendedItem = item as ExtendedLineItem;
          const isFromCatalog = !!extendedItem.sourceItemId;
          const hasDescriptionError = showValidationErrors && !item.description.trim();
          const hasQuantityError = showValidationErrors && item.quantity <= 0;
          
          return (
            <div
              key={item.id}
              className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-3 rounded-lg bg-secondary/50 items-center"
            >
              <div className="sm:col-span-5">
                <label className="text-xs text-muted-foreground sm:hidden mb-1 block">
                  Description
                </label>
                <div className="relative">
                  <Input
                    placeholder="Item description"
                    value={item.description}
                    onChange={(e) => onUpdate(index, "description", e.target.value)}
                    className={`bg-card pr-8 ${hasDescriptionError ? "border-destructive focus-visible:ring-destructive" : ""}`}
                  />
                  {isFromCatalog && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="absolute right-2 top-1/2 -translate-y-1/2">
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
              <div className="sm:col-span-2">
                <label className="text-xs text-muted-foreground sm:hidden mb-1 block">
                  Quantity
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
          );
        })}
      </div>
    </div>
  );
}
