import { useState } from "react";
import { Package, Plus, Search, Archive } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ItemTable } from "@/components/tables/ItemTable";
import { NewItemForm } from "@/components/NewItemForm";
import { ItemDeleteDialog } from "@/components/ItemDeleteDialog";
import { useToast } from "@/hooks/use-toast";
import { Item } from "@/data/items";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Items = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"active" | "archived" | "all">("active");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Item | null>(null);
  
  const { 
    items, 
    addItem, 
    updateItem, 
    archiveItem, 
    restoreItem,
    deleteItem,
    isItemReferenced,
    getItemReferenceCount,
  } = useApp();
  const { toast } = useToast();

  // Filter items based on search, category, and status
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      (item.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    
    const matchesCategory =
      categoryFilter === "all" || item.category === categoryFilter;
    
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && item.isActive) ||
      (statusFilter === "archived" && !item.isActive);
    
    return matchesSearch && matchesCategory && matchesStatus;
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
      toast({
        title: "Item updated",
        description: `${item.name} has been updated.`,
      });
    } else {
      addItem(item);
      toast({
        title: "Item added",
        description: `${item.name} has been added to your catalog.`,
      });
    }
  };

  const handleArchiveToggle = (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    if (item.isActive) {
      archiveItem(id);
      toast({
        title: "Item archived",
        description: `${item.name} has been archived.`,
      });
    } else {
      restoreItem(id);
      toast({
        title: "Item restored",
        description: `${item.name} has been restored.`,
      });
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
    toast({
      title: "Item deleted",
      description: `${itemToDelete.name} has been permanently deleted.`,
    });
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const handleConfirmArchive = () => {
    if (!itemToDelete) return;
    
    archiveItem(itemToDelete.id);
    toast({
      title: "Item archived",
      description: `${itemToDelete.name} has been archived.`,
    });
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Package className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-[36px] font-semibold text-foreground">Items</h1>
            <p className="text-sm text-muted-foreground">
              Manage your product & service catalog
            </p>
          </div>
        </div>
        <Button size="sm" onClick={handleOpenNewForm}>
          <Plus className="h-4 w-4 mr-2" />
          New Item
        </Button>
      </div>

      {/* Status Tabs */}
      <Tabs
        value={statusFilter}
        onValueChange={(v) => setStatusFilter(v as "active" | "archived" | "all")}
        className="mb-4"
      >
        <TabsList>
          <TabsTrigger value="active">
            Active ({activeCount})
          </TabsTrigger>
          <TabsTrigger value="archived">
            <Archive className="h-3.5 w-3.5 mr-1.5" />
            Archived ({archivedCount})
          </TabsTrigger>
          <TabsTrigger value="all">All ({items.length})</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Filters */}
      <div className="flex items-center justify-between mb-4">
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Parts">Parts</SelectItem>
            <SelectItem value="Labor">Labor</SelectItem>
            <SelectItem value="Services">Services</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>

        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search items..."
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
        />
      )}

      {/* New/Edit Item Form */}
      <NewItemForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleFormSubmit}
        editingItem={editingItem}
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
