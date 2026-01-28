import { useState } from "react";
import { Plus, Trash2, Link } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InvoiceFormData, LineItem } from "@/lib/invoice-schema";
import { SmartItemInput } from "@/components/SmartItemInput";
import { QuickAddItemForm } from "@/components/QuickAddItemForm";
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
  const [quickAddIndex, setQuickAddIndex] = useState<number | null>(null);
  const [quickAddName, setQuickAddName] = useState("");

  const handleItemSelect = (index: number, item: Item) => {
    // Auto-fill from selected catalog item
    onUpdate(index, "description", item.name);
    onUpdate(index, "unitPrice", centsToDollars(item.unitPriceCents));
    onUpdate(index, "quantity", item.defaultQty);
    
    // Also set extended properties if callback provided
    if (onAddFromCatalog) {
      // The onAddFromCatalog adds a new item, but we want to update existing
      // So we'll handle it through onUpdate for the core fields
    }
  };

  const handleAddNewItem = (index: number, searchText: string) => {
    setQuickAddIndex(index);
    setQuickAddName(searchText);
  };

  const handleQuickAddComplete = (index: number, item: Item) => {
    // Populate line item with the newly created item
    onUpdate(index, "description", item.name);
    onUpdate(index, "unitPrice", centsToDollars(item.unitPriceCents));
    onUpdate(index, "quantity", item.defaultQty);
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
          const isQuickAddOpen = quickAddIndex === index;
          
          return (
            <div key={item.id} className="space-y-2">
              <div
                className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-3 rounded-lg bg-secondary/50 items-center"
              >
                <div className="sm:col-span-5">
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

              {/* Quick Add Form - appears below the line item */}
              {isQuickAddOpen && (
                <div className="ml-0 sm:ml-3">
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
