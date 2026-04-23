import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/context/AppContext";
import { SettingsProvider } from "@/context/SettingsContext";
import { DocumentCountersProvider } from "@/context/DocumentCountersContext";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AutoInvoiceGenerator } from "@/components/AutoInvoiceGenerator";
import Auth from "./pages/Auth";
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
import TeamManagement from "./pages/TeamManagement";
import Settings from "./pages/Settings";
import TaxSettings from "./pages/settings/TaxSettings";
import PaymentSettings from "./pages/settings/PaymentSettings";
import CommunicationSettings from "./pages/settings/CommunicationSettings";
import SecuritySettings from "./pages/settings/SecuritySettings";
import TeamSettings from "./pages/settings/TeamSettings";
import ExportSettings from "./pages/settings/ExportSettings";
import NotFound from "./pages/NotFound";
import OnboardingRouter from "./pages/onboarding/OnboardingRouter";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <AppProvider>
              <SettingsProvider>
                <DocumentCountersProvider>
                  <AutoInvoiceGenerator />
                  <Toaster />
                  <Sonner />
                  <Routes>
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/onboarding/*" element={<OnboardingRouter />} />

                    <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                    <Route path="/invoices" element={<ProtectedRoute><Invoices /></ProtectedRoute>} />
                    <Route path="/quotes" element={<ProtectedRoute><Quotes /></ProtectedRoute>} />
                    <Route path="/recurring" element={<ProtectedRoute><RecurringInvoices /></ProtectedRoute>} />
                    <Route path="/clients" element={<ProtectedRoute><Clients /></ProtectedRoute>} />
                    <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
                    <Route path="/items" element={<ProtectedRoute><Items /></ProtectedRoute>} />
                    <Route path="/expenses" element={<ProtectedRoute><Expenses /></ProtectedRoute>} />
                    <Route path="/credit-memos" element={<ProtectedRoute><CreditMemos /></ProtectedRoute>} />
                    <Route path="/time-tracking" element={<ProtectedRoute><TimeTracking /></ProtectedRoute>} />
                    <Route path="/team" element={<ProtectedRoute requireRoles={["owner","admin"]}><TeamManagement /></ProtectedRoute>} />
                    <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                    <Route path="/settings/tax" element={<ProtectedRoute><TaxSettings /></ProtectedRoute>} />
                    <Route path="/settings/payments" element={<ProtectedRoute requireRoles={["owner","admin","finance"]}><PaymentSettings /></ProtectedRoute>} />
                    <Route path="/settings/communication" element={<ProtectedRoute><CommunicationSettings /></ProtectedRoute>} />
                    <Route path="/settings/security" element={<ProtectedRoute><SecuritySettings /></ProtectedRoute>} />
                    <Route path="/settings/team" element={<ProtectedRoute requireRoles={["owner","admin"]}><TeamSettings /></ProtectedRoute>} />
                    <Route path="/settings/export" element={<ProtectedRoute><ExportSettings /></ProtectedRoute>} />

                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </DocumentCountersProvider>
              </SettingsProvider>
            </AppProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
