import { useState } from "react";
import { MoreHorizontal, CheckCircle, Mail, Download, Trash2, Pencil } from "lucide-react";
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
import { Invoice } from "@/data/invoices";
import { cn } from "@/lib/utils";

interface InvoiceActionsProps {
  invoice: Invoice;
  onEdit: (invoice: Invoice) => void;
  onMarkPaid: (id: string) => void;
  onSendReminder: (invoice: Invoice) => void;
  onDownloadPdf: (invoice: Invoice) => void;
  onDelete: (id: string) => void;
}

export function InvoiceActions({
  invoice,
  onEdit,
  onMarkPaid,
  onSendReminder,
  onDownloadPdf,
  onDelete,
}: InvoiceActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const isPaid = invoice.status === "Paid";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-secondary transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 bg-card">
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onEdit(invoice);
            }}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Edit Invoice
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onMarkPaid(invoice.id);
            }}
            disabled={isPaid}
            className={cn(isPaid && "opacity-50")}
          >
            <CheckCircle className="mr-2 h-4 w-4 text-success" />
            Mark as Paid
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onSendReminder(invoice);
            }}
            disabled={isPaid}
            className={cn(isPaid && "opacity-50")}
          >
            <Mail className="mr-2 h-4 w-4" />
            Send Reminder
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onDownloadPdf(invoice);
            }}
          >
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              setShowDeleteDialog(true);
            }}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Invoice
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Invoice #{invoice.number}?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the invoice
              for {invoice.clientName}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onDelete(invoice.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
