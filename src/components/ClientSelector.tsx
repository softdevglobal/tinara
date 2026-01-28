import { useState } from "react";
import { Check, ChevronsUpDown, Plus, User, Building2, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

  const getCustomerTypeIcon = (client: Client) => {
    if (client.customerType === "INDIVIDUAL") {
      return <User className="h-4 w-4 text-muted-foreground" />;
    }
    return <Building2 className="h-4 w-4 text-muted-foreground" />;
  };

  const formatAddress = (client: Client) => {
    if (!client.billingAddress) return null;
    const parts = [
      client.billingAddress.city,
      client.billingAddress.state,
      client.billingAddress.country,
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : null;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-auto min-h-10 py-2 font-normal"
        >
          {selectedClient ? (
            <div className="flex items-start gap-3 text-left w-full">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary shrink-0 mt-0.5">
                {getCustomerTypeIcon(selectedClient)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium truncate">
                    {selectedClient.company || selectedClient.name}
                  </span>
                  {selectedClient.customerType && (
                    <Badge variant="secondary" className="text-xs h-5">
                      {selectedClient.customerType === "BUSINESS" ? "Business" : "Individual"}
                    </Badge>
                  )}
                  {selectedClient.taxIdValidated && (
                    <ShieldCheck className="h-4 w-4 text-green-500" />
                  )}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {selectedClient.company && `${selectedClient.name} • `}
                  {selectedClient.email}
                </div>
                {selectedClient.taxNumber && (
                  <div className="text-xs text-muted-foreground">
                    Tax ID: {selectedClient.taxNumber}
                  </div>
                )}
                {formatAddress(selectedClient) && (
                  <div className="text-xs text-muted-foreground truncate">
                    {formatAddress(selectedClient)}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <span className="text-muted-foreground">Select a client...</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[450px] p-0 bg-card" align="start">
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
                  value={`${client.name} ${client.company || ""} ${client.email} ${client.taxNumber || ""}`}
                  onSelect={() => {
                    onSelect(client);
                    setOpen(false);
                  }}
                  className="flex items-start gap-3 py-3"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary shrink-0 mt-0.5">
                    {getCustomerTypeIcon(client)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-foreground truncate">
                        {client.company || client.name}
                      </span>
                      {client.customerType && (
                        <Badge variant="outline" className="text-xs h-5">
                          {client.customerType === "BUSINESS" ? "B2B" : "B2C"}
                        </Badge>
                      )}
                      {client.taxIdValidated && (
                        <ShieldCheck className="h-3.5 w-3.5 text-green-500" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {client.company ? `${client.name} • ` : ""}{client.email}
                    </p>
                    {client.taxNumber && (
                      <p className="text-xs text-muted-foreground">
                        {client.taxNumber}
                      </p>
                    )}
                  </div>
                  <Check
                    className={cn(
                      "h-4 w-4 shrink-0 mt-1",
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
