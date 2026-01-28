import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Building2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Client, ClientPaymentTerms } from "@/data/clients";
import { CustomerType } from "@/types/tax-settings";

const newClientSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email").max(255),
  company: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
  mobile: z.string().max(20).optional(),
  website: z.string().max(255).optional(),
  taxNumber: z.string().max(50).optional(),
  taxIdValidated: z.boolean().optional(),
  customerType: z.enum(["BUSINESS", "INDIVIDUAL"]).optional(),
  paymentTerms: z.enum(["Due on receipt", "Net 7", "Net 14", "Net 30", "Net 60", "Custom"]).optional(),
  defaultCurrencyOverride: z.string().max(3).optional(),
  // Billing address
  billingStreet: z.string().max(255).optional(),
  billingCity: z.string().max(100).optional(),
  billingState: z.string().max(100).optional(),
  billingPostalCode: z.string().max(20).optional(),
  billingCountry: z.string().max(100).optional(),
  billingCountryCode: z.string().max(2).optional(),
  // Shipping address
  shippingStreet: z.string().max(255).optional(),
  shippingCity: z.string().max(100).optional(),
  shippingState: z.string().max(100).optional(),
  shippingPostalCode: z.string().max(20).optional(),
  shippingCountry: z.string().max(100).optional(),
  shippingCountryCode: z.string().max(2).optional(),
  sameAsBilling: z.boolean().optional(),
  notes: z.string().max(500).optional(),
});

type NewClientFormData = z.infer<typeof newClientSchema>;

interface NewClientFormProps {
  onSubmit: (client: Client) => void;
  onCancel: () => void;
}

export function NewClientForm({ onSubmit, onCancel }: NewClientFormProps) {
  const form = useForm<NewClientFormData>({
    resolver: zodResolver(newClientSchema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
      phone: "",
      mobile: "",
      website: "",
      taxNumber: "",
      taxIdValidated: false,
      customerType: "BUSINESS",
      paymentTerms: undefined,
      defaultCurrencyOverride: "",
      billingStreet: "",
      billingCity: "",
      billingState: "",
      billingPostalCode: "",
      billingCountry: "",
      billingCountryCode: "",
      shippingStreet: "",
      shippingCity: "",
      shippingState: "",
      shippingPostalCode: "",
      shippingCountry: "",
      shippingCountryCode: "",
      sameAsBilling: true,
      notes: "",
    },
  });

  const customerType = form.watch("customerType");
  const sameAsBilling = form.watch("sameAsBilling");

  const handleSubmit = (data: NewClientFormData) => {
    const newClient: Client = {
      id: `client_${Date.now()}`,
      name: data.name,
      email: data.email,
      company: data.company || undefined,
      phone: data.phone || undefined,
      mobile: data.mobile || undefined,
      website: data.website || undefined,
      taxNumber: data.taxNumber || undefined,
      taxIdValidated: data.taxIdValidated || false,
      customerType: data.customerType as CustomerType || "BUSINESS",
      paymentTerms: data.paymentTerms as ClientPaymentTerms || undefined,
      defaultCurrencyOverride: data.defaultCurrencyOverride || undefined,
      billingAddress: data.billingStreet ? {
        street: data.billingStreet || undefined,
        city: data.billingCity || undefined,
        state: data.billingState || undefined,
        postalCode: data.billingPostalCode || undefined,
        country: data.billingCountry || undefined,
        countryCode: data.billingCountryCode || undefined,
      } : undefined,
      shippingAddress: !data.sameAsBilling && data.shippingStreet ? {
        street: data.shippingStreet || undefined,
        city: data.shippingCity || undefined,
        state: data.shippingState || undefined,
        postalCode: data.shippingPostalCode || undefined,
        country: data.shippingCountry || undefined,
        countryCode: data.shippingCountryCode || undefined,
      } : undefined,
      notes: data.notes || undefined,
      createdAt: new Date().toISOString().split("T")[0],
    };
    onSubmit(newClient);
  };

  return (
    <div className="border border-border rounded-lg p-4 bg-secondary/30 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-medium text-foreground">New Client</h4>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onCancel}
          className="h-6 w-6"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Form {...form}>
        <div className="space-y-4">
          {/* Customer Type */}
          <div className="space-y-2">
            <FormLabel>Customer Type</FormLabel>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={customerType === "BUSINESS" ? "default" : "outline"}
                size="sm"
                onClick={() => form.setValue("customerType", "BUSINESS")}
                className="flex-1"
              >
                <Building2 className="h-4 w-4 mr-1" />
                Business
              </Button>
              <Button
                type="button"
                variant={customerType === "INDIVIDUAL" ? "default" : "outline"}
                size="sm"
                onClick={() => form.setValue("customerType", "INDIVIDUAL")}
                className="flex-1"
              >
                <User className="h-4 w-4 mr-1" />
                Individual
              </Button>
            </div>
          </div>

          {/* Contact Information */}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="mobile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mobile</FormLabel>
                  <FormControl>
                    <Input placeholder="+61 412 345 678" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Business Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="taxNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tax Number / ABN</FormLabel>
                  <FormControl>
                    <Input placeholder="ABN 12 345 678 901" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="paymentTerms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Terms</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select terms" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Due on receipt">Due on receipt</SelectItem>
                      <SelectItem value="Net 7">Net 7</SelectItem>
                      <SelectItem value="Net 14">Net 14</SelectItem>
                      <SelectItem value="Net 30">Net 30</SelectItem>
                      <SelectItem value="Net 60">Net 60</SelectItem>
                      <SelectItem value="Custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Billing Address */}
          <div className="pt-2">
            <h5 className="text-sm font-medium text-muted-foreground mb-3">Billing Address</h5>
            <div className="space-y-3">
              <FormField
                control={form.control}
                name="billingStreet"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Street address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="billingCity"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="City" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="billingState"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="State" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="billingPostalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="Postal code" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="billingCountry"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="Country" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Private Notes</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Add private notes about this client..."
                    className="min-h-[60px]"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onCancel}>
              Cancel
            </Button>
            <Button 
              type="button" 
              size="sm" 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit(handleSubmit)();
              }}
            >
              Add Client
            </Button>
          </div>
        </div>
      </Form>
    </div>
  );
}
