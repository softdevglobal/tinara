import { ArrowLeft, MoreHorizontal, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DocumentType } from "@/types/document";

interface DocumentFormHeaderProps {
  type: DocumentType;
  isEditing: boolean;
  documentNumber?: string;
  hasUnsavedChanges: boolean;
  onBack: () => void;
  onSave: () => void;
  onDuplicate?: () => void;
  onConvertToInvoice?: () => void;
  onVoid?: () => void;
  onDelete?: () => void;
}

export function DocumentFormHeader({
  type,
  isEditing,
  documentNumber,
  hasUnsavedChanges,
  onBack,
  onSave,
  onDuplicate,
  onConvertToInvoice,
  onVoid,
  onDelete,
}: DocumentFormHeaderProps) {
  const typeLabel = type === "invoice" ? "Invoice" : "Estimate";
  const backLabel = type === "invoice" ? "Back to invoices" : "Back to estimates";

  const handleBack = () => {
    if (hasUnsavedChanges) {
      // TODO: Show confirmation dialog
      const confirmed = window.confirm(
        "You have unsaved changes. Are you sure you want to leave?"
      );
      if (!confirmed) return;
    }
    onBack();
  };

  return (
    <div className="flex items-center justify-between mb-6">
      <button
        onClick={handleBack}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        {isEditing ? `${typeLabel} #${documentNumber}` : `Create an ${typeLabel.toLowerCase()}`}
      </button>

      <div className="flex items-center gap-2">
        {/* Actions dropdown */}
        {isEditing && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onDuplicate && (
                <DropdownMenuItem onClick={onDuplicate}>
                  Duplicate
                </DropdownMenuItem>
              )}
              {type === "quote" && onConvertToInvoice && (
                <DropdownMenuItem onClick={onConvertToInvoice}>
                  Convert to invoice
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {type === "invoice" && onVoid && (
                <DropdownMenuItem onClick={onVoid} className="text-destructive">
                  Void invoice
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem onClick={onDelete} className="text-destructive">
                  Delete draft
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <Button variant="ghost" onClick={handleBack}>
          <X className="h-4 w-4 mr-2" />
          Close
        </Button>

        <Button onClick={onSave}>
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
      </div>
    </div>
  );
}
