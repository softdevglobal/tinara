
# Invoice2go-Style POS System Redesign

## Overview
Transform the current invoicing application to match the clean, professional look of Invoice2go with a dark sidebar navigation, global search, overview dashboard cards, and table-based data views.

## Key Design Elements from Reference

Based on the Invoice2go screenshots, the design features:
- **Dark sidebar** (charcoal/slate) with grouped navigation items
- **White content area** with clean typography
- **Blue primary accent** for CTAs and active states
- **Overview dashboard cards** showing financial metrics (Overdue, Unpaid, Unsent, Sales)
- **Table-based lists** with sortable columns and checkboxes
- **Global search bar** in the header
- **User profile menu** in top-right corner
- **Red indicator bar** on active sidebar items

---

## Implementation Plan

### Phase 1: Create New Layout with Sidebar

**1.1 Create AppSidebar Component**
- Dark background (#1a1f2e or similar)
- Logo/brand area at top with "Create" button
- Grouped navigation sections:
  - Home, Clients
  - Invoices, Quotes (Estimates)
  - Recurring
- Red/orange accent bar for active route
- Collapsible for mobile

**1.2 Create TopHeader Component**
- Global search bar (centered)
- Notifications bell icon with badge
- User profile dropdown (right side)

**1.3 Update AppLayout**
- Replace current top navigation with sidebar layout
- Use SidebarProvider from shadcn/ui
- Add TopHeader above main content

---

### Phase 2: Dashboard Home Page

**2.1 Create Overview Cards Grid**
- **Overdue Invoices** - Red text, count and amount
- **Unpaid Invoices** - Default text, count and amount  
- **Unsent Invoices** - Default text, count and amount
- **Monthly Sales** - Current month total
- **Tax Year Sales** - Year-to-date with monthly average
- **Pending Quotes** - Count and amount with "See more" link

**2.2 Dashboard Statistics**
- Calculate stats from invoice data:
  - Overdue: filter by status === "Overdue"
  - Unpaid: filter by status === "Opened" or "Overdue"
  - Recent sales: filter paid invoices by date

---

### Phase 3: Table-Based List Views

**3.1 Invoice List Table**
- Proper table with columns:
  - Checkbox (for bulk select)
  - Invoice Number
  - Client Name
  - Date
  - Due Date
  - Status (badge)
  - Total
  - Actions dropdown
- Sortable column headers
- Clean row hover states

**3.2 Client List Table**
- Columns: Checkbox, Name, Email, Date Added, Balance Due, Actions
- Match the Invoice2go client list style

**3.3 Quotes List Table**
- Similar structure to invoices
- Status column with appropriate badges

---

### Phase 4: Color Scheme Update

**4.1 Update CSS Variables**
```css
/* Sidebar colors */
--sidebar: 222 47% 11%;  /* Dark charcoal */
--sidebar-foreground: 210 40% 98%;
--sidebar-accent: 217 33% 17%;

/* Primary accent - Blue */
--primary: 221 83% 53%;  /* Invoice2go blue */

/* Status colors */
--destructive: 0 84% 60%;  /* Red for overdue */
--success: 142 71% 45%;    /* Green for paid */
```

**4.2 Clean Typography**
- Remove Japanese-inspired fonts
- Use system fonts or Inter for cleaner look
- Larger, bolder headings
- Clear hierarchy

---

### Phase 5: Component Updates

**5.1 Files to Create**
- `src/components/layout/AppSidebar.tsx` - New sidebar component
- `src/components/layout/TopHeader.tsx` - Header with search
- `src/components/dashboard/OverviewCard.tsx` - Dashboard stat cards
- `src/components/dashboard/DashboardHome.tsx` - Home overview page
- `src/components/tables/InvoiceTable.tsx` - Table view for invoices
- `src/components/tables/ClientTable.tsx` - Table view for clients

**5.2 Files to Update**
- `src/components/AppLayout.tsx` - Complete rewrite for sidebar layout
- `src/pages/Index.tsx` - Add dashboard home view
- `src/pages/Clients.tsx` - Use table layout
- `src/pages/Quotes.tsx` - Use table layout
- `src/index.css` - Update color palette
- `tailwind.config.ts` - Add sidebar colors

---

## Technical Details

### Sidebar Navigation Structure
```text
+---------------------------+
|  [Logo] Invoice Manager   |
+---------------------------+
|  (+) Create               |
+---------------------------+
| ▌ Home                    |
|   Clients                 |
+---------------------------+
|   Invoices                |
|   Quotes                  |
+---------------------------+
|   Recurring               |
+---------------------------+
|   Reports (future)        |
+---------------------------+
|   Settings                |
+---------------------------+
```

### Dashboard Cards Layout
```text
+------------------+  +------------------+
| OVERDUE (3)      |  | UNPAID (5)       |
| A$23,474.34      |  | A$30,533.04      |
+------------------+  +------------------+

+------------------+  +------------------+
| UNSENT (2)       |  | JANUARY SALES    |
| A$10,196.04      |  | A$48,504.29      |
+------------------+  +------------------+
```

### Data Table Structure
```text
| ☐ | Number    | Client           | Email              | Date       | Status  | Total      | ⋮ |
|---|-----------|------------------|--------------------| -----------|---------|------------|---|
| ☐ | A53275081 | SECURITY CAMERAS | info@security.com  | Jan 21     | Overdue | $1,505.90  | ⋮ |
| ☐ | A53275082 | TECH SOLUTIONS   | tech@solutions.com | Jan 18     | Opened  | $3,250.00  | ⋮ |
```

---

## Summary of Changes

1. **New sidebar-based layout** replacing top navigation
2. **Dashboard home page** with financial overview cards
3. **Table-based data views** for invoices, clients, quotes
4. **Professional color scheme** with dark sidebar and blue accents
5. **Global search** in header
6. **Clean, business-focused typography**

This redesign will transform the application from a Japanese-inspired aesthetic to a professional Invoice2go/POS-style system while maintaining all existing functionality.
