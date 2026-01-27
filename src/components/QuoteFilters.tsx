import { Search, ArrowUpDown, CheckSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { QuoteSortOption } from "@/data/quotes";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

type StatusFilter = "all" | "Draft" | "Sent" | "Accepted" | "Expired" | "Converted";

interface QuoteFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: StatusFilter;
  onStatusChange: (status: StatusFilter) => void;
  sortOption: QuoteSortOption;
  onSortChange: (sort: QuoteSortOption) => void;
  counts: Record<StatusFilter, number>;
  isSelectMode?: boolean;
  onToggleSelectMode?: () => void;
}

const filterOptions: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "Draft", label: "Draft" },
  { value: "Sent", label: "Sent" },
  { value: "Accepted", label: "Accepted" },
  { value: "Expired", label: "Expired" },
  { value: "Converted", label: "Converted" },
];

const sortOptions: { value: QuoteSortOption; label: string }[] = [
  { value: "date-desc", label: "Date (Newest)" },
  { value: "date-asc", label: "Date (Oldest)" },
  { value: "accepted-desc", label: "Accepted (Latest)" },
  { value: "accepted-asc", label: "Accepted (Earliest)" },
  { value: "amount-desc", label: "Amount (High)" },
  { value: "amount-asc", label: "Amount (Low)" },
];

export function QuoteFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  sortOption,
  onSortChange,
  counts,
  isSelectMode,
  onToggleSelectMode,
}: QuoteFiltersProps) {
  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search quotes..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Sort Dropdown */}
        <Select value={sortOption} onValueChange={(v) => onSortChange(v as QuoteSortOption)}>
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

        {/* Select Mode Toggle */}
        {onToggleSelectMode && (
          <Button
            variant={isSelectMode ? "default" : "outline"}
            size="default"
            onClick={onToggleSelectMode}
            className="gap-2"
          >
            <CheckSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Select</span>
          </Button>
        )}
      </div>

      {/* Status Filters */}
      <div className="flex flex-wrap gap-2">
        {filterOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => onStatusChange(option.value)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
              statusFilter === option.value
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}
          >
            {option.label}
            <span className="ml-1.5 text-xs opacity-70">
              ({counts[option.value]})
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
