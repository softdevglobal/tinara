

# Complete Invoice/Estimate Line Items Persistence Implementation

## Executive Summary

This plan addresses critical business logic gaps where invoices and estimates currently save only a `total` number but discard all line item details. This makes auditing, editing, and re-sending impossible. We will implement proper document persistence with `DocumentLineItem[]` as the single source of truth.

---

## Current State Analysis

| Component | Current Problem | Impact |
|-----------|----------------|--------|
| Invoice model | Only stores `total: number` | Cannot audit, edit, or prove anything |
| Quote model | Only stores `total: number` | Same issue |
| InvoiceTotals | Uses global `taxRate * subtotal` | Ignores per-line tax codes |
| LineItemsEditor | Uses `ExtendedLineItem` (dollars) | Schema disconnect with `DocumentLineItem` (cents) |
| isItemReferenced | Always returns `false` | Allows hard-delete of referenced items (data corruption) |
| Save handlers | Discards `lineItems` array | Line items lost on save |

---

## Implementation Plan

### Phase 1: Upgrade Invoice Data Model (Critical)

**File: `src/data/invoices.ts`**

Update the Invoice interface to persist line items:

```text
interface Invoice {
  id: string;
  number: string;
  clientName: string;
  clientEmail?: string;
  projectName: string;
  date: string;
  dueDate: string;
  dueDaysOverdue: number;
  dueLabel: string;
  status: "Opened" | "Paid" | "Overdue";
  currency: string;
  paidDate?: string;
  notes?: string;

  // NEW: Line items as immutable snapshots
  lineItems: DocumentLineItem[];

  // NEW: Computed totals (stored for performance)
  totals: {
    subtotalCents: number;
    discountCents: number;
    taxCents: number;
    totalCents: number;
  };

  // DEPRECATED: Keep for backwards compat
  total?: number;  // Will be removed later
}
```

Migration for existing invoices:
- If `lineItems` is undefined, mark as legacy
- Display: "Line item breakdown unavailable (legacy record)"

**File: `src/data/quotes.ts`**

Same changes for Quote interface.

---

### Phase 2: Create DocumentLineItem-Based Form State

**Update: `src/components/LineItemsEditor.tsx`**

The editor should work with `DocumentLineItem` directly:

- Remove `ExtendedLineItem` type
- Form state holds `DocumentLineItem[]`
- Unit price input: display dollars, store `unitPriceCentsSnapshot`
- Tax code: dropdown per line (GST / GST Free / None)
- Discount: optional fields `discountType` + `discountValue`

Input conversion flow:
```text
User types: $150.00
-> displayToCents("150.00") = 15000
-> stored as unitPriceCentsSnapshot: 15000

Display:
-> centsToInputValue(15000) = "150.00"
```

Props change:
```text
interface LineItemsEditorProps {
  lineItems: DocumentLineItem[];
  documentId: string;
  onUpdate: (lineItems: DocumentLineItem[]) => void;
}
```

---

### Phase 3: Replace InvoiceTotals with calculateDocumentTotals

**Update: `src/components/InvoiceTotals.tsx`**

Remove the global `taxRate` input entirely.

New props:
```text
interface InvoiceTotalsProps {
  lineItems: DocumentLineItem[];
}
```

Component behavior:
1. Call `calculateDocumentTotals(lineItems)` from `tax-utils.ts`
2. Display:
   - Subtotal (sum of line bases)
   - Discounts (if any)
   - Tax (with breakdown by code if mixed)
   - Total
3. All values converted from cents to display using `centsToDisplay()`

Remove this bug pattern:
```text
// DELETE THIS EVERYWHERE
const taxAmount = subtotal * (taxRate / 100);
```

---

### Phase 4: Update Invoice Save Handler

**Update: `src/components/InvoiceDashboard.tsx`**

In `handleCreateInvoice()` and `handleUpdateInvoice()`:

```text
const handleCreateInvoice = (data: InvoiceFormData, lineItems: DocumentLineItem[]) => {
  const totals = calculateDocumentTotals(lineItems);

  const newInvoice: Invoice = {
    id: `inv_${Date.now()}`,
    number: `A${Date.now().toString().slice(-8)}`,
    clientName: data.clientName,
    clientEmail: data.clientEmail,
    projectName: data.projectName || "",
    date: data.issueDate.toISOString().split("T")[0],
    dueDate: data.dueDate.toISOString().split("T")[0],
    dueDaysOverdue: 0,
    dueLabel: `Due in ${daysDiff} days`,
    status: "Opened",
    currency: "AUD",
    notes: data.notes,

    // Persist the full line items
    lineItems: lineItems,

    // Store computed totals
    totals: {
      subtotalCents: totals.subtotalCents,
      discountCents: totals.discountCents,
      taxCents: totals.taxCents,
      totalCents: totals.totalCents,
    },
  };

  onUpdateInvoices((prev) => [newInvoice, ...prev]);
};
```

---

### Phase 5: Update NewInvoiceForm to Use DocumentLineItem

**Update: `src/components/NewInvoiceForm.tsx`**

Major changes:
1. Remove `ExtendedLineItem` type
2. State: `const [lineItems, setLineItems] = useState<DocumentLineItem[]>([]);`
3. Initialize with one empty DocumentLineItem
4. Remove global `taxRate` state
5. Pass `lineItems` to `InvoiceTotals`
6. On submit, pass `lineItems` to parent handler

Default empty line item:
```text
const createEmptyLineItem = (documentId: string, sortOrder: number): DocumentLineItem => ({
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
});
```

When editing an existing invoice:
- Load `invoice.lineItems` directly into form state
- If legacy invoice (no lineItems), show "Legacy record" message

