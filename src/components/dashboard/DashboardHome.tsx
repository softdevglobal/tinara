import { useMemo } from "react";
import { OverviewCard } from "./OverviewCard";
import { Invoice } from "@/data/invoices";
import { Quote } from "@/data/quotes";

interface DashboardHomeProps {
  invoices: Invoice[];
  quotes: Quote[];
}

export function DashboardHome({ invoices, quotes }: DashboardHomeProps) {
  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Overdue invoices
    const overdueInvoices = invoices.filter((inv) => inv.status === "Overdue");
    const overdueTotal = overdueInvoices.reduce((sum, inv) => sum + inv.total, 0);

    // Unpaid invoices (Opened + Overdue)
    const unpaidInvoices = invoices.filter(
      (inv) => inv.status === "Opened" || inv.status === "Overdue"
    );
    const unpaidTotal = unpaidInvoices.reduce((sum, inv) => sum + inv.total, 0);

    // Unsent/Draft invoices (for demo, using Opened status as unsent)
    const unsentInvoices = invoices.filter((inv) => inv.status === "Opened");
    const unsentTotal = unsentInvoices.reduce((sum, inv) => sum + inv.total, 0);

    // Monthly sales (paid this month)
    const paidThisMonth = invoices.filter((inv) => {
      if (inv.status !== "Paid" || !inv.paidDate) return false;
      const paidDate = new Date(inv.paidDate);
      return (
        paidDate.getMonth() === currentMonth &&
        paidDate.getFullYear() === currentYear
      );
    });
    const monthlySales = paidThisMonth.reduce((sum, inv) => sum + inv.total, 0);

    // Year-to-date sales
    const paidThisYear = invoices.filter((inv) => {
      if (inv.status !== "Paid" || !inv.paidDate) return false;
      const paidDate = new Date(inv.paidDate);
      return paidDate.getFullYear() === currentYear;
    });
    const yearSales = paidThisYear.reduce((sum, inv) => sum + inv.total, 0);
    const monthsElapsed = currentMonth + 1;
    const monthlyAverage = monthsElapsed > 0 ? yearSales / monthsElapsed : 0;

    // Pending quotes
    const pendingQuotes = quotes.filter(
      (q) => q.status === "Sent" || q.status === "Draft"
    );
    const pendingQuotesTotal = pendingQuotes.reduce((sum, q) => sum + q.total, 0);

    return {
      overdue: { count: overdueInvoices.length, total: overdueTotal },
      unpaid: { count: unpaidInvoices.length, total: unpaidTotal },
      unsent: { count: unsentInvoices.length, total: unsentTotal },
      monthlySales,
      yearSales,
      monthlyAverage,
      pendingQuotes: { count: pendingQuotes.length, total: pendingQuotesTotal },
    };
  }, [invoices, quotes]);

  const currentMonthName = new Date().toLocaleString("en-AU", { month: "long" });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your business</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <OverviewCard
          title="Overdue"
          count={stats.overdue.count}
          amount={stats.overdue.total}
          variant="overdue"
          link="/?status=overdue"
          linkText="View overdue"
        />
        <OverviewCard
          title="Unpaid"
          count={stats.unpaid.count}
          amount={stats.unpaid.total}
          link="/?status=unpaid"
          linkText="View unpaid"
        />
        <OverviewCard
          title="Unsent"
          count={stats.unsent.count}
          amount={stats.unsent.total}
          link="/"
          linkText="View invoices"
        />
        <OverviewCard
          title={`${currentMonthName} Sales`}
          amount={stats.monthlySales}
          variant="success"
        />
        <OverviewCard
          title="Tax Year Sales"
          amount={stats.yearSales}
          subtitle={`Monthly avg: $${stats.monthlyAverage.toFixed(0)}`}
        />
        <OverviewCard
          title="Pending Quotes"
          count={stats.pendingQuotes.count}
          amount={stats.pendingQuotes.total}
          link="/quotes"
          linkText="See more"
        />
      </div>
    </div>
  );
}
