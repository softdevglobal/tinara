import { useState, useEffect, useCallback } from "react";
import { FileText, Plus, Download } from "lucide-react";
import { InvoiceDashboard } from "@/components/InvoiceDashboard";
import { InvoiceStats } from "@/components/InvoiceStats";
import { AppLayout } from "@/components/AppLayout";
import { useApp } from "@/context/AppContext";
import { exportInvoicesToCSV } from "@/lib/csv-export";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Invoices = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const showNewFromUrl = searchParams.get("new") === "invoice";
  const editInvoiceId = searchParams.get("edit");
  const [showNewForm, setShowNewForm] = useState(showNewFromUrl);
  const [activeTab, setActiveTab] = useState<"unpaid" | "paid">("unpaid");
  const [taxYearFilter, setTaxYearFilter] = useState<string>("all");
  const { invoices, clients, setInvoices, addClient } = useApp();
  const { toast } = useToast();

  // Sync showNewForm with URL parameter changes (SPA navigation)
  useEffect(() => {
    if (showNewFromUrl) {
      setShowNewForm(true);
    }
  }, [showNewFromUrl]);

  const handleExportInvoices = () => {
    exportInvoicesToCSV(invoices);
    toast({
      title: "Export complete",
      description: `${invoices.length} invoices exported to CSV.`,
    });
  };

  const handleClearEditInvoiceId = useCallback(() => {
    // Remove the edit parameter from URL
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("edit");
    setSearchParams(newParams, { replace: true });
  }, [searchParams, setSearchParams]);

  // Filter invoices based on Unpaid/Paid tabs
  const unpaidStatuses = ["Opened", "Overdue", "Sent", "Draft"];
  const paidStatuses = ["Paid"];

  const unpaidInvoices = invoices.filter((inv) => unpaidStatuses.includes(inv.status));
  const paidInvoices = invoices.filter((inv) => paidStatuses.includes(inv.status));

  const currentInvoices = activeTab === "unpaid" ? unpaidInvoices : paidInvoices;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
    }).format(amount);
  };

  const totalAmount = currentInvoices.reduce(
    (sum, inv) => sum + (inv.totals?.totalCents ?? Math.round((inv.total ?? 0) * 100)) / 100,
    0
  );

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <FileText className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-[36px] font-semibold text-foreground">Invoices</h1>
            <p className="text-sm text-muted-foreground">Manage your billing</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportInvoices}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm" onClick={() => setShowNewForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Invoice
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "unpaid" | "paid")}>
        <div className="flex items-center justify-between mb-4">
          <TabsList className="bg-transparent p-0 h-auto">
            <TabsTrigger
              value="unpaid"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 pb-2"
            >
              Unpaid
            </TabsTrigger>
            <TabsTrigger
              value="paid"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 pb-2"
            >
              Paid
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

        <TabsContent value="unpaid" className="mt-0">
          <InvoiceDashboard
            invoices={unpaidInvoices}
            clients={clients}
            onUpdateInvoices={setInvoices}
            onAddClient={addClient}
            showNewForm={showNewForm}
            onCloseNewForm={() => setShowNewForm(false)}
            editInvoiceId={editInvoiceId}
            onClearEditInvoiceId={handleClearEditInvoiceId}
          />
        </TabsContent>

        <TabsContent value="paid" className="mt-0">
          <InvoiceDashboard
            invoices={paidInvoices}
            clients={clients}
            onUpdateInvoices={setInvoices}
            onAddClient={addClient}
            showNewForm={false}
            onCloseNewForm={() => {}}
            editInvoiceId={editInvoiceId}
            onClearEditInvoiceId={handleClearEditInvoiceId}
          />
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
};

export default Invoices;
