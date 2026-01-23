import { useState, useMemo } from "react";
import { invoices, Invoice } from "@/data/invoices";
import { InvoiceFilters } from "./InvoiceFilters";
import { InvoiceListItem } from "./InvoiceListItem";
import { InvoiceCard } from "./InvoiceCard";
import { ArrowLeft, FileText } from "lucide-react";

type StatusFilter = "all" | "Opened" | "Paid" | "Overdue";

export function InvoiceDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const counts = useMemo(() => ({
    all: invoices.length,
    Opened: invoices.filter((inv) => inv.status === "Opened").length,
    Paid: invoices.filter((inv) => inv.status === "Paid").length,
    Overdue: invoices.filter((inv) => inv.status === "Overdue").length,
  }), []);

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
  }, [searchQuery, statusFilter]);

  if (selectedInvoice) {
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
          <InvoiceCard invoice={selectedInvoice} />
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
            />
          ))}
        </div>
      )}
    </div>
  );
}
