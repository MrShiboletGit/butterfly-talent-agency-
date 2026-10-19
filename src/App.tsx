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
// The redesigned site ships as its own chunk, so v1 visitors never download it.
// If a deploy lands between loading the page and loading that chunk, the old
// chunk's URL is gone; reload once to pick up the new build instead of a blank page.
const V2_RELOAD_KEY = "v2-chunk-reloaded";
const V2App = lazy(() =>
  import("./v2/V2App").then((mod) => {
    try {
      sessionStorage.removeItem(V2_RELOAD_KEY);
    } catch {
      /* storage blocked */
    }
    return mod;
  }).catch((error) => {
    const key = V2_RELOAD_KEY;
    try {
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, "1");
        window.location.reload();
        return new Promise<never>(() => {});
      }
    } catch {
      /* storage blocked: fall through to the error */
    }
    throw error;
  }),
);

const queryClient = new QueryClient();

/**
 * Two versions of the site live side by side. Each one is always reachable under
 * its own prefix (/v1, /v2) and one of them also serves the bare domain.
 * Flipping MAIN_SITE is the whole cutover: the other version keeps working under
 * its prefix as a backup.
 *
 * The prefix becomes the router's basename, so every in-app link of a version
 * stays inside that version without either site knowing where it is mounted.
 */
const MAIN_SITE: "v1" | "v2" = "v1";
const PREFIXES = ["/v1", "/v2"] as const;

function currentPrefix() {
  const { pathname } = window.location;
  return PREFIXES.find((p) => pathname === p || pathname.startsWith(`${p}/`)) ?? "";
}

// ?v2 on the bare domain is a shortcut into the new site's preview.
function redirectQueryShortcut(prefix: string) {
  if (prefix) return;
  const params = new URLSearchParams(window.location.search);
  if (!params.has("v2")) return;
  params.delete("v2");
  const { pathname, hash } = window.location;
  const query = params.toString();
  window.location.replace(`/v2${pathname === "/" ? "" : pathname}${query ? `?${query}` : ""}${hash}`);
}

const prefix = currentPrefix();
redirectQueryShortcut(prefix);
const site = prefix === "/v1" ? "v1" : prefix === "/v2" ? "v2" : MAIN_SITE;

// v1 and the admin panel use toasts; v2 doesn't, so it doesn't get their (empty,
// English-labelled) notification regions on every page.
const toasters = (
  <>
    <Toaster />
    <Sonner />
  </>
);

const adminPanel = (
  <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
    <AdminPanel />
  </Suspense>
);

const V1Routes = () => (
  <>
    {toasters}
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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <BrowserRouter basename={prefix || undefined}>
          {site === "v2" ? (
            <Suspense fallback={<div style={{ minHeight: "100vh", background: "#07061A" }} />}>
              <V2App
                adminPanel={
                  <>
                    {toasters}
                    {adminPanel}
                  </>
                }
              />
            </Suspense>
          ) : (
            <V1Routes />
          )}
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
