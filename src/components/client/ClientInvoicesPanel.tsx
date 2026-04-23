import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  CheckCircle2,
  Send,
  Download,
  Trash2,
  Plus,
  Receipt,
  ArrowUpDown,
  Clock,
  AlertCircle,
  CheckCircle,
  FileEdit,
  Eye,
  X,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, differenceInDays } from "date-fns";
import { Invoice, getInvoiceTotal } from "@/data/invoices";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { MoreHorizontal } from "lucide-react";

interface Props {
  invoices: Invoice[];
  clientName: string;
  onNewInvoice: () => void;
}

type SavedView =
  | "all"
  | "open"
  | "overdue"
  | "paid"
  | "draft"
  | "due-soon";
type AgingBucket = "all" | "current" | "1-30" | "31-60" | "61-90" | "90+";
type SortKey = "date-desc" | "date-asc" | "amount-desc" | "amount-asc" | "due-asc";

const formatCurrency = (amount: number, currency = "AUD") =>
  new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);

const getDaysOverdue = (inv: Invoice): number => {
  if (inv.status === "Paid" || !inv.dueDate) return 0;
  const days = differenceInDays(new Date(), new Date(inv.dueDate));
  return Math.max(0, days);
};

const getAgingBucket = (inv: Invoice): AgingBucket => {
  const days = getDaysOverdue(inv);
  if (inv.status === "Paid") return "current";
  if (days === 0) return "current";
  if (days <= 30) return "1-30";
  if (days <= 60) return "31-60";
  if (days <= 90) return "61-90";
  return "90+";
};

const statusMeta = (status: string) => {
  switch (status) {
    case "Paid":
      return { cls: "bg-green-500/10 text-green-600 border-green-500/20", icon: CheckCircle };
    case "Overdue":
      return { cls: "bg-destructive/10 text-destructive border-destructive/20", icon: AlertCircle };
    case "Opened":
      return { cls: "bg-blue-500/10 text-blue-600 border-blue-500/20", icon: Eye };
    case "Draft":
      return { cls: "bg-muted text-muted-foreground border-border", icon: FileEdit };
    default:
      return { cls: "bg-muted text-muted-foreground border-border", icon: Clock };
  }
};

