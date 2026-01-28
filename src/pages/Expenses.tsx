import { useState } from "react";
import { Receipt, Plus, Search } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExpenseTable } from "@/components/tables/ExpenseTable";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Expenses = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const { expenses, projects, setExpenses } = useApp();
  const { toast } = useToast();

  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch =
      expense.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (expense.vendor?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesCategory =
      categoryFilter === "all" || expense.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  const handleDelete = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    toast({
      title: "Expense deleted",
      description: "The expense has been removed.",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
    }).format(amount);
  };

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Receipt className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-[36px] font-semibold text-foreground">Expenses</h1>
            <p className="text-sm text-muted-foreground">Track your business expenses</p>
          </div>
        </div>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          New Expense
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total Expenses</p>
          <p className="text-2xl font-semibold">{formatCurrency(totalExpenses)}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">This Month</p>
          <p className="text-2xl font-semibold">
            {formatCurrency(
              expenses
                .filter((e) => {
                  const expenseDate = new Date(e.date);
                  const now = new Date();
                  return (
                    expenseDate.getMonth() === now.getMonth() &&
                    expenseDate.getFullYear() === now.getFullYear()
                  );
                })
                .reduce((sum, e) => sum + e.amount, 0)
            )}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Entries</p>
          <p className="text-2xl font-semibold">{expenses.length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between mb-4">
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Travel">Travel</SelectItem>
            <SelectItem value="Equipment">Equipment</SelectItem>
            <SelectItem value="Supplies">Supplies</SelectItem>
            <SelectItem value="Software">Software</SelectItem>
            <SelectItem value="Marketing">Marketing</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>

        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search expenses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Table or Empty State */}
      {expenses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Receipt className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Track your expenses
          </h3>
          <p className="text-muted-foreground max-w-sm mb-4">
            Record business expenses to keep track of your spending and tax deductions.
          </p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add First Expense
          </Button>
        </div>
      ) : (
        <ExpenseTable
          expenses={filteredExpenses}
          projects={projects}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          onDelete={handleDelete}
        />
      )}
    </AppLayout>
  );
};

export default Expenses;
