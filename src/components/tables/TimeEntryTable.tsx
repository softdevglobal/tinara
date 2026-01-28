import { useState } from "react";
import { MoreHorizontal, ArrowUpDown } from "lucide-react";
import { TimeEntry } from "@/data/time-entries";
import { Project } from "@/data/projects";
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

interface TimeEntryTableProps {
  timeEntries: TimeEntry[];
  projects: Project[];
  clients: Client[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onEdit?: (entry: TimeEntry) => void;
  onDelete?: (id: string) => void;
  onMarkBilled?: (id: string) => void;
}

type SortField = "date" | "description" | "duration" | "amount";
type SortDirection = "asc" | "desc";

export function TimeEntryTable({
  timeEntries,
  projects,
  clients,
  selectedIds,
  onSelectionChange,
  onEdit,
  onDelete,
  onMarkBilled,
}: TimeEntryTableProps) {
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const getProjectName = (projectId?: string) => {
    if (!projectId) return "-";
    const project = projects.find((p) => p.id === projectId);
    return project?.name || "-";
  };

  const getClientName = (clientId?: string) => {
    if (!clientId) return "-";
    const client = clients.find((c) => c.id === clientId);
    return client?.company || client?.name || "-";
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const calculateAmount = (entry: TimeEntry) => {
    return (entry.duration / 60) * entry.hourlyRate;
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedEntries = [...timeEntries].sort((a, b) => {
    let comparison = 0;
    switch (sortField) {
      case "date":
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
        break;
      case "description":
        comparison = a.description.localeCompare(b.description);
        break;
      case "duration":
        comparison = a.duration - b.duration;
        break;
      case "amount":
        comparison = calculateAmount(a) - calculateAmount(b);
        break;
    }
    return sortDirection === "asc" ? comparison : -comparison;
  });

  const handleSelectAll = () => {
    if (selectedIds.length === timeEntries.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(timeEntries.map((e) => e.id));
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
                checked={selectedIds.length === timeEntries.length && timeEntries.length > 0}
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
            <TableHead>
              <SortableHeader field="date">Date</SortableHeader>
            </TableHead>
            <TableHead>
              <SortableHeader field="description">Description</SortableHeader>
            </TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Project</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>
              <SortableHeader field="duration">Duration</SortableHeader>
            </TableHead>
            <TableHead className="text-right">
              <SortableHeader field="amount">Amount</SortableHeader>
            </TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedEntries.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} className="h-24 text-center text-muted-foreground">
                No time entries found.
              </TableCell>
            </TableRow>
          ) : (
            sortedEntries.map((entry) => (
              <TableRow key={entry.id} className="hover:bg-muted/50">
                <TableCell>
                  <Checkbox
                    checked={selectedIds.includes(entry.id)}
                    onCheckedChange={() => handleSelectOne(entry.id)}
                  />
                </TableCell>
                <TableCell>{format(new Date(entry.date), "MMM d, yyyy")}</TableCell>
                <TableCell className="font-medium max-w-xs truncate">
                  {entry.description}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {getClientName(entry.clientId)}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {getProjectName(entry.projectId)}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {entry.startTime && entry.endTime
                    ? `${entry.startTime} - ${entry.endTime}`
                    : "-"}
                </TableCell>
                <TableCell>{formatDuration(entry.duration)}</TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(calculateAmount(entry))}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={entry.billed ? "default" : "outline"}
                    className={entry.billed ? "bg-green-500/10 text-green-600" : ""}
                  >
                    {entry.billed ? "Billed" : "Unbilled"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit?.(entry)}>
                        Edit
                      </DropdownMenuItem>
                      {!entry.billed && (
                        <DropdownMenuItem onClick={() => onMarkBilled?.(entry.id)}>
                          Mark as Billed
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => onDelete?.(entry.id)}
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
