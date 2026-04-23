import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useApp } from "@/context/AppContext";
import {
  FileText, ClipboardList, Users, FolderKanban, Package, Receipt,
  Repeat, Clock, CreditCard, UploadCloud, BarChart3, Plus, Home, Settings,
} from "lucide-react";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate();
  const { clients, invoices, quotes } = useApp();
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const go = (path: string) => {
    onOpenChange(false);
    navigate(path);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Search or type a command..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Quick create">
          <CommandItem onSelect={() => go("/invoices?new=invoice")}>
            <Plus className="mr-2 h-4 w-4" /> New invoice
          </CommandItem>
          <CommandItem onSelect={() => go("/quotes?new=quote")}>
            <Plus className="mr-2 h-4 w-4" /> New quote
          </CommandItem>
          <CommandItem onSelect={() => go("/clients?new=client")}>
            <Plus className="mr-2 h-4 w-4" /> New client
          </CommandItem>
          <CommandItem onSelect={() => go("/projects?new=project")}>
            <Plus className="mr-2 h-4 w-4" /> New project
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Navigate">
          <CommandItem onSelect={() => go("/")}><Home className="mr-2 h-4 w-4" /> Dashboard</CommandItem>
          <CommandItem onSelect={() => go("/invoices")}><FileText className="mr-2 h-4 w-4" /> Invoices</CommandItem>
          <CommandItem onSelect={() => go("/quotes")}><ClipboardList className="mr-2 h-4 w-4" /> Quotes</CommandItem>
          <CommandItem onSelect={() => go("/clients")}><Users className="mr-2 h-4 w-4" /> Clients</CommandItem>
          <CommandItem onSelect={() => go("/projects")}><FolderKanban className="mr-2 h-4 w-4" /> Projects</CommandItem>
          <CommandItem onSelect={() => go("/items")}><Package className="mr-2 h-4 w-4" /> Items</CommandItem>
          <CommandItem onSelect={() => go("/expenses")}><Receipt className="mr-2 h-4 w-4" /> Expenses</CommandItem>
          <CommandItem onSelect={() => go("/credit-memos")}><CreditCard className="mr-2 h-4 w-4" /> Credit memos</CommandItem>
          <CommandItem onSelect={() => go("/recurring")}><Repeat className="mr-2 h-4 w-4" /> Recurring</CommandItem>
          <CommandItem onSelect={() => go("/time-tracking")}><Clock className="mr-2 h-4 w-4" /> Time tracking</CommandItem>
          <CommandItem onSelect={() => go("/migration")}><UploadCloud className="mr-2 h-4 w-4" /> Import / Migration</CommandItem>
          <CommandItem onSelect={() => go("/reports")}><BarChart3 className="mr-2 h-4 w-4" /> Reports</CommandItem>
          <CommandItem onSelect={() => go("/settings")}><Settings className="mr-2 h-4 w-4" /> Settings</CommandItem>
        </CommandGroup>

        {clients.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Clients">
              {clients.slice(0, 8).map((c) => (
                <CommandItem
                  key={c.id}
                  value={`client ${c.name} ${c.email ?? ""}`}
                  onSelect={() => go(`/clients?edit=${c.id}`)}
                >
                  <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{c.name}</span>
                  {c.email && <span className="ml-auto text-xs text-muted-foreground truncate">{c.email}</span>}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {invoices.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Invoices">
              {invoices.slice(0, 8).map((inv) => (
                <CommandItem
                  key={inv.id}
                  value={`invoice ${inv.number} ${inv.clientName}`}
                  onSelect={() => go(`/invoices?edit=${inv.id}`)}
                >
                  <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{inv.number} — {inv.clientName}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{inv.status}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {quotes.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Quotes">
              {quotes.slice(0, 8).map((q) => (
                <CommandItem
                  key={q.id}
                  value={`quote ${q.number} ${q.clientName}`}
                  onSelect={() => go(`/quotes?edit=${q.id}`)}
                >
                  <ClipboardList className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{q.number} — {q.clientName}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{q.status}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
