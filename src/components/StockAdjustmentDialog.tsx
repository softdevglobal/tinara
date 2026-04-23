import { useState, useMemo, useEffect } from "react";
import { Package, ArrowUp, ArrowDown, Plus, Minus, RefreshCw, Search, ShoppingCart, RotateCcw, PackagePlus, Sparkles, Settings2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Item, InventoryMovement } from "@/data/items";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { format } from "date-fns";

const adjustmentSchema = z.object({
  direction: z.enum(["add", "remove", "set"]),
  qty: z.number().min(0.0001, "Quantity must be positive"),
  reason: z.string().min(1, "Reason is required").max(200),
});

type AdjustmentFormData = z.infer<typeof adjustmentSchema>;

interface StockAdjustmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: Item | null;
  movements: InventoryMovement[];
  onAdjust: (itemId: string, qtyDelta: number, reason: string) => void;
  initialTab?: "adjust" | "history";
}

export function StockAdjustmentDialog({
  open,
  onOpenChange,
  item,
  movements,
  onAdjust,
  initialTab = "adjust",
}: StockAdjustmentDialogProps) {
  const [tab, setTab] = useState<"adjust" | "history">(initialTab);
  const [historySearch, setHistorySearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | InventoryMovement["movementType"]>("all");

  // Reset tab whenever the dialog opens with a new item / requested tab
  useEffect(() => {
    if (open) {
      setTab(initialTab);
      setHistorySearch("");
      setTypeFilter("all");
    }
  }, [open, initialTab, item?.id]);

  const form = useForm<AdjustmentFormData>({
    resolver: zodResolver(adjustmentSchema),
    defaultValues: {
      direction: "add",
      qty: 1,
      reason: "",
    },
  });

  const itemMovements = useMemo(() => {
    if (!item) return [];
    return movements
      .filter((m) => m.itemId === item.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [item, movements]);

  if (!item) return null;

  const handleSubmit = (data: AdjustmentFormData) => {
    let delta = 0;
    if (data.direction === "add") delta = data.qty;
    else if (data.direction === "remove") delta = -data.qty;
    else delta = data.qty - item.stockOnHand; // set absolute → compute delta

    onAdjust(item.id, delta, data.reason);
    form.reset({ direction: "add", qty: 1, reason: "" });
    onOpenChange(false);
  };

  const movementMeta = (type: InventoryMovement["movementType"]) => {
    switch (type) {
      case "sale":
        return { label: "Sale", Icon: ShoppingCart, tone: "bg-blue-500/10 text-blue-600" };
      case "restock":
        return { label: "Restock", Icon: PackagePlus, tone: "bg-green-500/10 text-green-600" };
      case "return":
        return { label: "Return", Icon: RotateCcw, tone: "bg-purple-500/10 text-purple-600" };
      case "initial":
        return { label: "Opening stock", Icon: Sparkles, tone: "bg-muted text-muted-foreground" };
      case "adjustment":
      default:
        return { label: "Adjustment", Icon: Settings2, tone: "bg-amber-500/10 text-amber-600" };
    }
  };

  const filteredMovements = itemMovements.filter((m) => {
    if (typeFilter !== "all" && m.movementType !== typeFilter) return false;
    if (historySearch.trim()) {
      const q = historySearch.toLowerCase();
      if (!m.reason?.toLowerCase().includes(q) && !m.referenceId?.toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  const totals = itemMovements.reduce(
    (acc, m) => {
      if (m.qtyDelta > 0) acc.in += m.qtyDelta;
      else acc.out += Math.abs(m.qtyDelta);
      return acc;
    },
    { in: 0, out: 0 }
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={tab === "history" ? "sm:max-w-2xl" : "sm:max-w-lg"}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            {item.name}
          </DialogTitle>
          <DialogDescription>
            Current stock: <span className="font-semibold text-foreground">{item.stockOnHand}</span> {item.unit}
            {item.sku && <> · SKU {item.sku}</>}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="adjust">Adjust Stock</TabsTrigger>
            <TabsTrigger value="history">Movement History ({itemMovements.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="adjust" className="pt-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="direction"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adjustment Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="add">
                            <span className="flex items-center gap-2"><Plus className="h-3.5 w-3.5 text-green-600" /> Add stock (e.g. restock)</span>
                          </SelectItem>
                          <SelectItem value="remove">
                            <span className="flex items-center gap-2"><Minus className="h-3.5 w-3.5 text-amber-600" /> Remove stock (e.g. damaged)</span>
                          </SelectItem>
                          <SelectItem value="set">
                            <span className="flex items-center gap-2"><RefreshCw className="h-3.5 w-3.5 text-primary" /> Set absolute level (stocktake)</span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="qty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{form.watch("direction") === "set" ? "New stock level" : "Quantity"}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          step="any"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Unit: {item.unit}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reason *</FormLabel>
                      <FormControl>
                        <Textarea rows={2} placeholder="e.g. Restock from supplier, damaged in transit, stocktake correction…" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2 pt-2 border-t">
                  <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Record adjustment</Button>
                </div>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="history" className="pt-4 space-y-3">
            {itemMovements.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No movements recorded yet.
              </div>
            ) : (
              <>
                {/* Summary chips */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-md border bg-card p-3">
                    <div className="text-xs text-muted-foreground">Total in</div>
                    <div className="text-lg font-semibold text-green-600 flex items-center gap-1">
                      <ArrowUp className="h-4 w-4" />+{totals.in}
                    </div>
                  </div>
                  <div className="rounded-md border bg-card p-3">
                    <div className="text-xs text-muted-foreground">Total out</div>
                    <div className="text-lg font-semibold text-amber-600 flex items-center gap-1">
                      <ArrowDown className="h-4 w-4" />−{totals.out}
                    </div>
                  </div>
                  <div className="rounded-md border bg-card p-3">
                    <div className="text-xs text-muted-foreground">Movements</div>
                    <div className="text-lg font-semibold">{itemMovements.length}</div>
                  </div>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      value={historySearch}
                      onChange={(e) => setHistorySearch(e.target.value)}
                      placeholder="Search reason or reference…"
                      className="pl-8 h-9"
                    />
                  </div>
                  <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as typeof typeFilter)}>
                    <SelectTrigger className="w-[160px] h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All types</SelectItem>
                      <SelectItem value="adjustment">Adjustment</SelectItem>
                      <SelectItem value="sale">Sale</SelectItem>
                      <SelectItem value="restock">Restock</SelectItem>
                      <SelectItem value="return">Return</SelectItem>
                      <SelectItem value="initial">Opening stock</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <ScrollArea className="h-[340px] pr-3">
                  {filteredMovements.length === 0 ? (
                    <div className="py-8 text-center text-sm text-muted-foreground">
                      No movements match your filters.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredMovements.map((m) => {
                        const meta = movementMeta(m.movementType);
                        const isPositive = m.qtyDelta > 0;
                        return (
                          <div key={m.id} className="flex items-start gap-3 p-3 rounded-md border bg-card">
                            <div className={`h-8 w-8 shrink-0 rounded-md flex items-center justify-center ${meta.tone}`}>
                              <meta.Icon className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                  <Badge variant="outline" className="text-xs font-normal">
                                    {meta.label}
                                  </Badge>
                                  <span className={`text-sm font-semibold ${isPositive ? "text-green-600" : "text-amber-600"}`}>
                                    {isPositive ? "+" : ""}{m.qtyDelta} {item.unit}
                                  </span>
                                </div>
                                <span className="text-xs text-muted-foreground shrink-0">
                                  {format(new Date(m.createdAt), "PP · p")}
                                </span>
                              </div>
                              {m.reason && (
                                <p className="text-sm text-foreground/80 mt-1.5">{m.reason}</p>
                              )}
                              {m.referenceType && m.referenceId && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Linked to {m.referenceType}: <span className="font-mono">{m.referenceId}</span>
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </ScrollArea>
              </>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