---

### Phase 6: Update ItemPicker to Create Full Snapshots

**Update: `src/components/ItemPicker.tsx`**

When an item is selected, create a complete `DocumentLineItem`:

```text
const createSnapshotFromItem = (
  item: Item,
  documentId: string,
  sortOrder: number
): DocumentLineItem => ({
  id: generateId(),
  documentId,
  sourceItemId: item.id,  // Link to catalog
  nameSnapshot: item.name,
  descriptionSnapshot: item.description,
  unitSnapshot: item.unit,
  unitPriceCentsSnapshot: item.unitPriceCents,
  qty: item.defaultQty,
  discountType: "NONE",
  discountValue: 0,
  taxCodeSnapshot: item.taxCode,
  sortOrder,
});
```

---

### Phase 7: Implement Real Reference Tracking

**Update: `src/context/AppContext.tsx`**

Replace the stubbed `isItemReferenced()`:

```text
const isItemReferenced = (itemId: string): boolean => {
  // Check invoices
  const inInvoices = invoices.some(
    (inv) => inv.lineItems?.some((li) => li.sourceItemId === itemId)
  );

  // Check quotes
  const inQuotes = quotes.some(
    (q) => q.lineItems?.some((li) => li.sourceItemId === itemId)
  );

  return inInvoices || inQuotes;
};

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
```

This makes delete behavior correct:
- If referenced: archive only (set `isActive = false`)
- If never referenced: hard delete allowed

---

### Phase 8: Update Quote/Estimate Form

**Update: `src/components/EnhancedQuoteForm.tsx`**

Apply same changes as invoice form:
1. Use `DocumentLineItem[]` for line items state
2. Remove local `QuoteLineItem` type
3. Use `calculateDocumentTotals()` for totals
4. Persist `lineItems` and `totals` on save

---

### Phase 9: Update View Invoice/Quote Display

**Update: `src/components/InvoiceCard.tsx`** (and similar)

When viewing an invoice:
- If `invoice.lineItems` exists: render the line items table
- If `invoice.lineItems` is undefined: show "Line item breakdown unavailable (legacy record)"
- Edit button opens form with persisted line items

---

## Summary of File Changes

### Files to Update (10 files)

1. `src/data/invoices.ts`
   - Add `lineItems: DocumentLineItem[]` and `totals` object
   - Add migration helper for legacy records

2. `src/data/quotes.ts`
   - Same changes as invoices

3. `src/components/LineItemsEditor.tsx`
   - Use `DocumentLineItem` directly
   - Convert display/storage with money utils
   - Add per-line tax code dropdown

4. `src/components/InvoiceTotals.tsx`
   - Remove `taxRate` prop
   - Accept `DocumentLineItem[]`
   - Use `calculateDocumentTotals()`

5. `src/components/NewInvoiceForm.tsx`
   - Remove `ExtendedLineItem` type
   - State holds `DocumentLineItem[]`
   - Remove global `taxRate` state
   - Pass line items to save handler

6. `src/components/InvoiceDashboard.tsx`
   - Update `handleCreateInvoice` to persist line items
   - Update `handleUpdateInvoice` to persist line items

7. `src/components/EnhancedQuoteForm.tsx`
   - Same changes as invoice form

8. `src/context/AppContext.tsx`
   - Implement real `isItemReferenced()`
   - Implement real `getItemReferenceCount()`

9. `src/components/ItemPicker.tsx`
   - Create full `DocumentLineItem` snapshots

10. `src/components/InvoiceCard.tsx`
    - Display line items from persisted data

### Files Already Complete (no changes needed)

- `src/lib/line-item-schema.ts` - DocumentLineItem interface exists
- `src/lib/tax-utils.ts` - calculateDocumentTotals() exists
- `src/lib/money-utils.ts` - Conversion utilities exist

---

## Technical Architecture After Implementation

```text
+------------------+           +---------------------+
|  Item Catalogue  |           |  NewInvoiceForm     |
|------------------|           |---------------------|
| unitPriceCents   |  ------>  | DocumentLineItem[]  |
| taxCode          |  snapshot | (cents, taxCode)    |
| unit             |           +----------+----------+
+------------------+                      |
                                          | save
                                          v
                        +--------------------------------+
                        |  Invoice (persisted)           |
                        |--------------------------------|
                        | lineItems: DocumentLineItem[]  |
                        | totals: { subtotalCents, ... } |
                        +--------------------------------+
                                          |
                                          | read
                                          v
                        +--------------------------------+
                        |  InvoiceCard / Edit Form       |
                        |--------------------------------|
                        | Renders from lineItems         |
                        | Full audit trail available     |
                        +--------------------------------+
```

---

## Migration Strategy for Existing Data

Existing mock invoices without lineItems:
1. Keep them as-is (backwards compatible)
2. Add a check: `if (!invoice.lineItems)`
3. Display: "This is a legacy invoice. Line item details are unavailable."
4. Editing creates new lineItems array

No data loss, no breaking changes to existing records.

---

## Validation Rules

On invoice/estimate save:
1. At least one line item required
2. Each line item:
   - `nameSnapshot` required (min 1 char)
   - `qty` must be > 0
   - `unitPriceCentsSnapshot` must be >= 0
   - `taxCodeSnapshot` must be valid enum
3. Total can be 0 (e.g., pro-bono work) but warn user

---

## Expected Outcome

After implementation:
1. Every invoice/estimate persists its complete line items
2. Editing loads the exact line items that were saved
3. PDF generation uses actual saved line items
4. Item catalog tracks real usage (no false delete)
5. Per-line tax codes calculate correctly
6. All money stored in cents with line-level rounding
7. Legacy records display gracefully without errors

