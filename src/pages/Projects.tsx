import { useState } from "react";
import { FolderKanban, Plus, Search } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectTable } from "@/components/tables/ProjectTable";
import { NewProjectForm } from "@/components/NewProjectForm";
import { useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Projects = () => {
  const [searchParams] = useSearchParams();
  const showNewFromUrl = searchParams.get("new") === "project";
  const [showNewForm, setShowNewForm] = useState(showNewFromUrl);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"active" | "complete">("active");
  const { projects, clients, setProjects } = useApp();
  const { toast } = useToast();

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      activeTab === "active"
        ? project.status === "Active"
        : project.status === "Complete";
    return matchesSearch && matchesStatus;
  });

  const handleDelete = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    toast({
      title: "Project deleted",
      description: "The project has been removed.",
    });
  };

  if (showNewForm) {
    return (
      <AppLayout>
        <NewProjectForm
          clients={clients}
          onSubmit={(project) => {
            setProjects((prev) => [project, ...prev]);
            setShowNewForm(false);
            toast({
              title: "Project created",
              description: `Project ${project.number} has been created.`,
            });
          }}
          onCancel={() => setShowNewForm(false)}
        />
      </AppLayout>
    );
  }

  const activeCount = projects.filter((p) => p.status === "Active").length;
  const completeCount = projects.filter((p) => p.status === "Complete").length;

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <FolderKanban className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Projects</h1>
            <p className="text-sm text-muted-foreground">Organize your work</p>
          </div>
        </div>
        <Button size="sm" onClick={() => setShowNewForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "active" | "complete")}>
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="active">Active ({activeCount})</TabsTrigger>
            <TabsTrigger value="complete">Complete ({completeCount})</TabsTrigger>
          </TabsList>

          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <TabsContent value="active" className="mt-0">
          {filteredProjects.length === 0 && !searchQuery ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <FolderKanban className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Organize your projects
              </h3>
              <p className="text-muted-foreground max-w-sm mb-4">
                Create projects to group related invoices, quotes, and time entries together.
              </p>
              <Button onClick={() => setShowNewForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Project
              </Button>
            </div>
          ) : (
            <ProjectTable
              projects={filteredProjects}
              clients={clients}
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
              onDelete={handleDelete}
            />
          )}
        </TabsContent>

        <TabsContent value="complete" className="mt-0">
          <ProjectTable
            projects={filteredProjects}
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

export default Projects;
