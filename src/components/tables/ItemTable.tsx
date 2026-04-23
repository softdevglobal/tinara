import { useState } from "react";
import { MoreHorizontal, ArrowUpDown, Archive, Package, AlertTriangle, XCircle, Boxes } from "lucide-react";
import { Item, getStockStatus, calculateMarginPercent } from "@/data/items";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { centsToDisplay } from "@/lib/money-utils";
import { TAX_CODE_LABELS } from "@/lib/tax-utils";

interface ItemTableProps {
  items: Item[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onEdit?: (item: Item) => void;
  onDelete?: (id: string) => void;
  onArchive?: (id: string) => void;
  onAdjustStock?: (item: Item) => void;
}

type SortField = "name" | "category" | "unitPriceCents" | "stockOnHand" | "margin";
type SortDirection = "asc" | "desc";

export function ItemTable({
  items,
  selectedIds,
  onSelectionChange,
  onEdit,
  onDelete,
  onArchive,
  onAdjustStock,
}: ItemTableProps) {
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedItems = [...items].sort((a, b) => {
    let comparison = 0;
    switch (sortField) {
      case "name":
        comparison = a.name.localeCompare(b.name);
        break;
      case "category":
        comparison = a.category.localeCompare(b.category);
        break;
      case "unitPriceCents":
        comparison = a.unitPriceCents - b.unitPriceCents;
        break;
      case "stockOnHand":
        comparison = (a.stockOnHand ?? 0) - (b.stockOnHand ?? 0);
        break;
      case "margin": {
        const ma = calculateMarginPercent(a.unitPriceCents, a.costCents) ?? -1;
        const mb = calculateMarginPercent(b.unitPriceCents, b.costCents) ?? -1;
        comparison = ma - mb;
        break;
      }
    }
    return sortDirection === "asc" ? comparison : -comparison;
  });

  const handleSelectAll = () => {
    if (selectedIds.length === items.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(items.map((i) => i.id));
    }
  };

  const handleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((i) => i !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
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

  const renderStockCell = (item: Item) => {
    if (item.itemType !== "product") {
      return <span className="text-xs text-muted-foreground">—</span>;
    }
    const status = getStockStatus(item);
    const qty = item.stockOnHand ?? 0;

    if (status === "out_of_stock") {
      return (
        <Badge variant="secondary" className="bg-destructive/10 text-destructive hover:bg-destructive/15 gap-1">
          <XCircle className="h-3 w-3" />
          Out of stock
        </Badge>
      );
    }
    if (status === "low_stock") {
      return (
        <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/15 gap-1">
          <AlertTriangle className="h-3 w-3" />
          {qty} {item.unit}
        </Badge>
      );
    }
    return (
      <span className="text-sm font-medium">
        {qty} <span className="text-muted-foreground text-xs">{item.unit}</span>
      </span>
    );
  };

  const renderMarginCell = (item: Item) => {
    const margin = calculateMarginPercent(item.unitPriceCents, item.costCents);
    if (margin === null) return <span className="text-xs text-muted-foreground">—</span>;
    const tone = margin < 20 ? "text-amber-600" : margin >= 50 ? "text-green-600" : "text-foreground";
    return <span className={`text-sm font-medium ${tone}`}>{margin.toFixed(0)}%</span>;
  };

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 h-8 hover:bg-transparent"
      onClick={() => handleSort(field)}
    >
      {children}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={selectedIds.length === items.length && items.length > 0}
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
            <TableHead>
              <SortableHeader field="name">Name</SortableHeader>
            </TableHead>
            <TableHead>
              <SortableHeader field="category">Category</SortableHeader>
            </TableHead>
            <TableHead className="text-right">
              <SortableHeader field="unitPriceCents">Sell</SortableHeader>
            </TableHead>
            <TableHead className="text-right">Cost</TableHead>
            <TableHead className="text-right">
              <SortableHeader field="margin">Margin</SortableHeader>
            </TableHead>
            <TableHead>
              <SortableHeader field="stockOnHand">Stock</SortableHeader>
            </TableHead>
            <TableHead>Tax</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedItems.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} className="h-24 text-center text-muted-foreground">
                No items found.
              </TableCell>
            </TableRow>
          ) : (
            sortedItems.map((item) => (
              <TableRow
                key={item.id}
                className={`hover:bg-muted/50 ${!item.isActive ? "opacity-60" : ""}`}
              >
                <TableCell>
                  <Checkbox
                    checked={selectedIds.includes(item.id)}
                    onCheckedChange={() => handleSelectOne(item.id)}
                  />
                </TableCell>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {item.itemType === "product" && (
                      <Package className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    )}
                    <div className="min-w-0">
                      <div className="truncate">{item.name}</div>
                      {item.sku && (
                        <div className="text-xs text-muted-foreground">SKU {item.sku}</div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className={getCategoryColor(item.category)}>
                    {item.category}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {centsToDisplay(item.unitPriceCents)}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {item.costCents > 0 ? centsToDisplay(item.costCents) : "—"}
                </TableCell>
                <TableCell className="text-right">{renderMarginCell(item)}</TableCell>
                <TableCell>{renderStockCell(item)}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-normal">
                    {TAX_CODE_LABELS[item.taxCode]}
                  </Badge>
                </TableCell>
                <TableCell>
                  {item.isActive ? (
                    <Badge variant="default" className="bg-green-500/10 text-green-600 hover:bg-green-500/20">
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-muted text-muted-foreground">
                      <Archive className="h-3 w-3 mr-1" />
                      Archived
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit?.(item)}>
                        Edit
                      </DropdownMenuItem>
                      {item.itemType === "product" && (
                        <DropdownMenuItem onClick={() => onAdjustStock?.(item)}>
                          <Boxes className="h-4 w-4 mr-2" />
                          Adjust stock
                        </DropdownMenuItem>
                      )}
                      {item.isActive ? (
                        <DropdownMenuItem onClick={() => onArchive?.(item.id)}>
                          <Archive className="h-4 w-4 mr-2" />
                          Archive
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => onArchive?.(item.id)}>
                          Restore
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onDelete?.(item.id)}
                        className="text-destructive"
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
