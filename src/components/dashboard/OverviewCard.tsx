import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

interface OverviewCardProps {
  title: string;
  count?: number;
  amount: number;
  currency?: string;
  variant?: "default" | "overdue" | "success";
  link?: string;
  linkText?: string;
  subtitle?: string;
}

export function OverviewCard({
  title,
  count,
  amount,
  currency = "AUD",
  variant = "default",
  link,
  linkText,
  subtitle,
}: OverviewCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div
      className={cn(
        "overview-card",
        variant === "overdue" && "overview-card-overdue"
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {title}
            {count !== undefined && (
              <span className="ml-1 text-foreground">({count})</span>
            )}
          </h3>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
      </div>
      
      <p
        className={cn(
          "text-2xl font-bold tracking-tight",
          variant === "overdue" && "text-destructive",
          variant === "success" && "text-success",
          variant === "default" && "text-foreground"
        )}
      >
        {formatCurrency(amount)}
      </p>

      {link && linkText && (
        <Link
          to={link}
          className="inline-flex items-center gap-1 mt-3 text-sm text-primary hover:underline"
        >
          {linkText}
          <ChevronRight className="h-3 w-3" />
        </Link>
      )}
    </div>
  );
}
