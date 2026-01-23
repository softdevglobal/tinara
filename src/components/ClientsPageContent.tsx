import { useState } from "react";
import { Client } from "@/data/clients";
import { ClientList } from "@/components/ClientList";
import { ClientForm } from "@/components/ClientForm";
import { useToast } from "@/hooks/use-toast";

type View = "list" | "add" | "edit";

interface ClientsPageContentProps {
  clients: Client[];
  onAddClient: (client: Client) => void;
  onUpdateClient: (client: Client) => void;
  onDeleteClient: (id: string) => void;
}

export function ClientsPageContent({
  clients,
  onAddClient,
  onUpdateClient,
  onDeleteClient,
}: ClientsPageContentProps) {
  const [view, setView] = useState<View>("list");
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const { toast } = useToast();

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setView("edit");
  };

  const handleAddSubmit = (client: Client) => {
    onAddClient(client);
    setView("list");
    toast({
      title: "Client added",
      description: `${client.company || client.name} has been added.`,
    });
  };

  const handleEditSubmit = (client: Client) => {
    onUpdateClient(client);
    setView("list");
    setEditingClient(null);
    toast({
      title: "Client updated",
      description: `${client.company || client.name} has been updated.`,
    });
  };

  if (view === "add") {
    return (
      <ClientForm
        onSubmit={handleAddSubmit}
        onCancel={() => setView("list")}
      />
    );
  }

  if (view === "edit" && editingClient) {
    return (
      <ClientForm
        client={editingClient}
        onSubmit={handleEditSubmit}
        onCancel={() => {
          setView("list");
          setEditingClient(null);
        }}
      />
    );
  }

  return (
    <ClientList
      clients={clients}
      onEdit={handleEdit}
      onDelete={onDeleteClient}
      onAddNew={() => setView("add")}
    />
  );
}
