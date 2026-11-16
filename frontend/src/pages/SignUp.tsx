import { useSearchParams } from "react-router-dom";
import { SignUp } from "@clerk/react";

export default function SignUpPage() {
  const [params] = useSearchParams();
  const redirect = params.get("redirect") ?? "/dashboard";

  return (
    <div className="grid min-h-[calc(100svh-4rem)] lg:grid-cols-2">
      <aside className="relative hidden border-r border-white/10 lg:flex lg:flex-col lg:justify-between">
        <div className="p-10">
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-emerald-400">
            REG // PATIENT & DOCTOR TERMINAL
          </p>
          <h1 className="mt-6 font-heading text-4xl font-bold uppercase leading-tight tracking-tight text-zinc-50">
            Join the clinic
            <br />
            network
            <span className="text-emerald-400">.</span>
          </h1>
          <p className="mt-4 max-w-sm font-mono text-xs leading-relaxed text-zinc-400">
            Patients book and track consults. Doctors on the network get a console to run their
            daily queue — sign up with your clinic email.
          </p>
        </div>
        <div className="border-t border-white/10 p-10 font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-600">
          SLOT SEVA ◈ — IND // 24×7 DESK
        </div>
      </aside>
      <main className="flex items-center justify-center p-6">
        <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" forceRedirectUrl={redirect} />
      </main>
    </div>
  );
}
