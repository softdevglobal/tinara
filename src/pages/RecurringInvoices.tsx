import { useState } from "react";
import { Repeat, Plus } from "lucide-react";
import { RecurringInvoiceDashboard } from "@/components/RecurringInvoiceDashboard";
import { AppLayout } from "@/components/AppLayout";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";

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
            <h1 className="text-2xl font-semibold text-foreground">Recurring Invoices</h1>
            <p className="text-sm text-muted-foreground">Automate your billing</p>
          </div>
        </div>
        <Button size="sm" onClick={() => setShowNewForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Schedule
        </Button>
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
