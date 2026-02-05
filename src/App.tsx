import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import TalentPage from "./pages/TalentPage";
import TalentsPage from "./pages/TalentsPage";
import CampaignPage from "./pages/CampaignPage";
import CampaignsPage from "./pages/CampaignsPage";
import ClientPage from "./pages/ClientPage";
import ClientsPage from "./pages/ClientsPage";
import NotFound from "./pages/NotFound";
import ContactPage from "./pages/ContactPage";
import Accessibility from "./pages/Accessibility";
import PrivacyPage from "./pages/PrivacyPage";
import AccessibilityWidget from "./components/AccessibilityWidget";
import ScrollToTop from "./components/ScrollToTop";
import { AuthProvider } from "./contexts/AuthContext";

// Lazy load AdminPanel to prevent it from affecting the main site
const AdminPanel = lazy(() => import("./pages/AdminPanel"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          {/* Skip to content link for keyboard users */}
          <a href="#main-content" className="skip-link">
            דלג לתוכן הראשי
          </a>
          <AccessibilityWidget />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/talents" element={<TalentsPage />} />
            <Route path="/talent/:id" element={<TalentPage />} />
            <Route path="/campaigns" element={<CampaignsPage />} />
            <Route path="/campaign/:id" element={<CampaignPage />} />
            <Route path="/clients" element={<ClientsPage />} />
            <Route path="/client/:id" element={<ClientPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/accessibility" element={<Accessibility />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            {/* Hidden admin panel - not linked in navigation */}
            <Route path="/panel" element={
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
                <AdminPanel />
              </Suspense>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;