import { useState, useMemo, useCallback, useEffect } from "react";
import { Plus, Camera, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Client } from "@/data/clients";
import { Item } from "@/data/items";
import { Invoice } from "@/data/invoices";
import { Quote } from "@/data/quotes";
import {
  DocumentType,
  DocumentCreationTab,
  PaymentTerms,
  ClientSnapshot,
  DepositRequest,
  calculateDueDate,
  calculateValidUntil,
} from "@/types/document";
import { DocumentLineItem } from "@/lib/line-item-schema";
import { TAX_RATES, TaxCode } from "@/lib/tax-utils";
import { centsToDollars, dollarsToCents } from "@/lib/money-utils";
import { useDocumentCounters } from "@/context/DocumentCountersContext";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/hooks/use-toast";
import { ClientSelector } from "@/components/ClientSelector";
import { NewClientForm } from "@/components/NewClientForm";
import { SmartItemInput } from "@/components/SmartItemInput";
import { QuickAddItemForm } from "@/components/QuickAddItemForm";
import { DocumentFormHeader } from "./DocumentFormHeader";
import { DocumentDetailsPanel } from "./DocumentDetailsPanel";
import { DocumentPreviewTab } from "./DocumentPreviewTab";
import { DocumentSendTab } from "./DocumentSendTab";

interface DocumentCreationFormProps {
  type: DocumentType;
  onBack: () => void;
  onSubmit: (document: Invoice | Quote) => void;
  editingDocument?: Invoice | Quote;
  clients: Client[];
  onAddClient: (client: Client) => void;
}

interface FormLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  itemCode?: string;
  unit?: string;
  taxCode: TaxCode;
  discountType: "PERCENT" | "AMOUNT";
  discountValue: number;
  itemType?: "parts" | "labor";
  sourceItemId?: string;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

const defaultLineItem = (): FormLineItem => ({
  id: generateId(),
  description: "",
  quantity: 1,
  unitPrice: 0,
  itemCode: "",
  taxCode: "NONE",
  discountType: "PERCENT",
  discountValue: 0,
  itemType: "parts",
});

