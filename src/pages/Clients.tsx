import { Users, Download } from "lucide-react";
import { ClientsPageContent } from "@/components/ClientsPageContent";
import { AppLayout } from "@/components/AppLayout";
import { useApp } from "@/context/AppContext";
import { exportClientsToCSV } from "@/lib/csv-export";
import { useToast } from "@/hooks/use-toast";

const Clients = () => {
  const { clients, addClient, updateClient, deleteClient } = useApp();
  const { toast } = useToast();

  const handleExportClients = () => {
    exportClientsToCSV(clients);
    toast({
      title: "Export complete",
      description: `${clients.length} clients exported to CSV.`,
    });
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
            <h1 className="text-lg font-semibold text-foreground">Clients</h1>
            <p className="text-sm text-muted-foreground">
              {clients.length} client{clients.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <button
          onClick={handleExportClients}
          className="flex items-center gap-2 h-9 px-3 rounded-lg border border-border text-sm font-medium hover:bg-secondary transition-colors"
        >
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Export</span>
        </button>
      </div>

      <ClientsPageContent
        clients={clients}
        onAddClient={addClient}
        onUpdateClient={updateClient}
        onDeleteClient={deleteClient}
      />
    </AppLayout>
  );
};

export default Clients;
