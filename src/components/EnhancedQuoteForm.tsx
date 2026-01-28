import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, ArrowLeft, Save, Plus, Trash2, User, Camera, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { z } from "zod";
import { Quote, QuoteDepositRequest } from "@/data/quotes";
import { Client } from "@/data/clients";
import { Project } from "@/data/projects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";
import { ClientSelector } from "./ClientSelector";
import { NewClientForm } from "./NewClientForm";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useToast } from "@/hooks/use-toast";

interface QuoteLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

const quoteFormSchema = z.object({
  clientId: z.string().min(1, "Client is required"),
  projectId: z.string().optional(),
  issueDate: z.date(),
  validUntil: z.date(),
  comments: z.string().optional(),
});

type QuoteFormData = z.infer<typeof quoteFormSchema>;

interface EnhancedQuoteFormProps {
  onBack: () => void;
  onSubmit: (quote: Quote) => void;
  editingQuote?: Quote;
  clients: Client[];
  projects: Project[];
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

export function EnhancedQuoteForm({ 
  onBack, 
  onSubmit, 
  editingQuote,
  clients,
  projects,
  onAddClient,
}: EnhancedQuoteFormProps) {
  const { toast } = useToast();
  const isEditing = !!editingQuote;
  const [activeTab, setActiveTab] = useState<"create" | "preview" | "send">("create");
  const [lineItems, setLineItems] = useState<QuoteLineItem[]>([defaultLineItem()]);
  const [depositDialogOpen, setDepositDialogOpen] = useState(false);
  const [depositRequest, setDepositRequest] = useState<QuoteDepositRequest | null>(null);
  const [depositType, setDepositType] = useState<"percent" | "fixed">("percent");
  const [depositValue, setDepositValue] = useState(25);
  const [depositDueDate, setDepositDueDate] = useState(new Date().toISOString().split("T")[0]);
  const [addToFutureEstimates, setAddToFutureEstimates] = useState(true);
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const form = useForm<QuoteFormData>({
    resolver: zodResolver(quoteFormSchema),
    defaultValues: {
      clientId: "",
      projectId: "",
      issueDate: new Date(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      comments: "",
    },
  });

  // Update selected client when form value changes
  useEffect(() => {
    const clientId = form.watch("clientId");
    if (clientId) {
      const client = clients.find((c) => c.id === clientId);
      setSelectedClient(client || null);
    }
  }, [form.watch("clientId"), clients]);

  // Handle client selection
  const handleClientSelect = (client: Client | null) => {
    setSelectedClient(client);
    if (client) {
      form.setValue("clientId", client.id);
    } else {
      form.setValue("clientId", "");
    }
  };

  // Handle adding new client
  const handleAddNewClient = (client: Client) => {
    onAddClient(client);
    handleClientSelect(client);
    setShowNewClientForm(false);
    toast({
      title: "Client added",
      description: `${client.company || client.name} has been added to your clients.`,
    });
  };

  // Calculate totals
  const subtotal = lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const discount = 0;
  const total = subtotal - discount;
  const depositAmount = depositRequest 
    ? (depositRequest.type === "percent" ? (total * depositRequest.value / 100) : depositRequest.value)
    : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
    }).format(amount);
  };

  const handleAddLineItem = () => {
    setLineItems([...lineItems, defaultLineItem()]);
  };

  const handleRemoveLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index));
    }
  };

  const handleUpdateLineItem = (index: number, field: keyof QuoteLineItem, value: string | number) => {
    const updated = lineItems.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    setLineItems(updated);
  };

  const handleSaveDeposit = () => {
    setDepositRequest({
      type: depositType,
      value: depositValue,
      dueDate: depositDueDate,
      amountPaid: 0,
    });
    setDepositDialogOpen(false);
  };

  const handleCancelDeposit = () => {
    setDepositRequest(null);
    setDepositDialogOpen(false);
  };

  const handleFormSubmit = () => {
    const data = form.getValues();
    
    if (!data.clientId) {
      toast({
        title: "Client required",
        description: "Please select a client.",
        variant: "destructive",
      });
      return;
    }

    if (subtotal === 0) {
      toast({
        title: "Invalid estimate",
        description: "Please add at least one item with a price.",
        variant: "destructive",
      });
      return;
    }

    const client = clients.find((c) => c.id === data.clientId);
    const validDays = Math.ceil((data.validUntil.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    const quoteNumber = editingQuote?.number || `E${Date.now().toString().slice(-8)}`;

    // Convert to cents for storage
    const subtotalCents = Math.round(subtotal * 100);
    const totalCents = Math.round(total * 100);

    const newQuote: Quote = {
      id: editingQuote?.id || `quote_${Date.now()}`,
      number: quoteNumber,
      clientName: client?.company || client?.name || "",
      projectName: "",
      date: data.issueDate.toISOString().split("T")[0],
      validUntil: data.validUntil.toISOString().split("T")[0],
      validDaysRemaining: validDays,
      validLabel: validDays > 0 ? `Valid for ${validDays} days` : "Expired",
      status: "Unsent",
      currency: "AUD",
      projectId: data.projectId || undefined,
      depositRequest: depositRequest || undefined,
      comments: data.comments || undefined,
      lineItems: [], // TODO: Convert to DocumentLineItem once form is migrated
      totals: {
        subtotalCents,
        discountCents: 0,
        taxCents: 0, // TODO: Add per-line tax calculation
        totalCents,
      },
      total, // Keep for backwards compat
    };

    onSubmit(newQuote);
  };

  // Email content for Send tab
  const emailSubject = `Estimate #${editingQuote?.number || "NEW"} to review | ${selectedClient?.company || selectedClient?.name || "Client"}`;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Create an estimate
        </button>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={onBack}>Close</Button>
          <Button onClick={handleFormSubmit}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "create" | "preview" | "send")}>
        <TabsList className="bg-transparent p-0 h-auto mb-6">
          <TabsTrigger 
            value="create" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 pb-2"
          >
            Create
          </TabsTrigger>
          <TabsTrigger 
            value="preview"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 pb-2"
          >
            Preview
          </TabsTrigger>
          <TabsTrigger 
            value="send"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 pb-2"
          >
            Send
          </TabsTrigger>
        </TabsList>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <TabsContent value="create" className="mt-0">
              <Form {...form}>
                <div className="space-y-0">
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

                      {/* Hidden form field for validation */}
                      <FormField
                        control={form.control}
                        name="clientId"
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
                  </div>

                  {/* Parts and Labor Section */}
                  <div className="bg-card border rounded-lg overflow-hidden mt-4">
                    <div className="bg-muted/50 px-4 py-2 border-b">
                      <span className="text-sm font-medium">Parts and labor</span>
                    </div>
                    <div className="p-4">
                      <div className="space-y-3">
                        {lineItems.map((item, index) => (
                          <div key={item.id} className="flex gap-3 items-start">
                            <Input
                              placeholder="Description"
                              value={item.description}
                              onChange={(e) => handleUpdateLineItem(index, "description", e.target.value)}
                              className="flex-1"
                            />
                            <Input
                              type="number"
                              placeholder="Qty"
                              value={item.quantity}
                              onChange={(e) => handleUpdateLineItem(index, "quantity", Number(e.target.value))}
                              className="w-20"
                            />
                            <Input
                              type="number"
                              placeholder="Price"
                              value={item.unitPrice}
                              onChange={(e) => handleUpdateLineItem(index, "unitPrice", Number(e.target.value))}
                              className="w-28"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveLineItem(index)}
                              disabled={lineItems.length === 1}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
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
                        <button
                          type="button"
                          className="text-primary text-sm hover:underline"
                        >
                          Expenses
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Attachments Section */}
                  <div className="bg-card border rounded-lg overflow-hidden mt-4">
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

                  {/* Comments Section */}
                  <div className="bg-card border rounded-lg overflow-hidden mt-4">
                    <div className="bg-muted/50 px-4 py-2 border-b">
                      <span className="text-sm font-medium">Comments</span>
                    </div>
                    <div className="p-4">
                      <div className="flex gap-4">
                        <span className="text-sm text-muted-foreground w-20">Comment</span>
                        <FormField
                          control={form.control}
                          name="comments"
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <Textarea
                                  placeholder="Add comments..."
                                  className="min-h-[100px] resize-none"
                                  {...field}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Form>
            </TabsContent>

            <TabsContent value="preview" className="mt-0">
              <div className="bg-card border rounded-lg p-8 text-center">
                <div className="bg-gradient-to-r from-orange-400 to-red-400 h-24 -mx-8 -mt-8 mb-8 rounded-t-lg" />
                <h2 className="text-2xl font-bold mb-4">
                  {selectedClient?.company || selectedClient?.name || "Client Name"}
                </h2>
                <p className="text-muted-foreground mb-8">Quote Preview</p>
                <div className="text-left space-y-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Discount</span>
                    <span>{formatCurrency(discount)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-4">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="send" className="mt-0">
              <div className="bg-card border rounded-lg">
                <div className="p-4 space-y-4">
                  <div className="flex items-center gap-4">
                    <Label className="w-16">To</Label>
                    <Input 
                      value={selectedClient?.email || ""} 
                      placeholder="recipient@email.com"
                      className="flex-1"
                    />
                    <div className="flex gap-2">
                      <Button variant="link" size="sm">Cc</Button>
                      <Button variant="link" size="sm">Bcc</Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Label className="w-16">Subject</Label>
                    <Input value={emailSubject} className="flex-1" />
                  </div>
                  <Textarea 
                    className="min-h-[200px]"
                    placeholder="Hi,

Thank you for contacting us for your security needs.
We supply and install genuine high quality security systems for a budget price.

Here's an estimate for you to review.

If you're happy with it, please pay the deposit today."
                  />
                  <div className="flex items-center gap-2 justify-center text-muted-foreground text-sm">
                    {/* Payment icons placeholder */}
                    <span className="px-2 py-1 bg-muted rounded text-xs">VISA</span>
                    <span className="px-2 py-1 bg-muted rounded text-xs">MC</span>
                    <span className="px-2 py-1 bg-muted rounded text-xs">AMEX</span>
                    <span className="px-2 py-1 bg-muted rounded text-xs">Apple Pay</span>
                  </div>
                </div>
              </div>
            </TabsContent>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-4">
            <div className="bg-card border rounded-lg p-4">
              <h3 className="font-medium mb-1">Estimate</h3>
              <p className="text-lg font-semibold"># {editingQuote?.number || "NEW"}</p>
              <span className="inline-block mt-2 px-2 py-0.5 text-xs bg-muted rounded">Unsent</span>

              <div className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span>{format(form.watch("issueDate") || new Date(), "yyyy-MM-dd")}</span>
                </div>
                <div className="flex justify-between border-t pt-3">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Discount</span>
                  <span>{formatCurrency(discount)}</span>
                </div>
                <div className="flex justify-between border-t pt-3">
                  <span className="text-muted-foreground">Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Paid</span>
                  <span>{formatCurrency(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Balance</span>
                  <span>{formatCurrency(total)}</span>
                </div>
                <div className="flex justify-between border-t pt-3">
                  <span className="text-muted-foreground">
                    Deposit request ({depositRequest?.value || 25}%)
                  </span>
                  <span>{formatCurrency(depositAmount)}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setDepositDialogOpen(true)}
                  className="text-primary text-sm hover:underline"
                >
                  View deposit request
                </button>
              </div>
            </div>

            {activeTab === "send" && (
              <Button className="w-full" size="lg">
                Send estimate
              </Button>
            )}
          </div>
        </div>
      </Tabs>

      {/* Deposit Request Dialog */}
      <Dialog open={depositDialogOpen} onOpenChange={setDepositDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deposit request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span>Estimate total</span>
              <span>{formatCurrency(total)}</span>
            </div>

            <Tabs value={depositType} onValueChange={(v) => setDepositType(v as "percent" | "fixed")}>
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="percent">Percent (%)</TabsTrigger>
                <TabsTrigger value="fixed">Fixed ($)</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <Label className="w-32">Set percentage</Label>
                <Input
                  type="number"
                  value={depositValue}
                  onChange={(e) => setDepositValue(Number(e.target.value))}
                  className="w-24"
                />
                <span>%</span>
              </div>
              <div className="flex items-center gap-4">
                <Label className="w-32">Deposit amount</Label>
                <span>{formatCurrency(depositType === "percent" ? (total * depositValue / 100) : depositValue)}</span>
              </div>
              <div className="flex items-center gap-4">
                <Label className="w-32">Due date</Label>
                <Input
                  type="date"
                  value={depositDueDate}
                  onChange={(e) => setDepositDueDate(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-4">
                <Switch
                  checked={addToFutureEstimates}
                  onCheckedChange={setAddToFutureEstimates}
                />
                <Label>Setting: Add to future estimates</Label>
              </div>
              <div className="flex justify-between pt-4">
                <span>Deposit amount paid</span>
                <span>{formatCurrency(0)}</span>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={handleSaveDeposit} className="flex-1">Save</Button>
              <Button variant="link" onClick={handleCancelDeposit}>Cancel this request</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}