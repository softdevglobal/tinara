import { useState } from "react";
import { Check, ChevronsUpDown, Plus, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Client } from "@/data/clients";

interface ClientSelectorProps {
  clients: Client[];
  selectedClient: Client | null;
  onSelect: (client: Client | null) => void;
  onAddNew: () => void;
}

export function ClientSelector({
  clients,
  selectedClient,
  onSelect,
  onAddNew,
}: ClientSelectorProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-10 font-normal"
        >
          {selectedClient ? (
            <div className="flex items-center gap-2 truncate">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary shrink-0">
                <User className="h-3 w-3 text-muted-foreground" />
              </div>
              <div className="truncate text-left">
                <span className="font-medium">{selectedClient.company || selectedClient.name}</span>
                {selectedClient.company && (
                  <span className="text-muted-foreground ml-1">({selectedClient.name})</span>
                )}
              </div>
            </div>
          ) : (
            <span className="text-muted-foreground">Select a client...</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0 bg-card" align="start">
        <Command>
          <CommandInput placeholder="Search clients..." />
          <CommandList>
            <CommandEmpty>No client found.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  onAddNew();
                  setOpen(false);
                }}
                className="flex items-center gap-3 py-3 text-primary"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 shrink-0">
                  <Plus className="h-4 w-4 text-primary" />
                </div>
                <span className="font-medium">Add new client</span>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup>
              {clients.map((client) => (
                <CommandItem
                  key={client.id}
                  value={`${client.name} ${client.company || ""} ${client.email}`}
                  onSelect={() => {
                    onSelect(client);
                    setOpen(false);
                  }}
                  className="flex items-center gap-3 py-3"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary shrink-0">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {client.company || client.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {client.company ? `${client.name} • ` : ""}{client.email}
                    </p>
                  </div>
                  <Check
                    className={cn(
                      "h-4 w-4 shrink-0",
                      selectedClient?.id === client.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
