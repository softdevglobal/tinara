import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Quote, QuoteSortOption } from "@/data/quotes";
import { Invoice } from "@/data/invoices";
import { Client } from "@/data/clients";
import { Project } from "@/data/projects";
import { QuoteTable } from "./tables/QuoteTable";
import { DocumentCreationForm } from "./document/DocumentCreationForm";
import { generateQuotePdf } from "@/lib/pdf-generator";
import { useToast } from "@/hooks/use-toast";
import { useApp } from "@/context/AppContext";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

type View = "list" | "new" | "edit";

interface QuoteDashboardProps {
  quotes: Quote[];
  clients: Client[];
  projects: Project[];
  onUpdateQuotes: React.Dispatch<React.SetStateAction<Quote[]>>;
  onAddClient: (client: Client) => void;
  onConvertToInvoice: (quote: Quote) => Invoice;
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
        return (b.totals?.totalCents ?? 0) - (a.totals?.totalCents ?? 0);
      case "amount-asc":
        return (a.totals?.totalCents ?? 0) - (b.totals?.totalCents ?? 0);
      default:
        return 0;
    }
  });
}

export function QuoteDashboard({
  quotes,
  clients,
  projects,
  onUpdateQuotes,
  onAddClient,
  onConvertToInvoice,
  showNewForm,
  onCloseNewForm,
}: QuoteDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<QuoteSortOption>("date-desc");
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [view, setView] = useState<View>(showNewForm ? "new" : "list");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { toast } = useToast();
  const { brandingSettings } = useApp();
  const navigate = useNavigate();

  // Handler to view invoice from converted quote
  const handleViewInvoice = (invoiceId: string) => {
    // Navigate to invoices page with edit parameter
    navigate(`/invoices?edit=${invoiceId}`);
  };

  // Sync with prop
  useEffect(() => {
    if (showNewForm && view !== "new") {
      setView("new");
    }
  }, [showNewForm, view]);

  const filteredQuotes = useMemo(() => {
    const filtered = quotes.filter((quote) => {
      const matchesSearch =
        searchQuery === "" ||
        quote.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quote.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quote.projectName.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSearch;
    });
    return sortQuotes(filtered, sortOption);
  }, [quotes, searchQuery, sortOption]);

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

  const handleEdit = (quote: Quote) => {
    setEditingQuote(quote);
    setView("edit");
  };

  const handleCreateQuote = (quote: Quote | Invoice) => {
    onUpdateQuotes((prev) => [quote as Quote, ...prev]);
    setView("list");
    onCloseNewForm?.();
    toast({
      title: "Estimate created",
      description: `Estimate #${quote.number} has been created.`,
    });
  };

  const handleUpdateQuote = (updatedQuote: Quote | Invoice) => {
    onUpdateQuotes((prev) =>
      prev.map((q) => q.id === updatedQuote.id ? updatedQuote as Quote : q)
    );
    setEditingQuote(null);
    setView("list");
    toast({
      title: "Estimate updated",
      description: `Estimate #${updatedQuote.number} has been updated.`,
    });
  };

  const handleBackToList = () => {
    setView("list");
    setEditingQuote(null);
    onCloseNewForm?.();
  };

  // Handle convert to invoice from within form
  const handleConvertFromForm = () => {
    if (editingQuote) {
      const newInvoice = onConvertToInvoice(editingQuote);
      setEditingQuote(null);
      setView("list");
      return newInvoice;
    }
    return null;
  };

  if (view === "new") {
    return (
      <DocumentCreationForm
        type="quote"
        onBack={handleBackToList}
        onSubmit={handleCreateQuote}
        clients={clients}
        onAddClient={onAddClient}
      />
    );
  }

  if (view === "edit" && editingQuote) {
    return (
      <DocumentCreationForm
        type="quote"
        onBack={handleBackToList}
        onSubmit={handleUpdateQuote}
        editingDocument={editingQuote}
        clients={clients}
        onAddClient={onAddClient}
        onConvertToInvoice={handleConvertFromForm}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex justify-end">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search estimates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <QuoteTable
        quotes={filteredQuotes}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onConvertToInvoice={onConvertToInvoice}
        onDownloadPdf={handleDownloadPdf}
        onViewInvoice={handleViewInvoice}
        sortOption={sortOption}
        onSortChange={setSortOption}
      />
    </div>
  );
}