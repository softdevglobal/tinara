import { Quote } from "@/data/quotes";
import { cn } from "@/lib/utils";

interface QuoteStatusBadgeProps {
  status: Quote["status"];
}

export function QuoteStatusBadge({ status }: QuoteStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
        status === "Draft" && "bg-secondary text-secondary-foreground",
        status === "Sent" && "bg-blue-500/10 text-blue-500",
        status === "Accepted" && "bg-green-500/10 text-green-500",
        status === "Expired" && "bg-destructive/10 text-destructive",
        status === "Converted" && "bg-primary/10 text-primary"
      )}
    >
      {status}
    </span>
  );
}
