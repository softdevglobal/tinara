export interface CreditMemoItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface CreditMemo {
  id: string;
  number: string;
  clientId: string;
  date: string;
  status: "Draft" | "Sent" | "Applied";
  items: CreditMemoItem[];
  subtotal: number;
  tax: number;
  total: number;
  comments?: string;
  invoiceId?: string;
}

export const creditMemos: CreditMemo[] = [
  {
    id: "cm_1",
    number: "CM-001",
    clientId: "client_1",
    date: "2025-01-20",
    status: "Sent",
    items: [
      {
        id: "cmi_1",
        description: "Refund for cancelled installation",
        quantity: 1,
        unitPrice: 500.00,
        total: 500.00,
      },
    ],
    subtotal: 500.00,
    tax: 50.00,
    total: 550.00,
    comments: "Partial refund for cancelled service",
  },
  {
    id: "cm_2",
    number: "CM-002",
    clientId: "client_3",
    date: "2025-01-18",
    status: "Applied",
    items: [
      {
        id: "cmi_2",
        description: "Discount adjustment",
        quantity: 1,
        unitPrice: 250.00,
        total: 250.00,
      },
    ],
    subtotal: 250.00,
    tax: 25.00,
    total: 275.00,
    invoiceId: "inv_3",
  },
  {
    id: "cm_3",
    number: "CM-003",
    clientId: "client_2",
    date: "2025-01-25",
    status: "Draft",
    items: [
      {
        id: "cmi_3",
        description: "Return of defective equipment",
        quantity: 2,
        unitPrice: 299.00,
        total: 598.00,
      },
    ],
    subtotal: 598.00,
    tax: 59.80,
    total: 657.80,
    comments: "Customer returned 2 defective cameras",
  },
];
