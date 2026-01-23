import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Save, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Client } from "@/data/clients";

const clientSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email").max(255),
  company: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
});

type ClientFormData = z.infer<typeof clientSchema>;

interface ClientFormProps {
  client?: Client;
  onSubmit: (data: Client) => void;
  onCancel: () => void;
}

export function ClientForm({ client, onSubmit, onCancel }: ClientFormProps) {
  const isEditing = !!client;

  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: client?.name || "",
      email: client?.email || "",
      company: client?.company || "",
      phone: client?.phone || "",
    },
  });

  const handleSubmit = (data: ClientFormData) => {
    const clientData: Client = {
      id: client?.id || `client_${Date.now()}`,
      name: data.name,
      email: data.email,
      company: data.company || undefined,
      phone: data.phone || undefined,
    };
    onSubmit(clientData);
  };

  return (
    <div className="animate-fade-in">
      <button
        onClick={onCancel}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to clients
      </button>

      <div className="invoice-card p-6 max-w-xl">
        <h2 className="text-lg font-semibold text-foreground mb-6">
          {isEditing ? "Edit Client" : "Add New Client"}
        </h2>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="John Smith" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company</FormLabel>
                    <FormControl>
                      <Input placeholder="ACME Corporation" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john@acme.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="+61 400 123 456" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit">
                {isEditing ? (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Client
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
