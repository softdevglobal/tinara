import { Quote } from "@/data/quotes";
import { QuoteStatusBadge } from "./QuoteStatusBadge";
import { QuoteActions } from "./QuoteActions";
import { formatCurrency } from "@/lib/utils";

interface QuoteListItemProps {
  quote: Quote;
  onClick: () => void;
  onEdit: (quote: Quote) => void;
  onSend: (quote: Quote) => void;
  onAccept: (id: string) => void;
  onConvertToInvoice: (quote: Quote) => void;
  onDownloadPdf: (quote: Quote) => void;
  onDelete: (id: string) => void;
}

export function QuoteListItem({
  quote,
  onClick,
  onEdit,
  onSend,
  onAccept,
  onConvertToInvoice,
  onDownloadPdf,
  onDelete,
}: QuoteListItemProps) {
  return (
    <div
      className="invoice-card p-4 cursor-pointer hover:border-primary/30 transition-colors"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-sm font-medium text-foreground">
              #{quote.number}
            </span>
            <QuoteStatusBadge status={quote.status} />
          </div>
          <p className="text-sm text-foreground truncate">{quote.clientName}</p>
          {quote.projectName && (
            <p className="text-xs text-muted-foreground truncate">
              {quote.projectName}
            </p>
          )}
          {quote.validLabel && (
            <p className="text-xs text-muted-foreground mt-1">
              {quote.validLabel}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3 ml-4">
          <span className="text-sm font-semibold text-foreground">
            {formatCurrency(quote.total, quote.currency)}
          </span>
          <QuoteActions
            quote={quote}
            onEdit={onEdit}
            onSend={onSend}
            onAccept={onAccept}
            onConvertToInvoice={onConvertToInvoice}
            onDownloadPdf={onDownloadPdf}
            onDelete={onDelete}
          />
        </div>
      </div>
    </div>
  );
}
