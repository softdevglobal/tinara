import { useState } from "react";
import { MoreHorizontal, ArrowUpDown } from "lucide-react";
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

interface ProjectTableProps {
  projects: Project[];
  clients: Client[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onEdit?: (project: Project) => void;
  onDelete?: (id: string) => void;
}

type SortField = "number" | "name" | "client" | "createdAt" | "updatedAt" | "status";
type SortDirection = "asc" | "desc";

export function ProjectTable({
  projects,
  clients,
  selectedIds,
  onSelectionChange,
  onEdit,
  onDelete,
}: ProjectTableProps) {
  const [sortField, setSortField] = useState<SortField>("updatedAt");
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

  const sortedProjects = [...projects].sort((a, b) => {
    let comparison = 0;
    switch (sortField) {
      case "number":
        comparison = a.number.localeCompare(b.number);
        break;
      case "name":
        comparison = a.name.localeCompare(b.name);
        break;
      case "client":
        comparison = getClientName(a.clientId).localeCompare(getClientName(b.clientId));
        break;
      case "createdAt":
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case "updatedAt":
        comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        break;
      case "status":
        comparison = a.status.localeCompare(b.status);
        break;
    }
    return sortDirection === "asc" ? comparison : -comparison;
  });

  const handleSelectAll = () => {
    if (selectedIds.length === projects.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(projects.map((p) => p.id));
    }
  };

  const handleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((i) => i !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
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
                checked={selectedIds.length === projects.length && projects.length > 0}
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
            <TableHead>
              <SortableHeader field="number">Number</SortableHeader>
            </TableHead>
            <TableHead>
              <SortableHeader field="name">Project Name</SortableHeader>
            </TableHead>
            <TableHead>
              <SortableHeader field="client">Client</SortableHeader>
            </TableHead>
            <TableHead>
              <SortableHeader field="createdAt">Created</SortableHeader>
            </TableHead>
            <TableHead>
              <SortableHeader field="updatedAt">Last Updated</SortableHeader>
            </TableHead>
            <TableHead>
              <SortableHeader field="status">Status</SortableHeader>
            </TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedProjects.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                No projects found.
              </TableCell>
            </TableRow>
          ) : (
            sortedProjects.map((project) => (
              <TableRow key={project.id} className="hover:bg-muted/50">
                <TableCell>
                  <Checkbox
                    checked={selectedIds.includes(project.id)}
                    onCheckedChange={() => handleSelectOne(project.id)}
                  />
                </TableCell>
                <TableCell className="font-medium">{project.number}</TableCell>
                <TableCell>{project.name}</TableCell>
                <TableCell>{getClientName(project.clientId)}</TableCell>
                <TableCell>{format(new Date(project.createdAt), "MMM d, yyyy")}</TableCell>
                <TableCell>{format(new Date(project.updatedAt), "MMM d, yyyy")}</TableCell>
                <TableCell>
                  <Badge
                    variant={project.status === "Active" ? "default" : "secondary"}
                    className={project.status === "Active" ? "bg-primary" : ""}
                  >
                    {project.status}
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
                      <DropdownMenuItem onClick={() => onEdit?.(project)}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDelete?.(project.id)}
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
