import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Invoice } from "@/data/invoices";

interface RevenueChartProps {
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

function getMonthName(monthIndex: number): string {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return months[monthIndex];
}

export function RevenueChart({ invoices }: RevenueChartProps) {
  const chartData = useMemo(() => {
    const now = new Date();
    const data: { month: string; revenue: number; invoices: number }[] = [];

    // Generate last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthIndex = date.getMonth();
      const year = date.getFullYear();

      // Filter paid invoices for this month
      const monthInvoices = invoices.filter((inv) => {
        if (inv.status !== "Paid") return false;
        const invDate = new Date(inv.date);
        return invDate.getMonth() === monthIndex && invDate.getFullYear() === year;
      });

      const revenue = monthInvoices.reduce((sum, inv) => sum + inv.total, 0);

      data.push({
        month: getMonthName(monthIndex),
        revenue,
        invoices: monthInvoices.length,
      });
    }

    return data;
  }, [invoices]);

  const totalRevenue = chartData.reduce((sum, d) => sum + d.revenue, 0);
  const avgRevenue = totalRevenue / 6;

  return (
    <div className="invoice-card p-5 mb-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-foreground">Revenue Trend</h3>
          <p className="text-xs text-muted-foreground">Last 6 months</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-foreground">{formatCurrency(totalRevenue)}</p>
          <p className="text-xs text-muted-foreground">
            Avg {formatCurrency(avgRevenue)}/mo
          </p>
        </div>
      </div>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
          >
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              width={45}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-card border border-border rounded-lg shadow-lg p-3">
                      <p className="text-sm font-medium text-foreground mb-1">{label}</p>
                      <p className="text-sm text-success font-semibold">
                        {formatCurrency(payload[0].value as number)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {payload[0].payload.invoices} invoice{payload[0].payload.invoices !== 1 ? "s" : ""}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="hsl(160, 84%, 39%)"
              strokeWidth={2}
              fill="url(#revenueGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
