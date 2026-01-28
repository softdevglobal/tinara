import { useState } from "react";
import { Search, Plus, Pencil, Trash2, User, Mail, Phone, Building } from "lucide-react";
import { Client } from "@/data/clients";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

interface ClientListProps {
  clients: Client[];
  onEdit: (client: Client) => void;
  onDelete: (id: string) => void;
  onAddNew: () => void;
}

export function ClientList({ clients, onEdit, onDelete, onAddNew }: ClientListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteClient, setDeleteClient] = useState<Client | null>(null);
  const { toast } = useToast();

  const filteredClients = clients.filter((client) => {
    const query = searchQuery.toLowerCase();
    return (
      client.name.toLowerCase().includes(query) ||
      client.email.toLowerCase().includes(query) ||
      (client.company?.toLowerCase().includes(query) ?? false)
    );
  });

  const handleDelete = () => {
    if (deleteClient) {
      onDelete(deleteClient.id);
      toast({
        title: "Client deleted",
        description: `${deleteClient.company || deleteClient.name} has been removed.`,
      });
      setDeleteClient(null);
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Search and Add */}
      <div className="flex flex-col sm:flex-row gap-6 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-14 pl-12 pr-6 rounded-2xl border-2 border-input bg-card text-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
          />
        </div>
        <Button onClick={onAddNew} className="h-14 px-8 text-lg rounded-2xl">
          <Plus className="h-5 w-5 mr-2" />
          Add Client
        </Button>
      </div>

      {/* Client List */}
      {filteredClients.length === 0 ? (
        <div className="text-center py-16">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-sakura/20 to-ocean/20 mx-auto mb-6">
            <User className="h-10 w-10 text-primary" />
          </div>
          <p className="text-xl text-muted-foreground">
            {searchQuery ? "No clients found" : "No clients yet"}
          </p>
          <p className="text-base text-muted-foreground mt-2">
            {searchQuery ? "Try adjusting your search" : "Add your first client to get started"}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {filteredClients.map((client, index) => (
            <div
              key={client.id}
              className="invoice-card jp-card-accent p-8 group"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start justify-between mb-6 pt-2">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sakura/20 to-indigo/20 shrink-0">
                    <User className="h-8 w-8 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xl font-semibold text-foreground truncate">
                      {client.company || client.name}
                    </p>
                    {client.company && (
                      <p className="text-lg text-muted-foreground truncate">
                        {client.name}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10"
                    onClick={() => onEdit(client)}
                  >
                    <Pencil className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 text-muted-foreground hover:text-destructive"
                    onClick={() => setDeleteClient(client)}
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <div className="space-y-4 text-lg">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Mail className="h-5 w-5 shrink-0" />
                  <span className="truncate">{client.email}</span>
                </div>
                {client.phone && (
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Phone className="h-5 w-5 shrink-0" />
                    <span>{client.phone}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteClient} onOpenChange={() => setDeleteClient(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteClient?.company || deleteClient?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the client
              and their contact information.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
