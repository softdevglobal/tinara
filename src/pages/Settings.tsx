import { 
  Settings as SettingsIcon, 
  Receipt, 
  CreditCard, 
  Mail, 
  Shield, 
  Users, 
  Download,
  ChevronRight,
  Building2
} from "lucide-react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface SettingsLink {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  badge?: string;
}

const settingsLinks: SettingsLink[] = [
  {
    title: "Tax Settings & Currency",
    description: "Configure tax rates, registrations, and base currency",
    icon: Receipt,
    href: "/settings/tax",
  },
  {
    title: "Payment Options",
    description: "Connect Stripe, PayPal, and configure payment methods",
    icon: CreditCard,
    href: "/settings/payments",
  },
  {
    title: "Client Communication",
    description: "Email templates, reminders, and notification settings",
    icon: Mail,
    href: "/settings/communication",
  },
  {
    title: "Security",
    description: "Two-factor authentication and trusted devices",
    icon: Shield,
    href: "/settings/security",
  },
  {
    title: "Team Members",
    description: "Manage team access and permissions",
    icon: Users,
    href: "/settings/team",
  },
  {
    title: "Export Data",
    description: "Export invoices, clients, and audit logs",
    icon: Download,
    href: "/settings/export",
  },
];

const Settings = () => {
  return (
    <AppLayout>
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
          <SettingsIcon className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage your account and preferences
          </p>
        </div>
      </div>

      {/* Company Overview Card */}
      <Card className="mb-6 border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">My Business</CardTitle>
              <CardDescription>
                Australia • AUD • GST Registered
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Settings Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {settingsLinks.map((link) => (
          <Link key={link.href} to={link.href}>
            <Card className="h-full transition-colors hover:bg-secondary/50 cursor-pointer group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary group-hover:bg-primary/10">
                      <link.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-medium flex items-center gap-2">
                        {link.title}
                        {link.badge && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                            {link.badge}
                          </span>
                        )}
                      </CardTitle>
                      <CardDescription className="text-sm mt-0.5">
                        {link.description}
                      </CardDescription>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </AppLayout>
  );
};

export default Settings;
