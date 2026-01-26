import { CheckCircle, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

interface BulkActionsBarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onMarkPaid: () => void;
  onDelete: () => void;
  onCancel: () => void;
}

export function BulkActionsBar({
  selectedCount,
  totalCount,
  onSelectAll,
  onMarkPaid,
  onDelete,
  onCancel,
}: BulkActionsBarProps) {
  const allSelected = selectedCount === totalCount && totalCount > 0;

  return (
    <div className="flex items-center justify-between gap-4 p-3 mb-4 rounded-lg bg-secondary border border-border animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={allSelected}
            onCheckedChange={onSelectAll}
            className="data-[state=checked]:bg-primary"
          />
          <span className="text-sm text-muted-foreground">
            {selectedCount} of {totalCount} selected
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onMarkPaid}
          disabled={selectedCount === 0}
          className="gap-2"
        >
          <CheckCircle className="h-4 w-4" />
          <span className="hidden sm:inline">Mark Paid</span>
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={onDelete}
          disabled={selectedCount === 0}
          className="gap-2"
        >
          <Trash2 className="h-4 w-4" />
          <span className="hidden sm:inline">Delete</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="gap-2"
        >
          <X className="h-4 w-4" />
          <span className="hidden sm:inline">Cancel</span>
        </Button>
      </div>
    </div>
  );
}
