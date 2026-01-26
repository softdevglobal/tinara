import { useState } from "react";
import { Repeat, Plus } from "lucide-react";
import { RecurringInvoiceDashboard } from "@/components/RecurringInvoiceDashboard";
import { AppLayout } from "@/components/AppLayout";
import { useApp } from "@/context/AppContext";

const RecurringInvoices = () => {
  const [showNewForm, setShowNewForm] = useState(false);
  const { 
    recurringInvoices, 
    setRecurringInvoices, 
    setInvoices,
    clients, 
    addClient 
  } = useApp();

  const handleAddInvoice = (invoice: import("@/data/invoices").Invoice) => {
    setInvoices((prev) => [invoice, ...prev]);
  };

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Repeat className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Recurring Invoices</h1>
            <p className="text-sm text-muted-foreground">Automate your billing</p>
          </div>
        </div>
        <button
          onClick={() => setShowNewForm(true)}
          className="flex items-center gap-2 h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">New Schedule</span>
        </button>
      </div>

      <RecurringInvoiceDashboard
        recurringInvoices={recurringInvoices}
        onUpdateRecurringInvoices={setRecurringInvoices}
        onAddInvoice={handleAddInvoice}
        clients={clients}
        onAddClient={addClient}
        showNewForm={showNewForm}
        onCloseNewForm={() => setShowNewForm(false)}
      />
    </AppLayout>
  );
};

export default RecurringInvoices;
