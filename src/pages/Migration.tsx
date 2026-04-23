import { AppLayout } from "@/components/AppLayout";
import { UploadCloud, FileSpreadsheet, History, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Migration() {
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

      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <SourceCard
          icon={FileSpreadsheet}
          title="Invoice2go export"
          description="Import clients, invoices, quotes, items and expenses directly from your Invoice2go export."
          badge="Recommended"
        />
        <SourceCard
          icon={UploadCloud}
          title="CSV upload"
          description="Upload any CSV. Map columns to Tinara fields, validate, dedupe and import."
        />
        <SourceCard
          icon={History}
          title="QuickBooks / Xero"
          description="Coming next. The migration engine is ready — connectors land in the next release."
          disabled
        />
      </div>

      <div className="rounded-lg border border-dashed border-border bg-card p-10 text-center">
        <UploadCloud className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
        <h2 className="text-lg font-semibold text-foreground">Start your first import</h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto mt-1">
          Pick a source above to begin. The 8-step wizard (upload → detect → map → validate →
          dedupe → preview → import → results) is being wired in the next update.
        </p>
        <Button className="mt-5" disabled>
          Start import
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      <div className="mt-8">
        <h3 className="text-sm font-semibold text-foreground mb-3">Import history</h3>
        <div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          No imports yet. Your import batches and results will appear here.
        </div>
      </div>
    </AppLayout>
  );
}

function SourceCard({
  icon: Icon,
  title,
  description,
  badge,
  disabled,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  badge?: string;
  disabled?: boolean;
}) {
  return (
    <div className={`rounded-lg border border-border bg-card p-5 ${disabled ? "opacity-60" : "hover:border-primary/40 transition-colors cursor-pointer"}`}>
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
    </div>
  );
}
