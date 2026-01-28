export interface Project {
  id: string;
  number: string;
  name: string;
  clientId: string;
  status: "Active" | "Complete";
  createdAt: string;
  updatedAt: string;
  description?: string;
}

export const projects: Project[] = [
  {
    id: "proj_1",
    number: "P-001",
    name: "Security System Installation",
    clientId: "client_1",
    status: "Active",
    createdAt: "2025-01-15",
    updatedAt: "2025-01-28",
    description: "Complete security camera installation for main office",
  },
  {
    id: "proj_2",
    number: "P-002",
    name: "Website Redesign",
    clientId: "client_2",
    status: "Active",
    createdAt: "2025-01-10",
    updatedAt: "2025-01-25",
    description: "Full website redesign and development",
  },
  {
    id: "proj_3",
    number: "P-003",
    name: "POS System Setup",
    clientId: "client_3",
    status: "Complete",
    createdAt: "2024-12-01",
    updatedAt: "2025-01-05",
    description: "Point of sale system installation and training",
  },
  {
    id: "proj_4",
    number: "P-004",
    name: "Logistics Software Integration",
    clientId: "client_5",
    status: "Active",
    createdAt: "2025-01-20",
    updatedAt: "2025-01-28",
    description: "Integration of inventory management system",
  },
];
