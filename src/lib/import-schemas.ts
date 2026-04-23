/**
 * Field schemas describe which Tinara columns each importable entity
 * supports, plus header aliases used to auto-map incoming CSV columns
 * (including common Invoice2go export headers).
 */

export type ImportEntity = "clients" | "items";

export interface FieldSpec {
  key: string;
  label: string;
  required?: boolean;
  aliases: string[];
}

export const ENTITY_LABELS: Record<ImportEntity, string> = {
  clients: "Clients",
  items: "Items",
};

export const ENTITY_FIELDS: Record<ImportEntity, FieldSpec[]> = {
  clients: [
    {
      key: "name",
      label: "Name",
      required: true,
      aliases: ["client", "client name", "customer", "customer name", "full name"],
    },
    {
      key: "company",
      label: "Company",
      aliases: ["business", "business name", "organisation", "organization", "company name"],
    },
    {
      key: "email",
      label: "Email",
      aliases: ["e-mail", "email address", "contact email"],
    },
    {
      key: "phone",
      label: "Phone",
      aliases: ["mobile", "telephone", "phone number", "contact phone"],
    },
    {
      key: "website",
      label: "Website",
      aliases: ["url", "site", "web"],
    },
    {
      key: "tax_number",
      label: "Tax / ABN / VAT number",
      aliases: ["abn", "vat", "vat number", "tax id", "ein", "gst number"],
    },
    {
      key: "notes",
      label: "Notes",
      aliases: ["note", "comments", "memo", "description"],
    },
  ],
  items: [
    {
      key: "name",
      label: "Name",
      required: true,
      aliases: ["item", "product", "service", "item name", "title"],
    },
    {
      key: "sku",
      label: "SKU / Code",
      aliases: ["code", "item code", "product code", "sku code"],
    },
    {
      key: "description",
      label: "Description",
      aliases: ["details", "long description", "summary"],
    },
    {
      key: "category",
      label: "Category",
      aliases: ["group", "type", "department"],
    },
    {
      key: "unit",
      label: "Unit",
      aliases: ["uom", "units", "measure"],
    },
    {
      key: "unit_price",
      label: "Unit price",
      required: true,
      aliases: ["price", "rate", "sell price", "sale price", "amount", "unit_price"],
    },
    {
      key: "cost",
      label: "Cost",
      aliases: ["cost price", "buy price", "wholesale", "supplier price"],
    },
    {
      key: "stock_on_hand",
      label: "Stock on hand",
      aliases: ["stock", "qty", "quantity", "inventory", "on hand"],
    },
  ],
};

/** Parse a price-like string ("$1,250.00", "1250", " 1.25 ") to integer cents. */
export function parsePriceToCents(raw: string): number | null {
  if (!raw) return null;
  const cleaned = raw.replace(/[^0-9.\-]/g, "");
  if (!cleaned) return null;
  const num = Number(cleaned);
  if (Number.isNaN(num)) return null;
  return Math.round(num * 100);
}

export function parseNumber(raw: string): number | null {
  if (!raw) return null;
  const num = Number(raw.replace(/[^0-9.\-]/g, ""));
  return Number.isNaN(num) ? null : num;
}
