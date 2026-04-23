import { useState, useEffect, useCallback } from "react";
import { AppLayout } from "@/components/AppLayout";
import { UploadCloud, FileSpreadsheet, History, ArrowRight, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MigrationWizard } from "@/components/migration/MigrationWizard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { formatDistanceToNow } from "date-fns";

type Source = "invoice2go" | "csv";

interface ImportBatch {
  id: string;
  source: string;
  entity_type: string;
  status: string;
  total_rows: number;
  success_count: number;
  error_count: number;
  duplicate_count: number;
  filename: string | null;
  created_at: string;
  completed_at: string | null;
}

export default function Migration() {
  const { organisation } = useAuth();
  const [activeSource, setActiveSource] = useState<Source | null>(null);
  const [batches, setBatches] = useState<ImportBatch[]>([]);

  const loadBatches = useCallback(async () => {
    if (!organisation?.id) return;
    const { data } = await supabase
      .from("import_batches")
      .select("*")
      .eq("organisation_id", organisation.id)
      .order("created_at", { ascending: false })
      .limit(20);
    if (data) setBatches(data as ImportBatch[]);
  }, [organisation?.id]);

  useEffect(() => {
    loadBatches();
  }, [loadBatches]);

  return (
    <AppLayout>
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
          <UploadCloud className="h-4 w-4 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Import / Migration</h1>
          <p className="text-sm text-muted-foreground">Bring your business into Tinara in minutes</p>
        </div>
      </div>

      {!activeSource && (
        <>
          <div className="grid gap-4 md:grid-cols-3 mb-8">
            <SourceCard
              icon={FileSpreadsheet}
              title="Invoice2go export"
              description="Import clients, items and more from your Invoice2go CSV export."
              badge="Recommended"
              onClick={() => setActiveSource("invoice2go")}
            />
            <SourceCard
              icon={UploadCloud}
              title="CSV upload"
              description="Upload any CSV. Map columns to Tinara fields, validate, dedupe and import."
              onClick={() => setActiveSource("csv")}
            />
            <SourceCard
              icon={History}
              title="QuickBooks / Xero"
              description="Coming next. The migration engine is ready — connectors land in the next release."
              disabled
            />
          </div>

          <div className="mt-8">
            <h3 className="text-sm font-semibold text-foreground mb-3">Import history</h3>
            {batches.length === 0 ? (
              <div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground">
                No imports yet. Your import batches and results will appear here.
              </div>
            ) : (
              <div className="rounded-lg border border-border bg-card divide-y divide-border">
                {batches.map((b) => (
                  <BatchRow key={b.id} batch={b} />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {activeSource && (
        <MigrationWizard
          source={activeSource}
          onClose={() => {
            setActiveSource(null);
            loadBatches();
          }}
          onCompleted={loadBatches}
        />
      )}
    </AppLayout>
  );
}

function SourceCard({
  icon: Icon,
  title,
  description,
  badge,
  disabled,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  badge?: string;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`text-left rounded-lg border border-border bg-card p-5 ${
        disabled
          ? "opacity-60 cursor-not-allowed"
          : "hover:border-primary/40 transition-colors cursor-pointer"
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="h-9 w-9 rounded-md bg-secondary flex items-center justify-center">
          <Icon className="h-4 w-4 text-foreground" />
        </div>
        {badge && (
          <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary">
            {badge}
          </span>
        )}
      </div>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{description}</p>
      {!disabled && (
        <div className="mt-3 inline-flex items-center text-xs font-medium text-primary">
          Start
          <ArrowRight className="ml-1 h-3 w-3" />
        </div>
      )}
    </button>
  );
}

function BatchRow({ batch }: { batch: ImportBatch }) {
  const StatusIcon =
    batch.status === "completed"
      ? CheckCircle2
      : batch.status === "failed"
        ? AlertCircle
        : Clock;
  const statusColor =
    batch.status === "completed"
      ? "text-primary"
      : batch.status === "failed"
        ? "text-destructive"
        : "text-muted-foreground";

  return (
    <div className="flex items-center justify-between p-4">
      <div className="flex items-center gap-3 min-w-0">
        <StatusIcon className={`h-4 w-4 ${statusColor} shrink-0`} />
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {batch.filename || `${batch.entity_type} import`}
          </p>
          <p className="text-xs text-muted-foreground">
            {batch.entity_type} · {batch.source} ·{" "}
            {formatDistanceToNow(new Date(batch.created_at), { addSuffix: true })}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4 text-xs text-muted-foreground shrink-0">
        <span>
          <span className="font-semibold text-foreground">{batch.success_count}</span> imported
        </span>
        {batch.duplicate_count > 0 && (
          <span>
            <span className="font-semibold text-foreground">{batch.duplicate_count}</span> skipped
          </span>
        )}
        {batch.error_count > 0 && (
          <span className="text-destructive">
            <span className="font-semibold">{batch.error_count}</span> errors
          </span>
        )}
      </div>
    </div>
  );
}
