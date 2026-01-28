export interface TimeEntry {
  id: string;
  description: string;
  projectId?: string;
  clientId?: string;
  date: string;
  startTime?: string;
  endTime?: string;
  duration: number; // in minutes
  billed: boolean;
  hourlyRate: number;
  notes?: string;
}

export const timeEntries: TimeEntry[] = [
  {
    id: "time_1",
    description: "Security system configuration",
    projectId: "proj_1",
    clientId: "client_1",
    date: "2025-01-28",
    startTime: "09:00",
    endTime: "12:30",
    duration: 210,
    billed: false,
    hourlyRate: 85.00,
    notes: "Initial setup and camera configuration",
  },
  {
    id: "time_2",
    description: "Client consultation call",
    projectId: "proj_2",
    clientId: "client_2",
    date: "2025-01-27",
    startTime: "14:00",
    endTime: "15:00",
    duration: 60,
    billed: true,
    hourlyRate: 150.00,
    notes: "Discussed website requirements",
  },
  {
    id: "time_3",
    description: "Software installation",
    projectId: "proj_4",
    clientId: "client_5",
    date: "2025-01-26",
    startTime: "10:00",
    endTime: "14:00",
    duration: 240,
    billed: false,
    hourlyRate: 85.00,
  },
  {
    id: "time_4",
    description: "Training session",
    projectId: "proj_3",
    clientId: "client_3",
    date: "2025-01-20",
    startTime: "09:00",
    endTime: "12:00",
    duration: 180,
    billed: true,
    hourlyRate: 200.00,
    notes: "POS system training for staff",
  },
  {
    id: "time_5",
    description: "On-site maintenance",
    clientId: "client_4",
    date: "2025-01-25",
    startTime: "11:00",
    endTime: "13:30",
    duration: 150,
    billed: false,
    hourlyRate: 85.00,
  },
];
