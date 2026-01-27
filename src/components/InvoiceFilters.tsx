import { forwardRef } from "react";
import { Search, ArrowUpDown, CheckSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { InvoiceSortOption } from "@/data/invoices";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

type StatusFilter = "all" | "Opened" | "Paid" | "Overdue";

interface InvoiceFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: StatusFilter;
  onStatusChange: (status: StatusFilter) => void;
  sortOption: InvoiceSortOption;
  onSortChange: (sort: InvoiceSortOption) => void;
  counts: {
    all: number;
    Opened: number;
    Paid: number;
    Overdue: number;
  };
  isSelectMode?: boolean;
  onToggleSelectMode?: () => void;
}

const filterOptions: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "Opened", label: "Opened" },
  { value: "Paid", label: "Paid" },
  { value: "Overdue", label: "Overdue" },
];

const sortOptions: { value: InvoiceSortOption; label: string }[] = [
  { value: "date-desc", label: "Date (Newest)" },
  { value: "date-asc", label: "Date (Oldest)" },
  { value: "paid-desc", label: "Paid (Latest)" },
  { value: "paid-asc", label: "Paid (Earliest)" },
  { value: "amount-desc", label: "Amount (High)" },
  { value: "amount-asc", label: "Amount (Low)" },
];

export const InvoiceFilters = forwardRef<HTMLInputElement, InvoiceFiltersProps>(
  function InvoiceFilters(
    {
      searchQuery,
      onSearchChange,
      statusFilter,
      onStatusChange,
      sortOption,
      onSortChange,
      counts,
      isSelectMode,
      onToggleSelectMode,
    },
    ref
  ) {
    return (
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              ref={ref}
              type="text"
              placeholder="Search invoices... (⌘K)"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-lg border border-input bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background transition-shadow"
            />
          </div>

        {/* Select Mode Toggle */}
        <Button
          variant={isSelectMode ? "default" : "outline"}
          size="default"
          onClick={onToggleSelectMode}
          className="gap-2"
        >
          <CheckSquare className="h-4 w-4" />
          <span className="hidden sm:inline">Select</span>
        </Button>

        {/* Sort Dropdown */}
        <Select value={sortOption} onValueChange={(v) => onSortChange(v as InvoiceSortOption)}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <ArrowUpDown className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Sort by..." />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Status Filters */}
      <div className="flex items-center gap-1 p-1 rounded-lg bg-secondary w-fit">
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
);
