import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { itemFormSchema, ItemFormData, UNIT_OPTIONS, CATEGORY_OPTIONS } from "@/lib/item-schema";
import { TAX_CODE_LABELS, TaxCode } from "@/lib/tax-utils";
import { centsToDollars, dollarsToCents } from "@/lib/money-utils";
import { Item } from "@/data/items";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
      unitPriceCents: 0,
      unit: "unit",
      taxCode: "GST",
      defaultQty: 1,
      sku: "",
    },
  });

  const selectedCategory = form.watch("category");

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
          unitPriceCents: editingItem.unitPriceCents,
          unit: isStandardUnit ? editingItem.unit : "custom",
          taxCode: editingItem.taxCode,
          defaultQty: editingItem.defaultQty,
          sku: editingItem.sku || "",
        });
      } else {
        setShowCustomUnit(false);
        setCustomUnit("");
        form.reset({
          name: "",
          description: "",
          category: "Services",
          unitPriceCents: 0,
          unit: "unit",
          taxCode: "GST",
          defaultQty: 1,
          sku: "",
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
      unitPriceCents: data.unitPriceCents,
      unit: finalUnit,
      taxCode: data.taxCode,
      defaultQty: data.defaultQty,
      sku: data.sku || undefined,
      isActive: editingItem?.isActive ?? true,
      createdAt: editingItem?.createdAt || now,
      updatedAt: now,
    };

    onSubmit(item);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Item" : "New Item"}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Changes apply to future invoices/estimates only. Existing documents are not affected."
              : "Add a product or service to your catalog. You can use it when creating invoices and estimates."
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
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

            <div className="grid grid-cols-2 gap-4">
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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="unitPriceCents"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit Price *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          $
                        </span>
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

            <div className="grid grid-cols-2 gap-4">
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
                    <FormDescription className="text-xs">
                      Pre-filled when adding to documents
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedCategory === "Parts" && (
                <FormField
                  control={form.control}
                  name="sku"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SKU</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. CAM-001" {...field} />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Stock keeping unit
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
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
