import { ReactNode, useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { FileText, Users, ClipboardList, Repeat, Keyboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { KeyboardShortcutsModal } from "./KeyboardShortcutsModal";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AppLayoutProps {
  children: ReactNode;
}

const navItems = [
  { label: "Invoices", href: "/", icon: FileText },
  { label: "Quotes", href: "/quotes", icon: ClipboardList },
  { label: "Recurring", href: "/recurring", icon: Repeat },
  { label: "Clients", href: "/clients", icon: Users },
];

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const [showShortcuts, setShowShortcuts] = useState(false);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Ignore when typing in inputs
    const target = event.target as HTMLElement;
    if (
      target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.isContentEditable
    ) {
      return;
    }

    // Check for '?' key
    if (event.key === "?") {
      event.preventDefault();
      setShowShortcuts(true);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        {/* Header with Navigation */}
        <header className="border-b border-border bg-card sticky top-0 z-10">
          <div className="container max-w-4xl py-3">
            <nav className="flex items-center justify-between">
              <div className="flex items-center gap-1">
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
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowShortcuts(true)}
                    className="h-9 w-9"
                  >
                    <Keyboard className="h-4 w-4" />
                    <span className="sr-only">Keyboard shortcuts</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Keyboard shortcuts (?)</p>
                </TooltipContent>
              </Tooltip>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="container max-w-4xl py-6">{children}</main>

        {/* Keyboard Shortcuts Modal */}
        <KeyboardShortcutsModal
          open={showShortcuts}
          onOpenChange={setShowShortcuts}
        />
      </div>
    </TooltipProvider>
  );
}
