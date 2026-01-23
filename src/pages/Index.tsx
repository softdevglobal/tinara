import { useState } from "react";
import { InvoiceDashboard } from "@/components/InvoiceDashboard";
import { FileText, Plus } from "lucide-react";

const Index = () => {
  const [showNewForm, setShowNewForm] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container max-w-4xl py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <FileText className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">Invoices</h1>
                <p className="text-sm text-muted-foreground">Manage your billing</p>
              </div>
            </div>
            <button
              onClick={() => setShowNewForm(true)}
              className="flex items-center gap-2 h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Invoice</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-4xl py-6">
        <InvoiceDashboard
          showNewForm={showNewForm}
          onCloseNewForm={() => setShowNewForm(false)}
        />
      </main>
    </div>
  );
};

export default Index;
