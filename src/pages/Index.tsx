import { InvoiceCard } from "@/components/InvoiceCard";
import { FileText } from "lucide-react";

const invoiceData = {
  id: "inv_A53275081",
  number: "A53275081",
  clientName: "SECURITY CAMER...",
  projectName: "",
  date: "2026-01-21",
  dueDate: "2026-01-21",
  dueDaysOverdue: 2,
  dueLabel: "2 days ago",
  status: "Opened",
  total: 1505.9,
  currency: "AUD"
};

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container max-w-4xl py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <FileText className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">Invoices</h1>
              <p className="text-sm text-muted-foreground">Manage your billing</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-4xl py-8">
        <div className="mb-6">
          <h2 className="text-sm font-medium text-muted-foreground mb-1">
            Invoice Details
          </h2>
          <p className="text-xs text-muted-foreground">
            Review and manage invoice information
          </p>
        </div>

        <div className="max-w-md">
          <InvoiceCard invoice={invoiceData} />
        </div>
      </main>
    </div>
  );
};

export default Index;
