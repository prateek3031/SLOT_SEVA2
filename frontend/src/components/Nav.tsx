import { Link } from "react-router-dom";
import { Show, UserButton, useAuth } from "@clerk/react";
import { useQuery } from "@tanstack/react-query";
import { Button, buttonVariants } from "@/components/ui/button";
import { useAuthedApi } from "@/lib/authedApi";
import type { AppUser } from "@/lib/types";
import { useTriage } from "@/components/triage/TriageContext";

export default function Nav() {
  const { isSignedIn } = useAuth();
  const { setOpen } = useTriage();
  const api = useAuthedApi();
  const { data: me } = useQuery({
    queryKey: ["me"],
    enabled: !!isSignedIn,
    queryFn: () => api.get<AppUser>("/me"),
    retry: false,
    staleTime: 60_000,
  });
  const dashboardTo = me?.role === "doctor" ? "/doctor-dashboard" : "/dashboard";

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#090A0F]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-3">
          <Link to="/" data-testid="nav-logo-link" className="flex items-baseline gap-2">
            <span className="font-heading text-lg font-bold uppercase tracking-tight text-zinc-50">
              Slot Seva
            </span>
            <span className="text-emerald-400">◈</span>
          </Link>
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.25em] text-emerald-400/80 md:inline">
            SYS // ONLINE
          </span>
        </div>

        <nav className="hidden items-center gap-6 md:flex">
          <Link
            to="/doctors"
            data-testid="nav-doctors-link"
            className="font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-400 hover:text-emerald-400"
          >
            Doctors //
          </Link>
          {isSignedIn && (
            <Link
              to={dashboardTo}
              data-testid="nav-dashboard-link"
              className="font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-400 hover:text-emerald-400"
            >
              {me?.role === "doctor" ? "Clinic Console" : "My Console"} //
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            data-testid="nav-triage-button"
            onClick={() => setOpen(true)}
            className="border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300"
          >
            ✦ Symptom AI
          </Button>
          <Show when="signed-out">
            <Link
              to="/sign-in"
              data-testid="nav-sign-in-link"
              className={buttonVariants({ variant: "secondary", size: "sm" })}
            >
              Sign In //
            </Link>
          </Show>
          <Show when="signed-in">
            <UserButton />
          </Show>
        </div>
      </div>
    </header>
  );
}

export function PublicNav() {
  const { setOpen } = useTriage();

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#090A0F]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-3">
          <Link to="/" data-testid="nav-logo-link" className="flex items-baseline gap-2">
            <span className="font-heading text-lg font-bold uppercase tracking-tight text-zinc-50">
              Slot Seva
            </span>
            <span className="text-emerald-400">◈</span>
          </Link>
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.25em] text-emerald-400/80 md:inline">
            SYS // ONLINE
          </span>
        </div>

        <nav className="hidden items-center gap-6 md:flex">
          <Link
            to="/doctors"
            data-testid="nav-doctors-link"
            className="font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-400 hover:text-emerald-400"
          >
            Doctors //
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            data-testid="nav-triage-button"
            onClick={() => setOpen(true)}
            className="border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300"
          >
            ✦ Symptom AI
          </Button>
          <Link
            to="/sign-in"
            data-testid="nav-sign-in-link"
            className={buttonVariants({ variant: "secondary", size: "sm" })}
          >
            Sign In //
          </Link>
        </div>
      </div>
    </header>
  );
}
