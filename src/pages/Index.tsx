import { useState } from "react";
import { FileText, Plus, Download } from "lucide-react";
import { InvoiceDashboard } from "@/components/InvoiceDashboard";
import { InvoiceStats } from "@/components/InvoiceStats";
import { RevenueChart } from "@/components/RevenueChart";
import { AppLayout } from "@/components/AppLayout";
import { useApp } from "@/context/AppContext";
import { exportInvoicesToCSV } from "@/lib/csv-export";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [showNewForm, setShowNewForm] = useState(false);
  const { invoices, clients, setInvoices, addClient } = useApp();
  const { toast } = useToast();

  const handleExportInvoices = () => {
    exportInvoicesToCSV(invoices);
    toast({
      title: "Export complete",
      description: `${invoices.length} invoices exported to CSV.`,
    });
  };

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
          <button
            onClick={handleExportInvoices}
            className="flex items-center gap-2 h-9 px-3 rounded-lg border border-border text-sm font-medium hover:bg-secondary transition-colors"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button
            onClick={() => setShowNewForm(true)}
            className="flex items-center gap-2 h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Invoice</span>
          </button>
        </div>
      </div>

      {/* Stats & Chart */}
      {!showNewForm && (
        <>
          <InvoiceStats invoices={invoices} />
          <RevenueChart invoices={invoices} />
        </>
      )}

      <InvoiceDashboard
        invoices={invoices}
        clients={clients}
        onUpdateInvoices={setInvoices}
        onAddClient={addClient}
        showNewForm={showNewForm}
        onCloseNewForm={() => setShowNewForm(false)}
      />
    </AppLayout>
  );
};

export default Index;
