import { useState, useEffect } from "react";
import { FileText, Plus, Download } from "lucide-react";
import { InvoiceDashboard } from "@/components/InvoiceDashboard";
import { InvoiceStats } from "@/components/InvoiceStats";
import { DashboardHome } from "@/components/dashboard/DashboardHome";
import { AppLayout } from "@/components/AppLayout";
import { useApp } from "@/context/AppContext";
import { exportInvoicesToCSV } from "@/lib/csv-export";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";

type View = "home" | "invoices";

const Index = () => {
  const [searchParams] = useSearchParams();
  const showNewFromUrl = searchParams.get("new") === "invoice";
  const [showNewForm, setShowNewForm] = useState(showNewFromUrl);
  const [view, setView] = useState<View>("home");
  const { invoices, clients, setInvoices, addClient, quotes } = useApp();
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

  if (view === "invoices" || showNewForm) {
    return (
      <AppLayout>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <FileText className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">Invoices</h1>
              <p className="text-sm text-muted-foreground">Manage your billing</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportInvoices}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button
              size="sm"
              onClick={() => setShowNewForm(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Invoice
            </Button>
          </div>
        </div>

        {/* Stats */}
        {!showNewForm && <InvoiceStats invoices={invoices} />}

        <InvoiceDashboard
          invoices={invoices}
          clients={clients}
          onUpdateInvoices={setInvoices}
          onAddClient={addClient}
          showNewForm={showNewForm}
          onCloseNewForm={() => {
            setShowNewForm(false);
            if (!showNewFromUrl) {
              setView("home");
            }
          }}
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <DashboardHome invoices={invoices} quotes={quotes} />
      
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Recent Invoices</h2>
          <Button variant="link" onClick={() => setView("invoices")}>
            View all
          </Button>
        </div>
        <InvoiceStats invoices={invoices} />
        <div className="mt-4">
          <InvoiceDashboard
            invoices={invoices.slice(0, 5)}
            clients={clients}
            onUpdateInvoices={setInvoices}
            onAddClient={addClient}
            showNewForm={false}
            onCloseNewForm={() => {}}
          />
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;
