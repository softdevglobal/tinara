import { 
  Home, 
  Users, 
  FileText, 
  ClipboardList, 
  Repeat, 
  Plus, 
  Settings, 
  ChevronLeft,
  FolderKanban,
  Package,
  Receipt,
  CreditCard,
  Clock,
  HelpCircle,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const mainNavItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "Clients", url: "/clients", icon: Users },
  { title: "Projects", url: "/projects", icon: FolderKanban },
];

const billingNavItems = [
  { title: "Invoices", url: "/invoices", icon: FileText },
  { title: "Quotes", url: "/quotes", icon: ClipboardList },
  { title: "Credit Memos", url: "/credit-memos", icon: CreditCard },
];

const inventoryNavItems = [
  { title: "Items", url: "/items", icon: Package },
  { title: "Expenses", url: "/expenses", icon: Receipt },
];

const toolsNavItems = [
  { title: "Recurring", url: "/recurring", icon: Repeat },
  { title: "Time Tracking", url: "/time-tracking", icon: Clock },
];

interface NavItemProps {
  item: { title: string; url: string; icon: React.ComponentType<{ className?: string }> };
  collapsed: boolean;
}

function NavItem({ item, collapsed }: NavItemProps) {
  const location = useLocation();
  const isActive = location.pathname === item.url || 
    (item.url === "/" && location.pathname === "/");

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild>
        <NavLink
          to={item.url}
          className={cn(
            "relative flex items-center gap-3 px-3 py-2.5 rounded-md text-[18px] font-medium transition-colors",
            "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
            isActive && "text-sidebar-foreground bg-sidebar-accent"
          )}
        >
          {isActive && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-destructive rounded-r" />
          )}
          <item.icon className={cn("h-5 w-5 shrink-0", collapsed && "mx-auto")} />
          {!collapsed && <span>{item.title}</span>}
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function AppSidebar() {
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar
      className="border-r border-sidebar-border bg-sidebar"
      collapsible="icon"
    >
      <SidebarHeader className="p-4">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <FileText className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-2xl font-semibold text-sidebar-foreground">BMS PRO Blue</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="h-8 w-8 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
          </Button>
        </div>

        {/* Create Button */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              className={cn(
                "mt-4 w-full bg-primary hover:bg-primary/90 text-primary-foreground",
                collapsed && "px-2"
              )}
            >
              <Plus className="h-4 w-4" />
              {!collapsed && <span className="ml-2">Create</span>}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuItem asChild>
              <NavLink to="/?new=invoice" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                New Invoice
              </NavLink>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <NavLink to="/quotes?new=quote" className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4" />
                New Quote
              </NavLink>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <NavLink to="/clients?new=client" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                New Client
              </NavLink>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <NavLink to="/projects?new=project" className="flex items-center gap-2">
                <FolderKanban className="h-4 w-4" />
                New Project
              </NavLink>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <NavLink to="/credit-memos?new=credit-memo" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                New Credit Memo
              </NavLink>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarHeader>

      <SidebarContent className="px-2">
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <NavItem key={item.title} item={item} collapsed={collapsed} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Billing Section */}
        <SidebarGroup className="mt-2">
          {!collapsed && (
            <div className="px-3 py-2 text-sm font-semibold text-sidebar-foreground/50 uppercase tracking-wider">
              Billing
            </div>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {billingNavItems.map((item) => (
                <NavItem key={item.title} item={item} collapsed={collapsed} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Inventory Section */}
        <SidebarGroup className="mt-2">
          {!collapsed && (
            <div className="px-3 py-2 text-sm font-semibold text-sidebar-foreground/50 uppercase tracking-wider">
              Inventory
            </div>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {inventoryNavItems.map((item) => (
                <NavItem key={item.title} item={item} collapsed={collapsed} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Tools Section */}
        <SidebarGroup className="mt-2">
          {!collapsed && (
            <div className="px-3 py-2 text-sm font-semibold text-sidebar-foreground/50 uppercase tracking-wider">
              Tools
            </div>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {toolsNavItems.map((item) => (
                <NavItem key={item.title} item={item} collapsed={collapsed} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 mt-auto">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <button
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-[18px] font-medium w-full",
                  "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                )}
              >
                <HelpCircle className={cn("h-5 w-5 shrink-0", collapsed && "mx-auto")} />
                {!collapsed && <span>Help</span>}
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <button
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-[18px] font-medium w-full",
                  "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                )}
              >
                <Settings className={cn("h-5 w-5 shrink-0", collapsed && "mx-auto")} />
                {!collapsed && <span>Settings</span>}
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
