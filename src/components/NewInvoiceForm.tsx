import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, ArrowLeft, Send, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { invoiceFormSchema, InvoiceFormData, LineItem } from "@/lib/invoice-schema";
import { Invoice } from "@/data/invoices";
import { Client } from "@/data/clients";
import { Item } from "@/data/items";
import { centsToDollars } from "@/lib/money-utils";
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
import { LegacyInvoiceTotals } from "./InvoiceTotals";
import { dollarsToCents } from "@/lib/money-utils";
import { ClientSelector } from "./ClientSelector";
import { NewClientForm } from "./NewClientForm";
import { useToast } from "@/hooks/use-toast";

// Extended line item that tracks source item
interface ExtendedLineItem extends LineItem {
  sourceItemId?: string;
  unit?: string;
}

interface NewInvoiceFormProps {
  onBack: () => void;
  onSubmit: (data: InvoiceFormData) => void;
  editingInvoice?: Invoice;
  clients: Client[];
  onAddClient: (client: Client) => void;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

const defaultLineItem = (): ExtendedLineItem => ({
  id: generateId(),
  description: "",
  quantity: 1,
  unitPrice: 0,
});

export function NewInvoiceForm({ 
  onBack, 
  onSubmit, 
  editingInvoice,
  clients,
  onAddClient,
}: NewInvoiceFormProps) {
  const { toast } = useToast();
  const isEditing = !!editingInvoice;
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Initialize line items based on editing mode
  const getInitialLineItems = (): ExtendedLineItem[] => {
    if (editingInvoice) {
      return [{
        id: generateId(),
        description: editingInvoice.projectName || "Services",
        quantity: 1,
        unitPrice: editingInvoice.total,
      }];
    }
    return [defaultLineItem()];
  };

  const [lineItems, setLineItems] = useState<ExtendedLineItem[]>(getInitialLineItems);
  const [taxRate, setTaxRate] = useState(editingInvoice ? 0 : 10);

  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      clientName: editingInvoice?.clientName || "",
      clientEmail: "",
      projectName: editingInvoice?.projectName || "",
      issueDate: editingInvoice ? new Date(editingInvoice.date) : new Date(),
      dueDate: editingInvoice 
        ? new Date(editingInvoice.dueDate) 
        : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      lineItems: getInitialLineItems(),
      taxRate: editingInvoice ? 0 : 10,
      notes: "",
    },
  });

  // Find matching client when editing
  useEffect(() => {
    if (editingInvoice) {
      const matchingClient = clients.find(
        (c) => c.company === editingInvoice.clientName || c.name === editingInvoice.clientName
      );
      if (matchingClient) {
        setSelectedClient(matchingClient);
        form.setValue("clientEmail", matchingClient.email);
      }
    }
  }, [editingInvoice, clients]);

  // Update form when client is selected
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

  // Reset form when editingInvoice changes
  useEffect(() => {
    if (editingInvoice) {
      const items = getInitialLineItems();
      setLineItems(items);
      setTaxRate(0);
      form.reset({
        clientName: editingInvoice.clientName,
        clientEmail: "",
        projectName: editingInvoice.projectName,
        issueDate: new Date(editingInvoice.date),
        dueDate: new Date(editingInvoice.dueDate),
        lineItems: items,
        taxRate: 0,
        notes: "",
      });
    }
  }, [editingInvoice]);

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
    field: keyof LineItem,
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

  /**
   * Add item from catalog - creates a snapshot of the catalog item
   * Future price changes to the catalog won't affect this line item
   */
  const handleAddFromCatalog = (item: Item) => {
    const newItem: ExtendedLineItem = {
      id: generateId(),
      description: item.name,
      quantity: item.defaultQty,
      unitPrice: centsToDollars(item.unitPriceCents),
      sourceItemId: item.id,
      unit: item.unit,
    };
    const updated = [...lineItems, newItem];
    setLineItems(updated);
    form.setValue("lineItems", updated);
  };

  const handleFormSubmit = (data: InvoiceFormData) => {
    // Validate line items before submission
    const invalidItems = lineItems.filter(
      (item) => !item.description.trim() || item.quantity <= 0
    );

    if (invalidItems.length > 0) {
      toast({
        title: "Invalid line items",
        description: "Please fill in all item descriptions and ensure quantities are greater than 0.",
        variant: "destructive",
      });
      return;
    }

    const subtotal = lineItems.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );
    
    if (subtotal === 0) {
      toast({
        title: "Invalid invoice",
        description: "Please add at least one item with a price.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedClient) {
      toast({
        title: "Client required",
        description: "Please select or create a client for this invoice.",
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
        Back to invoices
      </button>

      <div className="invoice-card p-6">
        <h2 className="text-lg font-semibold text-foreground mb-6">
          {isEditing ? `Edit Invoice #${editingInvoice.number}` : "Create New Invoice"}
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

              {/* Hidden fields that get populated from client selection */}
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
                name="dueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Due Date *</FormLabel>
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
              onAddFromCatalog={handleAddFromCatalog}
            />

            {/* Totals */}
            <LegacyInvoiceTotals
              subtotalCents={dollarsToCents(lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0))}
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
                      placeholder="Payment terms, thank you message, etc."
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
                    Create Invoice
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
