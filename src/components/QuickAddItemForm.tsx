import { useState } from "react";
import { X, Check } from "lucide-react";
import { Item } from "@/data/items";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { dollarsToCents } from "@/lib/money-utils";

interface QuickAddItemFormProps {
  initialName: string;
  onAdd: (item: Item) => void;
  onCancel: () => void;
}

const CATEGORIES: Item["category"][] = ["Services", "Parts", "Labor", "Other"];
const UNITS = ["unit", "hour", "meter", "month", "day", "call", "session", "each"];

export function QuickAddItemForm({
  initialName,
  onAdd,
  onCancel,
}: QuickAddItemFormProps) {
  const { addItem } = useApp();
  const { toast } = useToast();
  
  const [name, setName] = useState(initialName);
  const [unitPrice, setUnitPrice] = useState("");
  const [category, setCategory] = useState<Item["category"]>("Services");
  const [unit, setUnit] = useState("unit");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter an item name.",
        variant: "destructive",
      });
      return;
    }

    const priceValue = parseFloat(unitPrice) || 0;
    
    const newItem: Item = {
      id: `item_${Date.now()}`,
      name: name.trim(),
      category,
      unitPriceCents: dollarsToCents(priceValue),
      unit,
      taxCode: "GST",
      defaultQty: 1,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setIsSubmitting(true);
    addItem(newItem);
    
    toast({
      title: "Item added to catalog",
      description: `"${name}" has been saved and added to this document.`,
    });

    onAdd(newItem);
    setIsSubmitting(false);
  };

  return (
    <div className="border rounded-lg p-4 bg-card shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Add New Item to Catalog</h4>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={onCancel}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <Label htmlFor="item-name" className="text-xs">Name *</Label>
          <Input
            id="item-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Item name"
            className="mt-1"
            autoFocus
          />
        </div>

        <div>
          <Label htmlFor="item-price" className="text-xs">Unit Price</Label>
          <Input
            id="item-price"
            type="number"
            min={0}
            step={0.01}
            value={unitPrice}
            onChange={(e) => setUnitPrice(e.target.value)}
            placeholder="0.00"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="item-unit" className="text-xs">Unit</Label>
          <Select value={unit} onValueChange={setUnit}>
            <SelectTrigger id="item-unit" className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover z-50">
              {UNITS.map((u) => (
                <SelectItem key={u} value={u}>
                  {u}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-2">
          <Label htmlFor="item-category" className="text-xs">Category</Label>
          <Select value={category} onValueChange={(v) => setCategory(v as Item["category"])}>
            <SelectTrigger id="item-category" className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover z-50">
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          type="button" 
          size="sm" 
          onClick={handleSubmit}
          disabled={isSubmitting || !name.trim()}
        >
          <Check className="h-4 w-4 mr-1" />
          Add to Catalog
        </Button>
      </div>
    </div>
  );
}
