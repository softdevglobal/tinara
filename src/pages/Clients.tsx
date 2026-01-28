import { useState } from "react";
import { Users, Plus, Download, Search } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { useApp } from "@/context/AppContext";
import { exportClientsToCSV } from "@/lib/csv-export";
import { useToast } from "@/hooks/use-toast";
import { ClientTable } from "@/components/tables/ClientTable";
import { NewClientForm } from "@/components/NewClientForm";
import { ClientForm } from "@/components/ClientForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Client } from "@/data/clients";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSearchParams, useNavigate } from "react-router-dom";

const Clients = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const showNewFromUrl = searchParams.get("new") === "client";
  
  const { clients, invoices, addClient, updateClient, deleteClient } = useApp();
  const { toast } = useToast();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewDialog, setShowNewDialog] = useState(showNewFromUrl);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const handleExportClients = () => {
    exportClientsToCSV(clients);
    toast({
      title: "Export complete",
      description: `${clients.length} clients exported to CSV.`,
    });
  };

  const filteredClients = clients.filter((client) => {
    const query = searchQuery.toLowerCase();
    return (
      client.name.toLowerCase().includes(query) ||
      client.email.toLowerCase().includes(query) ||
      (client.company?.toLowerCase().includes(query) ?? false)
    );
  });

  const handleAddClient = (client: Client) => {
    addClient(client);
    setShowNewDialog(false);
    toast({
      title: "Client added",
      description: `${client.name} has been added.`,
    });
  };

  const handleUpdateClient = (client: Client) => {
    updateClient(client);
    setEditingClient(null);
    toast({
      title: "Client updated",
      description: `${client.name} has been updated.`,
    });
  };

  const handleDeleteClient = (client: Client) => {
    deleteClient(client.id);
    toast({
      title: "Client deleted",
      description: `${client.name} has been removed.`,
    });
  };

  const handleCreateInvoice = (client: Client) => {
    navigate(`/?new=invoice&client=${encodeURIComponent(client.name)}`);
  };

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Users className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-[36px] font-semibold text-foreground">Clients</h1>
            <p className="text-sm text-muted-foreground">
              {clients.length} client{clients.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportClients}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm" onClick={() => setShowNewDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Client
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Table */}
      <ClientTable
        clients={filteredClients}
        invoices={invoices}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        onEdit={setEditingClient}
        onDelete={handleDeleteClient}
        onCreateInvoice={handleCreateInvoice}
      />

      {/* New Client Dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Client</DialogTitle>
          </DialogHeader>
          <NewClientForm
            onSubmit={handleAddClient}
            onCancel={() => setShowNewDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Client Dialog */}
      <Dialog open={!!editingClient} onOpenChange={() => setEditingClient(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Client</DialogTitle>
          </DialogHeader>
          {editingClient && (
            <ClientForm
              client={editingClient}
              onSubmit={handleUpdateClient}
              onCancel={() => setEditingClient(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Clients;
