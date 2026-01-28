import { useState, useEffect, useMemo } from "react";
import { Search, Package, Plus, ChevronDown } from "lucide-react";
import { Item } from "@/data/items";
import { useApp } from "@/context/AppContext";
import { centsToDisplay } from "@/lib/money-utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ItemPickerProps {
  onSelect: (item: Item) => void;
  triggerClassName?: string;
}

export function ItemPicker({ onSelect, triggerClassName }: ItemPickerProps) {
  const { items } = useApp();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Reset search when popover closes
  useEffect(() => {
    if (!open) {
      setSearchQuery("");
      setCategoryFilter("all");
    }
  }, [open]);

  // Filter to only active items
  const activeItems = useMemo(() => {
    return items.filter((item) => item.isActive);
  }, [items]);

  // Apply search and category filters
  const filteredItems = useMemo(() => {
    return activeItems.filter((item) => {
      const matchesSearch =
        searchQuery === "" ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
        (item.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

      const matchesCategory =
        categoryFilter === "all" || item.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [activeItems, searchQuery, categoryFilter]);

  const handleSelect = (item: Item) => {
    onSelect(item);
    setOpen(false);
  };

  const getCategoryColor = (category: Item["category"]) => {
    switch (category) {
      case "Parts":
        return "bg-blue-500/10 text-blue-600";
      case "Labor":
        return "bg-amber-500/10 text-amber-600";
      case "Services":
        return "bg-green-500/10 text-green-600";
      default:
        return "bg-gray-500/10 text-gray-600";
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={triggerClassName}
        >
          <Package className="h-4 w-4 mr-1" />
          From Catalog
          <ChevronDown className="h-3 w-3 ml-1 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="start">
        <div className="p-3 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
              autoFocus
            />
          </div>
        </div>

        <Tabs
          value={categoryFilter}
          onValueChange={setCategoryFilter}
          className="px-3 pt-2"
        >
          <TabsList className="h-8 w-full justify-start bg-transparent p-0 gap-1">
            <TabsTrigger value="all" className="h-7 px-2 text-xs data-[state=active]:bg-secondary">
              All
            </TabsTrigger>
            <TabsTrigger value="Services" className="h-7 px-2 text-xs data-[state=active]:bg-secondary">
              Services
            </TabsTrigger>
            <TabsTrigger value="Labor" className="h-7 px-2 text-xs data-[state=active]:bg-secondary">
              Labor
            </TabsTrigger>
            <TabsTrigger value="Parts" className="h-7 px-2 text-xs data-[state=active]:bg-secondary">
              Parts
            </TabsTrigger>
            <TabsTrigger value="Other" className="h-7 px-2 text-xs data-[state=active]:bg-secondary">
              Other
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <ScrollArea className="h-64">
          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-center p-4">
              <Package className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                {searchQuery ? "No items match your search" : "No items in catalog"}
              </p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {filteredItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item)}
                  className="w-full text-left p-2 rounded-md hover:bg-accent transition-colors group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-foreground truncate">
                          {item.name}
                        </span>
                        {item.sku && (
                          <span className="text-xs text-muted-foreground">
                            ({item.sku})
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {item.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant="secondary"
                          className={`text-xs px-1.5 py-0 ${getCategoryColor(item.category)}`}
                        >
                          {item.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          per {item.unit}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-medium text-sm text-foreground">
                        {centsToDisplay(item.unitPriceCents)}
                      </span>
                    </div>
                  </div>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Plus className="h-4 w-4 text-primary" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="p-2 border-t bg-muted/50">
          <p className="text-xs text-muted-foreground text-center">
            {filteredItems.length} item{filteredItems.length !== 1 ? "s" : ""} available
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
