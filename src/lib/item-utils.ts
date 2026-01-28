import { Item } from "@/data/items";
import { DocumentLineItem } from "./line-item-schema";

/**
 * Generate a unique ID for new items and line items
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

/**
 * Create a new DocumentLineItem from a catalogue Item
 * This creates an immutable snapshot - future changes to the catalogue
 * item will NOT affect this line item
 */
export function createLineItemFromCatalogueItem(
  item: Item,
  documentId: string,
  sortOrder: number
): DocumentLineItem {
  return {
    id: generateId(),
    documentId,
    sourceItemId: item.id,
    nameSnapshot: item.name,
    descriptionSnapshot: item.description,
    unitSnapshot: item.unit,
    unitPriceCentsSnapshot: item.unitPriceCents,
    qty: item.defaultQty,
    discountType: "NONE",
    discountValue: 0,
    taxCodeSnapshot: item.taxCode,
    sortOrder,
  };
}

/**
 * Create an empty line item for manual entry
 */
export function createEmptyLineItem(
  documentId: string,
  sortOrder: number
): DocumentLineItem {
  return {
    id: generateId(),
    documentId,
    nameSnapshot: "",
    unitSnapshot: "unit",
    unitPriceCentsSnapshot: 0,
    qty: 1,
    discountType: "NONE",
    discountValue: 0,
    taxCodeSnapshot: "GST",
    sortOrder,
  };
}

/**
 * Create a new Item with default values
 */
export function createNewItem(overrides?: Partial<Item>): Item {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    name: "",
    category: "Services",
    unitPriceCents: 0,
    unit: "unit",
    taxCode: "GST",
    defaultQty: 1,
    isActive: true,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

/**
 * Check if an item name is valid and unique
 */
export function validateItemName(
  name: string,
  existingItems: Item[],
  excludeId?: string
): { valid: boolean; error?: string } {
  const trimmed = name.trim();
  
  if (!trimmed) {
    return { valid: false, error: "Name is required" };
  }
  
  if (trimmed.length > 100) {
    return { valid: false, error: "Name must be less than 100 characters" };
  }
  
  const duplicate = existingItems.find(
    (item) => 
      item.name.toLowerCase() === trimmed.toLowerCase() && 
      item.id !== excludeId
  );
  
  if (duplicate) {
    return { valid: false, error: "An item with this name already exists" };
  }
  
  return { valid: true };
}
