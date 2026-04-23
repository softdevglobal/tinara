export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          organisation_id: string
          payload: Json | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          organisation_id: string
          payload?: Json | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          organisation_id?: string
          payload?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      attachments: {
        Row: {
          client_visible: boolean
          content_type: string | null
          created_at: string
          entity_id: string
          entity_type: string
          filename: string
          id: string
          organisation_id: string
          size_bytes: number | null
          storage_path: string
          uploaded_by: string
        }
        Insert: {
          client_visible?: boolean
          content_type?: string | null
          created_at?: string
          entity_id: string
          entity_type: string
          filename: string
          id?: string
          organisation_id: string
          size_bytes?: number | null
          storage_path: string
          uploaded_by: string
        }
        Update: {
          client_visible?: boolean
          content_type?: string | null
          created_at?: string
          entity_id?: string
          entity_type?: string
          filename?: string
          id?: string
          organisation_id?: string
          size_bytes?: number | null
          storage_path?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "attachments_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      client_addresses: {
        Row: {
          city: string | null
          client_id: string
          country: string | null
          created_at: string
          id: string
          label: string
          line1: string | null
          line2: string | null
          organisation_id: string
          postcode: string | null
          state: string | null
          updated_at: string
        }
        Insert: {
          city?: string | null
          client_id: string
          country?: string | null
          created_at?: string
          id?: string
          label?: string
          line1?: string | null
          line2?: string | null
          organisation_id: string
          postcode?: string | null
          state?: string | null
          updated_at?: string
        }
        Update: {
          city?: string | null
          client_id?: string
          country?: string | null
          created_at?: string
          id?: string
          label?: string
          line1?: string | null
          line2?: string | null
          organisation_id?: string
          postcode?: string | null
          state?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_addresses_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_addresses_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      client_contacts: {
        Row: {
          client_id: string
          created_at: string
          email: string | null
          id: string
          is_primary: boolean
          name: string
          organisation_id: string
          phone: string | null
          role: string | null
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          email?: string | null
          id?: string
          is_primary?: boolean
          name: string
          organisation_id: string
          phone?: string | null
          role?: string | null
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          email?: string | null
          id?: string
          is_primary?: boolean
          name?: string
          organisation_id?: string
          phone?: string | null
          role?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_contacts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_contacts_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          company: string | null
          created_at: string
          created_by: string
          currency: string
          email: string | null
          id: string
          is_archived: boolean
          name: string
          notes: string | null
          organisation_id: string
          payment_terms: string
          phone: string | null
          tags: string[]
          tax_number: string | null
          tax_treatment: string
          updated_at: string
          website: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string
          created_by: string
          currency?: string
          email?: string | null
          id?: string
          is_archived?: boolean
          name: string
          notes?: string | null
          organisation_id: string
          payment_terms?: string
          phone?: string | null
          tags?: string[]
          tax_number?: string | null
          tax_treatment?: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string
          created_by?: string
          currency?: string
          email?: string | null
          id?: string
          is_archived?: boolean
          name?: string
          notes?: string | null
          organisation_id?: string
          payment_terms?: string
          phone?: string | null
          tags?: string[]
          tax_number?: string | null
          tax_treatment?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_notes: {
        Row: {
          amount_cents: number
          client_id: string | null
          created_at: string
          created_by: string
          id: string
          invoice_id: string | null
          issue_date: string
          notes: string | null
          number: string
          organisation_id: string
          reason: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount_cents?: number
          client_id?: string | null
          created_at?: string
          created_by: string
          id?: string
          invoice_id?: string | null
          issue_date?: string
          notes?: string | null
          number: string
          organisation_id: string
          reason?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          client_id?: string | null
          created_at?: string
          created_by?: string
          id?: string
          invoice_id?: string | null
          issue_date?: string
          notes?: string | null
          number?: string
          organisation_id?: string
          reason?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_notes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_notes_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_notes_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      entity_notes: {
        Row: {
          body: string
          created_at: string
          created_by: string
          entity_id: string
          entity_type: string
          id: string
          is_internal: boolean
          organisation_id: string
          updated_at: string
        }
        Insert: {
          body: string
          created_at?: string
          created_by: string
          entity_id: string
          entity_type: string
          id?: string
          is_internal?: boolean
          organisation_id: string
          updated_at?: string
        }
        Update: {
          body?: string
          created_at?: string
          created_by?: string
          entity_id?: string
          entity_type?: string
          id?: string
          is_internal?: boolean
          organisation_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "entity_notes_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount_cents: number
          approval_status: string
          billed_invoice_id: string | null
          category: string
          client_id: string | null
          created_at: string
          created_by: string
          currency: string
          description: string
          expense_date: string
          id: string
          is_billable: boolean
          is_reimbursable: boolean
          notes: string | null
          organisation_id: string
          payment_method: string | null
          project_id: string | null
          receipt_url: string | null
          submitted_by: string | null
          tax_cents: number
          updated_at: string
          vendor: string | null
        }
        Insert: {
          amount_cents?: number
          approval_status?: string
          billed_invoice_id?: string | null
          category?: string
          client_id?: string | null
          created_at?: string
          created_by: string
          currency?: string
          description: string
          expense_date?: string
          id?: string
          is_billable?: boolean
          is_reimbursable?: boolean
          notes?: string | null
          organisation_id: string
          payment_method?: string | null
          project_id?: string | null
          receipt_url?: string | null
          submitted_by?: string | null
          tax_cents?: number
          updated_at?: string
          vendor?: string | null
        }
        Update: {
          amount_cents?: number
          approval_status?: string
          billed_invoice_id?: string | null
          category?: string
          client_id?: string | null
          created_at?: string
          created_by?: string
          currency?: string
          description?: string
          expense_date?: string
          id?: string
          is_billable?: boolean
          is_reimbursable?: boolean
          notes?: string | null
          organisation_id?: string
          payment_method?: string | null
          project_id?: string | null
          receipt_url?: string | null
          submitted_by?: string | null
          tax_cents?: number
          updated_at?: string
          vendor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_billed_invoice_id_fkey"
            columns: ["billed_invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      import_batches: {
        Row: {
          completed_at: string | null
          created_at: string
          created_by: string
          duplicate_count: number
          duplicate_rule: string
          entity_type: string
          error_count: number
          field_mapping: Json | null
          filename: string | null
          id: string
          organisation_id: string
          source: string
          started_at: string | null
          status: string
          success_count: number
          total_rows: number
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          created_by: string
          duplicate_count?: number
          duplicate_rule?: string
          entity_type: string
          error_count?: number
          field_mapping?: Json | null
          filename?: string | null
          id?: string
          organisation_id: string
          source: string
          started_at?: string | null
          status?: string
          success_count?: number
          total_rows?: number
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          created_by?: string
          duplicate_count?: number
          duplicate_rule?: string
          entity_type?: string
          error_count?: number
          field_mapping?: Json | null
          filename?: string | null
          id?: string
          organisation_id?: string
          source?: string
          started_at?: string | null
          status?: string
          success_count?: number
          total_rows?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "import_batches_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      import_rows: {
        Row: {
          batch_id: string
          created_at: string
          errors: Json | null
          id: string
          organisation_id: string
          parsed_data: Json | null
          raw_data: Json
          row_index: number
          status: string
          target_id: string | null
        }
        Insert: {
          batch_id: string
          created_at?: string
          errors?: Json | null
          id?: string
          organisation_id: string
          parsed_data?: Json | null
          raw_data: Json
          row_index: number
          status?: string
          target_id?: string | null
        }
        Update: {
          batch_id?: string
          created_at?: string
          errors?: Json | null
          id?: string
          organisation_id?: string
          parsed_data?: Json | null
          raw_data?: Json
          row_index?: number
          status?: string
          target_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "import_rows_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "import_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "import_rows_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_movements: {
        Row: {
          created_at: string
          created_by: string
          id: string
          item_id: string
          movement_type: string
          organisation_id: string
          qty_delta: number
          reason: string | null
          reference_id: string | null
          reference_type: string | null
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          item_id: string
          movement_type: string
          organisation_id: string
          qty_delta: number
          reason?: string | null
          reference_id?: string | null
          reference_type?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          item_id?: string
          movement_type?: string
          organisation_id?: string
          qty_delta?: number
          reason?: string | null
          reference_id?: string | null
          reference_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_movements_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_items: {
        Row: {
          created_at: string
          description: string
          discount_type: string
          discount_value: number
          id: string
          invoice_id: string
          item_id: string | null
          item_type: string | null
          line_subtotal_cents: number
          line_tax_cents: number
          line_total_cents: number
          organisation_id: string
          quantity: number
          sort_order: number
          tax_code: string
          tax_rate: number
          unit: string | null
          unit_price_cents: number
        }
        Insert: {
          created_at?: string
          description: string
          discount_type?: string
          discount_value?: number
          id?: string
          invoice_id: string
          item_id?: string | null
          item_type?: string | null
          line_subtotal_cents?: number
          line_tax_cents?: number
          line_total_cents?: number
          organisation_id: string
          quantity?: number
          sort_order?: number
          tax_code?: string
          tax_rate?: number
          unit?: string | null
          unit_price_cents?: number
        }
        Update: {
          created_at?: string
          description?: string
          discount_type?: string
          discount_value?: number
          id?: string
          invoice_id?: string
          item_id?: string | null
          item_type?: string | null
          line_subtotal_cents?: number
          line_tax_cents?: number
          line_total_cents?: number
          organisation_id?: string
          quantity?: number
          sort_order?: number
          tax_code?: string
          tax_rate?: number
          unit?: string | null
          unit_price_cents?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_payments: {
        Row: {
          amount_cents: number
          created_at: string
          created_by: string
          id: string
          invoice_id: string
          notes: string | null
          organisation_id: string
          paid_at: string
          payment_method: string
          reference: string | null
        }
        Insert: {
          amount_cents: number
          created_at?: string
          created_by: string
          id?: string
          invoice_id: string
          notes?: string | null
          organisation_id: string
          paid_at?: string
          payment_method?: string
          reference?: string | null
        }
        Update: {
          amount_cents?: number
          created_at?: string
          created_by?: string
          id?: string
          invoice_id?: string
          notes?: string | null
          organisation_id?: string
          paid_at?: string
          payment_method?: string
          reference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoice_payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_payments_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          balance_cents: number
          cancelled_at: string | null
          client_id: string | null
          client_snapshot: Json | null
          created_at: string
          created_by: string
          currency: string
          discount_cents: number
          due_date: string | null
          id: string
          internal_notes: string | null
          issue_date: string
          notes: string | null
          number: string
          organisation_id: string
          paid_at: string | null
          paid_cents: number
          payment_instructions: string | null
          po_number: string | null
          project_id: string | null
          quote_id: string | null
          sent_at: string | null
          status: string
          subtotal_cents: number
          tags: string[]
          tax_breakdown: Json | null
          tax_cents: number
          total_cents: number
          updated_at: string
          viewed_at: string | null
        }
        Insert: {
          balance_cents?: number
          cancelled_at?: string | null
          client_id?: string | null
          client_snapshot?: Json | null
          created_at?: string
          created_by: string
          currency?: string
          discount_cents?: number
          due_date?: string | null
          id?: string
          internal_notes?: string | null
          issue_date?: string
          notes?: string | null
          number: string
          organisation_id: string
          paid_at?: string | null
          paid_cents?: number
          payment_instructions?: string | null
          po_number?: string | null
          project_id?: string | null
          quote_id?: string | null
          sent_at?: string | null
          status?: string
          subtotal_cents?: number
          tags?: string[]
          tax_breakdown?: Json | null
          tax_cents?: number
          total_cents?: number
          updated_at?: string
          viewed_at?: string | null
        }
        Update: {
          balance_cents?: number
          cancelled_at?: string | null
          client_id?: string | null
          client_snapshot?: Json | null
          created_at?: string
          created_by?: string
          currency?: string
          discount_cents?: number
          due_date?: string | null
          id?: string
          internal_notes?: string | null
          issue_date?: string
          notes?: string | null
          number?: string
          organisation_id?: string
          paid_at?: string | null
          paid_cents?: number
          payment_instructions?: string | null
          po_number?: string | null
          project_id?: string | null
          quote_id?: string | null
          sent_at?: string | null
          status?: string
          subtotal_cents?: number
          tags?: string[]
          tax_breakdown?: Json | null
          tax_cents?: number
          total_cents?: number
          updated_at?: string
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      items: {
        Row: {
          category: string | null
          cost_cents: number
          created_at: string
          created_by: string
          default_qty: number
          description: string | null
          id: string
          is_active: boolean
          item_type: string
          last_used_at: string | null
          name: string
          organisation_id: string
          reorder_threshold: number | null
          sku: string | null
          stock_on_hand: number
          supplier: string | null
          tax_code: string
          unit: string
          unit_price_cents: number
          updated_at: string
        }
        Insert: {
          category?: string | null
          cost_cents?: number
          created_at?: string
          created_by: string
          default_qty?: number
          description?: string | null
          id?: string
          is_active?: boolean
          item_type?: string
          last_used_at?: string | null
          name: string
          organisation_id: string
          reorder_threshold?: number | null
          sku?: string | null
          stock_on_hand?: number
          supplier?: string | null
          tax_code?: string
          unit?: string
          unit_price_cents?: number
          updated_at?: string
        }
        Update: {
          category?: string | null
          cost_cents?: number
          created_at?: string
          created_by?: string
          default_qty?: number
          description?: string | null
          id?: string
          is_active?: boolean
          item_type?: string
          last_used_at?: string | null
          name?: string
          organisation_id?: string
          reorder_threshold?: number | null
          sku?: string | null
          stock_on_hand?: number
          supplier?: string | null
          tax_code?: string
          unit?: string
          unit_price_cents?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "items_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      organisations: {
        Row: {
          created_at: string
          created_by: string
          currency: string
          id: string
          logo_url: string | null
          name: string
          slug: string | null
          timezone: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          currency?: string
          id?: string
          logo_url?: string | null
          name: string
          slug?: string | null
          timezone?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          currency?: string
          id?: string
          logo_url?: string | null
          name?: string
          slug?: string | null
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          default_organisation_id: string | null
          display_name: string | null
          email: string
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          default_organisation_id?: string | null
          display_name?: string | null
          email: string
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          default_organisation_id?: string | null
          display_name?: string | null
          email?: string
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_default_organisation_id_fkey"
            columns: ["default_organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          assigned_to: string | null
          budget_cents: number | null
          client_id: string | null
          created_at: string
          created_by: string
          description: string | null
          due_date: string | null
          id: string
          name: string
          organisation_id: string
          start_date: string | null
          status: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          budget_cents?: number | null
          client_id?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          due_date?: string | null
          id?: string
          name: string
          organisation_id: string
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          budget_cents?: number | null
          client_id?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          due_date?: string | null
          id?: string
          name?: string
          organisation_id?: string
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_items: {
        Row: {
          created_at: string
          description: string
          discount_type: string
          discount_value: number
          id: string
          is_optional: boolean
          item_id: string | null
          line_subtotal_cents: number
          line_tax_cents: number
          line_total_cents: number
          organisation_id: string
          quantity: number
          quote_id: string
          sort_order: number
          tax_code: string
          tax_rate: number
          unit: string | null
          unit_price_cents: number
        }
        Insert: {
          created_at?: string
          description: string
          discount_type?: string
          discount_value?: number
          id?: string
          is_optional?: boolean
          item_id?: string | null
          line_subtotal_cents?: number
          line_tax_cents?: number
          line_total_cents?: number
          organisation_id: string
          quantity?: number
          quote_id: string
          sort_order?: number
          tax_code?: string
          tax_rate?: number
          unit?: string | null
          unit_price_cents?: number
        }
        Update: {
          created_at?: string
          description?: string
          discount_type?: string
          discount_value?: number
          id?: string
          is_optional?: boolean
          item_id?: string | null
          line_subtotal_cents?: number
          line_tax_cents?: number
          line_total_cents?: number
          organisation_id?: string
          quantity?: number
          quote_id?: string
          sort_order?: number
          tax_code?: string
          tax_rate?: number
          unit?: string | null
          unit_price_cents?: number
        }
        Relationships: [
          {
            foreignKeyName: "quote_items_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_items_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          accepted_at: string | null
          client_id: string | null
          client_snapshot: Json | null
          converted_at: string | null
          converted_invoice_id: string | null
          created_at: string
          created_by: string
          currency: string
          discount_cents: number
          expiry_date: string | null
          id: string
          internal_notes: string | null
          issue_date: string
          notes: string | null
          number: string
          organisation_id: string
          project_id: string | null
          rejected_at: string | null
          sent_at: string | null
          status: string
          subtotal_cents: number
          tax_cents: number
          total_cents: number
          updated_at: string
          version: number
          viewed_at: string | null
        }
        Insert: {
          accepted_at?: string | null
          client_id?: string | null
          client_snapshot?: Json | null
          converted_at?: string | null
          converted_invoice_id?: string | null
          created_at?: string
          created_by: string
          currency?: string
          discount_cents?: number
          expiry_date?: string | null
          id?: string
          internal_notes?: string | null
          issue_date?: string
          notes?: string | null
          number: string
          organisation_id: string
          project_id?: string | null
          rejected_at?: string | null
          sent_at?: string | null
          status?: string
          subtotal_cents?: number
          tax_cents?: number
          total_cents?: number
          updated_at?: string
          version?: number
          viewed_at?: string | null
        }
        Update: {
          accepted_at?: string | null
          client_id?: string | null
          client_snapshot?: Json | null
          converted_at?: string | null
          converted_invoice_id?: string | null
          created_at?: string
          created_by?: string
          currency?: string
          discount_cents?: number
          expiry_date?: string | null
          id?: string
          internal_notes?: string | null
          issue_date?: string
          notes?: string | null
          number?: string
          organisation_id?: string
          project_id?: string | null
          rejected_at?: string | null
          sent_at?: string | null
          status?: string
          subtotal_cents?: number
          tax_cents?: number
          total_cents?: number
          updated_at?: string
          version?: number
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      recurring_invoices: {
        Row: {
          auto_send: boolean
          client_id: string | null
          created_at: string
          created_by: string
          end_date: string | null
          frequency: string
          id: string
          interval_count: number
          is_active: boolean
          last_run_date: string | null
          last_run_status: string | null
          next_run_date: string | null
          organisation_id: string
          start_date: string
          template_name: string
          template_payload: Json
          updated_at: string
        }
        Insert: {
          auto_send?: boolean
          client_id?: string | null
          created_at?: string
          created_by: string
          end_date?: string | null
          frequency: string
          id?: string
          interval_count?: number
          is_active?: boolean
          last_run_date?: string | null
          last_run_status?: string | null
          next_run_date?: string | null
          organisation_id: string
          start_date?: string
          template_name: string
          template_payload?: Json
          updated_at?: string
        }
        Update: {
          auto_send?: boolean
          client_id?: string | null
          created_at?: string
          created_by?: string
          end_date?: string | null
          frequency?: string
          id?: string
          interval_count?: number
          is_active?: boolean
          last_run_date?: string | null
          last_run_status?: string | null
          next_run_date?: string | null
          organisation_id?: string
          start_date?: string
          template_name?: string
          template_payload?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recurring_invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_invoices_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      team_memberships: {
        Row: {
          created_at: string
          id: string
          invited_by: string | null
          organisation_id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          invited_by?: string | null
          organisation_id: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          invited_by?: string | null
          organisation_id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_memberships_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      time_entries: {
        Row: {
          approval_status: string
          billed_invoice_id: string | null
          client_id: string | null
          created_at: string
          description: string | null
          end_at: string | null
          entry_date: string
          hourly_rate_cents: number
          hours: number
          id: string
          is_billable: boolean
          is_locked: boolean
          organisation_id: string
          project_id: string | null
          start_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          approval_status?: string
          billed_invoice_id?: string | null
          client_id?: string | null
          created_at?: string
          description?: string | null
          end_at?: string | null
          entry_date?: string
          hourly_rate_cents?: number
          hours?: number
          id?: string
          is_billable?: boolean
          is_locked?: boolean
          organisation_id: string
          project_id?: string | null
          start_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          approval_status?: string
          billed_invoice_id?: string | null
          client_id?: string | null
          created_at?: string
          description?: string | null
          end_at?: string | null
          entry_date?: string
          hourly_rate_cents?: number
          hours?: number
          id?: string
          is_billable?: boolean
          is_locked?: boolean
          organisation_id?: string
          project_id?: string | null
          start_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_entries_billed_invoice_id_fkey"
            columns: ["billed_invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _org_id: string; _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _org_id: string
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_org_admin: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
      is_org_member: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "owner" | "admin" | "finance" | "staff" | "viewer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["owner", "admin", "finance", "staff", "viewer"],
    },
  },
} as const
