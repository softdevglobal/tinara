import { useState, useMemo, useRef, useEffect } from "react";
import { Invoice, InvoiceSortOption } from "@/data/invoices";
import { Client } from "@/data/clients";
import { InvoiceFilters } from "./InvoiceFilters";
import { InvoiceTable } from "./tables/InvoiceTable";
import { InvoiceCard } from "./InvoiceCard";
import { DocumentCreationForm } from "./document/DocumentCreationForm";
import { BulkActionsBar } from "./BulkActionsBar";
import { ArrowLeft } from "lucide-react";
import { generateInvoicePdf } from "@/lib/pdf-generator";
import { useToast } from "@/hooks/use-toast";
import { useApp } from "@/context/AppContext";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { Quote } from "@/data/quotes";

type StatusFilter = "all" | "Opened" | "Paid" | "Overdue";
type View = "list" | "detail" | "new" | "edit";

interface InvoiceDashboardProps {
  invoices: Invoice[];
  clients: Client[];
  onUpdateInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>;
  onAddClient: (client: Client) => void;
  showNewForm?: boolean;
  onCloseNewForm?: () => void;
  editInvoiceId?: string | null;
  onClearEditInvoiceId?: () => void;
}

function sortInvoices(invoices: Invoice[], sortOption: InvoiceSortOption): Invoice[] {
  return [...invoices].sort((a, b) => {
    switch (sortOption) {
      case "date-desc":
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      case "date-asc":
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      case "paid-desc":
        if (!a.paidDate && !b.paidDate) return 0;
        if (!a.paidDate) return 1;
        if (!b.paidDate) return -1;
        return new Date(b.paidDate).getTime() - new Date(a.paidDate).getTime();
      case "paid-asc":
        if (!a.paidDate && !b.paidDate) return 0;
        if (!a.paidDate) return 1;
        if (!b.paidDate) return -1;
        return new Date(a.paidDate).getTime() - new Date(b.paidDate).getTime();
      case "amount-desc":
        return (b.totals?.totalCents ?? 0) - (a.totals?.totalCents ?? 0);
      case "amount-asc":
        return (a.totals?.totalCents ?? 0) - (b.totals?.totalCents ?? 0);
      default:
        return 0;
    }
  });
}

