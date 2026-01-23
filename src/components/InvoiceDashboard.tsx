import { useState, useMemo } from "react";
import { Invoice } from "@/data/invoices";
import { Client } from "@/data/clients";
import { InvoiceFilters } from "./InvoiceFilters";
import { InvoiceListItem } from "./InvoiceListItem";
import { InvoiceCard } from "./InvoiceCard";
import { NewInvoiceForm } from "./NewInvoiceForm";
import { ArrowLeft, FileText } from "lucide-react";
import { generateInvoicePdf } from "@/lib/pdf-generator";
import { useToast } from "@/hooks/use-toast";
import { InvoiceFormData } from "@/lib/invoice-schema";

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
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [view, setView] = useState<View>(showNewForm ? "new" : "list");
  const { toast } = useToast();

  // Sync with prop
  if (showNewForm && view !== "new") {
    setView("new");
  }

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
    onUpdateInvoices((prev) =>
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
    onUpdateInvoices((prev) => prev.filter((inv) => inv.id !== id));
    toast({
      title: "Invoice deleted",
      description: "The invoice has been removed.",
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
      total: total,
      currency: "AUD",
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
              total,
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
              onClick={() => {
                setSelectedInvoice(invoice);
                setView("detail");
              }}
              onEdit={handleEdit}
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
