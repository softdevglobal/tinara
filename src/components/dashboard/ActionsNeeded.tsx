import { AlertCircle, Clock, Package, Repeat, FileWarning, Receipt, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { useMemo } from "react";

interface ActionItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  count: number;
  to: string;
  tone: "danger" | "warning" | "info";
}

export function ActionsNeeded() {
  const { invoices, quotes, items, recurringInvoices, timeEntries, expenses } = useApp();

  const actions = useMemo<ActionItem[]>(() => {
    const today = new Date();

    const overdueCount = invoices.filter((i) => i.status === "Overdue").length;

    const expiringQuotes = quotes.filter((q) => {
      if (q.status !== "Sent" && q.status !== "Draft") return false;
      const expiry = (q as any).expiryDate ? new Date((q as any).expiryDate) : null;
      if (!expiry) return false;
      const days = (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
      return days >= 0 && days <= 7;
    }).length;

    const lowStock = items.filter(
      (i) => (i as any).reorderThreshold != null && (i as any).stockOnHand != null &&
        (i as any).stockOnHand <= (i as any).reorderThreshold
    ).length;

    const failedRecurring = recurringInvoices.filter(
      (r) => (r as any).lastRunStatus === "failed"
    ).length;

    const unbilledTime = timeEntries.filter((t) => !t.billed && t.duration > 0).length;

    const expensesNoReceipt = expenses.filter((e) => !e.receipt).length;

    const list: ActionItem[] = [];
    if (overdueCount) list.push({ icon: AlertCircle, label: `${overdueCount} overdue invoice${overdueCount > 1 ? "s" : ""}`, count: overdueCount, to: "/invoices", tone: "danger" });
    if (expiringQuotes) list.push({ icon: Clock, label: `${expiringQuotes} quote${expiringQuotes > 1 ? "s" : ""} expiring soon`, count: expiringQuotes, to: "/quotes", tone: "warning" });
    if (failedRecurring) list.push({ icon: Repeat, label: `${failedRecurring} failed recurring run${failedRecurring > 1 ? "s" : ""}`, count: failedRecurring, to: "/recurring", tone: "danger" });
    if (lowStock) list.push({ icon: Package, label: `${lowStock} low-stock item${lowStock > 1 ? "s" : ""}`, count: lowStock, to: "/items", tone: "warning" });
    if (unbilledTime) list.push({ icon: FileWarning, label: `${unbilledTime} unbilled time entr${unbilledTime > 1 ? "ies" : "y"}`, count: unbilledTime, to: "/time-tracking", tone: "info" });
    if (expensesNoReceipt) list.push({ icon: Receipt, label: `${expensesNoReceipt} expense${expensesNoReceipt > 1 ? "s" : ""} missing receipt`, count: expensesNoReceipt, to: "/expenses", tone: "info" });

    return list;
  }, [invoices, quotes, items, recurringInvoices, timeEntries, expenses]);

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">Actions needed</h3>
        <span className="text-xs text-muted-foreground">{actions.length} item{actions.length === 1 ? "" : "s"}</span>
      </div>
      {actions.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center">You're all caught up. 🎉</p>
      ) : (
        <ul className="space-y-1">
          {actions.map((a, idx) => (
            <li key={idx}>
              <Link
                to={a.to}
                className="flex items-center justify-between gap-3 rounded-md px-2.5 py-2 hover:bg-secondary transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className={
                    a.tone === "danger" ? "text-destructive" :
                    a.tone === "warning" ? "text-amber-600 dark:text-amber-500" :
                    "text-primary"
                  }>
                    <a.icon className="h-4 w-4" />
                  </span>
                  <span className="text-sm text-foreground truncate">{a.label}</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground shrink-0" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
