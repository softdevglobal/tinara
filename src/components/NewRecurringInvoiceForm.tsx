import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, ArrowLeft, Save, Repeat } from "lucide-react";
import { cn } from "@/lib/utils";
import { recurringInvoiceFormSchema, RecurringInvoiceFormData } from "@/lib/recurring-invoice-schema";
import { LineItem } from "@/lib/invoice-schema";
import { RecurringInvoice } from "@/data/recurring-invoices";
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
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LineItemsEditor } from "./LineItemsEditor";
import { LegacyInvoiceTotals } from "./InvoiceTotals";
import { dollarsToCents } from "@/lib/money-utils";
import { ClientSelector } from "./ClientSelector";
import { NewClientForm } from "./NewClientForm";
import { useToast } from "@/hooks/use-toast";

interface NewRecurringInvoiceFormProps {
  onBack: () => void;
  onSubmit: (data: RecurringInvoiceFormData) => void;
  editingRecurring?: RecurringInvoice;
  clients: Client[];
  onAddClient: (client: Client) => void;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

const defaultLineItem = (): LineItem => ({
  id: generateId(),
  description: "",
  quantity: 1,
  unitPrice: 0,
});

export function NewRecurringInvoiceForm({
  onBack,
  onSubmit,
  editingRecurring,
  clients,
  onAddClient,
}: NewRecurringInvoiceFormProps) {
  const { toast } = useToast();
  const isEditing = !!editingRecurring;
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const getInitialLineItems = (): LineItem[] => {
    if (editingRecurring?.lineItems) {
      return editingRecurring.lineItems;
    }
    return [defaultLineItem()];
  };

  const [lineItems, setLineItems] = useState<LineItem[]>(getInitialLineItems);
  const [taxRate, setTaxRate] = useState(editingRecurring?.taxRate ?? 10);

  const form = useForm<RecurringInvoiceFormData>({
    resolver: zodResolver(recurringInvoiceFormSchema),
    defaultValues: {
      clientName: editingRecurring?.clientName || "",
      clientEmail: editingRecurring?.clientEmail || "",
      projectName: editingRecurring?.projectName || "",
      lineItems: getInitialLineItems(),
      taxRate: editingRecurring?.taxRate ?? 10,
      frequency: editingRecurring?.frequency || "monthly",
      startDate: editingRecurring 
        ? new Date(editingRecurring.nextDueDate) 
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      daysBefore: editingRecurring?.daysBefore ?? 7,
      notes: editingRecurring?.notes || "",
    },
  });

  useEffect(() => {
    if (editingRecurring) {
      const matchingClient = clients.find(
        (c) => c.company === editingRecurring.clientName || c.name === editingRecurring.clientName
      );
      if (matchingClient) {
        setSelectedClient(matchingClient);
      }
    }
  }, [editingRecurring, clients]);

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
      description: `${client.company || client.name} has been added.`,
    });
  };

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

  const handleFormSubmit = (data: RecurringInvoiceFormData) => {
    const subtotal = lineItems.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );

    if (subtotal === 0) {
      toast({
        title: "Invalid template",
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
        Back to recurring invoices
      </button>

      <div className="invoice-card p-6">
        <h2 className="text-lg font-semibold text-foreground mb-6">
          {isEditing ? "Edit Recurring Invoice" : "Create Recurring Invoice"}
        </h2>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
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
                render={({ field }) => <input type="hidden" {...field} />}
              />
              <FormField
                control={form.control}
                name="clientEmail"
                render={({ field }) => <input type="hidden" {...field} />}
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
                    <Input placeholder="Monthly Retainer" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Schedule Settings */}
            <div className="border-t border-border pt-6">
              <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
                <Repeat className="h-4 w-4" />
                Schedule Settings
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="frequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Frequency *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>First Due Date *</FormLabel>
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
                              {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
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
                  name="daysBefore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Generate Before (days)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          max={30}
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Days before due date
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

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
                      placeholder="Notes to include on generated invoices"
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
                <Save className="h-4 w-4 mr-2" />
                {isEditing ? "Save Changes" : "Create Recurring Invoice"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
