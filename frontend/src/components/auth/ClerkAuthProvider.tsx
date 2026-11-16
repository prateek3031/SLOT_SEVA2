import { useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ClerkProvider } from "@clerk/react";
import { dark } from "@clerk/ui/themes";

// Brand Clerk here once: it styles sign-in, sign-up and the user menu. Dark terminal theme.
const appearance = {
  theme: dark,
  variables: {
    colorPrimary: "#10B981",
    colorBackground: "#10121B",
    colorForeground: "#F4F4F5",
    colorInput: "#171A26",
    colorInputForeground: "#F4F4F5",
    colorBorder: "rgba(255,255,255,0.14)",
    borderRadius: "0.25rem",
    fontFamily: "'JetBrains Mono Variable', monospace",
  },
  captcha: { theme: "dark" as const },
};

interface ClerkConfig {
  enabled: boolean;
  publishable_key: string;
  proxy_url: string;
}

// Starts Clerk from the backend's runtime config, so deploy's live keys need no rebuild.
// Must render inside <BrowserRouter> so Clerk navigates without reloading.
export default function ClerkAuthProvider({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const navigate = useNavigate();
  const [config, setConfig] = useState<ClerkConfig | null>(null);
  const [unavailable, setUnavailable] = useState(false);

  // Retries while the backend restarts (e.g. right after provisioning): the app's
  // Clerk components crash if they ever render without <ClerkProvider>.
  useEffect(() => {
    let cancelled = false;
    const load = async (attempt = 0): Promise<void> => {
      try {
        const res = await fetch("/api/clerk/config");
        if (!res.ok) throw new Error(`Clerk config request failed: ${res.status}`);
        const cfg = (await res.json()) as ClerkConfig;
        if (cfg.enabled) {
          if (!cancelled) setConfig(cfg);
          return;
        }
        if (!cancelled) setUnavailable(true);
        return;
      } catch {
        if (cancelled) return;
      }
      if (cancelled) return;
      if (attempt >= 20) {
        setUnavailable(true);
        return;
      }
      setTimeout(() => {
        void load(attempt + 1);
      }, 1500);
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (unavailable) {
    if (fallback) return fallback;
    return (
      <p className="p-6 font-mono text-xs uppercase tracking-[0.2em] text-zinc-400">
        Sign-in is unavailable right now. Refresh the page to try again.
      </p>
    );
  }
  if (!config) return null;
  return (
    <ClerkProvider
      publishableKey={config.publishable_key}
      proxyUrl={config.proxy_url || undefined}
      appearance={appearance}
      routerPush={(to: string) => navigate(to)}
      routerReplace={(to: string) => navigate(to, { replace: true })}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      signInFallbackRedirectUrl="/"
      signUpFallbackRedirectUrl="/"
      afterSignOutUrl="/"
    >
      {children}
    </ClerkProvider>
  );
}