import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@clerk/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import StatusBadge from "@/components/StatusBadge";
import { useAuthedApi } from "@/lib/authedApi";
import type { Appointment, AppointmentList, AppUser } from "@/lib/types";
import { fmtDate, fmtTime, inr } from "@/lib/format";

export default function PatientDashboard() {
  const { isLoaded, isSignedIn } = useAuth();
  const api = useAuthedApi();
  const queryClient = useQueryClient();
  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null);

  const me = useQuery({
    enabled: !!isSignedIn,
    queryKey: ["me"],
    queryFn: () => api.get<AppUser>("/me"),
    retry: false,
  });
  const appts = useQuery({
    enabled: !!isSignedIn,
    queryKey: ["appointments"],
    queryFn: () => api.get<AppointmentList>("/appointments"),
    retry: false,
  });

  const cancel = useMutation({
    mutationFn: (id: string) => api.post<Appointment>(`/appointments/${id}/cancel`),
    onSuccess: () => {
      toast.success("Appointment cancelled");
      void queryClient.invalidateQueries({ queryKey: ["appointments"] });
      void queryClient.invalidateQueries({ queryKey: ["slots"] });
    },
    onError: () => toast.error("Could not cancel — try again"),
  });

  if (isLoaded && !isSignedIn) {
    return <Navigate to="/sign-in?redirect=%2Fdashboard" replace />;
  }
  if (me.data?.role === "doctor") {
    return <Navigate to="/doctor-dashboard" replace />;
  }

  const all = appts.data?.appointments ?? [];
  const active = all.filter((a) => a.status === "CONFIRMED" || a.status === "PENDING_PAYMENT");
  const past = all
    .filter((a) => a.status === "COMPLETED" || a.status === "CANCELLED")
    .reverse();
  const spent = all
    .filter((a) => a.payment_status === "MOCKED-PAID" && a.status !== "CANCELLED")
    .reduce((sum, a) => sum + a.amount, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
      <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-emerald-400">
        04 // Patient console — {me.data?.email ?? "…"}
      </p>
      <h1 className="mt-3 font-heading text-4xl font-bold uppercase tracking-tight text-zinc-50 md:text-5xl">
        My bookings<span className="text-emerald-400">.</span>
      </h1>

      <div className="mt-8 grid grid-cols-3 gap-px border border-white/10 bg-white/10">
        {[
          { label: "Active bookings", value: active.length },
          { label: "Visits done", value: all.filter((a) => a.status === "COMPLETED").length },
          { label: "Total paid", value: inr(spent) },
        ].map((s) => (
          <div key={s.label} className="bg-[#10121B] px-4 py-4">
            <p className="font-heading text-2xl font-bold text-emerald-400" data-testid={`patient-stat-${s.label.toLowerCase().replace(/[^a-z]+/g, "-")}`}>
              {s.value}
            </p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* ACTIVE PASSPORTS */}
      <h2 className="mt-10 font-mono text-[11px] uppercase tracking-[0.3em] text-zinc-500">
        Active appointment passports
      </h2>
      {active.length === 0 ? (
        <div className="mt-4 border border-white/12 bg-[#10121B] px-6 py-12 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-zinc-500" data-testid="patient-empty-state">
            No active bookings // the directory is open
          </p>
          <Link to="/doctors" data-testid="patient-empty-cta" className={buttonVariants({ className: "mt-6 font-mono" })}>
            Find a doctor ↗
          </Link>
        </div>
      ) : (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {active.map((a) => (
            <div key={a.id} className="border border-white/12 bg-[#10121B] p-5" data-testid={`appointment-card-${a.id}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500">
                    {a.reference}
                  </p>
                  <h3 className="mt-1 font-heading text-lg font-semibold uppercase tracking-tight text-zinc-50">
                    {a.doctor_name}
                  </h3>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-400">
                    {a.doctor_specialisation}
                  </p>
                </div>
                <StatusBadge status={a.status} />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 font-mono text-xs text-zinc-300">
                <p>
                  <span className="block text-[10px] uppercase tracking-[0.2em] text-zinc-500">Slot</span>
                  {fmtDate(a.date)} · {fmtTime(a.time)}
                </p>
                <p>
                  <span className="block text-[10px] uppercase tracking-[0.2em] text-zinc-500">Clinic</span>
                  {a.clinic_name}, {a.clinic_city}
                </p>
                <p>
                  <span className="block text-[10px] uppercase tracking-[0.2em] text-zinc-500">Paid</span>
                  {inr(a.amount)} · {a.payment_mode || a.status.replace("_", " ")}
                </p>
              </div>
              <div className="mt-4 flex justify-end">
                <Button
                  variant="destructive"
                  size="sm"
                  data-testid={`cancel-appointment-${a.id}`}
                  onClick={() => setCancelTarget(a)}
                  className="font-mono"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* HISTORY */}
      {past.length > 0 && (
        <>
          <h2 className="mt-12 font-mono text-[11px] uppercase tracking-[0.3em] text-zinc-500">
            History timeline
          </h2>
          <div className="mt-4 divide-y divide-white/10 border border-white/12 bg-[#10121B]">
            {past.map((a) => (
              <div key={a.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4" data-testid={`history-row-${a.id}`}>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                    {a.reference} · {fmtDate(a.date)} · {fmtTime(a.time)}
                  </p>
                  <p className="mt-1 font-mono text-sm text-zinc-200">
                    {a.doctor_name} — {a.doctor_specialisation}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-zinc-400">{inr(a.amount)}</span>
                  <StatusBadge status={a.status} />
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* CANCEL CONFIRM */}
      <Dialog open={!!cancelTarget} onOpenChange={(o) => !o && setCancelTarget(null)}>
        <DialogContent className="border-white/15 bg-[#10121B]">
          <DialogHeader>
            <DialogTitle className="font-heading uppercase tracking-tight text-zinc-50">
              Cancel this consult?
            </DialogTitle>
            <DialogDescription className="font-mono text-xs text-zinc-400">
              {cancelTarget
                ? `${cancelTarget.doctor_name} · ${fmtDate(cancelTarget.date)} · ${fmtTime(cancelTarget.time)} — the slot goes back to the bay.`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" size="sm" data-testid="cancel-keep-button" onClick={() => setCancelTarget(null)} className="font-mono">
              Keep booking
            </Button>
            <Button
              variant="destructive"
              size="sm"
              data-testid="confirm-cancel-button"
              onClick={() => {
                if (cancelTarget) cancel.mutate(cancelTarget.id);
                setCancelTarget(null);
              }}
              className="font-mono"
            >
              Yes, cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
