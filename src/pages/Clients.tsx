import { Users } from "lucide-react";
import { ClientsPageContent } from "@/components/ClientsPageContent";
import { AppLayout } from "@/components/AppLayout";
import { useApp } from "@/context/AppContext";

const Clients = () => {
  const { clients, addClient, updateClient, deleteClient } = useApp();

  return (
    <AppLayout>
      {/* Header */}
      <div className="mb-6">
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
