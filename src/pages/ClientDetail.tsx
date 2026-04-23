import { useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  Phone,
  Globe,
  MapPin,
  FileText,
  Receipt,
  FolderKanban,
  Plus,
  Pencil,
  ExternalLink,
  Building2,
  Users as UsersIcon,
  Activity,
  StickyNote,
  TrendingUp,
  AlertCircle,
  DollarSign,
  Send,
  Copy,
  Trash2,
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { format, formatDistanceToNow } from "date-fns";
import { Client } from "@/data/clients";
import { Invoice } from "@/data/invoices";
import { Quote } from "@/data/quotes";
import { Project } from "@/data/projects";
import { ClientForm } from "@/components/ClientForm";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 2,
  }).format(amount);

const ClientDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    clients,
    invoices,
    quotes,
    projects,
    updateClient,
    deleteClient,
  } = useApp();

  const [editOpen, setEditOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [noteDraft, setNoteDraft] = useState("");

  const client = useMemo(() => clients.find((c) => c.id === id), [clients, id]);

  // Match invoices / quotes by client name OR company name (current data shape)
  const matchesClient = (name?: string) => {
    if (!client || !name) return false;
    const n = name.toLowerCase();
    return (
      n === client.name.toLowerCase() ||
      (client.company ? n === client.company.toLowerCase() : false) ||
      n.includes(client.name.toLowerCase()) ||
      (client.company ? n.includes(client.company.toLowerCase()) : false)
    );
  };

  const clientInvoices: Invoice[] = useMemo(
    () => invoices.filter((inv) => matchesClient(inv.clientName)),
    [invoices, client]
  );
  const clientQuotes: Quote[] = useMemo(
    () => quotes.filter((q) => matchesClient(q.clientName)),
    [quotes, client]
  );
  const clientProjects: Project[] = useMemo(
    () => projects.filter((p) => p.clientId === client?.id),
    [projects, client]
  );

  // Financial summary
  const summary = useMemo(() => {
    const getTotal = (inv: Invoice) =>
      inv.totals?.totalCents != null ? inv.totals.totalCents / 100 : inv.total ?? 0;
    const totalBilled = clientInvoices.reduce((sum, i) => sum + getTotal(i), 0);
    const outstanding = clientInvoices
      .filter((i) => i.status === "Opened" || i.status === "Overdue")
      .reduce((sum, i) => sum + getTotal(i), 0);
    const overdue = clientInvoices
      .filter((i) => i.status === "Overdue")
      .reduce((sum, i) => sum + getTotal(i), 0);
    const paid = clientInvoices
      .filter((i) => i.status === "Paid")
      .reduce((sum, i) => sum + getTotal(i), 0);
    return { totalBilled, outstanding, overdue, paid, count: clientInvoices.length };
  }, [clientInvoices]);

  // Activity timeline (combines invoices, quotes, projects, created)
  const timeline = useMemo(() => {
    type Event = {
      id: string;
      kind: "invoice" | "quote" | "project" | "created";
      title: string;
      meta?: string;
      date: string;
      tone: "blue" | "purple" | "green" | "muted";
      href?: string;
    };
    const events: Event[] = [];

    if (client?.createdAt) {
      events.push({
        id: `created-${client.id}`,
        kind: "created",
        title: "Client added",
        date: client.createdAt,
        tone: "muted",
      });
    }
    clientInvoices.forEach((i) =>
      events.push({
        id: `inv-${i.id}`,
        kind: "invoice",
        title: `Invoice ${i.number}`,
        meta: `${i.status} · ${formatCurrency(
          i.totals?.totalCents != null ? i.totals.totalCents / 100 : i.total ?? 0
        )}`,
        date: i.date,
        tone: "blue",
        href: `/invoices?edit=${i.id}`,
      })
    );
    clientQuotes.forEach((q) =>
      events.push({
        id: `q-${q.id}`,
        kind: "quote",
        title: `Quote ${q.number}`,
        meta: `${q.status} · ${formatCurrency(
          q.totals?.totalCents != null ? q.totals.totalCents / 100 : q.total ?? 0
        )}`,
        date: q.date,
        tone: "purple",
        href: `/quotes?edit=${q.id}`,
      })
    );
    clientProjects.forEach((p) =>
      events.push({
        id: `p-${p.id}`,
        kind: "project",
        title: `Project ${p.name}`,
        meta: p.status,
        date: p.createdAt,
        tone: "green",
        href: `/projects`,
      })
    );

    return events.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [client, clientInvoices, clientQuotes, clientProjects]);

  if (!client) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <UsersIcon className="h-10 w-10 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Client not found</h2>
          <p className="text-sm text-muted-foreground mb-4">
            This client may have been deleted or the link is invalid.
          </p>
          <Button onClick={() => navigate("/clients")}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to clients
          </Button>
        </div>
      </AppLayout>
    );
  }

  const handleNewInvoice = () => {
    navigate(`/?new=invoice&client=${encodeURIComponent(client.name)}`);
  };
  const handleNewQuote = () => {
    navigate(`/quotes?new=quote&client=${encodeURIComponent(client.name)}`);
  };
  const handleNewProject = () => {
    navigate(`/projects?new=project&client=${client.id}`);
  };
  const handleDelete = () => {
    if (!confirm(`Delete ${client.name}? This cannot be undone.`)) return;
    deleteClient(client.id);
    toast({ title: "Client deleted", description: `${client.name} has been removed.` });
    navigate("/clients");
  };

  const handleSaveNote = () => {
    if (!noteDraft.trim()) return;
    const stamped = `${format(new Date(), "PP · p")} — ${noteDraft.trim()}`;
    const newNotes = client.notes ? `${client.notes}\n\n${stamped}` : stamped;
    updateClient({ ...client, notes: newNotes });
    setNoteDraft("");
    toast({ title: "Note added" });
  };

  const initials = client.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const billing = client.billingAddress;
  const shipping = client.shippingAddress;

  const statusColor = (status: string) => {
    switch (status) {
      case "Paid":
      case "Accepted":
      case "Complete":
        return "bg-green-500/10 text-green-600";
      case "Overdue":
      case "Declined":
        return "bg-destructive/10 text-destructive";
      case "Opened":
      case "Sent":
      case "Active":
        return "bg-blue-500/10 text-blue-600";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const toneClass = (tone: string) => {
    switch (tone) {
      case "blue":
        return "bg-blue-500/10 text-blue-600";
      case "purple":
        return "bg-purple-500/10 text-purple-600";
      case "green":
        return "bg-green-500/10 text-green-600";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <AppLayout>
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/clients")}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Clients
          </Button>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-lg">
              {initials}
            </div>
            <div>
              <h1 className="text-2xl font-semibold leading-tight">{client.name}</h1>
              {client.company && (
                <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5" /> {client.company}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
            <Pencil className="h-4 w-4 mr-2" /> Edit
          </Button>
          <Button variant="outline" size="sm" onClick={handleNewQuote}>
            <FileText className="h-4 w-4 mr-2" /> New quote
          </Button>
          <Button size="sm" onClick={handleNewInvoice}>
            <Plus className="h-4 w-4 mr-2" /> New invoice
          </Button>
        </div>
      </div>

      {/* Financial summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total billed</p>
              <p className="text-xl font-semibold">{formatCurrency(summary.totalBilled)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Outstanding</p>
              <p className="text-xl font-semibold">{formatCurrency(summary.outstanding)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="h-4 w-4 text-destructive" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Overdue</p>
              <p className="text-xl font-semibold">{formatCurrency(summary.overdue)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-green-500/10 flex items-center justify-center">
              <Receipt className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Paid · {summary.count} invoices</p>
              <p className="text-xl font-semibold">{formatCurrency(summary.paid)}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        {/* Sidebar info card */}
        <div className="space-y-4">
          <Card className="p-4 space-y-3">
            <h3 className="text-sm font-semibold">Contact</h3>
            <div className="space-y-2 text-sm">
              {client.email && (
                <a
                  href={`mailto:${client.email}`}
                  className="flex items-center gap-2 text-foreground hover:text-primary"
                >
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="truncate">{client.email}</span>
                </a>
              )}
              {client.phone && (
                <a
                  href={`tel:${client.phone}`}
                  className="flex items-center gap-2 text-foreground hover:text-primary"
                >
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" /> {client.phone}
                </a>
              )}
              {client.mobile && client.mobile !== client.phone && (
                <a
                  href={`tel:${client.mobile}`}
                  className="flex items-center gap-2 text-foreground hover:text-primary"
                >
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" /> {client.mobile}
                </a>
              )}
              {client.website && (
                <a
                  href={client.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-foreground hover:text-primary"
                >
                  <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="truncate">{client.website.replace(/^https?:\/\//, "")}</span>
                  <ExternalLink className="h-3 w-3 ml-auto" />
                </a>
              )}
              {!client.email && !client.phone && !client.website && (
                <p className="text-xs text-muted-foreground">No contact methods on file.</p>
              )}
            </div>
          </Card>

          <Card className="p-4 space-y-3">
            <h3 className="text-sm font-semibold">Business</h3>
            <div className="space-y-2 text-sm">
              {client.taxNumber && (
                <div>
                  <p className="text-xs text-muted-foreground">Tax ID</p>
                  <p className="font-mono text-xs">{client.taxNumber}</p>
                </div>
              )}
              {client.paymentTerms && (
                <div>
                  <p className="text-xs text-muted-foreground">Payment terms</p>
                  <p>{client.paymentTerms}</p>
                </div>
              )}
              {client.customerType && (
                <div>
                  <p className="text-xs text-muted-foreground">Customer type</p>
                  <Badge variant="outline" className="font-normal capitalize">
                    {client.customerType.toLowerCase()}
                  </Badge>
                </div>
              )}
              {client.createdAt && (
                <div>
                  <p className="text-xs text-muted-foreground">Customer since</p>
                  <p>{format(new Date(client.createdAt), "PP")}</p>
                </div>
              )}
            </div>
          </Card>

          <Card className="p-4 space-y-2">
            <h3 className="text-sm font-semibold">Quick actions</h3>
            <Button variant="outline" size="sm" className="w-full justify-start" onClick={handleNewInvoice}>
              <Receipt className="h-4 w-4 mr-2" /> New invoice
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start" onClick={handleNewQuote}>
              <FileText className="h-4 w-4 mr-2" /> New quote
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start" onClick={handleNewProject}>
              <FolderKanban className="h-4 w-4 mr-2" /> New project
            </Button>
            <Separator />
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-destructive hover:text-destructive"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4 mr-2" /> Delete client
            </Button>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="invoices">
              Invoices ({clientInvoices.length})
            </TabsTrigger>
            <TabsTrigger value="quotes">Quotes ({clientQuotes.length})</TabsTrigger>
            <TabsTrigger value="projects">
              Projects ({clientProjects.length})
            </TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <MapPin className="h-4 w-4" /> Billing address
                  </h3>
                </div>
                {billing && (billing.street || billing.city) ? (
                  <div className="text-sm text-foreground/80 space-y-0.5">
                    {billing.street && <p>{billing.street}</p>}
                    <p>
                      {[billing.city, billing.state, billing.postalCode].filter(Boolean).join(", ")}
                    </p>
                    {billing.country && <p>{billing.country}</p>}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No billing address on file.</p>
                )}
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <MapPin className="h-4 w-4" /> Shipping address
                  </h3>
                </div>
                {shipping && (shipping.street || shipping.city) ? (
                  <div className="text-sm text-foreground/80 space-y-0.5">
                    {shipping.street && <p>{shipping.street}</p>}
                    <p>
                      {[shipping.city, shipping.state, shipping.postalCode].filter(Boolean).join(", ")}
                    </p>
                    {shipping.country && <p>{shipping.country}</p>}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Same as billing, or not provided.
                  </p>
                )}
              </Card>
            </div>

            {/* Recent activity preview */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Activity className="h-4 w-4" /> Recent activity
                </h3>
                <Button variant="ghost" size="sm" onClick={() => setActiveTab("activity")}>
                  View all
                </Button>
              </div>
              {timeline.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">
                  No activity yet. Create an invoice or quote to get started.
                </p>
              ) : (
                <div className="space-y-2">
                  {timeline.slice(0, 5).map((e) => (
                    <div key={e.id} className="flex items-start gap-3 py-2">
                      <div className={`h-7 w-7 rounded-md flex items-center justify-center shrink-0 ${toneClass(e.tone)}`}>
                        {e.kind === "invoice" && <Receipt className="h-3.5 w-3.5" />}
                        {e.kind === "quote" && <FileText className="h-3.5 w-3.5" />}
                        {e.kind === "project" && <FolderKanban className="h-3.5 w-3.5" />}
                        {e.kind === "created" && <UsersIcon className="h-3.5 w-3.5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          {e.href ? (
                            <Link to={e.href} className="text-sm font-medium hover:text-primary">
                              {e.title}
                            </Link>
                          ) : (
                            <span className="text-sm font-medium">{e.title}</span>
                          )}
                          <span className="text-xs text-muted-foreground shrink-0">
                            {formatDistanceToNow(new Date(e.date), { addSuffix: true })}
                          </span>
                        </div>
                        {e.meta && <p className="text-xs text-muted-foreground">{e.meta}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Invoices */}
          <TabsContent value="invoices" className="mt-4">
            <Card>
              {clientInvoices.length === 0 ? (
                <div className="py-10 text-center">
                  <Receipt className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground mb-3">No invoices yet for this client.</p>
                  <Button size="sm" onClick={handleNewInvoice}>
                    <Plus className="h-4 w-4 mr-2" /> Create first invoice
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Number</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Due</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clientInvoices.map((inv) => {
                      const total =
                        inv.totals?.totalCents != null
                          ? inv.totals.totalCents / 100
                          : inv.total ?? 0;
                      return (
                        <TableRow
                          key={inv.id}
                          className="cursor-pointer"
                          onClick={() => navigate(`/invoices?edit=${inv.id}`)}
                        >
                          <TableCell className="font-medium">{inv.number}</TableCell>
                          <TableCell>{format(new Date(inv.date), "PP")}</TableCell>
                          <TableCell className="text-muted-foreground">{inv.dueLabel}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className={statusColor(inv.status)}>
                              {inv.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(total)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </Card>
          </TabsContent>

          {/* Quotes */}
          <TabsContent value="quotes" className="mt-4">
            <Card>
              {clientQuotes.length === 0 ? (
                <div className="py-10 text-center">
                  <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground mb-3">No quotes yet for this client.</p>
                  <Button size="sm" onClick={handleNewQuote}>
                    <Plus className="h-4 w-4 mr-2" /> Create first quote
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Number</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Valid until</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clientQuotes.map((q) => {
                      const total =
                        q.totals?.totalCents != null ? q.totals.totalCents / 100 : q.total ?? 0;
                      return (
                        <TableRow
                          key={q.id}
                          className="cursor-pointer"
                          onClick={() => navigate(`/quotes?edit=${q.id}`)}
                        >
                          <TableCell className="font-medium">{q.number}</TableCell>
                          <TableCell>{format(new Date(q.date), "PP")}</TableCell>
                          <TableCell className="text-muted-foreground">{q.validLabel}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className={statusColor(q.status)}>
                              {q.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(total)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </Card>
          </TabsContent>

          {/* Projects */}
          <TabsContent value="projects" className="mt-4">
            <Card>
              {clientProjects.length === 0 ? (
                <div className="py-10 text-center">
                  <FolderKanban className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground mb-3">No projects yet for this client.</p>
                  <Button size="sm" onClick={handleNewProject}>
                    <Plus className="h-4 w-4 mr-2" /> Create project
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Number</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Updated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clientProjects.map((p) => (
                      <TableRow
                        key={p.id}
                        className="cursor-pointer"
                        onClick={() => navigate(`/projects`)}
                      >
                        <TableCell className="font-medium">{p.number}</TableCell>
                        <TableCell>{p.name}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={statusColor(p.status)}>
                            {p.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{format(new Date(p.createdAt), "PP")}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {format(new Date(p.updatedAt), "PP")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Card>
          </TabsContent>

          {/* Activity */}
          <TabsContent value="activity" className="mt-4">
            <Card className="p-4">
              {timeline.length === 0 ? (
                <p className="text-sm text-muted-foreground py-10 text-center">
                  No activity recorded yet.
                </p>
              ) : (
                <div className="relative">
                  <div className="absolute left-3.5 top-2 bottom-2 w-px bg-border" />
                  <div className="space-y-4">
                    {timeline.map((e) => (
                      <div key={e.id} className="flex items-start gap-3 relative">
                        <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 z-10 ${toneClass(e.tone)}`}>
                          {e.kind === "invoice" && <Receipt className="h-3.5 w-3.5" />}
                          {e.kind === "quote" && <FileText className="h-3.5 w-3.5" />}
                          {e.kind === "project" && <FolderKanban className="h-3.5 w-3.5" />}
                          {e.kind === "created" && <UsersIcon className="h-3.5 w-3.5" />}
                        </div>
                        <div className="flex-1 pb-2">
                          <div className="flex items-center justify-between gap-2">
                            {e.href ? (
                              <Link to={e.href} className="text-sm font-medium hover:text-primary">
                                {e.title}
                              </Link>
                            ) : (
                              <span className="text-sm font-medium">{e.title}</span>
                            )}
                            <span className="text-xs text-muted-foreground shrink-0">
                              {format(new Date(e.date), "PP")}
                            </span>
                          </div>
                          {e.meta && <p className="text-xs text-muted-foreground mt-0.5">{e.meta}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Notes */}
          <TabsContent value="notes" className="mt-4 space-y-3">
            <Card className="p-4 space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <StickyNote className="h-4 w-4" /> Add a note
              </h3>
              <Textarea
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
                rows={3}
                placeholder="Internal note about this client (visible to your team only)…"
              />
              <div className="flex justify-end">
                <Button size="sm" onClick={handleSaveNote} disabled={!noteDraft.trim()}>
                  Save note
                </Button>
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="text-sm font-semibold mb-2">History</h3>
              {client.notes ? (
                <pre className="text-sm whitespace-pre-wrap font-sans text-foreground/80">
                  {client.notes}
                </pre>
              ) : (
                <p className="text-sm text-muted-foreground">No notes yet.</p>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Client</DialogTitle>
          </DialogHeader>
          <ClientForm
            client={client}
            onSubmit={(c) => {
              updateClient(c);
              setEditOpen(false);
              toast({ title: "Client updated" });
            }}
            onCancel={() => setEditOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default ClientDetail;
