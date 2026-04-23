import { useApp } from "@/context/AppContext";
import { useMemo } from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export function CashflowTrend() {
  const { invoices } = useApp();

  const data = useMemo(() => {
    const buckets: Record<string, { month: string; paid: number; invoiced: number }> = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      buckets[key] = {
        month: d.toLocaleString("en-AU", { month: "short" }),
        paid: 0,
        invoiced: 0,
      };
    }
    invoices.forEach((inv) => {
      const issued = new Date(inv.date);
      const ik = `${issued.getFullYear()}-${String(issued.getMonth() + 1).padStart(2, "0")}`;
      if (buckets[ik]) buckets[ik].invoiced += inv.total ?? 0;
      if (inv.paidDate) {
        const p = new Date(inv.paidDate);
        const pk = `${p.getFullYear()}-${String(p.getMonth() + 1).padStart(2, "0")}`;
        if (buckets[pk]) buckets[pk].paid += inv.total ?? 0;
      }
    });
    return Object.values(buckets);
  }, [invoices]);

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">Cashflow trend</h3>
        <span className="text-xs text-muted-foreground">Last 6 months</span>
      </div>
      <div className="h-48 -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <defs>
              <linearGradient id="paidGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 6, fontSize: 12 }}
              formatter={(v: number) => `$${v.toLocaleString()}`}
            />
            <Area type="monotone" dataKey="paid" name="Paid" stroke="hsl(var(--primary))" fill="url(#paidGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
