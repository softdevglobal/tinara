

# Production-Grade Items Catalog Implementation

## Overview

This plan upgrades the Items module from a simple list UI to a production-grade catalog system with proper business logic, including:
- Enhanced data models with cents-based pricing and tax codes
- Item-to-LineItem snapshot architecture (immutable document pricing)
- Full CRUD functionality with soft delete
- Item picker integration for invoices/quotes
- Per-line tax calculations with proper rounding

---

## Current State Analysis

| Component | Current State | Gap |
|-----------|--------------|-----|
| Item model | `unitPrice: number`, `taxable: boolean` | Need `unitPriceCents`, `taxCode`, `isActive`, `sku`, `defaultQty` |
| LineItem model | Simple: `id, description, quantity, unitPrice` | Need snapshots, `sourceItemId`, `discountType`, `taxCodeSnapshot` |
| CRUD | Delete only (hard delete) | Need Create/Edit modal, soft delete |
| Item picker | None | Need searchable picker in invoice/quote forms |
| Tax calculation | Global rate applied to subtotal | Need per-line tax based on taxCode |
| Money handling | Floats | Need integer cents with line-level rounding |

---

## Implementation Plan

### Phase 1: Enhanced Data Models

**1.1 Upgrade Item Interface**

File: `src/data/items.ts`

```text
interface Item {
  id: string;
  name: string;                           // required
  description?: string;
  category: "Parts" | "Labor" | "Services" | "Other";
  unitPriceCents: number;                 // integer cents
  unit: string;                           // hour, unit, meter, etc.
  taxCode: "GST" | "GST_FREE" | "NONE";   // replaces taxable boolean
  defaultQty: number;                     // default 1
  sku?: string;                           // optional for parts
  isActive: boolean;                      // soft delete flag
  createdAt: string;
  updatedAt: string;
}
```

**1.2 Create LineItem Schema for Documents**

File: `src/lib/line-item-schema.ts` (new)

```text
interface DocumentLineItem {
  id: string;
  documentId: string;                     // invoice/quote id
  sourceItemId?: string;                  // link to catalogue (nullable)
  nameSnapshot: string;
  descriptionSnapshot?: string;
  unitSnapshot: string;
  unitPriceCentsSnapshot: number;
  qty: number;
  discountType: "NONE" | "PERCENT" | "AMOUNT";
  discountValue: number;                  // percent (0-100) or cents
  taxCodeSnapshot: "GST" | "GST_FREE" | "NONE";
  sortOrder: number;
}
```

**1.3 Utility Functions**

File: `src/lib/money-utils.ts` (new)

- `centsToDisplay(cents: number): string` - format cents as AUD currency
- `displayToCents(display: string): number` - parse input to cents
- `calculateLineTax(lineNetCents: number, taxCode: string): number`
- `calculateLineNet(baseCents: number, discountType, discountValue): number`
- `calculateDocumentTotals(lineItems: DocumentLineItem[]): { subtotalCents, taxCents, totalCents }`

---

### Phase 2: Item CRUD Modal

**2.1 Create NewItemForm Component**

File: `src/components/NewItemForm.tsx` (new)

Modal dialog with fields:
- Name (text, required)
- Description (textarea, optional)
- Category (dropdown: Parts/Labor/Services/Other, required)
- Unit Price (currency input, converts to cents)
- Unit (dropdown: hour/unit/meter/month/call/session + custom, required)
- Tax Code (dropdown: GST 10%/GST Free/None, default GST)
- SKU (text, optional, shown for Parts category)
- Default Quantity (number, default 1)

Validation:
- Name required, max 100 chars
- Unit price >= 0
- Category required
- Unit required

**2.2 Create Item Schema with Zod**

File: `src/lib/item-schema.ts` (new)

```text
const itemFormSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  category: z.enum(["Parts", "Labor", "Services", "Other"]),
  unitPriceCents: z.number().min(0).max(99999999),
  unit: z.string().min(1).max(50),
  taxCode: z.enum(["GST", "GST_FREE", "NONE"]),
  defaultQty: z.number().min(1).max(9999).default(1),
  sku: z.string().max(50).optional(),
});
```

**2.3 Update Items Page**

File: `src/pages/Items.tsx`

- Wire "New Item" button to open NewItemForm modal
- Add edit mode for existing items
- Add confirmation dialog for delete with archive option
- Show "Archived" badge for inactive items
- Add bulk actions bar when items selected

**2.4 Update AppContext**

File: `src/context/AppContext.tsx`

Add helper functions:
- `addItem(item: Item): void`
- `updateItem(item: Item): void`
- `archiveItem(id: string): void` - sets isActive = false
- `deleteItem(id: string): void` - only if never referenced
- `isItemReferenced(id: string): boolean` - check if used in any document

---

### Phase 3: Item Picker Integration

**3.1 Create ItemPicker Component**

File: `src/components/ItemPicker.tsx` (new)

Dropdown/popover component with:
- Search input with 250ms debounce
- Category filter tabs
- Scrollable item list showing: name, price, unit
- Click to select and add as line item
- Filter out inactive items (`isActive = false`)

**3.2 Create Snapshot Function**

File: `src/lib/item-utils.ts` (new)

```text
function createLineItemFromCatalogueItem(
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
```

**3.3 Update LineItemsEditor**

File: `src/components/LineItemsEditor.tsx`

