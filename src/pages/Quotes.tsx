import { useState, useEffect } from "react";
import { ClipboardList, Plus, Download } from "lucide-react";
import { QuoteDashboard } from "@/components/QuoteDashboard";
import { AppLayout } from "@/components/AppLayout";
import { useApp } from "@/context/AppContext";
import { exportQuotesToCSV } from "@/lib/csv-export";
import { useToast } from "@/hooks/use-toast";
import { Quote } from "@/data/quotes";
import { Invoice } from "@/data/invoices";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchParams } from "react-router-dom";
import { useDocumentCounters } from "@/context/DocumentCountersContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Quotes = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const showNewFromUrl = searchParams.get("new") === "quote";
  const editQuoteId = searchParams.get("edit");
  const [showNewForm, setShowNewForm] = useState(showNewFromUrl);
  const [activeTab, setActiveTab] = useState<"pending" | "done">("pending");
  const [taxYearFilter, setTaxYearFilter] = useState<string>("all");
  const { quotes, clients, projects, setQuotes, addClient, setInvoices } = useApp();
  const { toast } = useToast();
  const { generateInvoiceNumber } = useDocumentCounters();

  // Sync showNewForm with URL parameter changes (SPA navigation)
  useEffect(() => {
    if (showNewFromUrl) {
      setShowNewForm(true);
    }
  }, [showNewFromUrl]);

  const handleClearEditQuoteId = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("edit");
    setSearchParams(newParams, { replace: true });
  };

  const handleExportQuotes = () => {
    exportQuotesToCSV(quotes);
    toast({
      title: "Export complete",
      description: `${quotes.length} quotes exported to CSV.`,
    });
  };

  const handleConvertToInvoice = (quote: Quote) => {
    // Generate a new invoice number using the counter
    const newInvoiceNumber = generateInvoiceNumber();
    
    // Calculate due date (14 days from today)
    const today = new Date();
    const dueDate = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);
    const dueDays = 14;

    // Create invoice with copied line items and audit trail
    const newInvoice: Invoice = {
      id: `inv_${Date.now()}`,
      number: newInvoiceNumber,
      clientName: quote.clientName,
      clientEmail: quote.clientSnapshot?.email,
      projectName: quote.projectName,
      projectId: quote.projectId,
      date: today.toISOString().split("T")[0],
      dueDate: dueDate.toISOString().split("T")[0],
      dueDaysOverdue: 0,
      dueLabel: `Due in ${dueDays} days`,
      status: "Opened",
      currency: quote.currency,
      notes: quote.comments,
      
      // Copy snapshots for audit integrity
      clientSnapshot: quote.clientSnapshot,
      documentTaxContext: quote.documentTaxContext,
      
      // Copy line items (already immutable snapshots)
      lineItems: quote.lineItems.map(item => ({
        ...item,
        id: `li_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        documentId: `inv_${Date.now()}`,
      })),
      
      // Copy totals
      totals: { ...quote.totals },
      
      // Audit trail - link back to quote
      quoteId: quote.id,
      
      // Copy other fields
      attachments: quote.attachments,
      poNumber: quote.poNumber,
      tags: quote.tags,
      internalNotes: quote.internalNotes,
      paymentInstructions: quote.paymentInstructions,
      
      // Keep for backwards compat
      total: quote.total,
    };

    // Add new invoice
    setInvoices((prev) => [newInvoice, ...prev]);
    
    // Update quote status to Converted and store invoice reference
    setQuotes((prev) =>
      prev.map((q) =>
        q.id === quote.id
          ? { 
              ...q, 
              status: "Converted" as const,
              convertedToInvoiceId: newInvoice.id,
            }
          : q
      )
    );

    toast({
      title: "Quote converted to invoice",
      description: `Invoice #${newInvoice.number} has been created from Quote #${quote.number}.`,
    });
    
    return newInvoice;
  };

  // Filter quotes based on Pending/Done tabs
  const pendingStatuses: Quote["status"][] = ["Draft", "Sent", "Unsent", "Opened"];
  const doneStatuses: Quote["status"][] = ["Accepted", "Approved", "Converted", "Expired"];

  const pendingQuotes = quotes.filter((q) => pendingStatuses.includes(q.status));
  const doneQuotes = quotes.filter((q) => doneStatuses.includes(q.status));

  const currentQuotes = activeTab === "pending" ? pendingQuotes : doneQuotes;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
    }).format(amount);
  };

  const totalAmount = currentQuotes.reduce((sum, q) => sum + (q.totals?.totalCents ?? Math.round((q.total ?? 0) * 100)) / 100, 0);

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <ClipboardList className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Estimates</h1>
            <p className="text-sm text-muted-foreground">Manage your quotes and proposals</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportQuotes}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button
            size="sm"
            onClick={() => setShowNewForm(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create an estimate
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "pending" | "done")}>
        <div className="flex items-center justify-between mb-4">
          <TabsList className="bg-transparent p-0 h-auto">
            <TabsTrigger 
              value="pending" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 pb-2"
            >
              Pending
            </TabsTrigger>
            <TabsTrigger 
              value="done"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 pb-2"
            >
              Done
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Total and Tax Year Filter */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm">
            <span className="text-muted-foreground">Total:</span>{" "}
            <span className="font-semibold">{formatCurrency(totalAmount)}</span>
          </p>

          <Select value={taxYearFilter} onValueChange={setTaxYearFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="All tax years" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All tax years</SelectItem>
              <SelectItem value="2026">2025-2026</SelectItem>
              <SelectItem value="2025">2024-2025</SelectItem>
              <SelectItem value="2024">2023-2024</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <TabsContent value="pending" className="mt-0">
          <QuoteDashboard
            quotes={pendingQuotes}
            clients={clients}
            projects={projects}
            onUpdateQuotes={setQuotes}
            onAddClient={addClient}
            onConvertToInvoice={handleConvertToInvoice}
            showNewForm={showNewForm}
            onCloseNewForm={() => setShowNewForm(false)}
            editQuoteId={editQuoteId}
            onClearEditQuoteId={handleClearEditQuoteId}
          />
        </TabsContent>

        <TabsContent value="done" className="mt-0">
          <QuoteDashboard
            quotes={doneQuotes}
            clients={clients}
            projects={projects}
            onUpdateQuotes={setQuotes}
            onAddClient={addClient}
            onConvertToInvoice={handleConvertToInvoice}
            showNewForm={false}
            onCloseNewForm={() => {}}
            editQuoteId={editQuoteId}
            onClearEditQuoteId={handleClearEditQuoteId}
          />
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
};

export default Quotes;