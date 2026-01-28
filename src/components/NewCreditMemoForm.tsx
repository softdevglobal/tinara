import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Save, CreditCard, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditMemo, CreditMemoItem } from "@/data/credit-memos";
import { Client } from "@/data/clients";

const creditMemoSchema = z.object({
  clientId: z.string().min(1, "Client is required"),
  comments: z.string().max(500).optional(),
});

type CreditMemoFormData = z.infer<typeof creditMemoSchema>;

interface NewCreditMemoFormProps {
  clients: Client[];
  onSubmit: (creditMemo: CreditMemo) => void;
  onCancel: () => void;
}

export function NewCreditMemoForm({ clients, onSubmit, onCancel }: NewCreditMemoFormProps) {
  const [activeTab, setActiveTab] = useState<"create" | "preview" | "send">("create");
  const [items, setItems] = useState<CreditMemoItem[]>([
    { id: "1", description: "", quantity: 1, unitPrice: 0, total: 0 },
  ]);

  const form = useForm<CreditMemoFormData>({
    resolver: zodResolver(creditMemoSchema),
    defaultValues: {
      clientId: "",
      comments: "",
    },
  });

  const updateItem = (index: number, field: keyof CreditMemoItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    if (field === "quantity" || field === "unitPrice") {
      newItems[index].total = newItems[index].quantity * newItems[index].unitPrice;
    }
    
    setItems(newItems);
  };

  const addItem = () => {
    setItems([
      ...items,
      { id: String(Date.now()), description: "", quantity: 1, unitPrice: 0, total: 0 },
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * 0.1; // 10% GST
  const total = subtotal + tax;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
    }).format(amount);
  };

  const handleSubmit = (data: CreditMemoFormData) => {
    const memoNumber = `CM-${String(Date.now()).slice(-6)}`;
    const now = new Date().toISOString().split("T")[0];
    
    const newMemo: CreditMemo = {
      id: `cm_${Date.now()}`,
      number: memoNumber,
      clientId: data.clientId,
      date: now,
      status: "Draft",
      items: items.filter((item) => item.description && item.total > 0),
      subtotal,
      tax,
      total,
      comments: data.comments || undefined,
    };
    
    onSubmit(newMemo);
  };

  const selectedClient = clients.find((c) => c.id === form.watch("clientId"));

  return (
    <div className="animate-fade-in">
      <button
        onClick={onCancel}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to credit memos
      </button>

      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
          <CreditCard className="h-4 w-4 text-primary-foreground" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">New Credit Memo</h2>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "create" | "preview" | "send")}>
        <TabsList className="mb-6">
          <TabsTrigger value="create">Create</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="send">Send</TabsTrigger>
        </TabsList>

        <TabsContent value="create">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              <div className="invoice-card p-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="clientId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Client *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a client" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {clients.map((client) => (
                                <SelectItem key={client.id} value={client.id}>
                                  {client.company || client.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Line Items */}
                    <div>
                      <FormLabel>Parts and labor</FormLabel>
                      <div className="mt-2 space-y-3">
                        {items.map((item, index) => (
                          <div key={item.id} className="flex gap-3 items-start">
                            <Input
                              placeholder="Description"
                              value={item.description}
                              onChange={(e) => updateItem(index, "description", e.target.value)}
                              className="flex-1"
                            />
                            <Input
                              type="number"
                              placeholder="Qty"
                              value={item.quantity}
                              onChange={(e) => updateItem(index, "quantity", Number(e.target.value))}
                              className="w-20"
                            />
                            <Input
                              type="number"
                              placeholder="Price"
                              value={item.unitPrice}
                              onChange={(e) => updateItem(index, "unitPrice", Number(e.target.value))}
                              className="w-28"
                            />
                            <div className="w-28 text-right pt-2 font-medium">
                              {formatCurrency(item.total)}
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeItem(index)}
                              disabled={items.length === 1}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button type="button" variant="outline" size="sm" onClick={addItem}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Line
                        </Button>
                      </div>
                    </div>

                    <FormField
                      control={form.control}
                      name="comments"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Comments</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Add any notes or comments..."
                              className="min-h-[80px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end gap-3 pt-4 border-t border-border">
                      <Button type="button" variant="outline" onClick={onCancel}>
                        Cancel
                      </Button>
                      <Button type="submit">
                        <Save className="h-4 w-4 mr-2" />
                        Create Credit Memo
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            </div>

            {/* Summary Sidebar */}
            <div className="space-y-4">
              <div className="invoice-card p-4">
                <h3 className="font-medium mb-4">Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Client</span>
                    <span>{selectedClient?.company || selectedClient?.name || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">GST (10%)</span>
                    <span>{formatCurrency(tax)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-base pt-2 border-t">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="preview">
          <div className="invoice-card p-6 text-center text-muted-foreground">
            Preview will show the formatted credit memo document.
          </div>
        </TabsContent>

        <TabsContent value="send">
          <div className="invoice-card p-6 text-center text-muted-foreground">
            Configure email sending options here.
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
