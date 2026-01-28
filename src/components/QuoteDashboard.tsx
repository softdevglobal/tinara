import { useState, useMemo, useRef } from "react";
import { Quote, QuoteSortOption } from "@/data/quotes";
import { Client } from "@/data/clients";
import { QuoteFilters } from "./QuoteFilters";
import { QuoteTable } from "./tables/QuoteTable";
import { QuoteCard } from "./QuoteCard";
import { NewQuoteForm } from "./NewQuoteForm";
import { QuoteBulkActionsBar } from "./QuoteBulkActionsBar";
import { ArrowLeft, FileText } from "lucide-react";
import { generateQuotePdf } from "@/lib/pdf-generator";
import { useToast } from "@/hooks/use-toast";
import { QuoteFormData } from "@/lib/quote-schema";
import { useApp } from "@/context/AppContext";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

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

function sortQuotes(quotes: Quote[], sortOption: QuoteSortOption): Quote[] {
  return [...quotes].sort((a, b) => {
    switch (sortOption) {
      case "date-desc":
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      case "date-asc":
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      case "accepted-desc":
        if (!a.acceptedDate && !b.acceptedDate) return 0;
        if (!a.acceptedDate) return 1;
        if (!b.acceptedDate) return -1;
        return new Date(b.acceptedDate).getTime() - new Date(a.acceptedDate).getTime();
      case "accepted-asc":
        if (!a.acceptedDate && !b.acceptedDate) return 0;
        if (!a.acceptedDate) return 1;
        if (!b.acceptedDate) return -1;
        return new Date(a.acceptedDate).getTime() - new Date(b.acceptedDate).getTime();
      case "amount-desc":
        return b.total - a.total;
      case "amount-asc":
        return a.total - b.total;
      default:
        return 0;
    }
  });
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
  const [sortOption, setSortOption] = useState<QuoteSortOption>("date-desc");
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [view, setView] = useState<View>(showNewForm ? "new" : "list");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { brandingSettings } = useApp();

  // Keyboard shortcuts
  useKeyboardShortcuts(
    {
      onNewItem: () => {
        if (view === "list") {
          setView("new");
        }
      },
      onToggleSelectMode: () => {},
      onFocusSearch: () => {
        if (view === "list") {
          searchInputRef.current?.focus();
        }
      },
    },
    view === "list"
  );

  // Sync with prop
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
    const filtered = quotes.filter((quote) => {
      const matchesSearch =
        searchQuery === "" ||
        quote.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quote.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quote.projectName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || quote.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
    return sortQuotes(filtered, sortOption);
  }, [quotes, searchQuery, statusFilter, sortOption]);

  const handleDownloadPdf = (quote: Quote) => {
    generateQuotePdf(quote, brandingSettings);
    toast({
      title: "PDF Downloaded",
      description: `Quote #${quote.number} has been downloaded.`,
    });
  };

  const handleDelete = (quote: Quote) => {
    onUpdateQuotes((prev) => prev.filter((q) => q.id !== quote.id));
    setSelectedIds((prev) => prev.filter((id) => id !== quote.id));
    toast({
      title: "Quote deleted",
      description: "The quote has been removed.",
    });
  };

  const handleBulkDelete = () => {
    const count = selectedIds.length;
    onUpdateQuotes((prev) => prev.filter((q) => !selectedIds.includes(q.id)));
    setSelectedIds([]);
    toast({
      title: "Quotes deleted",
      description: `${count} quotes have been removed.`,
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
    <div className="space-y-4">
      <QuoteFilters
        ref={searchInputRef}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        sortOption={sortOption}
        onSortChange={setSortOption}
        counts={counts}
        isSelectMode={selectedIds.length > 0}
        onToggleSelectMode={() => setSelectedIds([])}
      />

      {selectedIds.length > 0 && (
        <QuoteBulkActionsBar
          selectedCount={selectedIds.length}
          totalCount={filteredQuotes.length}
          onSelectAll={() => setSelectedIds(filteredQuotes.map((q) => q.id))}
          onAccept={() => {}}
          onDelete={handleBulkDelete}
          onCancel={() => setSelectedIds([])}
        />
      )}

      <QuoteTable
        quotes={filteredQuotes}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onConvertToInvoice={onConvertToInvoice}
        onDownloadPdf={handleDownloadPdf}
        sortOption={sortOption}
        onSortChange={setSortOption}
      />
    </div>
  );
}
