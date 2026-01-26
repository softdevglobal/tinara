import { Quote } from "@/data/quotes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Edit,
  Send,
  CheckCircle,
  FileText,
  Download,
  Trash2,
} from "lucide-react";

interface QuoteActionsProps {
  quote: Quote;
  onEdit: (quote: Quote) => void;
  onSend: (quote: Quote) => void;
  onAccept: (id: string) => void;
  onConvertToInvoice: (quote: Quote) => void;
  onDownloadPdf: (quote: Quote) => void;
  onDelete: (id: string) => void;
}

export function QuoteActions({
  quote,
  onEdit,
  onSend,
  onAccept,
  onConvertToInvoice,
  onDownloadPdf,
  onDelete,
}: QuoteActionsProps) {
  const handleClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  const canConvert = quote.status === "Accepted";
  const canSend = quote.status === "Draft";
  const canAccept = quote.status === "Sent";
  const canEdit = quote.status !== "Converted";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {canEdit && (
          <DropdownMenuItem onClick={(e) => handleClick(e, () => onEdit(quote))}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Quote
          </DropdownMenuItem>
        )}
        {canSend && (
          <DropdownMenuItem onClick={(e) => handleClick(e, () => onSend(quote))}>
            <Send className="mr-2 h-4 w-4" />
            Send Quote
          </DropdownMenuItem>
        )}
        {canAccept && (
          <DropdownMenuItem onClick={(e) => handleClick(e, () => onAccept(quote.id))}>
            <CheckCircle className="mr-2 h-4 w-4" />
            Mark as Accepted
          </DropdownMenuItem>
        )}
        {canConvert && (
          <DropdownMenuItem onClick={(e) => handleClick(e, () => onConvertToInvoice(quote))}>
            <FileText className="mr-2 h-4 w-4" />
            Convert to Invoice
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={(e) => handleClick(e, () => onDownloadPdf(quote))}>
          <Download className="mr-2 h-4 w-4" />
          Download PDF
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={(e) => handleClick(e, () => onDelete(quote.id))}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
