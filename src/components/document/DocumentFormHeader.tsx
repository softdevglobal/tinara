import { ArrowLeft, MoreHorizontal, Save, X, Copy, FileText, Ban, Trash2, Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DocumentType, InvoiceStatus, QuoteStatus } from "@/types/document";
import { useState } from "react";

interface DocumentFormHeaderProps {
  type: DocumentType;
  isEditing: boolean;
  documentNumber?: string;
  status?: InvoiceStatus | QuoteStatus;
  hasUnsavedChanges: boolean;
  onBack: () => void;
  onSave: () => void;
  onDuplicate?: () => void;
  onConvertToInvoice?: () => void;
  onVoid?: () => void;
  onDelete?: () => void;
  onDownloadPdf?: () => void;
  onPrint?: () => void;
}

export function DocumentFormHeader({
  type,
  isEditing,
  documentNumber,
  status,
  hasUnsavedChanges,
  onBack,
  onSave,
  onDuplicate,
  onConvertToInvoice,
  onVoid,
  onDelete,
  onDownloadPdf,
  onPrint,
}: DocumentFormHeaderProps) {
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [showVoidDialog, setShowVoidDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const typeLabel = type === "invoice" ? "Invoice" : "Estimate";
  const isDraft = status === "Draft" || status === "Unsent" || !status;
  const isVoided = status === "Void" || status === "Cancelled";

  const handleBack = () => {
    if (hasUnsavedChanges) {
      setShowUnsavedDialog(true);
      return;
    }
    onBack();
  };

  const confirmBack = () => {
    setShowUnsavedDialog(false);
    onBack();
  };

  const handleVoid = () => {
    setShowVoidDialog(true);
  };

  const confirmVoid = () => {
    setShowVoidDialog(false);
    onVoid?.();
  };

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    setShowDeleteDialog(false);
    onDelete?.();
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {isEditing 
            ? `${typeLabel} #${documentNumber}` 
            : `Create ${type === "invoice" ? "an invoice" : "an estimate"}`}
        </button>

        <div className="flex items-center gap-2">
          {/* Actions dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {/* Duplicate */}
              <DropdownMenuItem onClick={onDuplicate} disabled={!isEditing}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              
              {/* Convert to Invoice (quotes only) */}
              {type === "quote" && (
                <DropdownMenuItem onClick={onConvertToInvoice} disabled={!isEditing || isVoided}>
                  <FileText className="h-4 w-4 mr-2" />
                  Convert to Invoice
                </DropdownMenuItem>
              )}
              
              <DropdownMenuSeparator />
              
              {/* Download PDF */}
              <DropdownMenuItem onClick={onDownloadPdf} disabled={!isEditing}>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </DropdownMenuItem>
              
              {/* Print */}
              <DropdownMenuItem onClick={onPrint} disabled={!isEditing}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              {/* Void Invoice (invoices only, not drafts) */}
              {type === "invoice" && !isDraft && !isVoided && (
                <DropdownMenuItem onClick={handleVoid} className="text-destructive">
                  <Ban className="h-4 w-4 mr-2" />
                  Void Invoice
                </DropdownMenuItem>
              )}
              
              {/* Delete Draft (drafts only) */}
              {isDraft && isEditing && (
                <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Draft
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" onClick={handleBack}>
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>

          <Button onClick={onSave} disabled={isVoided}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      {/* Unsaved Changes Dialog */}
      <AlertDialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to leave? Your changes will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmBack}>
              Discard Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Void Invoice Dialog */}
      <AlertDialog open={showVoidDialog} onOpenChange={setShowVoidDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Void Invoice</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to void this invoice? This action cannot be undone. 
              The invoice number will be retained but the invoice will be marked as void.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmVoid} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Void Invoice
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Draft Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Draft</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this draft? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Draft
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
