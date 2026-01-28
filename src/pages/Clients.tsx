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
      {/* Decorative accent bar */}
      <div className="jp-accent-bar mb-8" />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-sakura shadow-lg">
            <Users className="h-8 w-8 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-title text-foreground">Clients</h1>
            <p className="text-lg text-muted-foreground">
              {clients.length} client{clients.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <button
          onClick={handleExportClients}
          className="flex items-center gap-3 h-14 px-6 rounded-2xl border-2 border-border text-lg font-medium hover:bg-secondary hover:border-primary/30 transition-all"
        >
          <Download className="h-5 w-5" />
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
