import { useState, useMemo } from "react";
import { invoices as initialInvoices, Invoice } from "@/data/invoices";
import { InvoiceFilters } from "./InvoiceFilters";
import { InvoiceListItem } from "./InvoiceListItem";
import { InvoiceCard } from "./InvoiceCard";
import { ArrowLeft, FileText } from "lucide-react";
import { generateInvoicePdf } from "@/lib/pdf-generator";
import { useToast } from "@/hooks/use-toast";

type StatusFilter = "all" | "Opened" | "Paid" | "Overdue";

export function InvoiceDashboard() {
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const { toast } = useToast();

  const counts = useMemo(
    () => ({
      all: invoices.length,
      Opened: invoices.filter((inv) => inv.status === "Opened").length,
      Paid: invoices.filter((inv) => inv.status === "Paid").length,
      Overdue: invoices.filter((inv) => inv.status === "Overdue").length,
    }),
    [invoices]
  );

  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const matchesSearch =
        searchQuery === "" ||
        invoice.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.projectName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || invoice.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [invoices, searchQuery, statusFilter]);

  const handleMarkPaid = (id: string) => {
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === id
          ? { ...inv, status: "Paid" as const, dueDaysOverdue: 0, dueLabel: "" }
          : inv
      )
    );
    toast({
      title: "Invoice marked as paid",
      description: "The invoice status has been updated.",
    });
  };

  const handleSendReminder = (invoice: Invoice) => {
    // This will be implemented with Cloud/Edge function
    toast({
      title: "Reminder feature",
      description: "Enable Lovable Cloud to send email reminders.",
      variant: "destructive",
    });
  };

  const handleDownloadPdf = (invoice: Invoice) => {
    generateInvoicePdf(invoice);
    toast({
      title: "PDF Downloaded",
      description: `Invoice #${invoice.number} has been downloaded.`,
    });
  };

  const handleDelete = (id: string) => {
    setInvoices((prev) => prev.filter((inv) => inv.id !== id));
    toast({
      title: "Invoice deleted",
      description: "The invoice has been removed.",
    });
  };

  if (selectedInvoice) {
    // Update selected invoice if it was modified
    const currentInvoice = invoices.find((inv) => inv.id === selectedInvoice.id);
    if (!currentInvoice) {
      setSelectedInvoice(null);
      return null;
    }

    return (
      <div className="animate-fade-in">
        <button
          onClick={() => setSelectedInvoice(null)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to invoices
        </button>
        <div className="max-w-md">
          <InvoiceCard invoice={currentInvoice} />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <InvoiceFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        counts={counts}
      />

      {filteredInvoices.length === 0 ? (
        <div className="text-center py-12">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary mx-auto mb-4">
            <FileText className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">No invoices found</p>
          <p className="text-xs text-muted-foreground mt-1">
            Try adjusting your search or filter
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredInvoices.map((invoice) => (
            <InvoiceListItem
              key={invoice.id}
              invoice={invoice}
              onClick={() => setSelectedInvoice(invoice)}
              onMarkPaid={handleMarkPaid}
              onSendReminder={handleSendReminder}
              onDownloadPdf={handleDownloadPdf}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
