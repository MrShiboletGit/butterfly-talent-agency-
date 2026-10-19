import { Suspense, lazy, type ComponentType, type ReactNode } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";

/**
 * Load a site version as its own chunk. If a deploy lands between loading the
 * page and loading that chunk, the old chunk's URL is gone; reload once to pick
 * up the new build instead of showing a blank page.
 */
type SiteProps = { adminPanel: ReactNode };

function lazyWithReload(load: () => Promise<{ default: ComponentType<SiteProps> }>) {
  const key = "chunk-reloaded";
  return lazy(() =>
    load()
      .then((mod) => {
        try {
          sessionStorage.removeItem(key);
        } catch {
          /* storage blocked */
        }
        return mod;
      })
      .catch((error) => {
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
}

// Lazy load AdminPanel to prevent it from affecting the main site
const AdminPanel = lazy(() => import("./pages/AdminPanel"));
// Each version ships as its own chunk, so visitors download only the one they see.
const V2App = lazyWithReload(() => import("./v2/V2App"));
const V1App = lazyWithReload(() => import("./V1App"));

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
const MAIN_SITE: "v1" | "v2" = "v2";
const PREFIXES = ["/v1", "/v2"] as const;

function currentPrefix() {
  const { pathname } = window.location;
  return PREFIXES.find((p) => pathname === p || pathname.startsWith(`${p}/`)) ?? "";
}

// ?v2 on the bare domain was the shortcut into the preview; it now lands on /v2,
// which serves the same site as the bare domain.
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

const adminPanel = (
  <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
    <AdminPanel />
  </Suspense>
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
                  // v2 itself uses no toasts, so it doesn't render their (empty,
                  // English-labelled) notification regions; the panel does use them.
                  <>
                    <Toaster />
                    <Sonner />
                    {adminPanel}
                  </>
                }
              />
            </Suspense>
          ) : (
            <Suspense fallback={<div className="min-h-screen" />}>
              <V1App adminPanel={adminPanel} />
            </Suspense>
          )}
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
