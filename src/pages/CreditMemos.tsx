import { useState } from "react";
import { CreditCard, Plus, Search } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CreditMemoTable } from "@/components/tables/CreditMemoTable";
import { NewCreditMemoForm } from "@/components/NewCreditMemoForm";
import { useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CreditMemos = () => {
  const [searchParams] = useSearchParams();
  const showNewFromUrl = searchParams.get("new") === "credit-memo";
  const [showNewForm, setShowNewForm] = useState(showNewFromUrl);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { creditMemos, clients, setCreditMemos } = useApp();
  const { toast } = useToast();

  const filteredMemos = creditMemos.filter((memo) => {
    const client = clients.find((c) => c.id === memo.clientId);
    const clientName = client?.company || client?.name || "";
    const matchesSearch =
      memo.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clientName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || memo.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = (id: string) => {
    setCreditMemos((prev) => prev.filter((m) => m.id !== id));
    toast({
      title: "Credit memo deleted",
      description: "The credit memo has been removed.",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
    }).format(amount);
  };

  const totalAmount = filteredMemos.reduce((sum, m) => sum + m.total, 0);

  if (showNewForm) {
    return (
      <AppLayout>
        <NewCreditMemoForm
          clients={clients}
          onSubmit={(memo) => {
            setCreditMemos((prev) => [memo, ...prev]);
            setShowNewForm(false);
            toast({
              title: "Credit memo created",
              description: `Credit memo ${memo.number} has been created.`,
            });
          }}
          onCancel={() => setShowNewForm(false)}
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <CreditCard className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Credit Memos</h1>
            <p className="text-sm text-muted-foreground">Manage refunds and credits</p>
          </div>
        </div>
        <Button size="sm" onClick={() => setShowNewForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Credit Memo
        </Button>
      </div>

      {/* Summary */}
      <div className="mb-4 p-4 rounded-lg border bg-card">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Total Credits</span>
          <span className="text-xl font-semibold">{formatCurrency(totalAmount)}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between mb-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Draft">Draft</SelectItem>
            <SelectItem value="Sent">Sent</SelectItem>
            <SelectItem value="Applied">Applied</SelectItem>
          </SelectContent>
        </Select>

        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search credit memos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Table or Empty State */}
      {creditMemos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <CreditCard className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No credit memos yet
          </h3>
          <p className="text-muted-foreground max-w-sm mb-4">
            Create credit memos to issue refunds or credits to your clients.
          </p>
          <Button onClick={() => setShowNewForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Credit Memo
          </Button>
        </div>
      ) : (
        <CreditMemoTable
          creditMemos={filteredMemos}
          clients={clients}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          onDelete={handleDelete}
        />
      )}
    </AppLayout>
  );
};

export default CreditMemos;
