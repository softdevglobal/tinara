
# Smart Item Code Search with Auto-Suggest

## Overview
Enhance the line item entry experience in invoices and quotes to allow typing an item code/name that searches through the existing items database, suggests matches as you type, and automatically offers to add non-existing items to the database.

## Current State
- **ItemPicker component**: A popover-based catalog browser with search and category filters
- **LineItemsEditor**: Uses separate "From Catalog" button and "Manual" button to add line items
- **EnhancedQuoteForm**: Uses simple Input fields for description/qty/price without item lookup
- **AppContext**: Already has `addItem()` method to add new items to the database

## Proposed Solution

### New Component: `SmartItemInput`
A combined input field that:
1. Shows autocomplete suggestions as user types
2. Searches by item name, SKU, and description
3. When a match is selected, auto-fills description, unit price, and quantity
4. When no match exists and user finishes typing, offers to "Add as new item"

### User Experience Flow
```text
User types "Consul" in description field
       |
       v
+------------------------+
| Consultation Hour      | <-- Matching suggestions appear
| $150.00 per hour       |
+------------------------+
| + Add "Consul" as new  | <-- Option to add if no exact match
+------------------------+
       |
       v (user selects existing OR adds new)
       |
Line item auto-fills with details
```

## Technical Implementation

### 1. Create `SmartItemInput` Component
**File**: `src/components/SmartItemInput.tsx`

This component will:
- Accept current description value and onChange handler
- Use `useApp()` to access items database
- Debounce search input (300ms)
- Display dropdown with:
  - Matching items (by name, SKU, description)
  - "Add as new item" option at bottom when text doesn't match exactly
- On item select: trigger callback with full item details
- On "Add new": open inline quick-add form or full item form

**Key Features**:
- `Command` component from shadcn/ui for keyboard navigation
- Fuzzy matching on name/SKU/description
- Shows price and category for each suggestion
- Pressing Enter on "Add new" opens new item dialog

### 2. Create `QuickAddItemForm` Component
**File**: `src/components/QuickAddItemForm.tsx`

A lightweight inline form for adding items quickly without leaving the invoice/quote:
- Name (pre-filled with typed text)
- Unit Price
- Category dropdown
- Unit dropdown
- "Add to catalog" button

### 3. Update `LineItemsEditor` Component
**File**: `src/components/LineItemsEditor.tsx`

Changes:
- Replace the plain `<Input>` for description with `<SmartItemInput>`
- Remove separate "From Catalog" button (now integrated into input)
- Keep "Manual" button as "Add Line" for blank rows
- Handle item selection to auto-populate: description, unitPrice, sourceItemId, unit

### 4. Update `EnhancedQuoteForm` Component
**File**: `src/components/EnhancedQuoteForm.tsx`

Changes:
- Replace plain description Input with `<SmartItemInput>`
- Add `onAddItem` prop to allow adding new items to catalog
- Auto-populate price when item selected
- Track `sourceItemId` on line items

### 5. Update `NewInvoiceForm` Component
**File**: `src/components/NewInvoiceForm.tsx`

Changes:
- Ensure `LineItemsEditor` receives `onAddItem` callback
- Connect to `addItem` from AppContext

## Component Structure

```
SmartItemInput
├── Input field (controlled)
├── Popover/Command dropdown
│   ├── Search results (filtered items)
│   │   └── Item row (name, SKU, price, category)
│   ├── Separator
│   └── "Add [typed text] as new item" action
└── QuickAddItemForm (inline, shown when adding new)
```

## Props Interface

```typescript
interface SmartItemInputProps {
  value: string;
  onChange: (value: string) => void;
  onItemSelect: (item: Item) => void;
  onAddNewItem: (item: Item) => void;
  placeholder?: string;
  className?: string;
}
```

## Files to Create
1. `src/components/SmartItemInput.tsx` - Main autocomplete component
2. `src/components/QuickAddItemForm.tsx` - Inline new item form

## Files to Modify
1. `src/components/LineItemsEditor.tsx` - Use SmartItemInput for description
2. `src/components/EnhancedQuoteForm.tsx` - Use SmartItemInput in line items
3. `src/components/NewInvoiceForm.tsx` - Pass addItem handler

## Behavior Details

### Search Logic
- Minimum 2 characters to trigger search
- Search fields: `name`, `sku`, `description`
- Case-insensitive matching
- Only show active items (`isActive: true`)
- Limit to 5-8 suggestions for clean UI

### Adding New Items
When user types something that doesn't match and:
- Clicks "Add as new item" option
- OR presses Enter when that option is focused

A quick-add form appears inline with:
- Name pre-filled with typed text
- Default category: "Services"
- Default unit: "unit"  
- Price field focused for quick entry

After adding:
- Item is saved to database via `addItem()`
- Line item is populated with new item details
- Toast confirmation: "Item added to catalog"

### Keyboard Navigation
- Arrow keys: Navigate suggestions
- Enter: Select highlighted item or add new
- Escape: Close dropdown, keep typed text
- Tab: Close dropdown, move to next field
