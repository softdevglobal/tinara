import { useState, useMemo } from "react";
import { Package, Plus, Search, Archive, AlertTriangle, XCircle, Boxes } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ItemTable } from "@/components/tables/ItemTable";
import { NewItemForm } from "@/components/NewItemForm";
import { ItemDeleteDialog } from "@/components/ItemDeleteDialog";
import { StockAdjustmentDialog } from "@/components/StockAdjustmentDialog";
import { useToast } from "@/hooks/use-toast";
import { Item, getStockStatus } from "@/data/items";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";

const Items = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [stockFilter, setStockFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"active" | "archived" | "all">("active");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Item | null>(null);
  const [adjustDialogOpen, setAdjustDialogOpen] = useState(false);
  const [itemToAdjust, setItemToAdjust] = useState<Item | null>(null);

  const {
    items,
    inventoryMovements,
    addItem,
    updateItem,
    archiveItem,
    restoreItem,
    deleteItem,
    isItemReferenced,
    getItemReferenceCount,
    adjustStock,
  } = useApp();
  const { toast } = useToast();

  // Inventory summary stats (active items only)
  const stats = useMemo(() => {
    const activeItems = items.filter((i) => i.isActive);
    const products = activeItems.filter((i) => i.itemType === "product");
    const lowStock = products.filter((i) => getStockStatus(i) === "low_stock");
    const outOfStock = products.filter((i) => getStockStatus(i) === "out_of_stock");
    const totalStockValue = products.reduce(
      (sum, i) => sum + (i.stockOnHand ?? 0) * i.costCents,
      0
    );
    return {
      productCount: products.length,
      lowStockCount: lowStock.length,
      outOfStockCount: outOfStock.length,
      totalStockValueCents: totalStockValue,
    };
  }, [items]);

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      (item.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      (item.supplier?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && item.isActive) ||
      (statusFilter === "archived" && !item.isActive);

    let matchesStock = true;
    if (stockFilter !== "all") {
      const status = getStockStatus(item);
      if (stockFilter === "low") matchesStock = status === "low_stock";
      else if (stockFilter === "out") matchesStock = status === "out_of_stock";
      else if (stockFilter === "in") matchesStock = status === "in_stock";
      else if (stockFilter === "tracked") matchesStock = item.itemType === "product";
    }

    return matchesSearch && matchesCategory && matchesStatus && matchesStock;
  });

  const activeCount = items.filter((i) => i.isActive).length;
  const archivedCount = items.filter((i) => !i.isActive).length;

  const handleOpenNewForm = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (item: Item) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleFormSubmit = (item: Item) => {
    if (editingItem) {
      updateItem(item);
      toast({ title: "Item updated", description: `${item.name} has been updated.` });
    } else {
      addItem(item);
      // If new product with opening stock, log initial movement
      if (item.itemType === "product" && item.stockOnHand > 0) {
        adjustStock(item.id, item.stockOnHand, "Opening stock", "initial");
        // adjustStock above adds delta on top of stockOnHand. We need to revert addItem's stock to 0 so total is correct.
        updateItem({ ...item, stockOnHand: 0 });
      }
      toast({ title: "Item added", description: `${item.name} has been added to your catalog.` });
    }
  };

  const handleArchiveToggle = (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    if (item.isActive) {
      archiveItem(id);
      toast({ title: "Item archived", description: `${item.name} has been archived.` });
    } else {
      restoreItem(id);
      toast({ title: "Item restored", description: `${item.name} has been restored.` });
    }
  };

  const handleDeleteClick = (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!itemToDelete) return;
    deleteItem(itemToDelete.id);
    toast({ title: "Item deleted", description: `${itemToDelete.name} has been permanently deleted.` });
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const handleConfirmArchive = () => {
    if (!itemToDelete) return;
    archiveItem(itemToDelete.id);
    toast({ title: "Item archived", description: `${itemToDelete.name} has been archived.` });
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const handleAdjustStock = (item: Item) => {
    setItemToAdjust(item);
    setAdjustDialogOpen(true);
  };

  const handleConfirmAdjust = (itemId: string, qtyDelta: number, reason: string) => {
    adjustStock(itemId, qtyDelta, reason);
    const item = items.find((i) => i.id === itemId);
    toast({
      title: "Stock adjusted",
      description: `${item?.name}: ${qtyDelta > 0 ? "+" : ""}${qtyDelta} ${item?.unit}.`,
    });
  };

  const formatCents = (cents: number) =>
    new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD", maximumFractionDigits: 0 }).format(cents / 100);

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Package className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Items & Inventory</h1>
            <p className="text-sm text-muted-foreground">
              Manage your catalog, track stock and monitor margins
            </p>
          </div>
        </div>
        <Button size="sm" onClick={handleOpenNewForm}>
          <Plus className="h-4 w-4 mr-2" />
          New Item
        </Button>
      </div>

      {/* Inventory summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Package className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Tracked products</p>
              <p className="text-xl font-semibold">{stats.productCount}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 cursor-pointer hover:border-amber-500/40 transition-colors" onClick={() => setStockFilter("low")}>
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Low stock</p>
              <p className="text-xl font-semibold">{stats.lowStockCount}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 cursor-pointer hover:border-destructive/40 transition-colors" onClick={() => setStockFilter("out")}>
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-destructive/10 flex items-center justify-center">
              <XCircle className="h-4 w-4 text-destructive" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Out of stock</p>
              <p className="text-xl font-semibold">{stats.outOfStockCount}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-green-500/10 flex items-center justify-center">
              <Boxes className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Stock value (at cost)</p>
              <p className="text-xl font-semibold">{formatCents(stats.totalStockValueCents)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Status Tabs */}
      <Tabs
        value={statusFilter}
        onValueChange={(v) => setStatusFilter(v as "active" | "archived" | "all")}
        className="mb-4"
      >
        <TabsList>
          <TabsTrigger value="active">Active ({activeCount})</TabsTrigger>
          <TabsTrigger value="archived">
            <Archive className="h-3.5 w-3.5 mr-1.5" />
            Archived ({archivedCount})
          </TabsTrigger>
          <TabsTrigger value="all">All ({items.length})</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Filters */}
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              <SelectItem value="Parts">Parts</SelectItem>
              <SelectItem value="Labor">Labor</SelectItem>
              <SelectItem value="Services">Services</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>

          <Select value={stockFilter} onValueChange={setStockFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Stock" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All stock</SelectItem>
              <SelectItem value="tracked">Tracked products</SelectItem>
              <SelectItem value="in">In stock</SelectItem>
              <SelectItem value="low">Low stock</SelectItem>
              <SelectItem value="out">Out of stock</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search items, SKU or supplier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Table or Empty State */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Package className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Build your catalog
          </h3>
          <p className="text-muted-foreground max-w-sm mb-4">
            Add products and services to quickly include them in invoices and quotes.
          </p>
          <Button onClick={handleOpenNewForm}>
            <Plus className="h-4 w-4 mr-2" />
            Add First Item
          </Button>
        </div>
      ) : (
        <ItemTable
          items={filteredItems}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          onEdit={handleOpenEditForm}
          onDelete={handleDeleteClick}
          onArchive={handleArchiveToggle}
          onAdjustStock={handleAdjustStock}
        />
      )}

      {/* New/Edit Item Form */}
      <NewItemForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleFormSubmit}
        editingItem={editingItem}
      />

      {/* Stock adjustment dialog */}
      <StockAdjustmentDialog
        open={adjustDialogOpen}
        onOpenChange={setAdjustDialogOpen}
        item={itemToAdjust}
        movements={inventoryMovements}
        onAdjust={handleConfirmAdjust}
      />

      {/* Delete Confirmation Dialog */}
      {itemToDelete && (
        <ItemDeleteDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          itemName={itemToDelete.name}
          isReferenced={isItemReferenced(itemToDelete.id)}
          referenceCount={getItemReferenceCount(itemToDelete.id)}
          onArchive={handleConfirmArchive}
          onDelete={handleConfirmDelete}
        />
      )}
    </AppLayout>
  );
};

export default Items;
