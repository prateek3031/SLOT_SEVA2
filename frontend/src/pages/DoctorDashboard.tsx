import { Navigate } from "react-router-dom";
import { useAuth } from "@clerk/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/StatusBadge";
import { useAuthedApi } from "@/lib/authedApi";
import type { Appointment, AppointmentList, AppUser, Doctor } from "@/lib/types";
import { fmtDate, fmtTime, inr } from "@/lib/format";

export default function DoctorDashboard() {
  const { isLoaded, isSignedIn } = useAuth();
  const api = useAuthedApi();
  const queryClient = useQueryClient();

  const me = useQuery({
    enabled: !!isSignedIn,
    queryKey: ["me"],
    queryFn: () => api.get<AppUser>("/me"),
    retry: false,
  });

  const doctor = useQuery({
    enabled: !!me.data?.doctor_id,
    queryKey: ["doctor", me.data?.doctor_id],
    queryFn: () => api.get<Doctor>(`/doctors/${me.data?.doctor_id}`),
    retry: false,
  });

  const appts = useQuery({
    enabled: !!isSignedIn,
    queryKey: ["appointments"],
    queryFn: () => api.get<AppointmentList>("/appointments"),
    retry: false,
  });

  const status = useMutation({
    mutationFn: ({ id, next }: { id: string; next: "COMPLETED" | "CANCELLED" }) =>
      api.patch<Appointment>(`/appointments/${id}/status`, { status: next }),
    onSuccess: (a) => {
      toast.success(`${a.reference} → ${a.status.replace("_", " ")}`);
      void queryClient.invalidateQueries({ queryKey: ["appointments"] });
      void queryClient.invalidateQueries({ queryKey: ["slots"] });
    },
    onError: () => toast.error("Could not update — try again"),
  });

  if (isLoaded && !isSignedIn) {
    return <Navigate to="/sign-in?redirect=%2Fdoctor-dashboard" replace />;
  }
  if (me.data && me.data.role !== "doctor") {
    return <Navigate to="/dashboard" replace />;
  }

  const all = appts.data?.appointments ?? [];
  const today = appts.data?.today ?? "";
  const todays = all
    .filter((a) => a.date === today && a.status !== "CANCELLED")
    .sort((a, b) => a.time.localeCompare(b.time));
  const upcoming = all.filter((a) => a.date > today && a.status !== "CANCELLED");
  const seenToday = todays.filter((a) => a.status === "CONFIRMED" || a.status === "COMPLETED");
  const revenueToday = seenToday.reduce((sum, a) => sum + a.amount, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
      <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-emerald-400">
        04 // Clinician command center — {doctor.data?.clinic_name ?? "…"}
      </p>
      <h1 className="mt-3 font-heading text-4xl font-bold uppercase tracking-tight text-zinc-50 md:text-5xl">
        {doctor.data?.name ?? "Clinic console"}
        <span className="text-emerald-400">.</span>
      </h1>
      <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-500" data-testid="doctor-dashboard-date">
        TODAY // {today ? fmtDate(today) : "…"}
      </p>

      <div className="mt-8 grid grid-cols-2 gap-px border border-white/10 bg-white/10 lg:grid-cols-4">
        {[
          { label: "Today's queue", value: todays.length },
          { label: "Seen today", value: seenToday.filter((a) => a.status === "COMPLETED").length },
          { label: "Revenue today", value: inr(revenueToday) },
          { label: "Upcoming", value: upcoming.length },
        ].map((s) => (
          <div key={s.label} className="bg-[#10121B] px-4 py-4">
            <p className="font-heading text-2xl font-bold text-emerald-400" data-testid={`doctor-stat-${s.label.toLowerCase().replace(/[^a-z]+/g, "-")}`}>
              {s.value}
            </p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* TODAY'S QUEUE */}
      <h2 className="mt-10 font-mono text-[11px] uppercase tracking-[0.3em] text-zinc-500">
        Today&apos;s consultation queue
      </h2>
      {todays.length === 0 ? (
        <div className="mt-4 border border-white/12 bg-[#10121B] px-6 py-12 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-zinc-500" data-testid="doctor-queue-empty">
            Queue clear // no consults booked for today
          </p>
        </div>
      ) : (
        <div className="mt-4 divide-y divide-white/10 border border-white/12 bg-[#10121B]">
          {todays.map((a) => (
            <div key={a.id} className="flex flex-wrap items-center justify-between gap-4 px-5 py-4" data-testid={`queue-row-${a.id}`}>
              <div className="flex items-center gap-5">
                <span className="font-mono text-lg font-bold text-emerald-400">{fmtTime(a.time)}</span>
                <div>
                  <p className="font-mono text-sm text-zinc-100" data-testid={`queue-patient-${a.id}`}>
                    {a.patient_name}
                    {a.patient_phone && <span className="ml-2 text-zinc-500">{a.patient_phone}</span>}
                  </p>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                    {a.reference} · {inr(a.amount)} · {a.payment_mode || "UNPAID"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={a.status} />
                {a.status === "CONFIRMED" && (
                  <Button
                    variant="outline"
                    size="sm"
                    data-testid={`complete-appointment-${a.id}`}
                    onClick={() => status.mutate({ id: a.id, next: "COMPLETED" })}
                    className="font-mono"
                  >
                    Mark completed
                  </Button>
                )}
                <Button
                  variant="destructive"
                  size="sm"
                  data-testid={`doctor-cancel-appointment-${a.id}`}
                  onClick={() => status.mutate({ id: a.id, next: "CANCELLED" })}
                  className="font-mono"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* UPCOMING */}
      {upcoming.length > 0 && (
        <>
          <h2 className="mt-12 font-mono text-[11px] uppercase tracking-[0.3em] text-zinc-500">
            Upcoming bookings
          </h2>
          <div className="mt-4 divide-y divide-white/10 border border-white/12 bg-[#10121B]">
            {upcoming.map((a) => (
              <div key={a.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4" data-testid={`upcoming-row-${a.id}`}>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                    {fmtDate(a.date)} · {fmtTime(a.time)}
                  </p>
                  <p className="mt-1 font-mono text-sm text-zinc-200">
                    {a.patient_name} · {a.reference}
                  </p>
                </div>
                <StatusBadge status={a.status} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
