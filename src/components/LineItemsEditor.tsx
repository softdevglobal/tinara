import { Plus, Trash2 } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { InvoiceFormData, LineItem } from "@/lib/invoice-schema";

interface LineItemsEditorProps {
  form: UseFormReturn<InvoiceFormData>;
  lineItems: LineItem[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, field: keyof LineItem, value: string | number) => void;
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
}: LineItemsEditorProps) {
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
          Add Item
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
          return (
            <div
              key={item.id}
              className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-3 rounded-lg bg-secondary/50 items-center"
            >
              <div className="sm:col-span-5">
                <label className="text-xs text-muted-foreground sm:hidden mb-1 block">
                  Description
                </label>
                <Input
                  placeholder="Item description"
                  value={item.description}
                  onChange={(e) => onUpdate(index, "description", e.target.value)}
                  className="bg-card"
                />
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
                  className="bg-card text-center"
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
