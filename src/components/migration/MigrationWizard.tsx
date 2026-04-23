import { useState, useMemo, useCallback } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  UploadCloud,
  FileSpreadsheet,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { parseCsv, suggestField, type ParsedCsv } from "@/lib/csv-parser";
import {
  ENTITY_FIELDS,
  ENTITY_LABELS,
  parsePriceToCents,
  parseNumber,
  type ImportEntity,
} from "@/lib/import-schemas";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

type Source = "invoice2go" | "csv";
type DuplicateRule = "skip" | "update" | "create";
type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

interface MigrationWizardProps {
  source: Source;
  onClose: () => void;
  onCompleted?: () => void;
}

interface ValidatedRow {
  rowIndex: number;
  raw: Record<string, string>;
  parsed: Record<string, unknown>;
  errors: string[];
  isDuplicate: boolean;
  duplicateOfId?: string;
}

const STEP_LABELS = [
  "Upload",
  "Detect",
  "Map",
  "Validate",
  "Dedupe",
  "Preview",
  "Import",
  "Results",
];

export function MigrationWizard({ source, onClose, onCompleted }: MigrationWizardProps) {
  const { user, organisation } = useAuth();
  const currentOrgId = organisation?.id ?? null;

  const [step, setStep] = useState<Step>(1);
  const [entity, setEntity] = useState<ImportEntity>("clients");
  const [filename, setFilename] = useState<string>("");
  const [parsed, setParsed] = useState<ParsedCsv | null>(null);
  const [mapping, setMapping] = useState<Record<string, string>>({}); // header -> tinara key
  const [duplicateRule, setDuplicateRule] = useState<DuplicateRule>("skip");
  const [validated, setValidated] = useState<ValidatedRow[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [results, setResults] = useState<{
    success: number;
    skipped: number;
    errors: number;
    batchId?: string;
  } | null>(null);

  const fieldSpecs = ENTITY_FIELDS[entity];

  /* ---------- Step 1: Upload ---------- */

  const handleFile = useCallback(
    async (file: File) => {
      const text = await file.text();
      const result = parseCsv(text);
      setFilename(file.name);
      setParsed(result);

      // auto-map using suggestField
      const auto: Record<string, string> = {};
      result.headers.forEach((h) => {
        const suggested = suggestField(h, fieldSpecs);
        if (suggested) auto[h] = suggested;
      });
      setMapping(auto);
      setStep(2);
    },
    [fieldSpecs]
  );

  /* ---------- Step 4: Validate + Dedupe ---------- */

  const runValidation = useCallback(async () => {
    if (!parsed || !currentOrgId) return;

    // Build inverse mapping: tinara key -> header
    const inverse: Record<string, string> = {};
    Object.entries(mapping).forEach(([header, key]) => {
      if (key && key !== "_skip") inverse[key] = header;
    });

    // Required field check
    const missingRequired = fieldSpecs
      .filter((f) => f.required && !inverse[f.key])
      .map((f) => f.label);
    if (missingRequired.length) {
      toast({
        title: "Mapping incomplete",
        description: `Map these required fields: ${missingRequired.join(", ")}`,
        variant: "destructive",
      });
      return;
    }

    // Fetch existing rows for duplicate detection
    let existing: { id: string; key: string }[] = [];
    if (entity === "clients") {
      const { data } = await supabase
        .from("clients")
        .select("id, email, name, company")
        .eq("organisation_id", currentOrgId);
      existing =
        data?.map((r) => ({
          id: r.id,
          key: (r.email || `${r.name}|${r.company || ""}`).toLowerCase(),
        })) || [];
    } else if (entity === "items") {
      const { data } = await supabase
        .from("items")
        .select("id, sku, name")
        .eq("organisation_id", currentOrgId);
      existing =
        data?.map((r) => ({
          id: r.id,
          key: (r.sku || r.name).toLowerCase(),
        })) || [];
    }
    const existingMap = new Map(existing.map((r) => [r.key, r.id]));

    const rows: ValidatedRow[] = parsed.records.map((rec, idx) => {
      const errors: string[] = [];
      const parsedRow: Record<string, unknown> = {};

      for (const spec of fieldSpecs) {
        const header = inverse[spec.key];
        const raw = header ? (rec[header] ?? "").trim() : "";

        if (spec.required && !raw) {
          errors.push(`${spec.label} is required`);
          continue;
        }
        if (!raw) continue;

        if (spec.key === "unit_price" || spec.key === "cost") {
          const cents = parsePriceToCents(raw);
          if (cents == null) {
            errors.push(`${spec.label} is not a valid number`);
          } else {
            parsedRow[spec.key === "unit_price" ? "unit_price_cents" : "cost_cents"] = cents;
          }
        } else if (spec.key === "stock_on_hand") {
          const n = parseNumber(raw);
          if (n == null) errors.push(`${spec.label} is not a number`);
          else parsedRow.stock_on_hand = n;
        } else if (spec.key === "email") {
          if (raw && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw)) {
            errors.push("Email format invalid");
          } else {
            parsedRow.email = raw;
          }
        } else {
          parsedRow[spec.key] = raw;
        }
      }

      // Duplicate check
      let isDuplicate = false;
      let duplicateOfId: string | undefined;
      if (entity === "clients") {
        const key = (
          (parsedRow.email as string) ||
          `${parsedRow.name as string}|${(parsedRow.company as string) || ""}`
        ).toLowerCase();
        if (existingMap.has(key)) {
          isDuplicate = true;
          duplicateOfId = existingMap.get(key);
        }
      } else if (entity === "items") {
        const key = ((parsedRow.sku as string) || (parsedRow.name as string) || "").toLowerCase();
        if (existingMap.has(key)) {
          isDuplicate = true;
          duplicateOfId = existingMap.get(key);
        }
      }

      return { rowIndex: idx + 2, raw: rec, parsed: parsedRow, errors, isDuplicate, duplicateOfId };
    });

    setValidated(rows);
    setStep(5);
  }, [parsed, mapping, fieldSpecs, entity, currentOrgId, toast]);

  /* ---------- Step 7: Run import ---------- */

  const runImport = useCallback(async () => {
    if (!currentOrgId || !user || !parsed) return;
    setIsImporting(true);
    setImportProgress(0);
    setStep(7);

    // 1. Create batch row
    const { data: batch, error: batchErr } = await supabase
      .from("import_batches")
      .insert({
        organisation_id: currentOrgId,
        created_by: user.id,
        source,
        entity_type: entity,
        status: "in_progress",
        total_rows: validated.length,
        filename,
        duplicate_rule: duplicateRule,
        field_mapping: mapping,
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (batchErr || !batch) {
      toast({ title: "Import failed", description: batchErr?.message, variant: "destructive" });
      setIsImporting(false);
      return;
    }

    let successCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    const total = validated.length;

    // 2. Process each row
    for (let i = 0; i < validated.length; i++) {
      const row = validated[i];

      if (row.errors.length) {
        errorCount++;
      } else if (row.isDuplicate && duplicateRule === "skip") {
        skippedCount++;
      } else {
        try {
          if (entity === "clients") {
            const payload = {
              organisation_id: currentOrgId,
              created_by: user.id,
              name: (row.parsed.name as string) || "Unnamed",
              company: (row.parsed.company as string) || null,
              email: (row.parsed.email as string) || null,
              phone: (row.parsed.phone as string) || null,
              website: (row.parsed.website as string) || null,
              tax_number: (row.parsed.tax_number as string) || null,
              notes: (row.parsed.notes as string) || null,
            };
            if (row.isDuplicate && duplicateRule === "update" && row.duplicateOfId) {
              await supabase.from("clients").update(payload).eq("id", row.duplicateOfId);
            } else {
              await supabase.from("clients").insert(payload);
            }
          } else if (entity === "items") {
            const payload = {
              organisation_id: currentOrgId,
              created_by: user.id,
              name: (row.parsed.name as string) || "Unnamed",
              sku: (row.parsed.sku as string) || null,
              description: (row.parsed.description as string) || null,
              category: (row.parsed.category as string) || null,
              unit: (row.parsed.unit as string) || "unit",
              unit_price_cents: (row.parsed.unit_price_cents as number) ?? 0,
              cost_cents: (row.parsed.cost_cents as number) ?? 0,
              stock_on_hand: (row.parsed.stock_on_hand as number) ?? 0,
            };
            if (row.isDuplicate && duplicateRule === "update" && row.duplicateOfId) {
              await supabase.from("items").update(payload).eq("id", row.duplicateOfId);
            } else {
              await supabase.from("items").insert(payload);
            }
          }
          successCount++;
        } catch {
          errorCount++;
        }
      }

      // Persist row outcome
      await supabase.from("import_rows").insert({
        organisation_id: currentOrgId,
        batch_id: batch.id,
        row_index: row.rowIndex,
        raw_data: row.raw,
        parsed_data: row.parsed,
        errors: row.errors.length ? { messages: row.errors } : null,
        status: row.errors.length
          ? "error"
          : row.isDuplicate && duplicateRule === "skip"
            ? "skipped"
            : "imported",
      });

      setImportProgress(Math.round(((i + 1) / total) * 100));
    }

    // 3. Finalize batch
    await supabase
      .from("import_batches")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        success_count: successCount,
        error_count: errorCount,
        duplicate_count: skippedCount,
      })
      .eq("id", batch.id);

    setResults({ success: successCount, skipped: skippedCount, errors: errorCount, batchId: batch.id });
    setIsImporting(false);
    setStep(8);
    onCompleted?.();
  }, [currentOrgId, user, parsed, validated, entity, source, filename, duplicateRule, mapping, toast, onCompleted]);

  /* ---------- Render ---------- */

  return (
    <div className="rounded-lg border border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary">
            <FileSpreadsheet className="h-4 w-4 text-foreground" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">
              {source === "invoice2go" ? "Invoice2go import" : "CSV import"}
            </h2>
            <p className="text-xs text-muted-foreground">
              Step {step} of 8 — {STEP_LABELS[step - 1]}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-1 border-b border-border px-6 py-3">
        {STEP_LABELS.map((label, idx) => {
          const n = (idx + 1) as Step;
          const active = step === n;
          const done = step > n;
          return (
            <div key={label} className="flex items-center gap-1 flex-1">
              <div
                className={cn(
                  "h-1.5 flex-1 rounded-full transition-colors",
                  done ? "bg-primary" : active ? "bg-primary/60" : "bg-muted"
                )}
              />
            </div>
          );
        })}
      </div>

      <div className="p-6">
        {/* Step 1: Upload */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <Label>What are you importing?</Label>
              <Select value={entity} onValueChange={(v) => setEntity(v as ImportEntity)}>
                <SelectTrigger className="mt-2 w-full md:w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="clients">{ENTITY_LABELS.clients}</SelectItem>
                  <SelectItem value="items">{ENTITY_LABELS.items}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-border bg-muted/40 p-12 hover:border-primary/40 hover:bg-muted/60 transition-colors">
              <UploadCloud className="h-10 w-10 text-muted-foreground" />
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">Drop your CSV here</p>
                <p className="text-xs text-muted-foreground">or click to browse</p>
              </div>
              <Input
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
              />
            </label>
          </div>
        )}

        {/* Step 2: Detect */}
        {step === 2 && parsed && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-md bg-muted/50 p-4">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-foreground">{filename}</p>
                <p className="text-muted-foreground">
                  {parsed.headers.length} columns detected · {parsed.records.length} data rows
                </p>
              </div>
            </div>
            <div className="rounded-md border border-border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {parsed.headers.slice(0, 6).map((h) => (
                      <TableHead key={h}>{h}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsed.records.slice(0, 3).map((r, i) => (
                    <TableRow key={i}>
                      {parsed.headers.slice(0, 6).map((h) => (
                        <TableCell key={h} className="text-xs">{r[h]}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Step 3: Map */}
        {step === 3 && parsed && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Match each column from your file to a Tinara field. Required fields are marked with *.
            </p>
            <div className="rounded-md border border-border divide-y divide-border">
              {parsed.headers.map((header) => (
                <div key={header} className="grid grid-cols-2 gap-4 p-3 items-center">
                  <div>
                    <p className="text-sm font-medium text-foreground">{header}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {parsed.records[0]?.[header] || "—"}
                    </p>
                  </div>
                  <Select
                    value={mapping[header] || "_skip"}
                    onValueChange={(v) => setMapping({ ...mapping, [header]: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_skip">— Don't import —</SelectItem>
                      {fieldSpecs.map((f) => (
                        <SelectItem key={f.key} value={f.key}>
                          {f.label}
                          {f.required && " *"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Validate trigger */}
        {step === 4 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Tinara will check every row against your mapping and flag formatting issues
              before any data is written.
            </p>
            <Button onClick={runValidation}>
              Run validation
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Step 5: Dedupe */}
        {step === 5 && (
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-3">
              <StatTile label="Valid rows" value={validated.filter((r) => !r.errors.length).length} />
              <StatTile label="Errors" value={validated.filter((r) => r.errors.length).length} tone="destructive" />
              <StatTile label="Duplicates" value={validated.filter((r) => r.isDuplicate).length} tone="warning" />
            </div>
            <div>
              <Label>How should we handle duplicates?</Label>
              <RadioGroup
                value={duplicateRule}
                onValueChange={(v) => setDuplicateRule(v as DuplicateRule)}
                className="mt-2 space-y-2"
              >
                <label className="flex items-start gap-3 rounded-md border border-border p-3 cursor-pointer">
                  <RadioGroupItem value="skip" className="mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Skip duplicates</p>
                    <p className="text-xs text-muted-foreground">Existing records stay untouched.</p>
                  </div>
                </label>
                <label className="flex items-start gap-3 rounded-md border border-border p-3 cursor-pointer">
                  <RadioGroupItem value="update" className="mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Update duplicates</p>
                    <p className="text-xs text-muted-foreground">Overwrite existing records with imported data.</p>
                  </div>
                </label>
                <label className="flex items-start gap-3 rounded-md border border-border p-3 cursor-pointer">
                  <RadioGroupItem value="create" className="mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Create duplicates anyway</p>
                    <p className="text-xs text-muted-foreground">Insert as new records regardless.</p>
                  </div>
                </label>
              </RadioGroup>
            </div>
          </div>
        )}

        {/* Step 6: Preview */}
        {step === 6 && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Final preview. Rows with errors will be skipped automatically.
            </p>
            <div className="max-h-96 overflow-auto rounded-md border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Row</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Preview</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {validated.slice(0, 50).map((r) => (
                    <TableRow key={r.rowIndex}>
                      <TableCell className="text-xs text-muted-foreground">{r.rowIndex}</TableCell>
                      <TableCell>
                        {r.errors.length ? (
                          <span className="inline-flex items-center gap-1 text-xs text-destructive">
                            <AlertCircle className="h-3 w-3" /> {r.errors[0]}
                          </span>
                        ) : r.isDuplicate ? (
                          <span className="text-xs text-warning-foreground bg-warning/20 px-2 py-0.5 rounded">
                            Duplicate · {duplicateRule}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-primary">
                            <CheckCircle2 className="h-3 w-3" /> Ready
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs truncate max-w-md">
                        {(r.parsed.name as string) || (r.parsed.sku as string) || "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {validated.length > 50 && (
              <p className="text-xs text-muted-foreground">
                Showing first 50 of {validated.length} rows.
              </p>
            )}
          </div>
        )}

        {/* Step 7: Importing */}
        {step === 7 && (
          <div className="space-y-4 py-8 text-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
            <div>
              <p className="text-sm font-medium text-foreground">Importing your data…</p>
              <p className="text-xs text-muted-foreground mt-1">{importProgress}% complete</p>
            </div>
            <Progress value={importProgress} className="max-w-md mx-auto" />
          </div>
        )}

        {/* Step 8: Results */}
        {step === 8 && results && (
          <div className="space-y-4 py-4 text-center">
            <CheckCircle2 className="h-12 w-12 text-primary mx-auto" />
            <div>
              <h3 className="text-lg font-semibold text-foreground">Import complete</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {results.success} imported · {results.skipped} skipped · {results.errors} errors
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-3 max-w-xl mx-auto">
              <StatTile label="Imported" value={results.success} tone="success" />
              <StatTile label="Skipped" value={results.skipped} tone="warning" />
              <StatTile label="Errors" value={results.errors} tone="destructive" />
            </div>
            <Button onClick={onClose}>Done</Button>
          </div>
        )}
      </div>

      {/* Footer */}
      {step > 1 && step < 7 && (
        <div className="flex items-center justify-between border-t border-border px-6 py-4">
          <Button variant="outline" onClick={() => setStep((s) => Math.max(1, s - 1) as Step)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          {step < 4 && (
            <Button
              onClick={() => setStep((s) => (s + 1) as Step)}
              disabled={step === 2 && !parsed}
            >
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
          {step === 5 && (
            <Button onClick={() => setStep(6)}>
              Continue to preview
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
          {step === 6 && (
            <Button
              onClick={runImport}
              disabled={isImporting || validated.every((r) => r.errors.length)}
            >
              Start import
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

function StatTile({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number;
  tone?: "default" | "destructive" | "warning" | "success";
}) {
  const toneClass = {
    default: "border-border",
    destructive: "border-destructive/30 bg-destructive/5",
    warning: "border-warning/30 bg-warning/5",
    success: "border-primary/30 bg-primary/5",
  }[tone];
  return (
    <div className={cn("rounded-md border p-3 text-center", toneClass)}>
      <p className="text-2xl font-semibold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}
