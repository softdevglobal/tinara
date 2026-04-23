import { useApp } from "@/context/AppContext";
import { useMemo } from "react";
import { FileText, ClipboardList, CheckCircle2, Send, UserPlus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ActivityItem {
  icon: React.ComponentType<{ className?: string }>;
  text: string;
  when: string;
  ts: number;
}

export function RecentActivity() {
  const { invoices, quotes, clients } = useApp();

  const items = useMemo<ActivityItem[]>(() => {
    const list: ActivityItem[] = [];

    invoices.slice(0, 30).forEach((inv) => {
      const date = inv.paidDate || inv.date;
      const ts = new Date(date).getTime();
      if (inv.status === "Paid") {
        list.push({
          icon: CheckCircle2,
          text: `Invoice ${inv.number} paid by ${inv.clientName}`,
          when: formatDistanceToNow(new Date(date), { addSuffix: true }),
          ts,
        });
      } else if (inv.status === "Opened") {
        list.push({
          icon: Send,
          text: `Invoice ${inv.number} sent to ${inv.clientName}`,
          when: formatDistanceToNow(new Date(date), { addSuffix: true }),
          ts,
        });
      }
    });

    quotes.slice(0, 30).forEach((q) => {
      const ts = new Date(q.date).getTime();
      list.push({
        icon: ClipboardList,
        text: `Quote ${q.number} for ${q.clientName} (${q.status})`,
        when: formatDistanceToNow(new Date(q.date), { addSuffix: true }),
        ts,
      });
    });

    clients.slice(0, 5).forEach((c) => {
      list.push({
        icon: UserPlus,
        text: `Client added: ${c.name}`,
        when: "recently",
        ts: Date.now() - 1000 * 60 * 60 * 24 * 7,
      });
    });

    return list.sort((a, b) => b.ts - a.ts).slice(0, 8);
  }, [invoices, quotes, clients]);

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">Recent activity</h3>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center">No activity yet.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((it, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <span className="mt-0.5 text-muted-foreground">
                <it.icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-foreground truncate">{it.text}</p>
                <p className="text-xs text-muted-foreground">{it.when}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