export function InvoiceDashboard({
  invoices,
  clients,
  onUpdateInvoices,
  onAddClient,
  showNewForm,
  onCloseNewForm,
  editInvoiceId,
  onClearEditInvoiceId,
}: InvoiceDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortOption, setSortOption] = useState<InvoiceSortOption>("date-desc");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [view, setView] = useState<View>(showNewForm ? "new" : "list");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { brandingSettings } = useApp();

  // Keyboard shortcuts
  useKeyboardShortcuts(
    {
      onNewItem: () => {
        if (view === "list") {
          setView("new");
        }
      },
      onToggleSelectMode: () => {},
      onFocusSearch: () => {
        if (view === "list") {
          searchInputRef.current?.focus();
        }
      },
    },
    view === "list"
  );

  // Sync with prop - use useEffect to avoid setState during render
  useEffect(() => {
    if (showNewForm && view !== "new") {
      setView("new");
    }
  }, [showNewForm, view]);

  // Handle edit invoice by ID from URL
  useEffect(() => {
    if (editInvoiceId && view === "list") {
      const invoiceToEdit = invoices.find((inv) => inv.id === editInvoiceId);
      if (invoiceToEdit) {
        setEditingInvoice(invoiceToEdit);
        setView("edit");
        onClearEditInvoiceId?.();
      }
    }
  }, [editInvoiceId, invoices, view, onClearEditInvoiceId]);

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
    const filtered = invoices.filter((invoice) => {
      const matchesSearch =
        searchQuery === "" ||
        invoice.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.projectName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || invoice.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
    return sortInvoices(filtered, sortOption);
  }, [invoices, searchQuery, statusFilter, sortOption]);

  const handleMarkPaid = (invoice: Invoice) => {
    const paidDate = new Date().toISOString().split("T")[0];
    onUpdateInvoices((prev) =>
      prev.map((inv) =>
        inv.id === invoice.id
          ? { ...inv, status: "Paid" as const, dueDaysOverdue: 0, dueLabel: "", paidDate }
          : inv
      )
    );
    toast({
      title: "Invoice marked as paid",
      description: "The invoice status has been updated.",
    });
  };

  const handleDownloadPdf = (invoice: Invoice) => {
    generateInvoicePdf(invoice, brandingSettings);
    toast({
      title: "PDF Downloaded",
      description: `Invoice #${invoice.number} has been downloaded.`,
    });
  };

  const handleDelete = (invoice: Invoice) => {
    onUpdateInvoices((prev) => prev.filter((inv) => inv.id !== invoice.id));
    setSelectedIds((prev) => prev.filter((id) => id !== invoice.id));
    toast({
      title: "Invoice deleted",
      description: "The invoice has been removed.",
    });
  };

  const handleBulkMarkPaid = () => {
    const paidDate = new Date().toISOString().split("T")[0];
    const count = selectedIds.length;
    onUpdateInvoices((prev) =>
      prev.map((inv) =>
        selectedIds.includes(inv.id)
          ? { ...inv, status: "Paid" as const, dueDaysOverdue: 0, dueLabel: "", paidDate }
          : inv
      )
    );
    setSelectedIds([]);
    toast({
      title: "Invoices marked as paid",
      description: `${count} invoice${count > 1 ? "s" : ""} marked as paid.`,
    });
  };

  const handleBulkDelete = () => {
    const count = selectedIds.length;
    onUpdateInvoices((prev) => prev.filter((inv) => !selectedIds.includes(inv.id)));
    setSelectedIds([]);
    toast({
      title: "Invoices deleted",
      description: `${count} invoice${count > 1 ? "s" : ""} deleted.`,
    });
  };

  const handleEdit = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setView("edit");
  };

  const handleCreateInvoice = (doc: Invoice | Quote) => {
    const invoice = doc as Invoice;
    onUpdateInvoices((prev) => [invoice, ...prev]);
    setView("list");
    onCloseNewForm?.();
    toast({
      title: "Invoice created",
      description: `Invoice #${invoice.number} has been created.`,
    });
  };

  const handleUpdateInvoice = (doc: Invoice | Quote) => {
    if (!editingInvoice) return;
    const invoice = doc as Invoice;
    
    onUpdateInvoices((prev) =>
      prev.map((inv) => inv.id === invoice.id ? invoice : inv)
    );
    
    setEditingInvoice(null);
    setView("list");
    toast({
      title: "Invoice updated",
      description: `Invoice #${invoice.number} has been updated.`,
    });
  };

  const handleBackToList = () => {
    setView("list");
    setSelectedInvoice(null);
    setEditingInvoice(null);
    onCloseNewForm?.();
  };

  if (view === "new") {
    return (
      <DocumentCreationForm
        type="invoice"
        onBack={handleBackToList}
        onSubmit={handleCreateInvoice}
        clients={clients}
        onAddClient={onAddClient}
      />
    );
  }

  if (view === "edit" && editingInvoice) {
    return (
      <DocumentCreationForm
        type="invoice"
        onBack={handleBackToList}
        onSubmit={handleUpdateInvoice}
        editingDocument={editingInvoice}
        clients={clients}
        onAddClient={onAddClient}
      />
    );
  }

  if (view === "detail" && selectedInvoice) {
    const currentInvoice = invoices.find((inv) => inv.id === selectedInvoice.id);
    if (!currentInvoice) {
      setView("list");
      setSelectedInvoice(null);
      return null;
    }

    return (
      <div className="animate-fade-in">
        <button
          onClick={handleBackToList}
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
    <div className="space-y-4">
      <InvoiceFilters
        ref={searchInputRef}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        sortOption={sortOption}
        onSortChange={setSortOption}
        counts={counts}
        isSelectMode={selectedIds.length > 0}
        onToggleSelectMode={() => setSelectedIds([])}
      />

      {selectedIds.length > 0 && (
        <BulkActionsBar
          selectedCount={selectedIds.length}
          totalCount={filteredInvoices.length}
          onSelectAll={() => setSelectedIds(filteredInvoices.map((inv) => inv.id))}
          onMarkPaid={handleBulkMarkPaid}
          onDelete={handleBulkDelete}
          onCancel={() => setSelectedIds([])}
        />
      )}

      <InvoiceTable
        invoices={filteredInvoices}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onMarkAsPaid={handleMarkPaid}
        onDownloadPdf={handleDownloadPdf}
        sortOption={sortOption}
        onSortChange={setSortOption}
      />
    </div>
  );
}