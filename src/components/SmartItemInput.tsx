import { useState, useRef, useEffect, useCallback } from "react";
import { Check, Plus, Package } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Item } from "@/data/items";
import { centsToDollars } from "@/lib/money-utils";
import { Input } from "@/components/ui/input";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface SmartItemInputProps {
  value: string;
  onChange: (value: string) => void;
  onItemSelect: (item: Item) => void;
  onAddNewItem?: (searchText: string) => void;
  placeholder?: string;
  className?: string;
  hasError?: boolean;
}

export function SmartItemInput({
  value,
  onChange,
  onItemSelect,
  onAddNewItem,
  placeholder = "Type item name or code...",
  className,
  hasError = false,
}: SmartItemInputProps) {
  const { items } = useApp();
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Sync internal search value with external value
  useEffect(() => {
    setSearchValue(value);
  }, [value]);

  // Filter items based on search
  const filteredItems = useCallback(() => {
    if (!searchValue || searchValue.length < 2) return [];

    const search = searchValue.toLowerCase();
    return items
      .filter((item) => {
        if (!item.isActive) return false;
        
        const nameMatch = item.name.toLowerCase().includes(search);
        const skuMatch = item.sku?.toLowerCase().includes(search);
        const descMatch = item.description?.toLowerCase().includes(search);
        
        return nameMatch || skuMatch || descMatch;
      })
      .slice(0, 6); // Limit to 6 suggestions
  }, [items, searchValue]);

  const suggestions = filteredItems();
  const hasExactMatch = suggestions.some(
    (item) => item.name.toLowerCase() === searchValue.toLowerCase()
  );
  const showAddNew = searchValue.length >= 2 && !hasExactMatch && onAddNewItem;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchValue(newValue);
    
    // Debounce the onChange callback
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      onChange(newValue);
    }, 100);

    // Open popover when typing
    if (newValue.length >= 2) {
      setOpen(true);
    }
  };

  const handleItemSelect = (item: Item) => {
    setSearchValue(item.name);
    onChange(item.name);
    onItemSelect(item);
    setOpen(false);
  };

  const handleAddNew = () => {
    if (onAddNewItem) {
      onAddNewItem(searchValue);
      setOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setOpen(false);
    }
    if (e.key === "Tab") {
      setOpen(false);
    }
  };

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
    }).format(centsToDollars(cents));
  };

  const getCategoryColor = (category: Item["category"]) => {
    switch (category) {
      case "Parts":
        return "bg-blue-500/10 text-blue-600";
      case "Labor":
        return "bg-orange-500/10 text-orange-600";
      case "Services":
        return "bg-green-500/10 text-green-600";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative w-full">
          <Input
            ref={inputRef}
            value={searchValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (searchValue.length >= 2) {
                setOpen(true);
              }
            }}
            placeholder={placeholder}
            className={cn(
              className,
              hasError && "border-destructive focus-visible:ring-destructive"
            )}
          />
        </div>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[350px] p-0 bg-popover z-50" 
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Command shouldFilter={false}>
          <CommandList>
            {suggestions.length === 0 && !showAddNew ? (
              <CommandEmpty className="py-4 text-sm text-muted-foreground">
                {searchValue.length < 2 
                  ? "Type at least 2 characters to search..."
                  : "No items found."}
              </CommandEmpty>
            ) : (
              <>
                {suggestions.length > 0 && (
                  <CommandGroup heading="Matching Items">
                    {suggestions.map((item) => (
                      <CommandItem
                        key={item.id}
                        value={item.id}
                        onSelect={() => handleItemSelect(item)}
                        className="flex items-center gap-3 py-3 cursor-pointer"
                      >
                        <Package className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium truncate">{item.name}</span>
                            {item.sku && (
                              <span className="text-xs text-muted-foreground">
                                {item.sku}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-sm text-muted-foreground">
                              {formatPrice(item.unitPriceCents)} / {item.unit}
                            </span>
                            <span className={cn(
                              "text-xs px-1.5 py-0.5 rounded",
                              getCategoryColor(item.category)
                            )}>
                              {item.category}
                            </span>
                          </div>
                        </div>
                        <Check className="h-4 w-4 text-primary opacity-0 group-aria-selected:opacity-100" />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

                {showAddNew && (
                  <>
                    {suggestions.length > 0 && <CommandSeparator />}
                    <CommandGroup>
                      <CommandItem
                        onSelect={handleAddNew}
                        className="flex items-center gap-3 py-3 cursor-pointer text-primary"
                      >
                        <Plus className="h-4 w-4 shrink-0" />
                        <span>
                          Add "<strong>{searchValue}</strong>" as new item
                        </span>
                      </CommandItem>
                    </CommandGroup>
                  </>
                )}
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
