export interface Client {
  id: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
}

export const clients: Client[] = [
  {
    id: "client_1",
    name: "John Smith",
    email: "john@securitycameras.com.au",
    company: "Security Cameras PTY",
    phone: "+61 400 123 456",
  },
  {
    id: "client_2",
    name: "Sarah Chen",
    email: "sarah@techsolutions.com.au",
    company: "Tech Solutions Inc",
    phone: "+61 400 234 567",
  },
  {
    id: "client_3",
    name: "Michael Brown",
    email: "michael@melbourneretail.com.au",
    company: "Melbourne Retail Co",
    phone: "+61 400 345 678",
  },
  {
    id: "client_4",
    name: "Emma Wilson",
    email: "emma@sunrisecafe.com.au",
    company: "Sunrise Cafe",
  },
  {
    id: "client_5",
    name: "David Lee",
    email: "david@globallogistics.com.au",
    company: "Global Logistics",
    phone: "+61 400 567 890",
  },
  {
    id: "client_6",
    name: "Jessica Taylor",
    email: "jessica@designstudio.com.au",
    company: "Design Studio AU",
  },
];
