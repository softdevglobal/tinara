import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/context/AppContext";
import { SettingsProvider } from "@/context/SettingsContext";
import { DocumentCountersProvider } from "@/context/DocumentCountersContext";
import { AutoInvoiceGenerator } from "@/components/AutoInvoiceGenerator";
import Index from "./pages/Index";
import Invoices from "./pages/Invoices";
import Clients from "./pages/Clients";
import Quotes from "./pages/Quotes";
import RecurringInvoices from "./pages/RecurringInvoices";
import Projects from "./pages/Projects";
import Items from "./pages/Items";
import Expenses from "./pages/Expenses";
import CreditMemos from "./pages/CreditMemos";
import TimeTracking from "./pages/TimeTracking";
import Settings from "./pages/Settings";
import TaxSettings from "./pages/settings/TaxSettings";
import PaymentSettings from "./pages/settings/PaymentSettings";
import CommunicationSettings from "./pages/settings/CommunicationSettings";
import SecuritySettings from "./pages/settings/SecuritySettings";
import TeamSettings from "./pages/settings/TeamSettings";
import ExportSettings from "./pages/settings/ExportSettings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppProvider>
          <SettingsProvider>
            <DocumentCountersProvider>
              <AutoInvoiceGenerator />
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/invoices" element={<Invoices />} />
                  <Route path="/quotes" element={<Quotes />} />
                  <Route path="/recurring" element={<RecurringInvoices />} />
                  <Route path="/clients" element={<Clients />} />
                  <Route path="/projects" element={<Projects />} />
                  <Route path="/items" element={<Items />} />
                  <Route path="/expenses" element={<Expenses />} />
                  <Route path="/credit-memos" element={<CreditMemos />} />
                  <Route path="/time-tracking" element={<TimeTracking />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/settings/tax" element={<TaxSettings />} />
                  <Route path="/settings/payments" element={<PaymentSettings />} />
                  <Route path="/settings/communication" element={<CommunicationSettings />} />
                  <Route path="/settings/security" element={<SecuritySettings />} />
                  <Route path="/settings/team" element={<TeamSettings />} />
                  <Route path="/settings/export" element={<ExportSettings />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </DocumentCountersProvider>
          </SettingsProvider>
        </AppProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
