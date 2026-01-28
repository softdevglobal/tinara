import { useState } from "react";
import { MoreHorizontal, ArrowUpDown } from "lucide-react";
import { CreditMemo } from "@/data/credit-memos";
import { Client } from "@/data/clients";
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

interface CreditMemoTableProps {
  creditMemos: CreditMemo[];
  clients: Client[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onEdit?: (creditMemo: CreditMemo) => void;
  onDelete?: (id: string) => void;
}

type SortField = "number" | "client" | "date" | "status" | "total";
type SortDirection = "asc" | "desc";

export function CreditMemoTable({
  creditMemos,
  clients,
  selectedIds,
  onSelectionChange,
  onEdit,
  onDelete,
}: CreditMemoTableProps) {
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const getClientName = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId);
    return client?.company || client?.name || "Unknown";
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedMemos = [...creditMemos].sort((a, b) => {
    let comparison = 0;
    switch (sortField) {
      case "number":
        comparison = a.number.localeCompare(b.number);
        break;
      case "client":
        comparison = getClientName(a.clientId).localeCompare(getClientName(b.clientId));
        break;
      case "date":
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
        break;
      case "status":
        comparison = a.status.localeCompare(b.status);
        break;
      case "total":
        comparison = a.total - b.total;
        break;
    }
    return sortDirection === "asc" ? comparison : -comparison;
  });

  const handleSelectAll = () => {
    if (selectedIds.length === creditMemos.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(creditMemos.map((cm) => cm.id));
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

  const getStatusColor = (status: CreditMemo["status"]) => {
    switch (status) {
      case "Draft":
        return "bg-muted text-muted-foreground";
      case "Sent":
        return "bg-blue-500/10 text-blue-600";
      case "Applied":
        return "bg-green-500/10 text-green-600";
      default:
        return "";
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
                checked={selectedIds.length === creditMemos.length && creditMemos.length > 0}
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
            <TableHead>
              <SortableHeader field="number">Number</SortableHeader>
            </TableHead>
            <TableHead>
              <SortableHeader field="client">Client</SortableHeader>
            </TableHead>
            <TableHead>
              <SortableHeader field="date">Date</SortableHeader>
            </TableHead>
            <TableHead>
              <SortableHeader field="status">Status</SortableHeader>
            </TableHead>
            <TableHead className="text-right">
              <SortableHeader field="total">Total</SortableHeader>
            </TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedMemos.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                No credit memos found.
              </TableCell>
            </TableRow>
          ) : (
            sortedMemos.map((memo) => (
              <TableRow key={memo.id} className="hover:bg-muted/50">
                <TableCell>
                  <Checkbox
                    checked={selectedIds.includes(memo.id)}
                    onCheckedChange={() => handleSelectOne(memo.id)}
                  />
                </TableCell>
                <TableCell className="font-medium">{memo.number}</TableCell>
                <TableCell>{getClientName(memo.clientId)}</TableCell>
                <TableCell>{format(new Date(memo.date), "MMM d, yyyy")}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className={getStatusColor(memo.status)}>
                    {memo.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(memo.total)}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit?.(memo)}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDelete?.(memo.id)}
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
