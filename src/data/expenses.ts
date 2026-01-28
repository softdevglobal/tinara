export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: "Travel" | "Equipment" | "Supplies" | "Software" | "Marketing" | "Other";
  projectId?: string;
  receipt?: string;
  vendor?: string;
  notes?: string;
}

export const expenses: Expense[] = [
  {
    id: "exp_1",
    description: "Office supplies",
    amount: 156.50,
    date: "2025-01-25",
    category: "Supplies",
    vendor: "Office Depot",
  },
  {
    id: "exp_2",
    description: "Client meeting travel",
    amount: 89.00,
    date: "2025-01-22",
    category: "Travel",
    projectId: "proj_1",
    vendor: "Uber",
  },
  {
    id: "exp_3",
    description: "Security camera samples",
    amount: 750.00,
    date: "2025-01-20",
    category: "Equipment",
    projectId: "proj_1",
    vendor: "Tech Supplies Co",
  },
  {
    id: "exp_4",
    description: "Adobe Creative Cloud subscription",
    amount: 79.99,
    date: "2025-01-15",
    category: "Software",
    vendor: "Adobe",
  },
  {
    id: "exp_5",
    description: "Google Ads campaign",
    amount: 500.00,
    date: "2025-01-10",
    category: "Marketing",
    vendor: "Google",
  },
  {
    id: "exp_6",
    description: "Network cables and connectors",
    amount: 234.00,
    date: "2025-01-08",
    category: "Equipment",
    projectId: "proj_4",
    vendor: "Cable Warehouse",
  },
];
