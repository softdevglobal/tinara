import { Quote } from "@/data/quotes";
import { QuoteStatusBadge } from "./QuoteStatusBadge";
import { formatCurrency } from "@/lib/utils";
import { Calendar, Building2 } from "lucide-react";

interface QuoteCardProps {
  quote: Quote;
}

export function QuoteCard({ quote }: QuoteCardProps) {
  return (
    <div className="invoice-card p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Quote #{quote.number}
          </h3>
          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
            <Building2 className="h-4 w-4" />
            {quote.clientName}
          </div>
        </div>
        <QuoteStatusBadge status={quote.status} />
      </div>

      {quote.projectName && (
        <p className="text-sm text-muted-foreground">{quote.projectName}</p>
      )}

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-muted-foreground">Created</p>
          <div className="flex items-center gap-1.5 text-foreground">
            <Calendar className="h-3.5 w-3.5" />
            {new Date(quote.date).toLocaleDateString()}
          </div>
        </div>
        <div>
          <p className="text-muted-foreground">Valid Until</p>
          <div className="flex items-center gap-1.5 text-foreground">
            <Calendar className="h-3.5 w-3.5" />
            {new Date(quote.validUntil).toLocaleDateString()}
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Total</span>
          <span className="text-xl font-bold text-foreground">
            {formatCurrency(quote.total, quote.currency)}
          </span>
        </div>
      </div>
    </div>
  );
}