export function DocumentCreationForm({
  type,
  onBack,
  onSubmit,
  editingDocument,
  clients,
  onAddClient,
}: DocumentCreationFormProps) {
  const { toast } = useToast();
  const { brandingSettings } = useApp();
  const { generateInvoiceNumber, generateQuoteNumber, peekNextInvoiceNumber, peekNextQuoteNumber } = useDocumentCounters();
  
  const isEditing = !!editingDocument;
  const typeLabel = type === "invoice" ? "Invoice" : "Estimate";

  // Form state
  const [activeTab, setActiveTab] = useState<DocumentCreationTab>("create");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Client state
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  
  // Document details
  const [documentNumber, setDocumentNumber] = useState<string | undefined>(
    isEditing ? (editingDocument as Invoice | Quote).number : undefined
  );
  const [date, setDate] = useState(
    isEditing ? new Date((editingDocument as Invoice | Quote).date) : new Date()
  );
  const [dueDate, setDueDate] = useState(
    isEditing && type === "invoice"
      ? new Date((editingDocument as Invoice).dueDate)
      : calculateDueDate(new Date(), "14_days")
  );
  const [validUntil, setValidUntil] = useState(
    isEditing && type === "quote"
      ? new Date((editingDocument as Quote).validUntil)
      : calculateValidUntil(new Date())
  );
  const [paymentTerms, setPaymentTerms] = useState<PaymentTerms>("14_days");
  const [currency, setCurrency] = useState("AUD");
  const [poNumber, setPoNumber] = useState("");
  const [status, setStatus] = useState(isEditing ? (editingDocument as Invoice | Quote).status : "Draft");

  // Line items
  const [lineItems, setLineItems] = useState<FormLineItem[]>([defaultLineItem()]);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [quickAddIndex, setQuickAddIndex] = useState<number | null>(null);
  const [quickAddName, setQuickAddName] = useState("");

  // Deposit
  const [depositRequest, setDepositRequest] = useState<DepositRequest | undefined>();

  // Notes
  const [internalNotes, setInternalNotes] = useState("");
  const [clientNotes, setClientNotes] = useState("");
  const [paymentInstructions, setPaymentInstructions] = useState("");

  // Get preview number
  const previewNumber = documentNumber || (type === "invoice" ? peekNextInvoiceNumber() : peekNextQuoteNumber());

  // Calculate totals
  const { subtotal, discount, tax, total } = useMemo(() => {
    let subtotal = 0;
    let discount = 0;
    let tax = 0;

    for (const item of lineItems) {
      const baseTotal = item.quantity * item.unitPrice;
      const discountAmount = item.discountType === "PERCENT"
        ? baseTotal * (item.discountValue / 100)
        : item.discountValue;
      const netAmount = Math.max(0, baseTotal - discountAmount);
      const taxRate = TAX_RATES[item.taxCode];
      const taxAmount = netAmount * taxRate;

      subtotal += baseTotal;
      discount += discountAmount;
      tax += taxAmount;
    }

    return {
      subtotal,
      discount,
      tax,
      total: subtotal - discount + tax,
    };
  }, [lineItems]);

  const depositAmount = depositRequest
    ? depositRequest.type === "percent"
      ? (total * depositRequest.value) / 100
      : depositRequest.value
    : 0;

  // Mark changes
  useEffect(() => {
    setHasUnsavedChanges(true);
  }, [selectedClient, date, dueDate, validUntil, lineItems, clientNotes, internalNotes]);

  // Load editing document
  useEffect(() => {
    if (editingDocument) {
      const doc = editingDocument as Invoice | Quote;
      const client = clients.find(
        (c) => c.company === doc.clientName || c.name === doc.clientName
      );
      if (client) setSelectedClient(client);
      setCurrency(doc.currency);
      setClientNotes((doc as Quote).comments || (doc as Invoice).notes || "");
    }
  }, [editingDocument, clients]);

  // Line item handlers
  const handleAddLineItem = () => {
    setLineItems([...lineItems, defaultLineItem()]);
  };

  const handleRemoveLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index));
    }
  };

  const handleUpdateLineItem = (index: number, field: keyof FormLineItem, value: FormLineItem[keyof FormLineItem]) => {
    setLineItems(lineItems.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const handleItemSelect = (index: number, item: Item) => {
    setLineItems(lineItems.map((lineItem, i) =>
      i === index
        ? {
            ...lineItem,
            description: item.name,
            unitPrice: centsToDollars(item.unitPriceCents),
            quantity: item.defaultQty,
            sourceItemId: item.id,
            itemCode: item.sku || "",
            unit: item.unit,
            taxCode: item.taxCode || "NONE",
          }
        : lineItem
    ));
  };

  const handleQuickAddComplete = (index: number, item: Item) => {
    handleItemSelect(index, item);
    setQuickAddIndex(null);
    setQuickAddName("");
  };

  const toggleRowExpanded = (index: number) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  // Client handlers
  const handleClientSelect = (client: Client | null) => {
    setSelectedClient(client);
  };

  const handleAddNewClient = (client: Client) => {
    onAddClient(client);
    setSelectedClient(client);
    setShowNewClientForm(false);
    toast({
      title: "Client added",
      description: `${client.company || client.name} has been added.`,
    });
  };

  // Create client snapshot
  const createClientSnapshot = (client: Client): ClientSnapshot => ({
    id: client.id,
    name: client.name,
    company: client.company,
    email: client.email,
    phone: client.phone,
    billingAddress: client.billingAddress ? {
      street: client.billingAddress.street,
      city: client.billingAddress.city,
      state: client.billingAddress.state,
      postcode: client.billingAddress.postalCode,
      country: client.billingAddress.country || "Australia",
    } : undefined,
    taxId: client.taxNumber,
  });

  // Convert form line items to DocumentLineItem format
  const convertToDocumentLineItems = (): DocumentLineItem[] => {
    return lineItems.map((item, index) => ({
      id: item.id,
      documentId: editingDocument?.id || `temp_${Date.now()}`,
      sourceItemId: item.sourceItemId,
      nameSnapshot: item.description,
      descriptionSnapshot: item.itemCode ? `SKU: ${item.itemCode}` : undefined,
      unitSnapshot: item.unit || "unit",
      unitPriceCentsSnapshot: dollarsToCents(item.unitPrice),
      qty: item.quantity,
      discountType: item.discountValue > 0 ? item.discountType : "NONE",
      discountValue: item.discountType === "AMOUNT" 
        ? dollarsToCents(item.discountValue) 
        : item.discountValue,
      taxCodeSnapshot: item.taxCode,
      sortOrder: index,
    }));
  };

  // Save handler
  const handleSave = () => {
    // Validation
    if (!selectedClient) {
      toast({
        title: "Client required",
        description: "Please select a client.",
        variant: "destructive",
      });
      return;
    }

    if (lineItems.every(item => !item.description.trim() || item.quantity <= 0)) {
      toast({
        title: "Line items required",
        description: "Please add at least one valid line item.",
        variant: "destructive",
      });
      return;
    }

    // Generate number if new document
    const finalNumber = documentNumber || (type === "invoice" ? generateInvoiceNumber() : generateQuoteNumber());
    
    // Calculate totals in cents
    const subtotalCents = dollarsToCents(subtotal);
    const discountCents = dollarsToCents(discount);
    const taxCents = dollarsToCents(tax);
    const totalCents = dollarsToCents(total);

    if (type === "invoice") {
      const invoice: Invoice = {
        id: editingDocument?.id || `inv_${Date.now()}`,
        number: finalNumber,
        clientName: selectedClient.company || selectedClient.name,
        clientEmail: selectedClient.email,
        projectName: "",
        date: date.toISOString().split("T")[0],
        dueDate: dueDate.toISOString().split("T")[0],
        dueDaysOverdue: 0,
        dueLabel: `Due in ${Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days`,
        status: "Opened" as const,
        currency,
        notes: clientNotes,
        lineItems: convertToDocumentLineItems(),
        totals: {
          subtotalCents,
          discountCents,
          taxCents,
          totalCents,
        },
        total, // Keep for backwards compat
      };
      onSubmit(invoice);
    } else {
      const validDays = Math.ceil((validUntil.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      const quote: Quote = {
        id: editingDocument?.id || `quote_${Date.now()}`,
        number: finalNumber,
        clientName: selectedClient.company || selectedClient.name,
        projectName: "",
        date: date.toISOString().split("T")[0],
        validUntil: validUntil.toISOString().split("T")[0],
        validDaysRemaining: validDays,
        validLabel: validDays > 0 ? `Valid for ${validDays} days` : "Expired",
        status: "Unsent" as const,
        currency,
        comments: clientNotes,
        depositRequest,
        lineItems: convertToDocumentLineItems(),
        totals: {
          subtotalCents,
          discountCents,
          taxCents,
          totalCents,
        },
        total, // Keep for backwards compat
      };
      onSubmit(quote);
    }

    setHasUnsavedChanges(false);
    toast({
      title: `${typeLabel} ${isEditing ? "updated" : "created"}`,
      description: `${typeLabel} #${finalNumber} has been ${isEditing ? "updated" : "created"}.`,
    });
  };

  // Send handler
  const handleSend = (data: { to: string; subject: string; body: string }) => {
    // First save, then mark as sent
    handleSave();
    toast({
      title: `${typeLabel} sent`,
      description: `${typeLabel} has been sent to ${data.to}.`,
    });
  };

  return (
    <div className="animate-fade-in">
      <DocumentFormHeader
        type={type}
        isEditing={isEditing}
        documentNumber={documentNumber}
        hasUnsavedChanges={hasUnsavedChanges}
        onBack={onBack}
        onSave={handleSave}
      />

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as DocumentCreationTab)}>
        <TabsList className="bg-transparent p-0 h-auto mb-6">
          <TabsTrigger 
            value="create" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 pb-2"
          >
            Create
          </TabsTrigger>
          <TabsTrigger 
            value="preview"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 pb-2"
          >
            Preview
          </TabsTrigger>
          <TabsTrigger 
            value="send"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 pb-2"
          >
            Send
          </TabsTrigger>
        </TabsList>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <TabsContent value="create" className="mt-0 space-y-4">
              {/* Client Section */}
              <div className="bg-card border rounded-lg overflow-hidden">
                <div className="bg-muted/50 px-4 py-2 border-b">
                  <span className="text-sm font-medium">Client</span>
                </div>
                <div className="p-4 space-y-4">
                  <ClientSelector
                    clients={clients}
                    selectedClient={selectedClient}
                    onSelect={handleClientSelect}
                    onAddNew={() => setShowNewClientForm(true)}
                  />

                  {showNewClientForm && (
                    <NewClientForm
                      onSubmit={handleAddNewClient}
                      onCancel={() => setShowNewClientForm(false)}
                    />
                  )}

                  {selectedClient && (
                    <div className="text-sm text-muted-foreground bg-secondary/50 rounded-lg p-3">
                      <p><strong>Email:</strong> {selectedClient.email}</p>
                      {selectedClient.phone && <p><strong>Phone:</strong> {selectedClient.phone}</p>}
                    </div>
                  )}
                </div>
              </div>

              {/* Line Items Section */}
              <div className="bg-card border rounded-lg overflow-hidden">
                <div className="bg-muted/50 px-4 py-2 border-b">
                  <span className="text-sm font-medium">Parts and labor</span>
                </div>
                <div className="p-4">
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="hidden sm:grid sm:grid-cols-12 gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      <div className="col-span-2">Item Code</div>
                      <div className="col-span-4">Description</div>
                      <div className="col-span-1 text-center">Qty</div>
                      <div className="col-span-2 text-right">Price</div>
                      <div className="col-span-2 text-right">Total</div>
                      <div className="col-span-1"></div>
                    </div>

                    {lineItems.map((item, index) => {
                      const isQuickAddOpen = quickAddIndex === index;
                      const isExpanded = expandedRows.has(index);
                      
                      // Calculate line total
                      const baseTotal = item.quantity * item.unitPrice;
                      const discountAmount = item.discountType === "PERCENT" 
                        ? baseTotal * (item.discountValue / 100)
                        : item.discountValue;
                      const netAmount = Math.max(0, baseTotal - discountAmount);
                      const taxRate = TAX_RATES[item.taxCode];
                      const taxAmount = netAmount * taxRate;
                      const lineTotal = netAmount + taxAmount;

                      return (
                        <div key={item.id} className="space-y-0">
                          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 p-3 rounded-t-lg bg-secondary/50 items-center">
                            {/* Item Code */}
                            <div className="sm:col-span-2">
                              <Input
                                placeholder="SKU"
                                value={item.itemCode || ""}
                                onChange={(e) => handleUpdateLineItem(index, "itemCode", e.target.value)}
                                className="bg-card text-sm"
                              />
                            </div>
                            {/* Description */}
                            <div className="sm:col-span-4">
                              <SmartItemInput
                                value={item.description}
                                onChange={(value) => handleUpdateLineItem(index, "description", value)}
                                onItemSelect={(catalogItem) => handleItemSelect(index, catalogItem)}
                                onAddNewItem={(searchText) => {
                                  setQuickAddIndex(index);
                                  setQuickAddName(searchText);
                                }}
                                placeholder="Type item name or code..."
                              />
                            </div>
                            {/* Qty */}
                            <div className="sm:col-span-1">
                              <Input
                                type="number"
                                min={1}
                                value={item.quantity}
                                onChange={(e) => handleUpdateLineItem(index, "quantity", Number(e.target.value))}
                                className="bg-card text-center"
                              />
                            </div>
                            {/* Price */}
                            <div className="sm:col-span-2">
                              <Input
                                type="number"
                                min={0}
                                step={0.01}
                                value={item.unitPrice}
                                onChange={(e) => handleUpdateLineItem(index, "unitPrice", Number(e.target.value))}
                                className="bg-card text-right"
                              />
                            </div>
                            {/* Total */}
                            <div className="sm:col-span-2 text-right">
                              <span className="font-medium">${lineTotal.toFixed(2)}</span>
                            </div>
                            {/* Delete */}
                            <div className="sm:col-span-1 flex justify-end">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveLineItem(index)}
                                disabled={lineItems.length === 1}
                                className="h-8 w-8"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {/* GST, Parts/Labor, Discount - Collapsible */}
                          <Collapsible open={isExpanded} onOpenChange={() => toggleRowExpanded(index)}>
                            <CollapsibleTrigger asChild>
                              <button
                                type="button"
                                className="w-full flex items-center gap-1 px-3 py-1.5 text-xs text-primary hover:text-primary/80 bg-secondary/30 rounded-b-lg border-t border-border/50 transition-colors"
                              >
                                {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                <span>GST, parts or labor, discount</span>
                              </button>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <div className="px-3 py-3 bg-secondary/20 rounded-b-lg border-t border-border/30 space-y-3">
                                {/* GST Row */}
                                <div className="flex items-center gap-4">
                                  <div className="flex items-center gap-2">
                                    <Checkbox
                                      id={`gst-${index}`}
                                      checked={item.taxCode === "GST"}
                                      onCheckedChange={(checked) => {
                                        handleUpdateLineItem(index, "taxCode", checked ? "GST" : "NONE");
                                      }}
                                    />
                                    <label htmlFor={`gst-${index}`} className="text-sm cursor-pointer">GST</label>
                                  </div>
                                  <Select
                                    value={item.taxCode === "GST" ? "10" : "0"}
                                    onValueChange={(value) => {
                                      handleUpdateLineItem(index, "taxCode", value === "10" ? "GST" : "NONE");
                                    }}
                                    disabled={item.taxCode !== "GST"}
                                  >
                                    <SelectTrigger className="w-20 h-8 text-xs">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="10">10%</SelectItem>
                                      <SelectItem value="0">0%</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                {/* Parts or Labor Row */}
                                <div className="flex items-center gap-4">
                                  <span className="text-sm text-muted-foreground w-24">Parts or labor</span>
                                  <Select
                                    value={item.itemType || "parts"}
                                    onValueChange={(value) => {
                                      handleUpdateLineItem(index, "itemType", value as "parts" | "labor");
                                    }}
                                  >
                                    <SelectTrigger className="w-24 h-8 text-xs">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="parts">Parts</SelectItem>
                                      <SelectItem value="labor">Labor</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                {/* Discount Row */}
                                <div className="flex items-center gap-4">
                                  <div className="flex items-center gap-2">
                                    <Checkbox
                                      id={`discount-${index}`}
                                      checked={item.discountValue > 0}
                                      onCheckedChange={(checked) => {
                                        if (!checked) {
                                          handleUpdateLineItem(index, "discountValue", 0);
                                        }
                                      }}
                                    />
                                    <label htmlFor={`discount-${index}`} className="text-sm cursor-pointer">Discount</label>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Button
                                      type="button"
                                      variant={item.discountType === "PERCENT" ? "default" : "outline"}
                                      size="sm"
                                      className="h-7 w-7 p-0 text-xs"
                                      onClick={() => handleUpdateLineItem(index, "discountType", "PERCENT")}
                                    >
                                      %
                                    </Button>
                                    <Button
                                      type="button"
                                      variant={item.discountType === "AMOUNT" ? "default" : "outline"}
                                      size="sm"
                                      className="h-7 w-7 p-0 text-xs"
                                      onClick={() => handleUpdateLineItem(index, "discountType", "AMOUNT")}
                                    >
                                      $
                                    </Button>
                                  </div>
                                  <Input
                                    type="number"
                                    min={0}
                                    step={item.discountType === "PERCENT" ? 1 : 0.01}
                                    max={item.discountType === "PERCENT" ? 100 : undefined}
                                    value={item.discountValue || ""}
                                    onChange={(e) => handleUpdateLineItem(index, "discountValue", parseFloat(e.target.value) || 0)}
                                    className="w-20 h-8 text-xs text-right"
                                  />
                                </div>

                                {/* Summary */}
                                {(taxAmount > 0 || discountAmount > 0) && (
                                  <div className="pt-2 border-t border-border/30 text-xs text-muted-foreground space-y-1">
                                    {discountAmount > 0 && (
                                      <div className="flex justify-between">
                                        <span>Discount:</span>
                                        <span className="text-destructive">-${discountAmount.toFixed(2)}</span>
                                      </div>
                                    )}
                                    {taxAmount > 0 && (
                                      <div className="flex justify-between">
                                        <span>GST (10%):</span>
                                        <span>${taxAmount.toFixed(2)}</span>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </CollapsibleContent>
                          </Collapsible>

                          {isQuickAddOpen && (
                            <QuickAddItemForm
                              initialName={quickAddName}
                              onAdd={(newItem) => handleQuickAddComplete(index, newItem)}
                              onCancel={() => {
                                setQuickAddIndex(null);
                                setQuickAddName("");
                              }}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-4 mt-4">
                    <button
                      type="button"
                      onClick={handleAddLineItem}
                      className="flex items-center gap-2 text-primary text-sm hover:underline"
                    >
                      <Plus className="h-4 w-4" />
                      Add Items
                    </button>
                    <span className="text-muted-foreground">|</span>
                    <button type="button" className="text-primary text-sm hover:underline">
                      Expenses
                    </button>
                    <button type="button" className="text-primary text-sm hover:underline">
                      Time entries
                    </button>
                  </div>
                </div>
              </div>

              {/* Attachments Section */}
              <div className="bg-card border rounded-lg overflow-hidden">
                <div className="bg-muted/50 px-4 py-2 border-b">
                  <span className="text-sm font-medium">Attachments</span>
                </div>
                <div className="p-4">
                  <button
                    type="button"
                    className="flex items-center gap-2 text-primary text-sm hover:underline"
                  >
                    <Camera className="h-4 w-4" />
                    Add photos
                  </button>
                </div>
              </div>

              {/* Notes Section */}
              <div className="bg-card border rounded-lg overflow-hidden">
                <div className="bg-muted/50 px-4 py-2 border-b">
                  <span className="text-sm font-medium">Notes</span>
                </div>
                <div className="p-4 space-y-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">
                      Notes to client (visible on {typeLabel.toLowerCase()})
                    </label>
                    <Textarea
                      value={clientNotes}
                      onChange={(e) => setClientNotes(e.target.value)}
                      placeholder="Payment instructions, warranty info, etc."
                      className="min-h-[80px]"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">
                      Internal notes (not visible to client)
                    </label>
                    <Textarea
                      value={internalNotes}
                      onChange={(e) => setInternalNotes(e.target.value)}
                      placeholder="Private notes for your records..."
                      className="min-h-[60px]"
                    />
                  </div>
                </div>
              </div>

              {/* Deposit Request (Quote only) */}
              {type === "quote" && (
                <div className="bg-card border rounded-lg overflow-hidden">
                  <div className="bg-muted/50 px-4 py-2 border-b">
                    <span className="text-sm font-medium">Deposit Request</span>
                  </div>
                  <div className="p-4">
                    {depositRequest ? (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>
                            {depositRequest.type === "percent" 
                              ? `${depositRequest.value}% deposit`
                              : `$${depositRequest.value} deposit`}
                          </span>
                          <span className="font-medium">${depositAmount.toFixed(2)}</span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDepositRequest(undefined)}
                        >
                          Remove deposit request
                        </Button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setDepositRequest({
                          type: "percent",
                          value: 25,
                          dueDate: new Date().toISOString().split("T")[0],
                          amountPaid: 0,
                        })}
                        className="text-primary text-sm hover:underline"
                      >
                        + Add deposit request
                      </button>
                    )}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="preview" className="mt-0">
              <DocumentPreviewTab
                type={type}
                documentNumber={previewNumber}
                clientSnapshot={selectedClient ? createClientSnapshot(selectedClient) : undefined}
                date={date}
                dueDate={type === "invoice" ? dueDate : undefined}
                validUntil={type === "quote" ? validUntil : undefined}
                lineItems={convertToDocumentLineItems()}
                currency={currency}
                subtotal={subtotal}
                discount={discount}
                tax={tax}
                total={total}
                depositRequest={depositRequest}
                clientNotes={clientNotes}
                paymentInstructions={paymentInstructions}
                brandingSettings={brandingSettings}
              />
            </TabsContent>

            <TabsContent value="send" className="mt-0">
              <DocumentSendTab
                type={type}
                documentNumber={previewNumber}
                clientSnapshot={selectedClient ? createClientSnapshot(selectedClient) : undefined}
                total={total}
                currency={currency}
                onSend={handleSend}
              />
            </TabsContent>
          </div>

          {/* Right Sidebar - Details Panel */}
          <div>
            <DocumentDetailsPanel
              type={type}
              documentNumber={previewNumber}
              status={status}
              date={date}
              dueDate={type === "invoice" ? dueDate : undefined}
              validUntil={type === "quote" ? validUntil : undefined}
              paymentTerms={paymentTerms}
              currency={currency}
              poNumber={poNumber}
              onDateChange={setDate}
              onDueDateChange={type === "invoice" ? setDueDate : undefined}
              onValidUntilChange={type === "quote" ? setValidUntil : undefined}
              onPaymentTermsChange={setPaymentTerms}
              onCurrencyChange={setCurrency}
              onPoNumberChange={setPoNumber}
              subtotal={subtotal}
              discount={discount}
              tax={tax}
              total={total}
              depositAmount={type === "quote" ? depositAmount : undefined}
            />
          </div>
        </div>
      </Tabs>
    </div>
  );
}
