
# Production-Grade Invoicing System Upgrade

## Overview

This plan transforms the existing invoice/quote system into a worldwide-ready, audit-compliant invoicing platform. The upgrade focuses on three core areas:

1. **Enhanced Data Models** - Worldwide tax engine, proper document snapshots, and complete line item fields
2. **Complete Document Creation Workflow** - Full Create/Preview/Send tabs with all required fields
3. **Correct Numbering System** - Sequential I 98978 / E 82385 format with proper rules

---

## Current State Analysis

### What's Already Built (Good Foundation)
- Document counters with I/E prefix system (localStorage)
- Tax settings page with TaxScheme, TaxRate, TaxRegistration models
- DocumentLineItem snapshot architecture
- Client snapshot structure in document types
- Three-tab workflow (Create/Preview/Send)
- SmartItemInput for catalog search

### What Needs Enhancement
- Invoice/Quote data models lack full snapshot fields
- Line items missing worldwide tax fields (taxRateSnapshot, taxCategorySnapshot)
- No reverse charge support in line items
- Document numbering not using I/E format in legacy mock data
- Client model missing customer type and shipping address
- Missing deposit invoice generation logic
- Missing audit metadata on documents

---

## Implementation Plan

### Phase 1: Enhanced Data Models

#### 1.1 Update Client Model
**File**: `src/data/clients.ts`

Add missing fields to support worldwide tax:
- `customerType`: "BUSINESS" | "INDIVIDUAL"
- `shippingAddress`: Full address object
- `taxIdValidated`: boolean
- `defaultCurrencyOverride`: string (optional)
- `taxTreatment`: "STANDARD" | "EXEMPT" | "REVERSE_CHARGE" (optional)

#### 1.2 Update Invoice/Quote Models
**Files**: `src/data/invoices.ts`, `src/data/quotes.ts`

Add complete audit and snapshot fields:

```text
Document Structure (Invoice/Quote):
+-- id, number, status
+-- clientSnapshot (full client data at issue time)
+-- documentTaxContext
|   +-- companyTaxSnapshot
|   +-- customerTaxSnapshot
|   +-- pricingModeSnapshot
|   +-- currencySnapshot
|   +-- roundingModeSnapshot
+-- lineItems[] (DocumentLineItem)
+-- totals (breakdown)
+-- attachments[]
+-- audit metadata (createdBy, updatedBy, timestamps)
+-- payment tracking (paid, balance)
```

#### 1.3 Update DocumentLineItem Schema
**File**: `src/lib/line-item-schema.ts`

Add worldwide tax fields:
- `taxCategorySnapshot`: TaxCategory (STANDARD, REDUCED, ZERO, EXEMPT, etc.)
- `taxRateSnapshot`: number (resolved rate at creation)
- `taxAmountCentsSnapshot`: number (pre-calculated tax)
- `isReverseCharge`: boolean
- `reverseChargeNote`: string (optional)
- `lineTotalCentsSnapshot`: number

---

### Phase 2: Global Tax Engine

#### 2.1 Tax Calculation Engine
**File**: `src/lib/global-tax-engine.ts`

Create a proper tax resolution engine:

```text
Tax Resolution Flow:
1. Get company tax scheme from SettingsContext
2. Check customer type (BUSINESS/INDIVIDUAL)
3. Check customer country vs company country
4. Apply rules:
   - Same country + Business + valid VAT = Standard rate
   - EU cross-border + B2B + valid VAT = Reverse Charge (0%)
   - Export outside tax zone = Zero-rated
   - Individual = Standard rate always
5. Return resolved TaxApplication object
```

Functions to create:
- `resolveTaxForLine(item, companySettings, customerProfile)` - Returns applicable tax
- `calculateLineItemTax(lineItem)` - Calculates tax using snapshot values
- `calculateDocumentTotals(lineItems)` - Sums with tax grouping
- `createTaxBreakdown(lineItems)` - Groups tax by name/rate for display

#### 2.2 Update Tax Utilities
**File**: `src/lib/tax-utils.ts`

Extend to support:
- Multiple tax rates per document (mixed lines)
- Tax breakdown by category
- Reverse charge detection and application
- Export zero-rating logic

---

### Phase 3: Complete Document Creation Form

#### 3.1 Client Section Enhancement
**File**: `src/components/document/DocumentCreationForm.tsx`

