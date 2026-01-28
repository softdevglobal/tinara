import { useState, useMemo } from "react";
import { RecurringInvoice, getNextRecurrenceDate } from "@/data/recurring-invoices";
import { Invoice } from "@/data/invoices";
import { Client } from "@/data/clients";
import { RecurringInvoiceListItem } from "./RecurringInvoiceListItem";
import { NewRecurringInvoiceForm } from "./NewRecurringInvoiceForm";
import { RecurringInvoiceFormData } from "@/lib/recurring-invoice-schema";
import { ArrowLeft, Repeat, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";

type View = "list" | "new" | "edit";
type StatusFilter = "all" | "active" | "paused";

interface RecurringInvoiceDashboardProps {
  recurringInvoices: RecurringInvoice[];
  onUpdateRecurringInvoices: React.Dispatch<React.SetStateAction<RecurringInvoice[]>>;
  onAddInvoice: (invoice: Invoice) => void;
  clients: Client[];
  onAddClient: (client: Client) => void;
  showNewForm?: boolean;
  onCloseNewForm?: () => void;
}

export function RecurringInvoiceDashboard({
  recurringInvoices,
  onUpdateRecurringInvoices,
  onAddInvoice,
  clients,
  onAddClient,
  showNewForm,
  onCloseNewForm,
}: RecurringInvoiceDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [editingRecurring, setEditingRecurring] = useState<RecurringInvoice | null>(null);
  const [view, setView] = useState<View>(showNewForm ? "new" : "list");
  const { toast } = useToast();

  if (showNewForm && view !== "new") {
    setView("new");
  }

  const counts = useMemo(() => ({
    all: recurringInvoices.length,
    active: recurringInvoices.filter((r) => r.isActive).length,
    paused: recurringInvoices.filter((r) => !r.isActive).length,
  }), [recurringInvoices]);

  const filteredRecurring = useMemo(() => {
    return recurringInvoices.filter((recurring) => {
      const matchesSearch =
        searchQuery === "" ||
        recurring.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recurring.projectName?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && recurring.isActive) ||
        (statusFilter === "paused" && !recurring.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [recurringInvoices, searchQuery, statusFilter]);

  const handleToggleActive = (id: string) => {
    onUpdateRecurringInvoices((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isActive: !r.isActive } : r))
    );
    const recurring = recurringInvoices.find((r) => r.id === id);
    toast({
      title: recurring?.isActive ? "Recurring invoice paused" : "Recurring invoice resumed",
      description: `The schedule for ${recurring?.clientName} has been updated.`,
    });
  };

  const handleDelete = (id: string) => {
    onUpdateRecurringInvoices((prev) => prev.filter((r) => r.id !== id));
    toast({
      title: "Recurring invoice deleted",
      description: "The recurring invoice template has been removed.",
    });
  };

  const handleEdit = (recurring: RecurringInvoice) => {
    setEditingRecurring(recurring);
    setView("edit");
  };

  const handleGenerateNow = (recurring: RecurringInvoice) => {
    const subtotal = recurring.lineItems.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );
    const taxAmount = subtotal * (recurring.taxRate / 100);
    const total = subtotal + taxAmount;

    // Convert legacy line items to cents for storage
    const subtotalCents = Math.round(subtotal * 100);
    const taxCents = Math.round(taxAmount * 100);
    const totalCents = Math.round(total * 100);

    const newInvoice: Invoice = {
      id: `inv_${Date.now()}`,
      number: `A${Date.now().toString().slice(-8)}`,
      clientName: recurring.clientName,
      projectName: recurring.projectName || "",
      date: new Date().toISOString().split("T")[0],
      dueDate: recurring.nextDueDate,
      dueDaysOverdue: 0,
      dueLabel: `Due ${new Date(recurring.nextDueDate).toLocaleDateString()}`,
      status: "Opened",
      currency: recurring.currency,
      lineItems: [], // Legacy - generated from recurring template
      totals: {
        subtotalCents,
        discountCents: 0,
        taxCents,
        totalCents,
      },
      total, // Keep for backwards compat
    };

    onAddInvoice(newInvoice);

    // Update next due date
    onUpdateRecurringInvoices((prev) =>
      prev.map((r) =>
        r.id === recurring.id
          ? {
              ...r,
              lastGeneratedAt: new Date().toISOString().split("T")[0],
              nextDueDate: getNextRecurrenceDate(recurring.nextDueDate, recurring.frequency),
            }
          : r
      )
    );

    toast({
      title: "Invoice generated",
      description: `Invoice #${newInvoice.number} has been created for ${recurring.clientName}.`,
    });
  };

  const handleCreateRecurring = (data: RecurringInvoiceFormData) => {
    const newRecurring: RecurringInvoice = {
      id: `rec_${Date.now()}`,
      clientName: data.clientName,
      clientEmail: data.clientEmail,
      projectName: data.projectName,
      lineItems: data.lineItems,
      taxRate: data.taxRate,
      currency: "AUD",
      frequency: data.frequency,
      nextDueDate: data.startDate.toISOString().split("T")[0],
      daysBefore: data.daysBefore,
      isActive: true,
      createdAt: new Date().toISOString().split("T")[0],
      notes: data.notes,
    };

    onUpdateRecurringInvoices((prev) => [newRecurring, ...prev]);
    setView("list");
    onCloseNewForm?.();
    toast({
      title: "Recurring invoice created",
      description: `${data.frequency} invoice for ${data.clientName} has been set up.`,
    });
  };

  const handleUpdateRecurring = (data: RecurringInvoiceFormData) => {
    if (!editingRecurring) return;

    onUpdateRecurringInvoices((prev) =>
      prev.map((r) =>
        r.id === editingRecurring.id
          ? {
              ...r,
              clientName: data.clientName,
              clientEmail: data.clientEmail,
              projectName: data.projectName,
              lineItems: data.lineItems,
              taxRate: data.taxRate,
              frequency: data.frequency,
              nextDueDate: data.startDate.toISOString().split("T")[0],
              daysBefore: data.daysBefore,
              notes: data.notes,
            }
          : r
      )
    );

    setEditingRecurring(null);
    setView("list");
    toast({
      title: "Recurring invoice updated",
      description: `The schedule for ${data.clientName} has been updated.`,
    });
  };

  const handleBackToList = () => {
    setView("list");
    setEditingRecurring(null);
    onCloseNewForm?.();
  };

  if (view === "new") {
    return (
      <NewRecurringInvoiceForm
        onBack={handleBackToList}
        onSubmit={handleCreateRecurring}
        clients={clients}
        onAddClient={onAddClient}
      />
    );
  }

  if (view === "edit" && editingRecurring) {
    return (
      <NewRecurringInvoiceForm
        onBack={handleBackToList}
        onSubmit={handleUpdateRecurring}
        editingRecurring={editingRecurring}
        clients={clients}
        onAddClient={onAddClient}
      />
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Filters */}
      <div className="space-y-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search recurring invoices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex gap-2">
          {(["all", "active", "paused"] as StatusFilter[]).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                statusFilter === status
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)} ({counts[status]})
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {filteredRecurring.length === 0 ? (
        <div className="text-center py-12">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary mx-auto mb-4">
            <Repeat className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">No recurring invoices found</p>
          <p className="text-xs text-muted-foreground mt-1">
            Create one to automate your billing
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRecurring.map((recurring) => (
            <RecurringInvoiceListItem
              key={recurring.id}
              recurring={recurring}
              onToggleActive={handleToggleActive}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onGenerateNow={handleGenerateNow}
            />
          ))}
        </div>
      )}
    </div>
  );
}
