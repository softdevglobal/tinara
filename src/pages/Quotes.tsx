import { useState } from "react";
import { FileText, Plus, Download } from "lucide-react";
import { QuoteDashboard } from "@/components/QuoteDashboard";
import { AppLayout } from "@/components/AppLayout";
import { useApp } from "@/context/AppContext";
import { exportQuotesToCSV } from "@/lib/csv-export";
import { useToast } from "@/hooks/use-toast";
import { Quote } from "@/data/quotes";
import { Invoice } from "@/data/invoices";

const Quotes = () => {
  const [showNewForm, setShowNewForm] = useState(false);
  const { quotes, clients, setQuotes, addClient, invoices, setInvoices } = useApp();
  const { toast } = useToast();

  const handleExportQuotes = () => {
    exportQuotesToCSV(quotes);
    toast({
      title: "Export complete",
      description: `${quotes.length} quotes exported to CSV.`,
    });
  };

  const handleConvertToInvoice = (quote: Quote) => {
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
      total: quote.total,
      currency: quote.currency,
    };

    // Add the new invoice
    setInvoices((prev) => [newInvoice, ...prev]);

    // Mark the quote as converted
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

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <FileText className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Quotes</h1>
            <p className="text-sm text-muted-foreground">Manage your proposals</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportQuotes}
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
            <span className="hidden sm:inline">New Quote</span>
          </button>
        </div>
      </div>

      <QuoteDashboard
        quotes={quotes}
        clients={clients}
        onUpdateQuotes={setQuotes}
        onAddClient={addClient}
        onConvertToInvoice={handleConvertToInvoice}
        showNewForm={showNewForm}
        onCloseNewForm={() => setShowNewForm(false)}
      />
    </AppLayout>
  );
};

export default Quotes;
