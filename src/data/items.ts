import { TaxCode } from "@/lib/tax-utils";

export type ItemType = "product" | "service" | "labor" | "fee";

export interface InventoryMovement {
  id: string;
  itemId: string;
  movementType: "adjustment" | "sale" | "restock" | "return" | "initial";
  qtyDelta: number;                    // Positive = added, negative = removed
  reason?: string;
  referenceId?: string;                // e.g. invoice id
  referenceType?: string;              // e.g. "invoice"
  createdAt: string;
  createdBy?: string;
}

export interface Item {
  id: string;
  name: string;
  description?: string;
  category: "Parts" | "Labor" | "Services" | "Other";
  itemType: ItemType;                  // product | service | labor | fee
  unitPriceCents: number;              // Sell price in integer cents
  costCents: number;                   // Cost price in integer cents (for margin)
  unit: string;                        // hour, unit, meter, month, etc.
  taxCode: TaxCode;                    // GST, GST_FREE, NONE
  defaultQty: number;                  // Default quantity when adding to document
  sku?: string;                        // Optional SKU for parts
  supplier?: string;                   // Optional supplier name
  stockOnHand: number;                 // Current stock level (products only)
  reorderThreshold?: number;           // Low-stock alert threshold
  isActive: boolean;                   // Soft delete flag
  lastUsedAt?: string;                 // Last time used in a document
  createdAt: string;
  updatedAt: string;
}

/**
 * Stock status derived from stockOnHand and reorderThreshold
 */
export type StockStatus = "in_stock" | "low_stock" | "out_of_stock" | "not_tracked";

export function getStockStatus(item: Item): StockStatus {
  // Only products track stock
  if (item.itemType !== "product") return "not_tracked";
  if (item.stockOnHand <= 0) return "out_of_stock";
  if (item.reorderThreshold != null && item.stockOnHand <= item.reorderThreshold) {
    return "low_stock";
  }
  return "in_stock";
}

/**
 * Calculate margin percentage from sell and cost prices
 * Returns null when cost is 0 (cannot compute margin)
 */
export function calculateMarginPercent(unitPriceCents: number, costCents: number): number | null {
  if (unitPriceCents <= 0) return null;
  if (costCents <= 0) return null;
  return ((unitPriceCents - costCents) / unitPriceCents) * 100;
}

/**
 * Profit per unit in cents
 */
export function calculateProfitCents(unitPriceCents: number, costCents: number): number {
  return unitPriceCents - costCents;
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
  const itemType: ItemType = legacy.category === "Parts" ? "product" : legacy.category === "Labor" ? "labor" : "service";
  return {
    id: legacy.id,
    name: legacy.name,
    description: legacy.description,
    category: legacy.category,
    itemType,
    unitPriceCents: Math.round(legacy.unitPrice * 100),
    costCents: 0,
    unit: legacy.unit,
    taxCode: legacy.taxable ? "GST" : "NONE",
    defaultQty: 1,
    stockOnHand: 0,
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
    costCents: 0,
    category: "Services",
    itemType: "service",
    taxCode: "GST",
    defaultQty: 1,
    unit: "hour",
    stockOnHand: 0,
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "item_2",
    name: "Security Camera - Indoor",
    description: "HD indoor security camera with night vision",
    unitPriceCents: 29900,
    costCents: 18000,
    category: "Parts",
    itemType: "product",
    taxCode: "GST",
    defaultQty: 1,
    sku: "CAM-IND-001",
    supplier: "Acme Security Supply",
    stockOnHand: 24,
    reorderThreshold: 10,
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
    costCents: 28000,
    category: "Parts",
    itemType: "product",
    taxCode: "GST",
    defaultQty: 1,
    sku: "CAM-OUT-001",
    supplier: "Acme Security Supply",
    stockOnHand: 6,
    reorderThreshold: 8,
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
    costCents: 4500,
    category: "Labor",
    itemType: "labor",
    taxCode: "GST",
    defaultQty: 1,
    unit: "hour",
    stockOnHand: 0,
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "item_5",
    name: "Network Cable (per meter)",
    description: "Cat6 ethernet cable",
    unitPriceCents: 350,
    costCents: 120,
    category: "Parts",
    itemType: "product",
    taxCode: "GST",
    defaultQty: 10,
    sku: "CAB-CAT6-001",
    supplier: "CableHub",
    stockOnHand: 0,
    reorderThreshold: 50,
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
    costCents: 1200,
    category: "Services",
    itemType: "service",
    taxCode: "GST",
    defaultQty: 1,
    unit: "month",
    stockOnHand: 0,
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "item_7",
    name: "Emergency Service Call",
    description: "After-hours emergency service",
    unitPriceCents: 25000,
    costCents: 0,
    category: "Labor",
    itemType: "fee",
    taxCode: "GST",
    defaultQty: 1,
    unit: "call",
    stockOnHand: 0,
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "item_8",
    name: "Training Session",
    description: "On-site training session",
    unitPriceCents: 20000,
    costCents: 8000,
    category: "Services",
    itemType: "service",
    taxCode: "GST",
    defaultQty: 1,
    unit: "session",
    stockOnHand: 0,
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
];

// Initial inventory movements (seed: initial stock for products)
export const inventoryMovements: InventoryMovement[] = [
  {
    id: "mov_1",
    itemId: "item_2",
    movementType: "initial",
    qtyDelta: 24,
    reason: "Opening stock",
    createdAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "mov_2",
    itemId: "item_3",
    movementType: "initial",
    qtyDelta: 6,
    reason: "Opening stock",
    createdAt: "2024-01-01T00:00:00.000Z",
  },
];