Enhance client picker to show:
- Customer type indicator (Business/Individual badge)
- Tax ID with validation status
- Billing address summary
- "Edit client" link

Add new client modal with full fields:
- Name (required)
- Email (required)
- Phone
- Billing address (country/region/postcode)
- Shipping address (optional)
- Customer type toggle
- Tax ID with validation toggle
- Default payment terms
- Notes

#### 3.2 Document Details Panel Enhancement
**File**: `src/components/document/DocumentDetailsPanel.tsx`

Make all fields editable:
- Document number (auto-generated, editable with uniqueness check)
- Issue date (date picker)
- Terms dropdown (Same day, 7/14/30/60 days, custom)
- Due date (auto-calculated but editable override)
- Currency selector (locks after payments)
- Status indicator
- PO/Reference number
- Project/Job link dropdown
- Tags input

Rules to implement:
- Changing terms recalculates due date unless manually overridden
- Show warning when editing locked fields (has payments)
- Currency changes require confirmation if line items exist

#### 3.3 Line Items Module Enhancement
**File**: `src/components/document/DocumentCreationForm.tsx`

Add line item import sources:
```text
+-- Parts and labor (catalog picker) [EXISTING]
+-- Expenses (import from expenses module) [NEW]
+-- Time entries (import timesheets) [NEW]
+-- Appointments (import booking data) [NEW]
```

Per-line fields to add:
- Cost price (internal only, hidden from client)
- Account/category dropdown (for accounting integration)
- "From catalog" indicator with link icon
- Drag handle for reordering

Tax selector per line:
- Auto (resolves from company scheme + customer)
- Override options:
  - Standard rate
  - Reduced rate
  - Zero-rated (export)
  - Exempt
  - Reverse charge
  - Out of scope
- Tooltip explaining "Why this tax applied"

#### 3.4 Totals Panel Enhancement
**File**: `src/components/InvoiceTotals.tsx` and new `DocumentTotalsPanel.tsx`

Display complete breakdown:
```text
Subtotal (net)          $1,500.00
Line Discounts           -$150.00
Document Discount        -$50.00
---
Net Total              $1,300.00
Tax:
  GST 10%                $120.00
  GST Free                 $0.00
---
Total                  $1,420.00
Paid                    -$500.00
Deposit (pending)       -$200.00
---
Balance Due             $720.00
```

Features:
- Tax inclusive/exclusive indicator
- Rounding adjustment line (if applicable)
- Tax breakdown by code when mixed rates
- Deposit section with progress indicator

#### 3.5 Deposit Request Modal
**File**: `src/components/document/DepositRequestModal.tsx` (new)

Fields:
- Type: Percentage of total / Fixed amount
- Amount input (validates against balance)
- Due date picker (separate from invoice due date)
- Description for client
- Payment methods enabled (Stripe/PayPal toggles)
- "Save as default for future estimates" checkbox

Behavior:
- Deposit cannot exceed total
- If deposit paid, balance updates automatically
- Shows on PDF and email

#### 3.6 Attachments Section
**File**: `src/components/document/DocumentAttachments.tsx` (new)

Features:
- Drag-and-drop file upload
- Photo capture button (mobile)
- File list with:
  - Filename, size, upload date
  - "Visible to client" toggle per file
  - Delete button
- Include attachments toggle for send

---

### Phase 4: Preview and Send Tabs

#### 4.1 Preview Tab Enhancement
**File**: `src/components/document/DocumentPreviewTab.tsx`

Display:
- Exact PDF-like rendering
- Company branding (logo, colors)
- Client snapshot data
- Full line item table with tax breakdown
- Payment instructions
- Missing field warnings (highlighted)

#### 4.2 Send Tab Enhancement
**File**: `src/components/document/DocumentSendTab.tsx`

Full email composition:
- Recipients: To, CC, BCC (multiple email entry)
- Subject line (template with placeholders)
- Body (editable, defaults from Settings)
- Toggle: Attach PDF (always on by default)
- Toggle: Include payment link (if Stripe enabled)
- "Send me preview" button (emails to current user)
- Send button with confirmation

Track after send:
- Sent timestamp
- Who sent
- Delivery status (stub for now)
- Open/view events (future)

---

### Phase 5: Actions Menu and State Management

#### 5.1 Document Actions Menu
**File**: `src/components/document/DocumentFormHeader.tsx`

