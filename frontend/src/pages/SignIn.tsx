import { useSearchParams } from "react-router-dom";
import { SignIn } from "@clerk/react";

export default function SignInPage() {
  const [params] = useSearchParams();
  const redirect = params.get("redirect") ?? "/dashboard";

  return (
    <div className="grid min-h-[calc(100svh-4rem)] lg:grid-cols-2">
      <aside className="relative hidden border-r border-white/10 lg:flex lg:flex-col lg:justify-between">
        <div className="p-10">
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-emerald-400">
            AUTH // SECURE TERMINAL
          </p>
          <h1 className="mt-6 font-heading text-4xl font-bold uppercase leading-tight tracking-tight text-zinc-50">
            Welcome back to
            <br />
            the neighbourhood
            <span className="text-emerald-400">.</span>
          </h1>
          <p className="mt-4 max-w-sm font-mono text-xs leading-relaxed text-zinc-400">
            Sign in to track bookings, settle consults at the demo checkout and keep your clinic
            history in one console.
          </p>
        </div>
        <div className="border-t border-white/10 p-10 font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-600">
          SLOT SEVA ◈ — IND // 24×7 DESK
        </div>
      </aside>
      <main className="flex items-center justify-center p-6">
        <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" forceRedirectUrl={redirect} withSignUp />
      </main>
    </div>
  );
}
