import { useMemo } from "react";
import { DollarSign, AlertTriangle, TrendingUp, Clock } from "lucide-react";
import { Invoice } from "@/data/invoices";
import { cn } from "@/lib/utils";

interface InvoiceStatsProps {
  invoices: Invoice[];
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ElementType;
  variant?: "default" | "warning" | "success";
}

function StatCard({ title, value, subtitle, icon: Icon, variant = "default" }: StatCardProps) {
  return (
    <div className="invoice-card p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">
            {title}
          </p>
          <p
            className={cn(
              "text-2xl font-bold tracking-tight",
              variant === "warning" && "text-destructive",
              variant === "success" && "text-success",
              variant === "default" && "text-foreground"
            )}
          >
            {value}
          </p>
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        </div>
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg",
            variant === "warning" && "bg-destructive/10",
            variant === "success" && "bg-success/10",
            variant === "default" && "bg-secondary"
          )}
        >
          <Icon
            className={cn(
              "h-5 w-5",
              variant === "warning" && "text-destructive",
              variant === "success" && "text-success",
              variant === "default" && "text-muted-foreground"
            )}
          />
        </div>
      </div>
    </div>
  );
}

export function InvoiceStats({ invoices }: InvoiceStatsProps) {
  const stats = useMemo(() => {
    const outstanding = invoices
      .filter((inv) => inv.status === "Opened" || inv.status === "Overdue")
      .reduce((sum, inv) => sum + inv.total, 0);

    const overdue = invoices
      .filter((inv) => inv.status === "Overdue")
      .reduce((sum, inv) => sum + inv.total, 0);

    const overdueCount = invoices.filter((inv) => inv.status === "Overdue").length;

    // Get current month's paid invoices
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const paidThisMonth = invoices
      .filter((inv) => {
        if (inv.status !== "Paid") return false;
        const invDate = new Date(inv.date);
        return invDate.getMonth() === currentMonth && invDate.getFullYear() === currentYear;
      })
      .reduce((sum, inv) => sum + inv.total, 0);

    const paidCount = invoices.filter((inv) => inv.status === "Paid").length;

    const openCount = invoices.filter(
      (inv) => inv.status === "Opened" || inv.status === "Overdue"
    ).length;

    return {
      outstanding,
      overdue,
      overdueCount,
      paidThisMonth,
      paidCount,
      openCount,
    };
  }, [invoices]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <StatCard
        title="Outstanding"
        value={formatCurrency(stats.outstanding)}
        subtitle={`${stats.openCount} open invoice${stats.openCount !== 1 ? "s" : ""}`}
        icon={Clock}
        variant="default"
      />
      <StatCard
        title="Overdue"
        value={formatCurrency(stats.overdue)}
        subtitle={`${stats.overdueCount} invoice${stats.overdueCount !== 1 ? "s" : ""} past due`}
        icon={AlertTriangle}
        variant={stats.overdue > 0 ? "warning" : "default"}
      />
      <StatCard
        title="Collected"
        value={formatCurrency(stats.paidThisMonth)}
        subtitle={`${stats.paidCount} paid total`}
        icon={TrendingUp}
        variant="success"
      />
    </div>
  );
}
