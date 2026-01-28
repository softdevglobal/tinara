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
  // Item CRUD helpers
  addItem: (item: Item) => void;
  updateItem: (item: Item) => void;
  archiveItem: (id: string) => void;
  restoreItem: (id: string) => void;
  deleteItem: (id: string) => void;
  isItemReferenced: (id: string) => boolean;
  getItemReferenceCount: (id: string) => number;
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

  // Client helpers
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

  // Item CRUD helpers
  const addItem = (item: Item) => {
    setItems((prev) => [item, ...prev]);
  };

  const updateItem = (item: Item) => {
    setItems((prev) => prev.map((i) => (i.id === item.id ? item : i)));
  };

  const archiveItem = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, isActive: false, updatedAt: new Date().toISOString() }
          : item
      )
    );
  };

  const restoreItem = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, isActive: true, updatedAt: new Date().toISOString() }
          : item
      )
    );
  };

  const deleteItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  /**
   * Check if an item is referenced in any invoice or quote line items
   * This determines whether we should archive vs hard delete
   */
  const isItemReferenced = (itemId: string): boolean => {
    // Check invoices for line items with sourceItemId
    const inInvoices = invoices.some(
      (inv) => inv.lineItems?.some((li) => li.sourceItemId === itemId)
    );

    // Check quotes for line items with sourceItemId
    const inQuotes = quotes.some(
      (q) => q.lineItems?.some((li) => li.sourceItemId === itemId)
    );

    return inInvoices || inQuotes;
  };

  /**
   * Get the count of documents referencing an item
   * Used for archive confirmation messaging
   */
  const getItemReferenceCount = (itemId: string): number => {
    let count = 0;

    for (const inv of invoices) {
      count += (inv.lineItems || []).filter((li) => li.sourceItemId === itemId).length;
    }

    for (const q of quotes) {
      count += (q.lineItems || []).filter((li) => li.sourceItemId === itemId).length;
    }

    return count;
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
    // Item helpers
    addItem,
    updateItem,
    archiveItem,
    restoreItem,
    deleteItem,
    isItemReferenced,
    getItemReferenceCount,
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
