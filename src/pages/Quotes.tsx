import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Quotes = () => {
  const [searchParams] = useSearchParams();
  const showNewFromUrl = searchParams.get("new") === "quote";
  const [showNewForm, setShowNewForm] = useState(showNewFromUrl);
  const [activeTab, setActiveTab] = useState<"pending" | "done">("pending");
  const [taxYearFilter, setTaxYearFilter] = useState<string>("all");
  const { quotes, clients, projects, setQuotes, addClient, setInvoices } = useApp();
  const { toast } = useToast();

  const handleExportQuotes = () => {
    exportQuotesToCSV(quotes);
    toast({
      title: "Export complete",
      description: `${quotes.length} quotes exported to CSV.`,
    });
  };

  const handleConvertToInvoice = (quote: Quote) => {
    // Use quote's line items and totals if available, otherwise create legacy
    const totalCents = quote.totals?.totalCents ?? Math.round((quote.total ?? 0) * 100);
    
    const newInvoice: Invoice = {
      id: `inv_${Date.now()}`,
      number: `A${Date.now().toString().slice(-8)}`,
      clientName: quote.clientName,
      projectName: quote.projectName,
      date: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      dueDaysOverdue: 0,
      dueLabel: "Due in 14 days",
      status: "Opened",
      currency: quote.currency,
      lineItems: quote.lineItems || [],
      totals: quote.totals || {
        subtotalCents: totalCents,
        discountCents: 0,
        taxCents: 0,
        totalCents: totalCents,
      },
      total: quote.total, // Keep for backwards compat
    };

    setInvoices((prev) => [newInvoice, ...prev]);
    setQuotes((prev) =>
      prev.map((q) =>
        q.id === quote.id
          ? { ...q, status: "Converted" as const }
          : q
      )
    );

    toast({
      title: "Quote converted to invoice",
      description: `Invoice #${newInvoice.number} has been created from Quote #${quote.number}.`,
    });
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
          />
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
};

export default Quotes;