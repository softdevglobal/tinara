import { MoreHorizontal } from "lucide-react";
import { Client } from "@/data/clients";
import { Invoice } from "@/data/invoices";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
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

interface ClientTableProps {
  clients: Client[];
  invoices: Invoice[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onEdit?: (client: Client) => void;
  onDelete?: (client: Client) => void;
  onCreateInvoice?: (client: Client) => void;
}

export function ClientTable({
  clients,
  invoices,
  selectedIds,
  onSelectionChange,
  onEdit,
  onDelete,
  onCreateInvoice,
}: ClientTableProps) {
  const allSelected = clients.length > 0 && selectedIds.length === clients.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < clients.length;

  const handleSelectAll = () => {
    if (allSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(clients.map((c) => c.id));
    }
  };

  const handleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((i) => i !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  const getClientBalance = (clientName: string) => {
    const clientInvoices = invoices.filter(
      (inv) =>
        inv.clientName.toLowerCase().includes(clientName.toLowerCase()) &&
        (inv.status === "Opened" || inv.status === "Overdue")
    );
    return clientInvoices.reduce((sum, inv) => sum + inv.total, 0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-12">
              <Checkbox
                checked={allSelected}
                ref={(ref) => {
                  if (ref) {
                    (ref as HTMLButtonElement & { indeterminate?: boolean }).indeterminate = someSelected;
                  }
                }}
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead className="text-right">Balance Due</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                No clients found
              </TableCell>
            </TableRow>
          ) : (
            clients.map((client) => {
              const balance = getClientBalance(client.company || client.name);
              return (
                <TableRow
                  key={client.id}
                  className={cn(
                    selectedIds.includes(client.id) && "bg-muted/50"
                  )}
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(client.id)}
                      onCheckedChange={() => handleSelectOne(client.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {client.company || "-"}
                  </TableCell>
                  <TableCell>
                    <a
                      href={`mailto:${client.email}`}
                      className="text-primary hover:underline"
                    >
                      {client.email}
                    </a>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {client.phone || "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={cn(
                        "font-medium",
                        balance > 0 ? "text-destructive" : "text-muted-foreground"
                      )}
                    >
                      {balance > 0 ? formatCurrency(balance) : "-"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit?.(client)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onCreateInvoice?.(client)}>
                          Create Invoice
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onDelete?.(client)}
                          className="text-destructive"
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
