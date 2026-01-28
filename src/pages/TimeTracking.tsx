import { useState } from "react";
import { Clock, Plus, Search, Play } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TimeEntryTable } from "@/components/tables/TimeEntryTable";
import { TimeTracker } from "@/components/TimeTracker";
import { useToast } from "@/hooks/use-toast";

const TimeTracking = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"unbilled" | "billed">("unbilled");
  const [showTimer, setShowTimer] = useState(false);
  const { timeEntries, projects, clients, setTimeEntries } = useApp();
  const { toast } = useToast();

  const filteredEntries = timeEntries.filter((entry) => {
    const matchesSearch = entry.description
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesTab =
      activeTab === "unbilled" ? !entry.billed : entry.billed;
    return matchesSearch && matchesTab;
  });

  const unbilledCount = timeEntries.filter((e) => !e.billed).length;
  const billedCount = timeEntries.filter((e) => e.billed).length;

  const unbilledTotal = timeEntries
    .filter((e) => !e.billed)
    .reduce((sum, e) => sum + (e.duration / 60) * e.hourlyRate, 0);

  const handleDelete = (id: string) => {
    setTimeEntries((prev) => prev.filter((e) => e.id !== id));
    toast({
      title: "Time entry deleted",
      description: "The time entry has been removed.",
    });
  };

  const handleMarkBilled = (id: string) => {
    setTimeEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, billed: true } : e))
    );
    toast({
      title: "Marked as billed",
      description: "The time entry has been marked as billed.",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
    }).format(amount);
  };

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Clock className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Time Tracking</h1>
            <p className="text-sm text-muted-foreground">Track billable hours</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowTimer(!showTimer)}>
            <Play className="h-4 w-4 mr-2" />
            {showTimer ? "Hide Timer" : "Start Timer"}
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Entry
          </Button>
        </div>
      </div>

      {/* Timer Widget */}
      {showTimer && (
        <div className="mb-6">
          <TimeTracker
            clients={clients}
            projects={projects}
            onSave={(entry) => {
              setTimeEntries((prev) => [entry, ...prev]);
              setShowTimer(false);
              toast({
                title: "Time entry saved",
                description: `Logged ${Math.round(entry.duration / 60)}h ${entry.duration % 60}m`,
              });
            }}
          />
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Unbilled Amount</p>
          <p className="text-2xl font-semibold text-primary">
            {formatCurrency(unbilledTotal)}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Unbilled Hours</p>
          <p className="text-2xl font-semibold">
            {(
              timeEntries
                .filter((e) => !e.billed)
                .reduce((sum, e) => sum + e.duration, 0) / 60
            ).toFixed(1)}h
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "unbilled" | "billed")}>
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="unbilled">Unbilled ({unbilledCount})</TabsTrigger>
            <TabsTrigger value="billed">Billed ({billedCount})</TabsTrigger>
          </TabsList>

          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search entries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <TabsContent value="unbilled" className="mt-0">
          {filteredEntries.length === 0 && !searchQuery ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Clock className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Keep track of time
              </h3>
              <p className="text-muted-foreground max-w-sm mb-4">
                Start the timer or add time entries manually to track your billable hours.
              </p>
              <Button onClick={() => setShowTimer(true)}>
                <Play className="h-4 w-4 mr-2" />
                Start Timer
              </Button>
            </div>
          ) : (
            <TimeEntryTable
              timeEntries={filteredEntries}
              projects={projects}
              clients={clients}
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
              onDelete={handleDelete}
              onMarkBilled={handleMarkBilled}
            />
          )}
        </TabsContent>

        <TabsContent value="billed" className="mt-0">
          <TimeEntryTable
            timeEntries={filteredEntries}
            projects={projects}
            clients={clients}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            onDelete={handleDelete}
          />
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
};

export default TimeTracking;
