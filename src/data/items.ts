import { TaxCode } from "@/lib/tax-utils";

export interface Item {
  id: string;
  name: string;
  description?: string;
  category: "Parts" | "Labor" | "Services" | "Other";
  unitPriceCents: number;             // Price stored in integer cents
  unit: string;                        // hour, unit, meter, month, etc.
  taxCode: TaxCode;                    // GST, GST_FREE, NONE
  defaultQty: number;                  // Default quantity when adding to document
  sku?: string;                        // Optional SKU for parts
  isActive: boolean;                   // Soft delete flag
  createdAt: string;
  updatedAt: string;
}

/**
 * @deprecated Use unitPriceCents instead. This is for migration compatibility.
 */
export interface LegacyItem {
  id: string;
  name: string;
  description?: string;
  unitPrice: number;
  category: "Parts" | "Labor" | "Services" | "Other";
  taxable: boolean;
  unit: string;
}

/**
 * Convert legacy item format to new format
 */
export function migrateLegacyItem(legacy: LegacyItem): Item {
  const now = new Date().toISOString();
  return {
    id: legacy.id,
    name: legacy.name,
    description: legacy.description,
    category: legacy.category,
    unitPriceCents: Math.round(legacy.unitPrice * 100),
    unit: legacy.unit,
    taxCode: legacy.taxable ? "GST" : "NONE",
    defaultQty: 1,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };
}

// Initial items data (migrated from legacy format)
export const items: Item[] = [
  {
    id: "item_1",
    name: "Consultation Hour",
    description: "Professional consultation services",
    unitPriceCents: 15000,
    category: "Services",
    taxCode: "GST",
    defaultQty: 1,
    unit: "hour",
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "item_2",
    name: "Security Camera - Indoor",
    description: "HD indoor security camera with night vision",
    unitPriceCents: 29900,
    category: "Parts",
    taxCode: "GST",
    defaultQty: 1,
    sku: "CAM-IND-001",
    unit: "unit",
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "item_3",
    name: "Security Camera - Outdoor",
    description: "Weatherproof outdoor security camera",
    unitPriceCents: 44900,
    category: "Parts",
    taxCode: "GST",
    defaultQty: 1,
    sku: "CAM-OUT-001",
    unit: "unit",
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "item_4",
    name: "Installation Labor",
    description: "Standard installation labor rate",
    unitPriceCents: 8500,
    category: "Labor",
    taxCode: "GST",
    defaultQty: 1,
    unit: "hour",
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "item_5",
    name: "Network Cable (per meter)",
    description: "Cat6 ethernet cable",
    unitPriceCents: 350,
    category: "Parts",
    taxCode: "GST",
    defaultQty: 10,
    sku: "CAB-CAT6-001",
    unit: "meter",
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "item_6",
    name: "Software License - Monthly",
    description: "Monthly software subscription",
    unitPriceCents: 4999,
    category: "Services",
    taxCode: "GST",
    defaultQty: 1,
    unit: "month",
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "item_7",
    name: "Emergency Service Call",
    description: "After-hours emergency service",
    unitPriceCents: 25000,
    category: "Labor",
    taxCode: "GST",
    defaultQty: 1,
    unit: "call",
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "item_8",
    name: "Training Session",
    description: "On-site training session",
    unitPriceCents: 20000,
    category: "Services",
    taxCode: "GST",
    defaultQty: 1,
    unit: "session",
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
];
