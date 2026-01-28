export interface Client {
  id: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  mobile?: string;
  website?: string;
  taxNumber?: string;
  billingAddress?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  paymentTerms?: "Due on receipt" | "Net 7" | "Net 14" | "Net 30" | "Net 60" | "Custom";
  notes?: string;
  createdAt?: string;
}

export const clients: Client[] = [
  {
    id: "client_1",
    name: "John Smith",
    email: "john@securitycameras.com.au",
    company: "Security Cameras PTY",
    phone: "+61 400 123 456",
    mobile: "+61 412 345 678",
    website: "https://securitycameras.com.au",
    taxNumber: "ABN 12 345 678 901",
    billingAddress: {
      street: "123 Security Lane",
      city: "Sydney",
      state: "NSW",
      postalCode: "2000",
      country: "Australia",
    },
    paymentTerms: "Net 30",
    createdAt: "2024-06-15",
  },
  {
    id: "client_2",
    name: "Sarah Chen",
    email: "sarah@techsolutions.com.au",
    company: "Tech Solutions Inc",
    phone: "+61 400 234 567",
    mobile: "+61 423 456 789",
    website: "https://techsolutions.com.au",
    taxNumber: "ABN 23 456 789 012",
    paymentTerms: "Net 14",
    createdAt: "2024-08-20",
  },
  {
    id: "client_3",
    name: "Michael Brown",
    email: "michael@melbourneretail.com.au",
    company: "Melbourne Retail Co",
    phone: "+61 400 345 678",
    billingAddress: {
      street: "456 Retail Avenue",
      city: "Melbourne",
      state: "VIC",
      postalCode: "3000",
      country: "Australia",
    },
    paymentTerms: "Due on receipt",
    createdAt: "2024-09-10",
  },
  {
    id: "client_4",
    name: "Emma Wilson",
    email: "emma@sunrisecafe.com.au",
    company: "Sunrise Cafe",
    paymentTerms: "Net 7",
    createdAt: "2024-10-05",
  },
  {
    id: "client_5",
    name: "David Lee",
    email: "david@globallogistics.com.au",
    company: "Global Logistics",
    phone: "+61 400 567 890",
    mobile: "+61 456 789 012",
    website: "https://globallogistics.com.au",
    taxNumber: "ABN 56 789 012 345",
    billingAddress: {
      street: "789 Logistics Drive",
      city: "Brisbane",
      state: "QLD",
      postalCode: "4000",
      country: "Australia",
    },
    paymentTerms: "Net 60",
    notes: "Large enterprise client - requires purchase orders",
    createdAt: "2024-11-01",
  },
  {
    id: "client_6",
    name: "Jessica Taylor",
    email: "jessica@designstudio.com.au",
    company: "Design Studio AU",
    website: "https://designstudio.com.au",
    paymentTerms: "Net 14",
    createdAt: "2024-12-15",
  },
];
