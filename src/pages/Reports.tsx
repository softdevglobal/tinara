import { AppLayout } from "@/components/AppLayout";
import { BarChart3, TrendingUp, Users, Package, Receipt, FileText, Clock, Repeat } from "lucide-react";

const reports = [
  { icon: TrendingUp, title: "Revenue", description: "Revenue by date with period comparison" },
  { icon: Receipt, title: "Payments received", description: "Cashflow by payment method and date" },
  { icon: FileText, title: "Aged receivables", description: "Outstanding balances by age bucket" },
  { icon: Users, title: "Top clients", description: "Best customers by revenue and frequency" },
  { icon: Package, title: "Item performance", description: "Top-selling items, margins, stock turn" },
  { icon: BarChart3, title: "Tax summary", description: "GST collected and paid by period" },
  { icon: Receipt, title: "Expense summary", description: "Spend by category, vendor, project" },
  { icon: TrendingUp, title: "Profit snapshot", description: "Revenue minus expenses, period over period" },
  { icon: Clock, title: "Unbilled time", description: "Time entries ready to invoice" },
  { icon: Repeat, title: "Recurring performance", description: "Recurring revenue and run health" },
];

export default function Reports() {
  return (
    <AppLayout>
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
          <BarChart3 className="h-4 w-4 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Reports</h1>
          <p className="text-sm text-muted-foreground">Decision-ready insights across your business</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {reports.map((r) => (
          <div
            key={r.title}
            className="rounded-lg border border-border bg-card p-5 hover:border-primary/40 transition-colors cursor-pointer"
          >
            <div className="h-9 w-9 rounded-md bg-secondary flex items-center justify-center mb-3">
              <r.icon className="h-4 w-4 text-foreground" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">{r.title}</h3>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{r.description}</p>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground mt-6">
        Each report will support graph + table views, period comparison, CSV/PDF export and saved presets.
      </p>
    </AppLayout>
  );
}