export function ClientInvoicesPanel({ invoices, clientName, onNewInvoice }: Props) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setInvoices } = useApp();

  const [view, setView] = useState<SavedView>("all");
  const [aging, setAging] = useState<AgingBucket>("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("date-desc");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Counts per saved view
  const counts = useMemo(() => {
    const c = { all: invoices.length, open: 0, overdue: 0, paid: 0, draft: 0, dueSoon: 0 };
    const today = new Date();
    invoices.forEach((i) => {
      if (i.status === "Paid") c.paid++;
      else if (i.status === "Overdue") {
        c.overdue++;
        c.open++;
      } else if (i.status === "Draft") c.draft++;
      else if (i.status === "Opened") {
        c.open++;
        if (i.dueDate) {
          const d = differenceInDays(new Date(i.dueDate), today);
          if (d >= 0 && d <= 7) c.dueSoon++;
        }
      }
    });
    return c;
  }, [invoices]);

  // Aging summary (totals per bucket, unpaid only)
  const agingSummary = useMemo(() => {
    const buckets = { current: 0, "1-30": 0, "31-60": 0, "61-90": 0, "90+": 0 };
    invoices
      .filter((i) => i.status !== "Paid")
      .forEach((i) => {
        const b = getAgingBucket(i);
        if (b !== "all") buckets[b] += getInvoiceTotal(i);
      });
    return buckets;
  }, [invoices]);

  // Apply saved view + aging + search
  const filtered = useMemo(() => {
    let list = [...invoices];

    // Saved view
    switch (view) {
      case "open":
        list = list.filter((i) => i.status === "Opened" || i.status === "Overdue");
        break;
      case "overdue":
        list = list.filter((i) => i.status === "Overdue");
        break;
      case "paid":
        list = list.filter((i) => i.status === "Paid");
        break;
      case "draft":
        list = list.filter((i) => i.status === "Draft");
        break;
      case "due-soon": {
        const today = new Date();
        list = list.filter((i) => {
          if (i.status !== "Opened" || !i.dueDate) return false;
          const d = differenceInDays(new Date(i.dueDate), today);
          return d >= 0 && d <= 7;
        });
        break;
      }
    }

    if (aging !== "all") {
      list = list.filter((i) => getAgingBucket(i) === aging);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (i) =>
          i.number.toLowerCase().includes(q) ||
          (i.projectName?.toLowerCase().includes(q) ?? false) ||
          (i.poNumber?.toLowerCase().includes(q) ?? false)
      );
    }

    // Sort
    list.sort((a, b) => {
      switch (sort) {
        case "date-asc":
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case "amount-desc":
          return getInvoiceTotal(b) - getInvoiceTotal(a);
        case "amount-asc":
          return getInvoiceTotal(a) - getInvoiceTotal(b);
        case "due-asc":
          return new Date(a.dueDate || a.date).getTime() - new Date(b.dueDate || b.date).getTime();
        default:
          return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
    });

    return list;
  }, [invoices, view, aging, search, sort]);

  const allVisibleSelected =
    filtered.length > 0 && filtered.every((i) => selected.has(i.id));

  const toggleAll = () => {
    if (allVisibleSelected) {
      const next = new Set(selected);
      filtered.forEach((i) => next.delete(i.id));
      setSelected(next);
    } else {
      const next = new Set(selected);
      filtered.forEach((i) => next.add(i.id));
      setSelected(next);
    }
  };

  const toggleOne = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const clearSelection = () => setSelected(new Set());

  // Bulk actions
  const bulkMarkPaid = () => {
    const ids = Array.from(selected);
    setInvoices((prev) =>
      prev.map((i) =>
        ids.includes(i.id) && i.status !== "Paid"
          ? {
              ...i,
              status: "Paid",
              paidDate: new Date().toISOString().split("T")[0],
              paymentMethod: i.paymentMethod ?? "bank_transfer",
            }
          : i
      )
    );
    toast({ title: `Marked ${ids.length} invoice${ids.length === 1 ? "" : "s"} as paid` });
    clearSelection();
  };

  const bulkSendReminder = () => {
    toast({
      title: `Reminders queued`,
      description: `${selected.size} reminder${selected.size === 1 ? "" : "s"} will be sent to ${clientName}.`,
    });
    clearSelection();
  };

  const bulkDelete = () => {
    if (!confirm(`Delete ${selected.size} invoice(s)? This cannot be undone.`)) return;
    const ids = Array.from(selected);
    setInvoices((prev) => prev.filter((i) => !ids.includes(i.id)));
    toast({ title: `Deleted ${ids.length} invoice${ids.length === 1 ? "" : "s"}` });
    clearSelection();
  };

  const singleMarkPaid = (id: string) => {
    setInvoices((prev) =>
      prev.map((i) =>
        i.id === id
          ? {
              ...i,
              status: "Paid",
              paidDate: new Date().toISOString().split("T")[0],
              paymentMethod: i.paymentMethod ?? "bank_transfer",
            }
          : i
      )
    );
    toast({ title: "Invoice marked as paid" });
  };

  const singleDelete = (id: string) => {
    if (!confirm("Delete this invoice? This cannot be undone.")) return;
    setInvoices((prev) => prev.filter((i) => i.id !== id));
    toast({ title: "Invoice deleted" });
  };

  // Saved views chips config
  const views: { id: SavedView; label: string; count: number; tone: string }[] = [
    { id: "all", label: "All", count: counts.all, tone: "" },
    { id: "open", label: "Open", count: counts.open, tone: "text-blue-600" },
    { id: "due-soon", label: "Due soon", count: counts.dueSoon, tone: "text-amber-600" },
    { id: "overdue", label: "Overdue", count: counts.overdue, tone: "text-destructive" },
    { id: "paid", label: "Paid", count: counts.paid, tone: "text-green-600" },
    { id: "draft", label: "Draft", count: counts.draft, tone: "text-muted-foreground" },
  ];

  const agingChips: { id: AgingBucket; label: string; total?: number }[] = [
    { id: "all", label: "All ages" },
    { id: "current", label: "Current", total: agingSummary.current },
    { id: "1-30", label: "1–30 days", total: agingSummary["1-30"] },
    { id: "31-60", label: "31–60 days", total: agingSummary["31-60"] },
    { id: "61-90", label: "61–90 days", total: agingSummary["61-90"] },
    { id: "90+", label: "90+ days", total: agingSummary["90+"] },
  ];

  return (
    <Card className="overflow-hidden">
      {/* Toolbar */}
      <div className="p-4 border-b space-y-3">
        {/* Saved views */}
        <div className="flex flex-wrap items-center gap-1.5">
          {views.map((v) => (
            <button
              key={v.id}
              onClick={() => {
                setView(v.id);
                clearSelection();
              }}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-medium border transition-colors",
                view === v.id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background hover:bg-muted border-border"
              )}
            >
              <span className={view === v.id ? "" : v.tone}>{v.label}</span>
              <span
                className={cn(
                  "ml-1.5 tabular-nums",
                  view === v.id ? "opacity-90" : "text-muted-foreground"
                )}
              >
                {v.count}
              </span>
            </button>
          ))}
        </div>

        {/* Aging filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-muted-foreground mr-1">Aging:</span>
          {agingChips.map((a) => (
            <button
              key={a.id}
              onClick={() => setAging(a.id)}
              className={cn(
                "px-2.5 py-1 rounded-md text-xs border transition-colors flex items-center gap-1.5",
                aging === a.id
                  ? "bg-foreground text-background border-foreground"
                  : "bg-background hover:bg-muted border-border"
              )}
            >
              <span>{a.label}</span>
              {a.total !== undefined && a.total > 0 && (
                <span
                  className={cn(
                    "tabular-nums text-[10px] px-1 rounded",
                    aging === a.id ? "bg-background/20" : "text-muted-foreground"
                  )}
                >
                  {formatCurrency(a.total)}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search + sort + new */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search number, project, PO…"
              className="pl-8 h-9"
            />
          </div>
          <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
            <SelectTrigger className="h-9 w-[170px]">
              <ArrowUpDown className="h-3.5 w-3.5 mr-1" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-desc">Newest first</SelectItem>
              <SelectItem value="date-asc">Oldest first</SelectItem>
              <SelectItem value="due-asc">Due date</SelectItem>
              <SelectItem value="amount-desc">Highest amount</SelectItem>
              <SelectItem value="amount-asc">Lowest amount</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" onClick={onNewInvoice} className="h-9">
            <Plus className="h-4 w-4 mr-1.5" /> New
          </Button>
        </div>
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-primary/5 border-b border-primary/20 animate-fade-in">
          <div className="text-sm">
            <span className="font-medium">{selected.size}</span> selected
          </div>
          <div className="flex items-center gap-1.5">
            <Button size="sm" variant="outline" onClick={bulkMarkPaid}>
              <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Mark paid
            </Button>
            <Button size="sm" variant="outline" onClick={bulkSendReminder}>
              <Send className="h-3.5 w-3.5 mr-1.5" /> Send reminder
            </Button>
            <Button size="sm" variant="outline" onClick={() => toast({ title: "Download started" })}>
              <Download className="h-3.5 w-3.5 mr-1.5" /> Download
            </Button>
            <Button size="sm" variant="outline" onClick={bulkDelete} className="text-destructive hover:text-destructive">
              <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Delete
            </Button>
            <Button size="sm" variant="ghost" onClick={clearSelection}>
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="py-12 text-center">
          <Receipt className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-3">
            {invoices.length === 0
              ? "No invoices yet for this client."
              : "No invoices match these filters."}
          </p>
          {invoices.length === 0 ? (
            <Button size="sm" onClick={onNewInvoice}>
              <Plus className="h-4 w-4 mr-2" /> Create first invoice
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setView("all");
                setAging("all");
                setSearch("");
              }}
            >
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox checked={allVisibleSelected} onCheckedChange={toggleAll} />
              </TableHead>
              <TableHead>Number</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Due</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Aging</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((inv) => {
              const total = getInvoiceTotal(inv);
              const meta = statusMeta(inv.status);
              const Icon = meta.icon;
              const days = getDaysOverdue(inv);
              const bucket = getAgingBucket(inv);
              const isSel = selected.has(inv.id);
              return (
                <TableRow
                  key={inv.id}
                  className={cn("cursor-pointer", isSel && "bg-primary/5")}
                  onClick={() => navigate(`/invoices?edit=${inv.id}`)}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox checked={isSel} onCheckedChange={() => toggleOne(inv.id)} />
                  </TableCell>
                  <TableCell className="font-medium font-mono text-xs">
                    #{inv.number}
                    {inv.projectName && (
                      <div className="text-xs text-muted-foreground font-sans mt-0.5 truncate max-w-[180px]">
                        {inv.projectName}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">{format(new Date(inv.date), "d MMM yyyy")}</TableCell>
                  <TableCell className="text-sm">
                    {inv.dueDate ? format(new Date(inv.dueDate), "d MMM yyyy") : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("font-normal gap-1", meta.cls)}>
                      <Icon className="h-3 w-3" />
                      {inv.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {inv.status === "Paid" ? (
                      <span className="text-xs text-muted-foreground">—</span>
                    ) : days === 0 ? (
                      <span className="text-xs text-muted-foreground">Current</span>
                    ) : (
                      <span
                        className={cn(
                          "text-xs font-medium",
                          bucket === "1-30"
                            ? "text-amber-600"
                            : bucket === "31-60"
                              ? "text-orange-600"
                              : "text-destructive"
                        )}
                      >
                        {days}d overdue
                      </span>
                    )}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right font-semibold tabular-nums",
                      inv.status === "Overdue" && "text-destructive"
                    )}
                  >
                    {formatCurrency(total, inv.currency)}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/invoices?edit=${inv.id}`)}>
                          <FileEdit className="h-4 w-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        {inv.status !== "Paid" && (
                          <DropdownMenuItem onClick={() => singleMarkPaid(inv.id)}>
                            <CheckCircle2 className="h-4 w-4 mr-2" /> Mark paid
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() =>
                            toast({
                              title: "Reminder sent",
                              description: `Reminder for #${inv.number} queued.`,
                            })
                          }
                        >
                          <Send className="h-4 w-4 mr-2" /> Send reminder
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toast({ title: "Download started" })}>
                          <Download className="h-4 w-4 mr-2" /> Download PDF
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => singleDelete(inv.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </Card>
  );
}
