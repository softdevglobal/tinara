import { useState } from "react";
import { ArrowLeft, Download, FileSpreadsheet, Mail, Clock, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSettings } from "@/context/SettingsContext";
import { useToast } from "@/hooks/use-toast";
import { AuditAction, AuditLog } from "@/types/tax-settings";
import { format } from "date-fns";

type ExportType = "invoices" | "clients" | "items" | "payments";

const EXPORT_OPTIONS: { value: ExportType; label: string; description: string }[] = [
  { value: "invoices", label: "Invoices", description: "All invoices with line items and totals" },
  { value: "clients", label: "Clients", description: "Client details and contact information" },
  { value: "items", label: "Items", description: "Product/service catalog with prices" },
  { value: "payments", label: "Payments", description: "Payment records and transactions" },
];

const EXPORT_ACTION_MAP: Record<ExportType, AuditAction> = {
  invoices: "EXPORT_INVOICES",
  clients: "EXPORT_CLIENTS",
  items: "EXPORT_ITEMS",
  payments: "EXPORT_PAYMENTS",
};

const ExportSettings = () => {
  const { auditLogs, addAuditLog } = useSettings();
  const { toast } = useToast();
  
  const [selectedExport, setSelectedExport] = useState<ExportType>("invoices");
  const [isExporting, setIsExporting] = useState(false);

  // Filter export-related audit logs
  const exportLogs = auditLogs.filter(log => log.action.startsWith("EXPORT_"));

  const handleExport = async () => {
    setIsExporting(true);
    
    // Simulate async export
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    addAuditLog(
      EXPORT_ACTION_MAP[selectedExport],
      `Exported ${selectedExport} data to CSV/XLSX`
    );
    
    setIsExporting(false);
    
    toast({
      title: "Export started",
      description: "Your export is being processed. You'll receive an email when it's ready.",
    });
  };

  const getActionLabel = (action: AuditAction): string => {
    switch (action) {
      case "EXPORT_INVOICES": return "Invoices";
      case "EXPORT_CLIENTS": return "Clients";
      case "EXPORT_ITEMS": return "Items";
      case "EXPORT_PAYMENTS": return "Payments";
      default: return action;
    }
  };

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link to="/settings" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-foreground">Export Data</h1>
          <p className="text-sm text-muted-foreground">
            Export your data to CSV or XLSX format
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Export Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Export Data
            </CardTitle>
            <CardDescription>
              Select what data to export. The file will be sent to your email.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Export Type</Label>
              <Select
                value={selectedExport}
                onValueChange={(value: ExportType) => setSelectedExport(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXPORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex flex-col items-start">
                        <span>{option.label}</span>
                        <span className="text-xs text-muted-foreground">
                          {option.description}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Export will not include PDFs and attachments. 
                Only data records will be exported in CSV/XLSX format.
              </AlertDescription>
            </Alert>

            <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Email Delivery</p>
                  <p className="text-sm text-muted-foreground">
                    Export file will be sent to your email address
                  </p>
                </div>
              </div>
              <Button onClick={handleExport} disabled={isExporting}>
                {isExporting ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Start Export
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Export History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Export History</CardTitle>
            <CardDescription>
              Recent data exports from your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            {exportLogs.length === 0 ? (
              <div className="text-center py-8">
                <Download className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No exports yet</p>
                <p className="text-sm text-muted-foreground">
                  Your export history will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {exportLogs.slice(0, 10).map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                        <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {getActionLabel(log.action)} Export
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(log.createdAt), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {log.userEmail}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Audit Logs */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Audit Logs</CardTitle>
            <CardDescription>
              Recent account activity and changes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {auditLogs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No activity logged yet
              </p>
            ) : (
              <div className="space-y-2">
                {auditLogs.slice(0, 20).map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                  >
                    <div>
                      <p className="text-sm">{log.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {log.userEmail} • {format(new Date(log.createdAt), "MMM d, h:mm a")}
                      </p>
                    </div>
                    <span className="text-xs font-mono bg-secondary px-2 py-1 rounded">
                      {log.action}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default ExportSettings;
