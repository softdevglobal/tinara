import { cn } from "@/lib/utils";

interface InvoiceStatusBadgeProps {
  status: string;
  isOverdue?: boolean;
  className?: string;
}

export function InvoiceStatusBadge({ status, isOverdue, className }: InvoiceStatusBadgeProps) {
  const isPaid = status === "Paid";
  
  return (
    <span
      className={cn(
        "status-badge",
        isOverdue && "status-badge-overdue",
        isPaid && "bg-success/10 text-success",
        !isOverdue && !isPaid && "status-badge-opened",
        className
      )}
    >
      {isOverdue && (
        <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-destructive animate-pulse" />
      )}
      {isPaid && (
        <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-success" />
      )}
      {status}
    </span>
  );
}
