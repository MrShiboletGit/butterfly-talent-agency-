/**
 * The original site (v1). Since v2 became the main site, v1 is the backup served
 * under /v1, so App.tsx loads this module only when someone opens it.
 */
import type { ReactNode } from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
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

const V1App = ({ adminPanel }: { adminPanel: ReactNode }) => (
  <>
    <Toaster />
    <Sonner />
    <ScrollToTop />
    {/* Skip to content link for keyboard users */}
    <a href="#main-content" className="skip-link">
      דלג לתוכן הראשי
    </a>
    <AccessibilityWidget />
    <div id="main-content" tabIndex={-1}>
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
      <Route path="/panel" element={adminPanel} />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
    </div>
  </>
);

export default V1App;
