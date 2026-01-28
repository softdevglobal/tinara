import { useState, useEffect, useRef } from "react";
import { Play, Pause, Square, Clock } from "lucide-react";
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
import { TimeEntry } from "@/data/time-entries";
import { Project } from "@/data/projects";
import { Client } from "@/data/clients";

interface TimeTrackerProps {
  clients: Client[];
  projects: Project[];
  onSave: (entry: TimeEntry) => void;
}

export function TimeTracker({ clients, projects, onSave }: TimeTrackerProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [description, setDescription] = useState("");
  const [clientId, setClientId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [hourlyRate, setHourlyRate] = useState(85);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<string | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const handleStart = () => {
    if (!isRunning) {
      startTimeRef.current = new Date().toTimeString().slice(0, 5);
    }
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleStop = () => {
    if (seconds === 0) return;

    const endTime = new Date().toTimeString().slice(0, 5);
    const duration = Math.ceil(seconds / 60); // Convert to minutes

    const entry: TimeEntry = {
      id: `time_${Date.now()}`,
      description: description || "Untitled time entry",
      projectId: projectId || undefined,
      clientId: clientId || undefined,
      date: new Date().toISOString().split("T")[0],
      startTime: startTimeRef.current || undefined,
      endTime,
      duration,
      billed: false,
      hourlyRate,
    };

    onSave(entry);
    
    // Reset
    setIsRunning(false);
    setSeconds(0);
    setDescription("");
    startTimeRef.current = null;
  };

  const handleReset = () => {
    setIsRunning(false);
    setSeconds(0);
    startTimeRef.current = null;
  };

  const filteredProjects = clientId
    ? projects.filter((p) => p.clientId === clientId)
    : projects;

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center gap-3 mb-4">
        <Clock className="h-5 w-5 text-primary" />
        <h3 className="font-medium">Timer</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Timer Display */}
        <div className="md:col-span-1">
          <div className="text-4xl font-mono font-bold text-center py-4">
            {formatTime(seconds)}
          </div>
          <div className="flex justify-center gap-2">
            {!isRunning ? (
              <Button size="sm" onClick={handleStart}>
                <Play className="h-4 w-4 mr-1" />
                Start
              </Button>
            ) : (
              <Button size="sm" variant="outline" onClick={handlePause}>
                <Pause className="h-4 w-4 mr-1" />
                Pause
              </Button>
            )}
            <Button
              size="sm"
              variant="destructive"
              onClick={handleStop}
              disabled={seconds === 0}
            >
              <Square className="h-4 w-4 mr-1" />
              Stop & Save
            </Button>
          </div>
        </div>

        {/* Form Fields */}
        <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label>Description</Label>
            <Input
              placeholder="What are you working on?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <Label>Client</Label>
            <Select value={clientId} onValueChange={setClientId}>
              <SelectTrigger>
                <SelectValue placeholder="Select client (optional)" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.company || client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Project</Label>
            <Select value={projectId} onValueChange={setProjectId}>
              <SelectTrigger>
                <SelectValue placeholder="Select project (optional)" />
              </SelectTrigger>
              <SelectContent>
                {filteredProjects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Hourly Rate (A$)</Label>
            <Input
              type="number"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(Number(e.target.value))}
            />
          </div>

          <div className="flex items-end">
            <div className="text-sm text-muted-foreground">
              Estimated: A${((seconds / 3600) * hourlyRate).toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
