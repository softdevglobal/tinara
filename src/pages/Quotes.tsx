import { useState } from "react";
import { FileText, Plus, Download } from "lucide-react";
import { QuoteDashboard } from "@/components/QuoteDashboard";
import { AppLayout } from "@/components/AppLayout";
import { useApp } from "@/context/AppContext";
import { exportQuotesToCSV } from "@/lib/csv-export";
import { useToast } from "@/hooks/use-toast";
import { Quote } from "@/data/quotes";
import { Invoice } from "@/data/invoices";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "react-router-dom";

const Quotes = () => {
  const [searchParams] = useSearchParams();
  const showNewFromUrl = searchParams.get("new") === "quote";
  const [showNewForm, setShowNewForm] = useState(showNewFromUrl);
  const { quotes, clients, setQuotes, addClient, setInvoices } = useApp();
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
            New Quote
          </Button>
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