- Replace "Add Item" button with split button: "Add Item" / "Add from Catalog"
- "Add from Catalog" opens ItemPicker
- When item selected: create snapshot, allow user to edit qty/price
- Show "linked" indicator if sourceItemId exists
- New column: per-line discount (optional, collapsible)
- Calculate and display per-line tax

**3.4 Update Invoice Form**

File: `src/components/NewInvoiceForm.tsx`

- Replace single taxRate with per-line tax display
- Update totals calculation to use new DocumentLineItem model
- Migrate from float-based to cents-based calculations

**3.5 Update Quote Form**

File: `src/components/NewQuoteForm.tsx` or `src/components/EnhancedQuoteForm.tsx`

- Same changes as invoice form

---

### Phase 4: Tax Calculation Engine

**4.1 Per-Line Tax Logic**

File: `src/lib/tax-utils.ts` (new)

```text
const TAX_RATES = {
  GST: 0.10,      // 10%
  GST_FREE: 0,
  NONE: 0,
};

function calculateLineItem(line: DocumentLineItem): {
  baseCents: number;
  discountCents: number;
  netCents: number;
  taxCents: number;
  totalCents: number;
} {
  const baseCents = line.qty * line.unitPriceCentsSnapshot;
  
  let discountCents = 0;
  if (line.discountType === "PERCENT") {
    discountCents = Math.round(baseCents * (line.discountValue / 100));
  } else if (line.discountType === "AMOUNT") {
    discountCents = line.discountValue;
  }
  
  const netCents = baseCents - discountCents;
  const taxRate = TAX_RATES[line.taxCodeSnapshot];
  const taxCents = Math.round(netCents * taxRate);
  const totalCents = netCents + taxCents;
  
  return { baseCents, discountCents, netCents, taxCents, totalCents };
}
```

**4.2 Update InvoiceTotals Component**

File: `src/components/InvoiceTotals.tsx`

- Remove global taxRate input
- Calculate totals from per-line tax
- Display breakdown: Subtotal, Discounts, Tax (GST), Total
- Show itemized tax if mixed taxCodes exist

---

### Phase 5: Delete/Archive Logic

**5.1 Reference Checking**

In `AppContext` or utility:

```text
function isItemReferenced(itemId: string): boolean {
  // Check invoices, quotes, credit memos for line items
  // with sourceItemId === itemId
  return invoices.some(inv => inv.lineItems?.some(li => li.sourceItemId === itemId))
    || quotes.some(q => q.lineItems?.some(li => li.sourceItemId === itemId));
}
```

**5.2 Delete Confirmation Dialog**

File: `src/components/ItemDeleteDialog.tsx` (new)

- If item referenced: "This item is used in X invoices/quotes. Archive instead?"
- If not referenced: "Delete permanently?"
- Archive sets `isActive = false`
- Hard delete removes from array

---

## Summary of File Changes

### Files to Create (7 new files)
1. `src/lib/line-item-schema.ts` - DocumentLineItem interface and Zod schema
2. `src/lib/money-utils.ts` - Cents conversion and formatting utilities
3. `src/lib/item-schema.ts` - Item form validation schema
4. `src/lib/tax-utils.ts` - Per-line tax calculation engine
5. `src/lib/item-utils.ts` - Snapshot creation function
6. `src/components/NewItemForm.tsx` - Create/Edit item modal
7. `src/components/ItemPicker.tsx` - Searchable item catalogue picker
8. `src/components/ItemDeleteDialog.tsx` - Archive/delete confirmation

### Files to Update (8 files)
1. `src/data/items.ts` - Enhanced Item interface with new fields
2. `src/context/AppContext.tsx` - Add item CRUD helpers and reference checking
3. `src/pages/Items.tsx` - Wire up modal, archive logic, bulk actions
4. `src/components/tables/ItemTable.tsx` - Show archived badge, edit handler
5. `src/components/LineItemsEditor.tsx` - Item picker integration, per-line tax
6. `src/components/InvoiceTotals.tsx` - Per-line tax totals
7. `src/components/NewInvoiceForm.tsx` - Cents-based line items
8. `src/lib/invoice-schema.ts` - Update LineItem schema

---

## Technical Architecture

```text
+------------------+
|  Item Catalogue  |  (templates, can be edited)
|------------------|
| id, name, sku    |
| unitPriceCents   |
| taxCode, unit    |
| isActive         |
+--------+---------+
         |
         | snapshot on add
         v
+-------------------+
|  DocumentLineItem |  (immutable per invoice/quote)
|-------------------|
| sourceItemId      |  <-- link back to catalogue
| nameSnapshot      |  <-- copied at creation time
| unitPriceCents... |
| discountType      |
| taxCodeSnapshot   |
+-------------------+
         |
         | aggregated
         v
+-------------------+
|  Document Totals  |
|-------------------|
| subtotalCents     |
| discountCents     |
| taxCents (GST)    |
| totalCents        |
+-------------------+
```

---

## Migration Notes

- Existing mock items will need conversion from `unitPrice` (float) to `unitPriceCents` (integer)
- Add `isActive: true`, `createdAt`, `updatedAt`, `taxCode: "GST"`, `defaultQty: 1` to all existing items
- Existing invoices/quotes using old LineItem format will continue to work (no sourceItemId means manual entry)

---

## Expected Outcome

After implementation:
1. Items page has full Create/Edit/Archive functionality
2. Invoice and quote forms can select items from catalogue
3. Line items are immutable snapshots (catalogue changes don't affect old documents)
4. Per-line discounts and tax codes are supported
5. All money stored in cents with proper rounding
6. Soft delete prevents data loss for referenced items

