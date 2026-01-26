import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, ArrowLeft, Send, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { quoteFormSchema, QuoteFormData, QuoteLineItem } from "@/lib/quote-schema";
import { Quote } from "@/data/quotes";
import { Client } from "@/data/clients";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { LineItemsEditor } from "./LineItemsEditor";
import { InvoiceTotals } from "./InvoiceTotals";
import { ClientSelector } from "./ClientSelector";
import { NewClientForm } from "./NewClientForm";
import { useToast } from "@/hooks/use-toast";

interface NewQuoteFormProps {
  onBack: () => void;
  onSubmit: (data: QuoteFormData) => void;
  editingQuote?: Quote;
  clients: Client[];
  onAddClient: (client: Client) => void;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

const defaultLineItem = (): QuoteLineItem => ({
  id: generateId(),
  description: "",
  quantity: 1,
  unitPrice: 0,
});

export function NewQuoteForm({ 
  onBack, 
  onSubmit, 
  editingQuote,
  clients,
  onAddClient,
}: NewQuoteFormProps) {
  const { toast } = useToast();
  const isEditing = !!editingQuote;
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const getInitialLineItems = (): QuoteLineItem[] => {
    if (editingQuote) {
      return [{
        id: generateId(),
        description: editingQuote.projectName || "Services",
        quantity: 1,
        unitPrice: editingQuote.total,
      }];
    }
    return [defaultLineItem()];
  };

  const [lineItems, setLineItems] = useState<QuoteLineItem[]>(getInitialLineItems);
  const [taxRate, setTaxRate] = useState(editingQuote ? 0 : 10);

  const form = useForm<QuoteFormData>({
    resolver: zodResolver(quoteFormSchema),
    defaultValues: {
      clientName: editingQuote?.clientName || "",
      clientEmail: "",
      projectName: editingQuote?.projectName || "",
      issueDate: editingQuote ? new Date(editingQuote.date) : new Date(),
      validUntil: editingQuote 
        ? new Date(editingQuote.validUntil) 
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      lineItems: getInitialLineItems(),
      taxRate: editingQuote ? 0 : 10,
      notes: "",
    },
  });

  useEffect(() => {
    if (editingQuote) {
      const matchingClient = clients.find(
        (c) => c.company === editingQuote.clientName || c.name === editingQuote.clientName
      );
      if (matchingClient) {
        setSelectedClient(matchingClient);
        form.setValue("clientEmail", matchingClient.email);
      }
    }
  }, [editingQuote, clients]);

  const handleClientSelect = (client: Client | null) => {
    setSelectedClient(client);
    if (client) {
      form.setValue("clientName", client.company || client.name);
      form.setValue("clientEmail", client.email);
    } else {
      form.setValue("clientName", "");
      form.setValue("clientEmail", "");
    }
  };

  const handleAddNewClient = (client: Client) => {
    onAddClient(client);
    handleClientSelect(client);
    setShowNewClientForm(false);
    toast({
      title: "Client added",
      description: `${client.company || client.name} has been added to your clients.`,
    });
  };

  useEffect(() => {
    if (editingQuote) {
      const items = getInitialLineItems();
      setLineItems(items);
      setTaxRate(0);
      form.reset({
        clientName: editingQuote.clientName,
        clientEmail: "",
        projectName: editingQuote.projectName,
        issueDate: new Date(editingQuote.date),
        validUntil: new Date(editingQuote.validUntil),
        lineItems: items,
        taxRate: 0,
        notes: "",
      });
    }
  }, [editingQuote]);

  const handleAddLineItem = () => {
    const newItem = defaultLineItem();
    setLineItems([...lineItems, newItem]);
    form.setValue("lineItems", [...lineItems, newItem]);
  };

  const handleRemoveLineItem = (index: number) => {
    const updated = lineItems.filter((_, i) => i !== index);
    setLineItems(updated);
    form.setValue("lineItems", updated);
  };

  const handleUpdateLineItem = (
    index: number,
    field: keyof QuoteLineItem,
    value: string | number
  ) => {
    const updated = lineItems.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    setLineItems(updated);
    form.setValue("lineItems", updated);
  };

  const handleTaxRateChange = (rate: number) => {
    setTaxRate(rate);
    form.setValue("taxRate", rate);
  };

  const handleFormSubmit = (data: QuoteFormData) => {
    const subtotal = lineItems.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );
    
    if (subtotal === 0) {
      toast({
        title: "Invalid quote",
        description: "Please add at least one item with a price.",
        variant: "destructive",
      });
      return;
    }

    onSubmit({ ...data, lineItems, taxRate });
  };

  return (
    <div className="animate-fade-in">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to quotes
      </button>

      <div className="invoice-card p-6">
        <h2 className="text-lg font-semibold text-foreground mb-6">
          {isEditing ? `Edit Quote #${editingQuote.number}` : "Create New Quote"}
        </h2>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="space-y-6"
          >
            {/* Client Selection */}
            <div className="space-y-4">
              <FormItem>
                <FormLabel>Client *</FormLabel>
                <ClientSelector
                  clients={clients}
                  selectedClient={selectedClient}
                  onSelect={handleClientSelect}
                  onAddNew={() => setShowNewClientForm(true)}
                />
              </FormItem>

              {showNewClientForm && (
                <NewClientForm
                  onSubmit={handleAddNewClient}
                  onCancel={() => setShowNewClientForm(false)}
                />
              )}

              <FormField
                control={form.control}
                name="clientName"
                render={({ field }) => (
                  <input type="hidden" {...field} />
                )}
              />
              <FormField
                control={form.control}
                name="clientEmail"
                render={({ field }) => (
                  <input type="hidden" {...field} />
                )}
              />

              {selectedClient && (
                <div className="text-sm text-muted-foreground bg-secondary/50 rounded-lg p-3">
                  <p><strong>Email:</strong> {selectedClient.email}</p>
                  {selectedClient.phone && <p><strong>Phone:</strong> {selectedClient.phone}</p>}
                </div>
              )}
            </div>

            <FormField
              control={form.control}
              name="projectName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Website Redesign" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="issueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Issue Date *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-card" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="validUntil"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Valid Until *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-card" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Divider */}
            <div className="border-t border-border" />

            {/* Line Items */}
            <LineItemsEditor
              form={form}
              lineItems={lineItems}
              onAdd={handleAddLineItem}
              onRemove={handleRemoveLineItem}
              onUpdate={handleUpdateLineItem}
            />

            {/* Totals */}
            <InvoiceTotals
              lineItems={lineItems}
              taxRate={taxRate}
              onTaxRateChange={handleTaxRateChange}
            />

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Terms, conditions, etc."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit */}
            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button type="button" variant="outline" onClick={onBack}>
                Cancel
              </Button>
              <Button type="submit" disabled={!selectedClient}>
                {isEditing ? (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Create Quote
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
