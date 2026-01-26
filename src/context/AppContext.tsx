import { createContext, useContext, useState, ReactNode } from "react";
import { invoices as initialInvoices, Invoice } from "@/data/invoices";
import { clients as initialClients, Client } from "@/data/clients";
import { quotes as initialQuotes, Quote } from "@/data/quotes";
import { BrandingSettings, defaultBrandingSettings } from "@/types/branding";

interface AppState {
  invoices: Invoice[];
  clients: Client[];
  quotes: Quote[];
  brandingSettings: BrandingSettings;
  setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>;
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
  setQuotes: React.Dispatch<React.SetStateAction<Quote[]>>;
  addClient: (client: Client) => void;
  updateClient: (client: Client) => void;
  deleteClient: (id: string) => void;
  updateBrandingSettings: (settings: BrandingSettings) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [quotes, setQuotes] = useState<Quote[]>(initialQuotes);
  const [brandingSettings, setBrandingSettings] = useState<BrandingSettings>(defaultBrandingSettings);

  const addClient = (client: Client) => {
    setClients((prev) => [client, ...prev]);
  };

  const updateClient = (client: Client) => {
    setClients((prev) => prev.map((c) => (c.id === client.id ? client : c)));
  };

  const deleteClient = (id: string) => {
    setClients((prev) => prev.filter((c) => c.id !== id));
  };

  const updateBrandingSettings = (settings: BrandingSettings) => {
    setBrandingSettings(settings);
  };

  const value: AppState = {
    invoices,
    clients,
    quotes,
    brandingSettings,
    setInvoices,
    setClients,
    setQuotes,
    addClient,
    updateClient,
    deleteClient,
    updateBrandingSettings,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppState {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}
