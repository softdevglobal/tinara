import { useState } from "react";
import { MoreHorizontal, ArrowUpDown, Receipt } from "lucide-react";
import { Expense } from "@/data/expenses";
import { Project } from "@/data/projects";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface ExpenseTableProps {
  expenses: Expense[];
  projects: Project[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onEdit?: (expense: Expense) => void;
  onDelete?: (id: string) => void;
}

type SortField = "date" | "description" | "category" | "amount" | "vendor";
type SortDirection = "asc" | "desc";

export function ExpenseTable({
  expenses,
  projects,
  selectedIds,
  onSelectionChange,
  onEdit,
  onDelete,
}: ExpenseTableProps) {
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const getProjectName = (projectId?: string) => {
    if (!projectId) return "-";
    const project = projects.find((p) => p.id === projectId);
    return project?.name || "-";
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedExpenses = [...expenses].sort((a, b) => {
    let comparison = 0;
    switch (sortField) {
      case "date":
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
        break;
      case "description":
        comparison = a.description.localeCompare(b.description);
        break;
      case "category":
        comparison = a.category.localeCompare(b.category);
        break;
      case "amount":
        comparison = a.amount - b.amount;
        break;
      case "vendor":
        comparison = (a.vendor || "").localeCompare(b.vendor || "");
        break;
    }
    return sortDirection === "asc" ? comparison : -comparison;
  });

  const handleSelectAll = () => {
    if (selectedIds.length === expenses.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(expenses.map((e) => e.id));
    }
  };

  const handleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((i) => i !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
    }).format(amount);
  };

  const getCategoryColor = (category: Expense["category"]) => {
    switch (category) {
      case "Travel":
        return "bg-purple-500/10 text-purple-600";
      case "Equipment":
        return "bg-blue-500/10 text-blue-600";
      case "Supplies":
        return "bg-amber-500/10 text-amber-600";
      case "Software":
        return "bg-cyan-500/10 text-cyan-600";
      case "Marketing":
        return "bg-pink-500/10 text-pink-600";
      default:
        return "bg-gray-500/10 text-gray-600";
    }
  };

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 h-8 hover:bg-transparent"
      onClick={() => handleSort(field)}
    >
      {children}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={selectedIds.length === expenses.length && expenses.length > 0}
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
            <TableHead>
              <SortableHeader field="date">Date</SortableHeader>
            </TableHead>
            <TableHead>
              <SortableHeader field="description">Description</SortableHeader>
            </TableHead>
            <TableHead>
              <SortableHeader field="vendor">Vendor</SortableHeader>
            </TableHead>
            <TableHead>
              <SortableHeader field="category">Category</SortableHeader>
            </TableHead>
            <TableHead>Project</TableHead>
            <TableHead className="text-right">
              <SortableHeader field="amount">Amount</SortableHeader>
            </TableHead>
            <TableHead className="w-12">Receipt</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedExpenses.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                No expenses found.
              </TableCell>
            </TableRow>
          ) : (
            sortedExpenses.map((expense) => (
              <TableRow key={expense.id} className="hover:bg-muted/50">
                <TableCell>
                  <Checkbox
                    checked={selectedIds.includes(expense.id)}
                    onCheckedChange={() => handleSelectOne(expense.id)}
                  />
                </TableCell>
                <TableCell>{format(new Date(expense.date), "MMM d, yyyy")}</TableCell>
                <TableCell className="font-medium">{expense.description}</TableCell>
                <TableCell className="text-muted-foreground">{expense.vendor || "-"}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className={getCategoryColor(expense.category)}>
                    {expense.category}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {getProjectName(expense.projectId)}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(expense.amount)}
                </TableCell>
                <TableCell>
                  {expense.receipt && (
                    <Receipt className="h-4 w-4 text-muted-foreground" />
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit?.(expense)}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDelete?.(expense.id)}
                        className="text-destructive"
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
