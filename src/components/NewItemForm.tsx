import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Package, Wrench, Briefcase, Receipt, TrendingUp } from "lucide-react";
import { itemFormSchema, ItemFormData, UNIT_OPTIONS, CATEGORY_OPTIONS, ITEM_TYPE_OPTIONS } from "@/lib/item-schema";
import { TAX_CODE_LABELS, TaxCode } from "@/lib/tax-utils";
import { centsToDollars, dollarsToCents } from "@/lib/money-utils";
import { Item, calculateMarginPercent } from "@/data/items";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface NewItemFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (item: Item) => void;
  editingItem?: Item | null;
}

export function NewItemForm({
  open,
  onOpenChange,
  onSubmit,
  editingItem,
}: NewItemFormProps) {
  const isEditing = !!editingItem;
  const [customUnit, setCustomUnit] = useState("");
  const [showCustomUnit, setShowCustomUnit] = useState(false);

  const form = useForm<ItemFormData>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "Services",
      itemType: "service",
      unitPriceCents: 0,
      costCents: 0,
      unit: "unit",
      taxCode: "GST",
      defaultQty: 1,
      sku: "",
      supplier: "",
      stockOnHand: 0,
      reorderThreshold: undefined,
    },
  });

  const selectedItemType = form.watch("itemType");
  const isProduct = selectedItemType === "product";
  const watchedPrice = form.watch("unitPriceCents");
  const watchedCost = form.watch("costCents");
  const margin = calculateMarginPercent(watchedPrice, watchedCost);

  // Reset form when opening or when editingItem changes
  useEffect(() => {
    if (open) {
      if (editingItem) {
        const isStandardUnit = UNIT_OPTIONS.some(u => u.value === editingItem.unit);
        setShowCustomUnit(!isStandardUnit);
        setCustomUnit(!isStandardUnit ? editingItem.unit : "");

        form.reset({
          name: editingItem.name,
          description: editingItem.description || "",
          category: editingItem.category,
          itemType: editingItem.itemType,
          unitPriceCents: editingItem.unitPriceCents,
          costCents: editingItem.costCents ?? 0,
          unit: isStandardUnit ? editingItem.unit : "custom",
          taxCode: editingItem.taxCode,
          defaultQty: editingItem.defaultQty,
          sku: editingItem.sku || "",
          supplier: editingItem.supplier || "",
          stockOnHand: editingItem.stockOnHand ?? 0,
          reorderThreshold: editingItem.reorderThreshold,
        });
      } else {
        setShowCustomUnit(false);
        setCustomUnit("");
        form.reset({
          name: "",
          description: "",
          category: "Services",
          itemType: "service",
          unitPriceCents: 0,
          costCents: 0,
          unit: "unit",
          taxCode: "GST",
          defaultQty: 1,
          sku: "",
          supplier: "",
          stockOnHand: 0,
          reorderThreshold: undefined,
        });
      }
    }
  }, [open, editingItem, form]);

  const handleUnitChange = (value: string) => {
    if (value === "custom") {
      setShowCustomUnit(true);
      form.setValue("unit", customUnit || "custom");
    } else {
      setShowCustomUnit(false);
      setCustomUnit("");
      form.setValue("unit", value);
    }
  };

  const handleFormSubmit = (data: ItemFormData) => {
    const now = new Date().toISOString();
    const finalUnit = showCustomUnit && customUnit ? customUnit : data.unit;

    const item: Item = {
      id: editingItem?.id || Math.random().toString(36).substring(2, 9),
      name: data.name,
      description: data.description || undefined,
      category: data.category,
      itemType: data.itemType,
      unitPriceCents: data.unitPriceCents,
      costCents: data.costCents,
      unit: finalUnit,
      taxCode: data.taxCode,
      defaultQty: data.defaultQty,
      sku: data.sku || undefined,
      supplier: data.supplier || undefined,
      stockOnHand: data.itemType === "product" ? data.stockOnHand : 0,
      reorderThreshold: data.itemType === "product" ? data.reorderThreshold : undefined,
      isActive: editingItem?.isActive ?? true,
      lastUsedAt: editingItem?.lastUsedAt,
      createdAt: editingItem?.createdAt || now,
      updatedAt: now,
    };

    onSubmit(item);
    onOpenChange(false);
  };

  const itemTypeIcon = (type: string) => {
    switch (type) {
      case "product": return <Package className="h-3.5 w-3.5" />;
      case "labor": return <Wrench className="h-3.5 w-3.5" />;
      case "service": return <Briefcase className="h-3.5 w-3.5" />;
      case "fee": return <Receipt className="h-3.5 w-3.5" />;
      default: return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Item" : "New Item"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Changes apply to future invoices/quotes only. Existing documents are not affected."
              : "Add a product or service to your catalog. Products track inventory; services do not."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
            {/* --- Basic info --- */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Consultation Hour" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Optional description for this item"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="itemType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ITEM_TYPE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            <span className="flex items-center gap-2">
                              {itemTypeIcon(opt.value)}
                              {opt.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CATEGORY_OPTIONS.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="taxCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tax *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select tax" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(Object.entries(TAX_CODE_LABELS) as [TaxCode, string][]).map(([code, label]) => (
                          <SelectItem key={code} value={code}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* --- Pricing --- */}
            <div>
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Pricing & Margin
              </h4>
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="unitPriceCents"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sell Price *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                          <Input
                            type="number"
                            min={0}
                            step={0.01}
                            placeholder="0.00"
                            className="pl-7"
                            value={centsToDollars(field.value)}
                            onChange={(e) => {
                              const dollars = parseFloat(e.target.value) || 0;
                              field.onChange(dollarsToCents(dollars));
                            }}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="costCents"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cost</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                          <Input
                            type="number"
                            min={0}
                            step={0.01}
                            placeholder="0.00"
                            className="pl-7"
                            value={centsToDollars(field.value)}
                            onChange={(e) => {
                              const dollars = parseFloat(e.target.value) || 0;
                              field.onChange(dollarsToCents(dollars));
                            }}
                          />
                        </div>
                      </FormControl>
                      <FormDescription className="text-xs">For margin tracking</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormItem>
                  <FormLabel>Margin</FormLabel>
                  <div className="h-10 flex items-center px-3 rounded-md border bg-muted/40 text-sm font-medium">
                    {margin === null ? (
                      <span className="text-muted-foreground">—</span>
                    ) : (
                      <span className={margin < 20 ? "text-amber-600" : "text-green-600"}>
                        {margin.toFixed(1)}%
                      </span>
                    )}
                  </div>
                  <FormDescription className="text-xs">Auto-calculated</FormDescription>
                </FormItem>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit *</FormLabel>
                    <Select
                      onValueChange={handleUnitChange}
                      value={showCustomUnit ? "custom" : field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {UNIT_OPTIONS.map((unit) => (
                          <SelectItem key={unit.value} value={unit.value}>
                            {unit.label}
                          </SelectItem>
                        ))}
                        <SelectItem value="custom">Custom...</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="defaultQty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Quantity</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">Pre-filled when adding to documents</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {showCustomUnit && (
              <FormItem>
                <FormLabel>Custom Unit</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. piece, box, roll"
                    value={customUnit}
                    onChange={(e) => {
                      setCustomUnit(e.target.value);
                      form.setValue("unit", e.target.value || "custom");
                    }}
                  />
                </FormControl>
              </FormItem>
            )}

            {/* --- Inventory (products only) --- */}
            {isProduct && (
              <>
                <Separator />
                <div>
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Package className="h-4 w-4 text-primary" />
                    Inventory Tracking
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="sku"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SKU / Code</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. CAM-001" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="supplier"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Supplier</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Acme Supply" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="stockOnHand"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Stock on Hand</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              step={1}
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormDescription className="text-xs">
                            {isEditing ? "Use Adjust Stock for ongoing changes" : "Opening stock level"}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="reorderThreshold"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reorder Threshold</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              step={1}
                              placeholder="Optional"
                              value={field.value ?? ""}
                              onChange={(e) => {
                                const v = e.target.value;
                                field.onChange(v === "" ? undefined : parseFloat(v) || 0);
                              }}
                            />
                          </FormControl>
                          <FormDescription className="text-xs">Alert when stock falls to this level</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {isEditing ? "Save Changes" : "Add Item"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
