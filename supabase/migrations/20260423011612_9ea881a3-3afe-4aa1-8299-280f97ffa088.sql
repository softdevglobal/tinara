
-- ============================================================
-- TINARA CORE BUSINESS SCHEMA
-- Multi-tenant tables for the operating platform
-- ============================================================

-- ----- helper: updated_at trigger reuse -----
-- (public.update_updated_at_column already exists)

-- ============================================================
-- CLIENTS + CONTACTS + ADDRESSES
-- ============================================================
CREATE TABLE public.clients (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  company         TEXT,
  email           TEXT,
  phone           TEXT,
  website         TEXT,
  tax_number      TEXT,
  payment_terms   TEXT NOT NULL DEFAULT 'NET_30',
  tax_treatment   TEXT NOT NULL DEFAULT 'standard',
  currency        TEXT NOT NULL DEFAULT 'AUD',
  notes           TEXT,
  tags            TEXT[] NOT NULL DEFAULT '{}',
  is_archived     BOOLEAN NOT NULL DEFAULT false,
  created_by      UUID NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_clients_org ON public.clients(organisation_id);
CREATE INDEX idx_clients_email ON public.clients(organisation_id, lower(email));

CREATE TABLE public.client_contacts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  client_id       UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  role            TEXT,
  email           TEXT,
  phone           TEXT,
  is_primary      BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_client_contacts_client ON public.client_contacts(client_id);

CREATE TABLE public.client_addresses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  client_id       UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  label           TEXT NOT NULL DEFAULT 'billing', -- billing | service | shipping
  line1           TEXT,
  line2           TEXT,
  city            TEXT,
  state           TEXT,
  postcode        TEXT,
  country         TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_client_addresses_client ON public.client_addresses(client_id);

-- ============================================================
-- PROJECTS
-- ============================================================
CREATE TABLE public.projects (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  client_id       UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  name            TEXT NOT NULL,
  description     TEXT,
  status          TEXT NOT NULL DEFAULT 'active', -- active | on_hold | complete | archived
  start_date      DATE,
  due_date        DATE,
  budget_cents    BIGINT,
  assigned_to     UUID,
  created_by      UUID NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_projects_org ON public.projects(organisation_id);
CREATE INDEX idx_projects_client ON public.projects(client_id);

-- ============================================================
-- ITEMS + INVENTORY
-- ============================================================
CREATE TABLE public.items (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id      UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  name                 TEXT NOT NULL,
  description          TEXT,
  sku                  TEXT,
  item_type            TEXT NOT NULL DEFAULT 'service', -- product | service | labor | fee
  category             TEXT,
  unit                 TEXT NOT NULL DEFAULT 'unit',
  cost_cents           BIGINT NOT NULL DEFAULT 0,
  unit_price_cents     BIGINT NOT NULL DEFAULT 0,
  tax_code             TEXT NOT NULL DEFAULT 'GST',
  default_qty          NUMERIC NOT NULL DEFAULT 1,
  stock_on_hand        NUMERIC NOT NULL DEFAULT 0,
  reorder_threshold    NUMERIC,
  supplier             TEXT,
  is_active            BOOLEAN NOT NULL DEFAULT true,
  last_used_at         TIMESTAMPTZ,
  created_by           UUID NOT NULL,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_items_org ON public.items(organisation_id);
CREATE INDEX idx_items_sku ON public.items(organisation_id, sku);

CREATE TABLE public.inventory_movements (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  item_id         UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  movement_type   TEXT NOT NULL, -- adjustment | sale | restock | return
  qty_delta       NUMERIC NOT NULL,
  reason          TEXT,
  reference_id    UUID,
  reference_type  TEXT,           -- invoice | manual | import
  created_by      UUID NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_inv_movements_item ON public.inventory_movements(item_id);

-- ============================================================
-- INVOICES + LINE ITEMS + PAYMENTS
-- ============================================================
CREATE TABLE public.invoices (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id      UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  number               TEXT NOT NULL,
  client_id            UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  project_id           UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  quote_id             UUID,
  client_snapshot      JSONB,
  status               TEXT NOT NULL DEFAULT 'draft', -- draft|sent|viewed|partially_paid|paid|overdue|cancelled|archived
  issue_date           DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date             DATE,
  sent_at              TIMESTAMPTZ,
  viewed_at            TIMESTAMPTZ,
  paid_at              TIMESTAMPTZ,
  cancelled_at         TIMESTAMPTZ,
  currency             TEXT NOT NULL DEFAULT 'AUD',
  subtotal_cents       BIGINT NOT NULL DEFAULT 0,
  discount_cents       BIGINT NOT NULL DEFAULT 0,
  tax_cents            BIGINT NOT NULL DEFAULT 0,
  total_cents          BIGINT NOT NULL DEFAULT 0,
  paid_cents           BIGINT NOT NULL DEFAULT 0,
  balance_cents        BIGINT NOT NULL DEFAULT 0,
  tax_breakdown        JSONB,
  notes                TEXT,
  internal_notes       TEXT,
  payment_instructions TEXT,
  po_number            TEXT,
  tags                 TEXT[] NOT NULL DEFAULT '{}',
  created_by           UUID NOT NULL,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (organisation_id, number)
);
CREATE INDEX idx_invoices_org_status ON public.invoices(organisation_id, status);
CREATE INDEX idx_invoices_client ON public.invoices(client_id);
CREATE INDEX idx_invoices_due ON public.invoices(organisation_id, due_date);

CREATE TABLE public.invoice_items (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id     UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  invoice_id          UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  item_id             UUID,
  sort_order          INT NOT NULL DEFAULT 0,
  description         TEXT NOT NULL,
  quantity            NUMERIC NOT NULL DEFAULT 1,
  unit                TEXT,
  unit_price_cents    BIGINT NOT NULL DEFAULT 0,
  discount_type       TEXT NOT NULL DEFAULT 'NONE',
  discount_value      NUMERIC NOT NULL DEFAULT 0,
  tax_code            TEXT NOT NULL DEFAULT 'NONE',
  tax_rate            NUMERIC NOT NULL DEFAULT 0,
  line_subtotal_cents BIGINT NOT NULL DEFAULT 0,
  line_tax_cents      BIGINT NOT NULL DEFAULT 0,
  line_total_cents    BIGINT NOT NULL DEFAULT 0,
  item_type           TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_invoice_items_invoice ON public.invoice_items(invoice_id);

CREATE TABLE public.invoice_payments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id   UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  invoice_id        UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  amount_cents      BIGINT NOT NULL,
  payment_method    TEXT NOT NULL DEFAULT 'other',
  reference         TEXT,
  paid_at           DATE NOT NULL DEFAULT CURRENT_DATE,
  notes             TEXT,
  created_by        UUID NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_invoice_payments_invoice ON public.invoice_payments(invoice_id);

-- ============================================================
-- QUOTES + LINE ITEMS
-- ============================================================
CREATE TABLE public.quotes (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id      UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  number               TEXT NOT NULL,
  client_id            UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  project_id           UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  client_snapshot      JSONB,
  status               TEXT NOT NULL DEFAULT 'draft', -- draft|sent|viewed|accepted|rejected|expired|converted
  issue_date           DATE NOT NULL DEFAULT CURRENT_DATE,
  expiry_date          DATE,
  sent_at              TIMESTAMPTZ,
  viewed_at            TIMESTAMPTZ,
  accepted_at          TIMESTAMPTZ,
  rejected_at          TIMESTAMPTZ,
  converted_at         TIMESTAMPTZ,
  converted_invoice_id UUID,
  currency             TEXT NOT NULL DEFAULT 'AUD',
  subtotal_cents       BIGINT NOT NULL DEFAULT 0,
  discount_cents       BIGINT NOT NULL DEFAULT 0,
  tax_cents            BIGINT NOT NULL DEFAULT 0,
  total_cents          BIGINT NOT NULL DEFAULT 0,
  notes                TEXT,
  internal_notes       TEXT,
  version              INT NOT NULL DEFAULT 1,
  created_by           UUID NOT NULL,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (organisation_id, number)
);
CREATE INDEX idx_quotes_org_status ON public.quotes(organisation_id, status);
CREATE INDEX idx_quotes_client ON public.quotes(client_id);

CREATE TABLE public.quote_items (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id     UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  quote_id            UUID NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,
  item_id             UUID,
  sort_order          INT NOT NULL DEFAULT 0,
  description         TEXT NOT NULL,
  quantity            NUMERIC NOT NULL DEFAULT 1,
  unit                TEXT,
  unit_price_cents    BIGINT NOT NULL DEFAULT 0,
  discount_type       TEXT NOT NULL DEFAULT 'NONE',
  discount_value      NUMERIC NOT NULL DEFAULT 0,
  tax_code            TEXT NOT NULL DEFAULT 'NONE',
  tax_rate            NUMERIC NOT NULL DEFAULT 0,
  line_subtotal_cents BIGINT NOT NULL DEFAULT 0,
  line_tax_cents      BIGINT NOT NULL DEFAULT 0,
  line_total_cents    BIGINT NOT NULL DEFAULT 0,
  is_optional         BOOLEAN NOT NULL DEFAULT false,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_quote_items_quote ON public.quote_items(quote_id);

-- ============================================================
-- CREDIT NOTES
-- ============================================================
CREATE TABLE public.credit_notes (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id   UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  number            TEXT NOT NULL,
  client_id         UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  invoice_id        UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
  status            TEXT NOT NULL DEFAULT 'draft', -- draft | issued | applied | void
  issue_date        DATE NOT NULL DEFAULT CURRENT_DATE,
  reason            TEXT,
  amount_cents      BIGINT NOT NULL DEFAULT 0,
  notes             TEXT,
  created_by        UUID NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (organisation_id, number)
);
CREATE INDEX idx_credit_notes_org ON public.credit_notes(organisation_id);

-- ============================================================
-- EXPENSES
-- ============================================================
CREATE TABLE public.expenses (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id     UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  client_id           UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  project_id          UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  category            TEXT NOT NULL DEFAULT 'general',
  description         TEXT NOT NULL,
  vendor              TEXT,
  amount_cents        BIGINT NOT NULL DEFAULT 0,
  tax_cents           BIGINT NOT NULL DEFAULT 0,
  currency            TEXT NOT NULL DEFAULT 'AUD',
  expense_date        DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method      TEXT,
  receipt_url         TEXT,
  is_billable         BOOLEAN NOT NULL DEFAULT false,
  is_reimbursable     BOOLEAN NOT NULL DEFAULT false,
  billed_invoice_id   UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
  approval_status     TEXT NOT NULL DEFAULT 'pending', -- pending | approved | rejected
  submitted_by        UUID,
  notes               TEXT,
  created_by          UUID NOT NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_expenses_org ON public.expenses(organisation_id);
CREATE INDEX idx_expenses_project ON public.expenses(project_id);

-- ============================================================
-- TIME ENTRIES
-- ============================================================
CREATE TABLE public.time_entries (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id     UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  user_id             UUID NOT NULL,
  client_id           UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  project_id          UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  description         TEXT,
  entry_date          DATE NOT NULL DEFAULT CURRENT_DATE,
  start_at            TIMESTAMPTZ,
  end_at              TIMESTAMPTZ,
  hours               NUMERIC NOT NULL DEFAULT 0,
  hourly_rate_cents   BIGINT NOT NULL DEFAULT 0,
  is_billable         BOOLEAN NOT NULL DEFAULT true,
  is_locked           BOOLEAN NOT NULL DEFAULT false,
  billed_invoice_id   UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
  approval_status     TEXT NOT NULL DEFAULT 'pending',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_time_entries_org ON public.time_entries(organisation_id);
CREATE INDEX idx_time_entries_user ON public.time_entries(user_id);
CREATE INDEX idx_time_entries_project ON public.time_entries(project_id);

-- ============================================================
-- RECURRING INVOICES
-- ============================================================
CREATE TABLE public.recurring_invoices (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id     UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  client_id           UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  template_name       TEXT NOT NULL,
  frequency           TEXT NOT NULL, -- weekly | monthly | quarterly | yearly
  interval_count      INT NOT NULL DEFAULT 1,
  start_date          DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date            DATE,
  next_run_date       DATE,
  last_run_date       DATE,
  last_run_status     TEXT, -- success | failed
  auto_send           BOOLEAN NOT NULL DEFAULT false,
  is_active           BOOLEAN NOT NULL DEFAULT true,
  template_payload    JSONB NOT NULL DEFAULT '{}',
  created_by          UUID NOT NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_recurring_org ON public.recurring_invoices(organisation_id);

-- ============================================================
-- ATTACHMENTS, NOTES, ACTIVITY, TAGS
-- ============================================================
CREATE TABLE public.attachments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  entity_type     TEXT NOT NULL, -- client | invoice | quote | project | expense
  entity_id       UUID NOT NULL,
  filename        TEXT NOT NULL,
  storage_path    TEXT NOT NULL,
  content_type    TEXT,
  size_bytes      BIGINT,
  client_visible  BOOLEAN NOT NULL DEFAULT false,
  uploaded_by     UUID NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_attachments_entity ON public.attachments(entity_type, entity_id);

CREATE TABLE public.entity_notes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  entity_type     TEXT NOT NULL,
  entity_id       UUID NOT NULL,
  body            TEXT NOT NULL,
  is_internal     BOOLEAN NOT NULL DEFAULT true,
  created_by      UUID NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_entity_notes_entity ON public.entity_notes(entity_type, entity_id);

CREATE TABLE public.activity_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  entity_type     TEXT NOT NULL,
  entity_id       UUID NOT NULL,
  action          TEXT NOT NULL, -- created | updated | sent | viewed | paid | converted | imported | ...
  actor_id        UUID,
  payload         JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_activity_org_entity ON public.activity_logs(organisation_id, entity_type, entity_id);
CREATE INDEX idx_activity_org_created ON public.activity_logs(organisation_id, created_at DESC);

-- ============================================================
-- IMPORT BATCHES
-- ============================================================
CREATE TABLE public.import_batches (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  source          TEXT NOT NULL, -- invoice2go | csv | quickbooks | xero
  entity_type     TEXT NOT NULL, -- clients | items | invoices | quotes | expenses | ...
  status          TEXT NOT NULL DEFAULT 'pending', -- pending | mapping | validating | importing | complete | failed
  total_rows      INT NOT NULL DEFAULT 0,
  success_count   INT NOT NULL DEFAULT 0,
  error_count     INT NOT NULL DEFAULT 0,
  duplicate_count INT NOT NULL DEFAULT 0,
  field_mapping   JSONB,
  duplicate_rule  TEXT NOT NULL DEFAULT 'skip', -- skip | update | duplicate
  filename        TEXT,
  started_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  created_by      UUID NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_import_batches_org ON public.import_batches(organisation_id);

CREATE TABLE public.import_rows (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  batch_id        UUID NOT NULL REFERENCES public.import_batches(id) ON DELETE CASCADE,
  row_index       INT NOT NULL,
  raw_data        JSONB NOT NULL,
  parsed_data     JSONB,
  status          TEXT NOT NULL DEFAULT 'pending', -- pending | imported | skipped | error | duplicate
  target_id       UUID,
  errors          JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_import_rows_batch ON public.import_rows(batch_id);

-- ============================================================
-- ENABLE RLS ON ALL NEW TABLES
-- ============================================================
ALTER TABLE public.clients              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_contacts      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_addresses     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_movements  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_payments     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_items          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_notes         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_entries         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_invoices   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attachments          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entity_notes         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_batches       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_rows          ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS POLICIES (uniform pattern: org members read/write)
-- Sensitive role guards (delete/cancel) restricted to admins.
-- ============================================================

-- Helper macro per table
DO $$
DECLARE
  t TEXT;
  tbls TEXT[] := ARRAY[
    'clients','client_contacts','client_addresses','projects','items',
    'inventory_movements','invoices','invoice_items','invoice_payments',
    'quotes','quote_items','credit_notes','expenses','time_entries',
    'recurring_invoices','attachments','entity_notes','activity_logs',
    'import_batches','import_rows'
  ];
BEGIN
  FOREACH t IN ARRAY tbls LOOP
    EXECUTE format($f$
      CREATE POLICY "Org members can view %1$s"
        ON public.%1$I FOR SELECT
        USING (public.is_org_member(auth.uid(), organisation_id));
    $f$, t);

    EXECUTE format($f$
      CREATE POLICY "Org members can insert %1$s"
        ON public.%1$I FOR INSERT
        WITH CHECK (public.is_org_member(auth.uid(), organisation_id));
    $f$, t);

    EXECUTE format($f$
      CREATE POLICY "Org members can update %1$s"
        ON public.%1$I FOR UPDATE
        USING (public.is_org_member(auth.uid(), organisation_id));
    $f$, t);

    EXECUTE format($f$
      CREATE POLICY "Org admins can delete %1$s"
        ON public.%1$I FOR DELETE
        USING (public.is_org_admin(auth.uid(), organisation_id));
    $f$, t);
  END LOOP;
END $$;

-- ============================================================
-- updated_at triggers for tables that have updated_at
-- ============================================================
DO $$
DECLARE
  t TEXT;
  tbls TEXT[] := ARRAY[
    'clients','client_contacts','client_addresses','projects','items',
    'invoices','quotes','credit_notes','expenses','time_entries',
    'recurring_invoices','entity_notes','import_batches'
  ];
BEGIN
  FOREACH t IN ARRAY tbls LOOP
    EXECUTE format($f$
      CREATE TRIGGER trg_%1$s_updated_at
      BEFORE UPDATE ON public.%1$I
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    $f$, t);
  END LOOP;
END $$;
