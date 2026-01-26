import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { FileText, Users, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: ReactNode;
}

const navItems = [
  { label: "Invoices", href: "/", icon: FileText },
  { label: "Quotes", href: "/quotes", icon: ClipboardList },
  { label: "Clients", href: "/clients", icon: Users },
];

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Navigation */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container max-w-4xl py-3">
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-4xl py-6">{children}</main>
    </div>
  );
}
