export interface Item {
  id: string;
  name: string;
  description?: string;
  unitPrice: number;
  category: "Parts" | "Labor" | "Services" | "Other";
  taxable: boolean;
  unit: string;
}

export const items: Item[] = [
  {
    id: "item_1",
    name: "Consultation Hour",
    description: "Professional consultation services",
    unitPrice: 150.00,
    category: "Services",
    taxable: true,
    unit: "hour",
  },
  {
    id: "item_2",
    name: "Security Camera - Indoor",
    description: "HD indoor security camera with night vision",
    unitPrice: 299.00,
    category: "Parts",
    taxable: true,
    unit: "unit",
  },
  {
    id: "item_3",
    name: "Security Camera - Outdoor",
    description: "Weatherproof outdoor security camera",
    unitPrice: 449.00,
    category: "Parts",
    taxable: true,
    unit: "unit",
  },
  {
    id: "item_4",
    name: "Installation Labor",
    description: "Standard installation labor rate",
    unitPrice: 85.00,
    category: "Labor",
    taxable: true,
    unit: "hour",
  },
  {
    id: "item_5",
    name: "Network Cable (per meter)",
    description: "Cat6 ethernet cable",
    unitPrice: 3.50,
    category: "Parts",
    taxable: true,
    unit: "meter",
  },
  {
    id: "item_6",
    name: "Software License - Monthly",
    description: "Monthly software subscription",
    unitPrice: 49.99,
    category: "Services",
    taxable: true,
    unit: "month",
  },
  {
    id: "item_7",
    name: "Emergency Service Call",
    description: "After-hours emergency service",
    unitPrice: 250.00,
    category: "Labor",
    taxable: true,
    unit: "call",
  },
  {
    id: "item_8",
    name: "Training Session",
    description: "On-site training session",
    unitPrice: 200.00,
    category: "Services",
    taxable: true,
    unit: "session",
  },
];
