import { useState, useMemo, useRef, useEffect } from "react";
import { Invoice, InvoiceSortOption } from "@/data/invoices";
import { Client } from "@/data/clients";
import { InvoiceFilters } from "./InvoiceFilters";
import { InvoiceTable } from "./tables/InvoiceTable";
import { InvoiceCard } from "./InvoiceCard";
import { NewInvoiceForm } from "./NewInvoiceForm";
import { BulkActionsBar } from "./BulkActionsBar";
import { ArrowLeft, FileText } from "lucide-react";
import { generateInvoicePdf } from "@/lib/pdf-generator";
import { useToast } from "@/hooks/use-toast";
import { InvoiceFormData } from "@/lib/invoice-schema";
import { useApp } from "@/context/AppContext";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

type StatusFilter = "all" | "Opened" | "Paid" | "Overdue";
type View = "list" | "detail" | "new" | "edit";

interface InvoiceDashboardProps {
  invoices: Invoice[];
  clients: Client[];
  onUpdateInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>;
  onAddClient: (client: Client) => void;
  showNewForm?: boolean;
  onCloseNewForm?: () => void;
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
        return b.total - a.total;
      case "amount-asc":
        return a.total - b.total;
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
  }, [showNewForm]);

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

  const handleCreateInvoice = (data: InvoiceFormData) => {
    const subtotal = data.lineItems.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );
    const taxAmount = subtotal * (data.taxRate / 100);
    const total = subtotal + taxAmount;

    // Convert to cents for storage
    const subtotalCents = Math.round(subtotal * 100);
    const taxCents = Math.round(taxAmount * 100);
    const totalCents = Math.round(total * 100);

    const newInvoice: Invoice = {
      id: `inv_${Date.now()}`,
      number: `A${Date.now().toString().slice(-8)}`,
      clientName: data.clientName,
      projectName: data.projectName || "",
      date: data.issueDate.toISOString().split("T")[0],
      dueDate: data.dueDate.toISOString().split("T")[0],
      dueDaysOverdue: 0,
      dueLabel: `Due in ${Math.ceil((data.dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days`,
      status: "Opened",
      currency: "AUD",
      lineItems: [], // TODO: Convert to DocumentLineItem once form is migrated
      totals: {
        subtotalCents,
        discountCents: 0,
        taxCents,
        totalCents,
      },
      total, // Keep for backwards compat
    };

    onUpdateInvoices((prev) => [newInvoice, ...prev]);
    setView("list");
    onCloseNewForm?.();
    toast({
      title: "Invoice created",
      description: `Invoice #${newInvoice.number} has been created.`,
    });
  };

  const handleUpdateInvoice = (data: InvoiceFormData) => {
    if (!editingInvoice) return;

    const subtotal = data.lineItems.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );
    const taxAmount = subtotal * (data.taxRate / 100);
    const total = subtotal + taxAmount;

    // Convert to cents for storage
    const subtotalCents = Math.round(subtotal * 100);
    const taxCents = Math.round(taxAmount * 100);
    const totalCents = Math.round(total * 100);

    const dueDate = data.dueDate;
    const now = new Date();
    const daysDiff = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    let status: "Opened" | "Paid" | "Overdue" = editingInvoice.status;
    let dueDaysOverdue = 0;
    let dueLabel = "";

    if (status !== "Paid") {
      if (daysDiff < 0) {
        status = "Overdue";
        dueDaysOverdue = Math.abs(daysDiff);
        dueLabel = `${dueDaysOverdue} day${dueDaysOverdue > 1 ? "s" : ""} ago`;
      } else {
        status = "Opened";
        dueLabel = `Due in ${daysDiff} days`;
      }
    }

    onUpdateInvoices((prev) =>
      prev.map((inv) =>
        inv.id === editingInvoice.id
          ? {
              ...inv,
              clientName: data.clientName,
              projectName: data.projectName || "",
              date: data.issueDate.toISOString().split("T")[0],
              dueDate: data.dueDate.toISOString().split("T")[0],
              dueDaysOverdue,
              dueLabel,
              status,
              totals: {
                subtotalCents,
                discountCents: 0,
                taxCents,
                totalCents,
              },
              total, // Keep for backwards compat
            }
          : inv
      )
    );
    
    setEditingInvoice(null);
    setView("list");
    toast({
      title: "Invoice updated",
      description: `Invoice #${editingInvoice.number} has been updated.`,
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
      <NewInvoiceForm 
        onBack={handleBackToList} 
        onSubmit={handleCreateInvoice}
        clients={clients}
        onAddClient={onAddClient}
      />
    );
  }

  if (view === "edit" && editingInvoice) {
    return (
      <NewInvoiceForm
        onBack={handleBackToList}
        onSubmit={handleUpdateInvoice}
        editingInvoice={editingInvoice}
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
