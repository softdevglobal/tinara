import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

type StatusFilter = "all" | "Opened" | "Paid" | "Overdue";

interface InvoiceFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: StatusFilter;
  onStatusChange: (status: StatusFilter) => void;
  counts: {
    all: number;
    Opened: number;
    Paid: number;
    Overdue: number;
  };
}

const filterOptions: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "Opened", label: "Opened" },
  { value: "Paid", label: "Paid" },
  { value: "Overdue", label: "Overdue" },
];

export function InvoiceFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  counts,
}: InvoiceFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search invoices..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full h-10 pl-10 pr-4 rounded-lg border border-input bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background transition-shadow"
        />
      </div>

      {/* Status Filters */}
      <div className="flex items-center gap-1 p-1 rounded-lg bg-secondary">
        {filterOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => onStatusChange(option.value)}
            className={cn(
              "px-3 py-1.5 rounded-md text-sm font-medium transition-all",
              statusFilter === option.value
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {option.label}
            <span
              className={cn(
                "ml-1.5 text-xs",
                statusFilter === option.value
                  ? "text-muted-foreground"
                  : "text-muted-foreground/70"
              )}
            >
              {counts[option.value]}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
