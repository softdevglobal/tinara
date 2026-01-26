import { useState, useMemo } from "react";
import { Quote } from "@/data/quotes";
import { Invoice } from "@/data/invoices";
import { Client } from "@/data/clients";
import { QuoteFilters } from "./QuoteFilters";
import { QuoteListItem } from "./QuoteListItem";
import { QuoteCard } from "./QuoteCard";
import { NewQuoteForm } from "./NewQuoteForm";
import { ArrowLeft, FileText } from "lucide-react";
import { generateQuotePdf } from "@/lib/pdf-generator";
import { useToast } from "@/hooks/use-toast";
import { QuoteFormData } from "@/lib/quote-schema";
import { useApp } from "@/context/AppContext";

type StatusFilter = "all" | "Draft" | "Sent" | "Accepted" | "Expired" | "Converted";
type View = "list" | "detail" | "new" | "edit";

interface QuoteDashboardProps {
  quotes: Quote[];
  clients: Client[];
  onUpdateQuotes: React.Dispatch<React.SetStateAction<Quote[]>>;
  onAddClient: (client: Client) => void;
  onConvertToInvoice: (quote: Quote) => void;
  showNewForm?: boolean;
  onCloseNewForm?: () => void;
}

export function QuoteDashboard({
  quotes,
  clients,
  onUpdateQuotes,
  onAddClient,
  onConvertToInvoice,
  showNewForm,
  onCloseNewForm,
}: QuoteDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [view, setView] = useState<View>(showNewForm ? "new" : "list");
  const { toast } = useToast();
  const { brandingSettings } = useApp();

  if (showNewForm && view !== "new") {
    setView("new");
  }

  const counts = useMemo(
    () => ({
      all: quotes.length,
      Draft: quotes.filter((q) => q.status === "Draft").length,
      Sent: quotes.filter((q) => q.status === "Sent").length,
      Accepted: quotes.filter((q) => q.status === "Accepted").length,
      Expired: quotes.filter((q) => q.status === "Expired").length,
      Converted: quotes.filter((q) => q.status === "Converted").length,
    }),
    [quotes]
  );

  const filteredQuotes = useMemo(() => {
    return quotes.filter((quote) => {
      const matchesSearch =
        searchQuery === "" ||
        quote.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quote.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quote.projectName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || quote.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [quotes, searchQuery, statusFilter]);

  const handleSend = (quote: Quote) => {
    onUpdateQuotes((prev) =>
      prev.map((q) =>
        q.id === quote.id
          ? { ...q, status: "Sent" as const }
          : q
      )
    );
    toast({
      title: "Quote sent",
      description: `Quote #${quote.number} has been marked as sent.`,
    });
  };

  const handleAccept = (id: string) => {
    onUpdateQuotes((prev) =>
      prev.map((q) =>
        q.id === id
          ? { ...q, status: "Accepted" as const }
          : q
      )
    );
    toast({
      title: "Quote accepted",
      description: "The quote has been marked as accepted.",
    });
  };

  const handleDownloadPdf = (quote: Quote) => {
    generateQuotePdf(quote, brandingSettings);
    toast({
      title: "PDF Downloaded",
      description: `Quote #${quote.number} has been downloaded.`,
    });
  };

  const handleDelete = (id: string) => {
    onUpdateQuotes((prev) => prev.filter((q) => q.id !== id));
    toast({
      title: "Quote deleted",
      description: "The quote has been removed.",
    });
  };

  const handleEdit = (quote: Quote) => {
    setEditingQuote(quote);
    setView("edit");
  };

  const handleCreateQuote = (data: QuoteFormData) => {
    const subtotal = data.lineItems.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );
    const taxAmount = subtotal * (data.taxRate / 100);
    const total = subtotal + taxAmount;

    const validDays = Math.ceil((data.validUntil.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    const newQuote: Quote = {
      id: `quote_${Date.now()}`,
      number: `Q${Date.now().toString().slice(-8)}`,
      clientName: data.clientName,
      projectName: data.projectName || "",
      date: data.issueDate.toISOString().split("T")[0],
      validUntil: data.validUntil.toISOString().split("T")[0],
      validDaysRemaining: validDays,
      validLabel: validDays > 0 ? `Valid for ${validDays} days` : "Expired",
      status: "Draft",
      total: total,
      currency: "AUD",
    };

    onUpdateQuotes((prev) => [newQuote, ...prev]);
    setView("list");
    onCloseNewForm?.();
    toast({
      title: "Quote created",
      description: `Quote #${newQuote.number} has been created.`,
    });
  };

  const handleUpdateQuote = (data: QuoteFormData) => {
    if (!editingQuote) return;

    const subtotal = data.lineItems.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );
    const taxAmount = subtotal * (data.taxRate / 100);
    const total = subtotal + taxAmount;

    const validDays = Math.ceil((data.validUntil.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    onUpdateQuotes((prev) =>
      prev.map((q) =>
        q.id === editingQuote.id
          ? {
              ...q,
              clientName: data.clientName,
              projectName: data.projectName || "",
              date: data.issueDate.toISOString().split("T")[0],
              validUntil: data.validUntil.toISOString().split("T")[0],
              validDaysRemaining: validDays,
              validLabel: validDays > 0 ? `Valid for ${validDays} days` : "Expired",
              total,
            }
          : q
      )
    );
    
    setEditingQuote(null);
    setView("list");
    toast({
      title: "Quote updated",
      description: `Quote #${editingQuote.number} has been updated.`,
    });
  };

  const handleBackToList = () => {
    setView("list");
    setSelectedQuote(null);
    setEditingQuote(null);
    onCloseNewForm?.();
  };

  if (view === "new") {
    return (
      <NewQuoteForm 
        onBack={handleBackToList} 
        onSubmit={handleCreateQuote}
        clients={clients}
        onAddClient={onAddClient}
      />
    );
  }

  if (view === "edit" && editingQuote) {
    return (
      <NewQuoteForm
        onBack={handleBackToList}
        onSubmit={handleUpdateQuote}
        editingQuote={editingQuote}
        clients={clients}
        onAddClient={onAddClient}
      />
    );
  }

  if (view === "detail" && selectedQuote) {
    const currentQuote = quotes.find((q) => q.id === selectedQuote.id);
    if (!currentQuote) {
      setView("list");
      setSelectedQuote(null);
      return null;
    }

    return (
      <div className="animate-fade-in">
        <button
          onClick={handleBackToList}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to quotes
        </button>
        <div className="max-w-md">
          <QuoteCard quote={currentQuote} />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <QuoteFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        counts={counts}
      />

      {filteredQuotes.length === 0 ? (
        <div className="text-center py-12">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary mx-auto mb-4">
            <FileText className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">No quotes found</p>
          <p className="text-xs text-muted-foreground mt-1">
            Try adjusting your search or filter
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredQuotes.map((quote) => (
            <QuoteListItem
              key={quote.id}
              quote={quote}
              onClick={() => {
                setSelectedQuote(quote);
                setView("detail");
              }}
              onEdit={handleEdit}
              onSend={handleSend}
              onAccept={handleAccept}
              onConvertToInvoice={onConvertToInvoice}
              onDownloadPdf={handleDownloadPdf}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
