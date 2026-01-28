

# Invoice2go Feature Expansion Plan

## Overview

Based on the reference screenshots, this plan adds several new modules and enhances existing ones to fully match the Invoice2go system. The new features include Projects management, Items catalog, Expenses tracking, Credit Memos, and Time Tracking.

---

## New Features from Reference Images

### 1. Projects Module
- Projects list with Active/Complete tabs
- Table view with columns: Number, Project name, Client, Created, Last updated
- Empty state with "Organize your projects" message
- Create project form linking to clients
- Project detail view with Activity/Info/Projects tabs

### 2. Items Catalog
- Reusable line items (parts, labor, services)
- Can be quickly added to invoices/quotes
- Manage pricing and descriptions centrally

### 3. Expenses Tracking
- Track business expenses
- Attach to projects or invoices
- Categorization and reporting

### 4. Credit Memos
- Table listing with Number, Client, Date, Status, Total columns
- Create form with Create/Preview/Send workflow tabs
- Sections: Client, Parts and labor, Attachments, Comments
- Summary panel showing memo details

### 5. Time Tracking
- Unbilled/Billed tabs for time entries
- Start timer functionality
- Convert time entries to billable items
- Empty state with "Keep track of time" message

### 6. Enhanced Client Form
- Additional fields: Contact name, Mobile, Website, Tax number
- Custom payment terms dropdown
- Private notes field
- Billing address separate from contact info

### 7. Enhanced Invoice Page Header
- Action buttons: Purchase orders, Credit memos, Time tracking
- Unpaid/Paid tab filter
- Total amount display above table
- Tax year filter dropdown

---

## Implementation Plan

### Phase 1: Update Sidebar Navigation

**File: `src/components/layout/AppSidebar.tsx`**

Add new navigation items matching Invoice2go structure:
- Home, Clients, Projects (main section)
- Invoices, Estimates (billing section)
- Items, Expenses (inventory section)
- Cash flow, Integrated apps, Reports (tools section)
- Help, Settings (footer section)

### Phase 2: Create Data Types and Mock Data

**New Files:**
- `src/data/projects.ts` - Project interface and sample data
- `src/data/items.ts` - Item/service interface and catalog
- `src/data/expenses.ts` - Expense interface and sample data
- `src/data/credit-memos.ts` - Credit memo interface and data
- `src/data/time-entries.ts` - Time entry interface and data

**Update File: `src/data/clients.ts`**
- Add new fields: contactName, mobile, website, taxNumber, billingAddress, paymentTerms, notes

### Phase 3: Update App Context

**File: `src/context/AppContext.tsx`**

Add state management for:
- Projects (CRUD operations)
- Items catalog
- Expenses
- Credit memos
- Time entries

### Phase 4: Create New Pages

**New Page Files:**
- `src/pages/Projects.tsx` - Projects list with tabs
- `src/pages/Items.tsx` - Items catalog
- `src/pages/Expenses.tsx` - Expenses tracking
- `src/pages/CreditMemos.tsx` - Credit memos list
- `src/pages/TimeTracking.tsx` - Time entries

### Phase 5: Create Table Components

**New Table Files:**
- `src/components/tables/ProjectTable.tsx`
- `src/components/tables/ItemTable.tsx`
- `src/components/tables/ExpenseTable.tsx`
- `src/components/tables/CreditMemoTable.tsx`
- `src/components/tables/TimeEntryTable.tsx`

### Phase 6: Create Form Components

**New Form Files:**
- `src/components/NewProjectForm.tsx`
- `src/components/NewItemForm.tsx`
- `src/components/NewExpenseForm.tsx`
- `src/components/NewCreditMemoForm.tsx` (with Create/Preview/Send tabs)
- `src/components/TimeTracker.tsx` (timer widget)

### Phase 7: Enhance Existing Components

**Update: `src/components/NewClientForm.tsx`**
- Add fields: Contact name, Mobile, Website, Tax number
- Add Billing address, Custom payment terms, Notes
- Match Invoice2go form layout with label-left styling

**Update: `src/pages/Index.tsx` (Invoices)**
- Add action buttons row: Purchase orders, Credit memos, Time tracking
- Add Unpaid/Paid tabs
- Display total amount above table
- Add tax year filter dropdown

### Phase 8: Update Routing

**File: `src/App.tsx`**

Add routes:
- `/projects` - Projects page
- `/items` - Items catalog
- `/expenses` - Expenses tracking
- `/credit-memos` - Credit memos
- `/time-tracking` - Time entries

---

## Technical Details

### New Data Interfaces

```text
Project {
  id, number, name, clientId, status, 
  createdAt, updatedAt, description
}

Item {
  id, name, description, unitPrice, 
  category, taxable, unit
}

Expense {
  id, description, amount, date, 
  category, projectId, receipt
}

CreditMemo {
  id, number, clientId, date, status,
  items[], subtotal, total, comments
}

TimeEntry {
  id, description, projectId, clientId,
  startTime, endTime, duration, billed
}
```

### Empty State Components

Create reusable empty states matching Invoice2go style:
- Illustrated icon (folder, clock, document)
- Title text
- Description
- Primary action button

---

## Summary of Files

### Files to Create (18 files)
1. `src/data/projects.ts`
2. `src/data/items.ts`
3. `src/data/expenses.ts`
4. `src/data/credit-memos.ts`
5. `src/data/time-entries.ts`
6. `src/pages/Projects.tsx`
7. `src/pages/Items.tsx`
8. `src/pages/Expenses.tsx`
9. `src/pages/CreditMemos.tsx`
10. `src/pages/TimeTracking.tsx`
11. `src/components/tables/ProjectTable.tsx`
12. `src/components/tables/ItemTable.tsx`
13. `src/components/tables/ExpenseTable.tsx`
14. `src/components/tables/CreditMemoTable.tsx`
15. `src/components/tables/TimeEntryTable.tsx`
16. `src/components/NewProjectForm.tsx`
17. `src/components/NewCreditMemoForm.tsx`
18. `src/components/TimeTracker.tsx`

### Files to Update (6 files)
1. `src/components/layout/AppSidebar.tsx` - Add new nav items
2. `src/data/clients.ts` - Extended Client interface
3. `src/context/AppContext.tsx` - Add new state slices
4. `src/App.tsx` - Add new routes
5. `src/components/NewClientForm.tsx` - Add more fields
6. `src/pages/Index.tsx` - Add action buttons and tabs

---

## Visual Reference Mapping

| Screenshot | Feature | Implementation |
|------------|---------|----------------|
| image-4 | Projects empty state | Projects page with tabs |
| image-5 | Add client form | Enhanced NewClientForm |
| image-6 | Projects list | ProjectTable component |
| image-7, 10 | Invoices with actions | Updated Index page header |
| image-8 | Credit memos list | CreditMemos page |
| image-9 | Add credit memo | NewCreditMemoForm |
| image-11 | Time tracking | TimeTracking page |

This plan transforms the application into a full-featured Invoice2go clone with Projects, Items, Expenses, Credit Memos, and Time Tracking capabilities.

