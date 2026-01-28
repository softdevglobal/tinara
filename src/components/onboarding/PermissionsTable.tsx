import {
  StaffPermissions,
  PERMISSION_MODULE_LABELS,
  PERMISSION_LEVEL_LABELS,
  PermissionLevel,
  BasicPermissionLevel,
  ReadOnlyPermissionLevel,
} from "@/types/onboarding";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  FileText,
  FileCheck,
  Users,
  Package,
  Receipt,
  Clock,
  RefreshCw,
  Settings,
  Download,
  CreditCard,
} from "lucide-react";

interface PermissionsTableProps {
  permissions: StaffPermissions;
  compact?: boolean;
}

const MODULE_ICONS: Record<keyof StaffPermissions, React.ElementType> = {
  invoices: FileText,
  quotes: FileCheck,
  clients: Users,
  items: Package,
  expenses: Receipt,
  timeTracking: Clock,
  recurring: RefreshCw,
  settings: Settings,
  exports: Download,
  payments: CreditCard,
};

function getPermissionColor(
  level: PermissionLevel | BasicPermissionLevel | ReadOnlyPermissionLevel
): string {
  switch (level) {
    case "ISSUE":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    case "WRITE":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
    case "READ":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
    case "NONE":
    default:
      return "bg-muted text-muted-foreground";
  }
}

export function PermissionsTable({
  permissions,
  compact = false,
}: PermissionsTableProps) {
  const modules = Object.keys(permissions) as (keyof StaffPermissions)[];

  if (compact) {
    return (
      <div className="grid grid-cols-2 gap-2">
        {modules.map((module) => {
          const level = permissions[module];
          if (level === "NONE") return null;

          const Icon = MODULE_ICONS[module];

          return (
            <div
              key={module}
              className="flex items-center gap-2 p-2 rounded-lg bg-muted/50"
            >
              <Icon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium flex-1">
                {PERMISSION_MODULE_LABELS[module]}
              </span>
              <Badge
                variant="secondary"
                className={cn("text-xs", getPermissionColor(level))}
              >
                {PERMISSION_LEVEL_LABELS[level]}
              </Badge>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Module</TableHead>
            <TableHead>Access Level</TableHead>
            <TableHead className="text-right">Capabilities</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {modules.map((module) => {
            const level = permissions[module];
            const Icon = MODULE_ICONS[module];

            return (
              <TableRow key={module}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {PERMISSION_MODULE_LABELS[module]}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={cn(getPermissionColor(level))}
                  >
                    {PERMISSION_LEVEL_LABELS[level]}
                  </Badge>
                </TableCell>
                <TableCell className="text-right text-sm text-muted-foreground">
                  {getCapabilityDescription(module, level)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

function getCapabilityDescription(
  module: keyof StaffPermissions,
  level: PermissionLevel | BasicPermissionLevel | ReadOnlyPermissionLevel
): string {
  if (level === "NONE") return "No access to this module";

  const actions: string[] = [];

  if (level === "READ" || level === "WRITE" || level === "ISSUE") {
    actions.push("View");
  }

  if (level === "WRITE" || level === "ISSUE") {
    actions.push("Create", "Edit");
  }

  if (level === "ISSUE") {
    if (module === "invoices") {
      actions.push("Send", "Mark Paid");
    } else if (module === "quotes") {
      actions.push("Send", "Convert to Invoice");
    }
  }

  return actions.join(", ");
}
