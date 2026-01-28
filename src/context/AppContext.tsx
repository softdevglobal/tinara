import { createContext, useContext, useState, ReactNode } from "react";
import { invoices as initialInvoices, Invoice } from "@/data/invoices";
import { clients as initialClients, Client } from "@/data/clients";
import { quotes as initialQuotes, Quote } from "@/data/quotes";
import { recurringInvoices as initialRecurringInvoices, RecurringInvoice } from "@/data/recurring-invoices";
import { projects as initialProjects, Project } from "@/data/projects";
import { items as initialItems, Item } from "@/data/items";
import { expenses as initialExpenses, Expense } from "@/data/expenses";
import { creditMemos as initialCreditMemos, CreditMemo } from "@/data/credit-memos";
import { timeEntries as initialTimeEntries, TimeEntry } from "@/data/time-entries";
import { BrandingSettings, defaultBrandingSettings } from "@/types/branding";

interface AppState {
  invoices: Invoice[];
  clients: Client[];
  quotes: Quote[];
  recurringInvoices: RecurringInvoice[];
  projects: Project[];
  items: Item[];
  expenses: Expense[];
  creditMemos: CreditMemo[];
  timeEntries: TimeEntry[];
  brandingSettings: BrandingSettings;
  setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>;
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
  setQuotes: React.Dispatch<React.SetStateAction<Quote[]>>;
  setRecurringInvoices: React.Dispatch<React.SetStateAction<RecurringInvoice[]>>;
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  setItems: React.Dispatch<React.SetStateAction<Item[]>>;
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
  setCreditMemos: React.Dispatch<React.SetStateAction<CreditMemo[]>>;
  setTimeEntries: React.Dispatch<React.SetStateAction<TimeEntry[]>>;
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
  const [recurringInvoices, setRecurringInvoices] = useState<RecurringInvoice[]>(initialRecurringInvoices);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [items, setItems] = useState<Item[]>(initialItems);
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [creditMemos, setCreditMemos] = useState<CreditMemo[]>(initialCreditMemos);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>(initialTimeEntries);
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
    recurringInvoices,
    projects,
    items,
    expenses,
    creditMemos,
    timeEntries,
    brandingSettings,
    setInvoices,
    setClients,
    setQuotes,
    setRecurringInvoices,
    setProjects,
    setItems,
    setExpenses,
    setCreditMemos,
    setTimeEntries,
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