Actions dropdown:
- Duplicate (creates new draft copy)
- Convert to Invoice (quotes only)
- Void/Cancel (invoices - marks as void, keeps number)
- Delete (drafts only - doesn't consume number)
- Download PDF
- Print

#### 5.2 Editing Rules Enforcement

Rules to implement:
1. Drafts: Fully editable, no number assigned
2. Sent/Issued: Show warning before edits, log to audit
3. Has Payments: Block currency/total edits, require credit note flow
4. Voided: Read-only, number preserved
5. Manual number edit: Validate uniqueness, log audit event

---

### Phase 6: Quote-Specific Behavior

#### 6.1 Quote Workflow Differences

Labels:
- "Quote date" instead of "Issue date"
- "Valid until" instead of "Due date"

Status values:
- Draft, Sent, Opened, Accepted, Declined, Expired, Converted

Convert to Invoice:
- Creates new invoice with copied snapshots
- Generates NEW invoice number
- Preserves `quoteId` reference for audit trail
- Original quote status changes to "Converted"

---

## File Changes Summary

### New Files to Create
1. `src/lib/global-tax-engine.ts` - Tax resolution and calculation engine
2. `src/components/document/DepositRequestModal.tsx` - Deposit configuration
3. `src/components/document/DocumentAttachments.tsx` - File attachments
4. `src/components/document/DocumentTotalsPanel.tsx` - Enhanced totals display
5. `src/components/document/ExpenseImportModal.tsx` - Import from expenses
6. `src/components/document/TimeEntryImportModal.tsx` - Import time entries

### Files to Modify
1. `src/data/clients.ts` - Add customerType, shippingAddress, taxIdValidated
2. `src/data/invoices.ts` - Add clientSnapshot, documentTaxContext, audit fields
3. `src/data/quotes.ts` - Add same snapshot fields
4. `src/lib/line-item-schema.ts` - Add taxCategorySnapshot, taxRateSnapshot, isReverseCharge
5. `src/lib/tax-utils.ts` - Extend with worldwide tax support
6. `src/types/document.ts` - Add DocumentAuditMeta, AttachmentConfig
7. `src/components/document/DocumentCreationForm.tsx` - Full enhancement
8. `src/components/document/DocumentDetailsPanel.tsx` - Make all fields editable
9. `src/components/document/DocumentPreviewTab.tsx` - Enhanced rendering
10. `src/components/document/DocumentSendTab.tsx` - Full email composition
11. `src/components/document/DocumentFormHeader.tsx` - Actions menu
12. `src/components/ClientSelector.tsx` - Show customer type, tax status
13. `src/components/NewClientForm.tsx` - Add all required fields
14. `src/components/InvoiceTotals.tsx` - Per-line tax breakdown

---

## Technical Requirements

### Numbering Rules (Non-Negotiable)
- Invoice sequence: I 98978, I 98979, I 98980...
- Quote sequence: E 82385, E 82386, E 82387...
- Numbers assigned ONLY on first save/send (drafts are numberless)
- Deleted drafts don't consume numbers
- Voided documents keep their number, never reuse
- Quote to Invoice conversion generates NEW invoice number
- Manual editing requires admin role and logs audit event

### Snapshot Rules (Non-Negotiable)
- Client data snapshotted at issue time
- Line item prices/tax snapshotted at creation
- Changes to catalog items don't affect existing documents
- Edits after sending create revision or require credit note workflow

### Tax Calculation Rules
- Tax calculated per line, not global rate on subtotal
- Discount applied before tax calculation
- Round at line level using company rounding mode
- Support mixed tax codes in single document
- Show itemized tax breakdown by code/rate

---

## Testing Checklist

### Document Numbering
- [ ] New invoice gets I XXXXX format
- [ ] New quote gets E XXXXX format
- [ ] Draft has no number until saved
- [ ] Deleted draft doesn't increment counter
- [ ] Void keeps number, next invoice skips it
- [ ] Quote conversion creates new invoice number

### Tax Calculations
- [ ] Per-line tax calculation correct
- [ ] Mixed tax codes show breakdown
- [ ] Discounts apply before tax
- [ ] Rounding matches company setting
- [ ] Reverse charge shows 0% with note

### Snapshot Integrity
- [ ] Editing client after issue doesn't change document
- [ ] Editing catalog item doesn't change existing lines
- [ ] All snapshot fields populated at save time

