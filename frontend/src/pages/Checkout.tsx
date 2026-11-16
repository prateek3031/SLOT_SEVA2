import { useState } from "react";
import { Link, Navigate, useLocation, useSearchParams } from "react-router-dom";
import { useAuth } from "@clerk/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import StatusBadge from "@/components/StatusBadge";
import { useAuthedApi } from "@/lib/authedApi";
import { apiGet } from "@/lib/api";
import type { Appointment, AppUser, Doctor } from "@/lib/types";
import { fmtDate, fmtTime, inr } from "@/lib/format";

// Deterministic pseudo-QR from the booking reference — demo pass ornament, not scannable.
function QrMock({ seed }: { seed: string }) {
  let h = 7;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const cells: boolean[] = [];
  for (let i = 0; i < 64; i++) {
    h = (h * 1103515245 + 12345) >>> 0;
    cells.push((h >>> 16) % 2 === 0);
  }
  return (
    <div className="grid w-fit grid-cols-8 gap-px border border-white/15 bg-white/10 p-1" data-testid="appointment-qr-mock">
      {cells.map((on, i) => (
        <div key={i} className={`h-2.5 w-2.5 ${on ? "bg-zinc-100" : "bg-transparent"}`} />
      ))}
    </div>
  );
}

const METHODS = [
  { v: "UPI", label: "UPI / QR" },
  { v: "CARD", label: "CARD" },
  { v: "NETBANKING", label: "NET BANKING" },
] as const;

export default function Checkout() {
  const [params] = useSearchParams();
  const location = useLocation();
  const { isLoaded, isSignedIn } = useAuth();
  const api = useAuthedApi();
  const queryClient = useQueryClient();

  const doctorId = params.get("doctor") ?? "";
  const date = params.get("date") ?? "";
  const time = params.get("time") ?? "";

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [mode, setMode] = useState<"UPI" | "CARD" | "NETBANKING">("UPI");
  const [paid, setPaid] = useState<Appointment | null>(null);
  const [payError, setPayError] = useState("");

  const me = useQuery({
    enabled: !!isSignedIn,
    queryKey: ["me"],
    queryFn: () => api.get<AppUser>("/me"),
    retry: false,
  });
  const doctor = useQuery({
    enabled: !!doctorId,
    queryKey: ["doctor", doctorId],
    queryFn: () => apiGet<Doctor>(`/doctors/${doctorId}`),
    retry: false,
  });

  // Prefill patient name from the profile once it loads.
  if (me.data && !name) {
    setName(me.data.name);
  }

  const pay = useMutation({
    mutationFn: async (): Promise<Appointment> => {
      const created = await api.post<Appointment>("/appointments", {
        doctor_id: doctorId,
        date,
        time,
        patient_name: name.trim(),
        patient_phone: phone.trim(),
      });
      try {
        return await api.post<Appointment>(`/appointments/${created.id}/pay`, { payment_mode: mode });
      } catch (err) {
        // Release the slot if the demo settlement fails.
        await api.post(`/appointments/${created.id}/cancel`).catch(() => undefined);
        throw err;
      }
    },
    onSuccess: (appt) => {
      setPaid(appt);
      setPayError("");
      toast.success(`Booking confirmed — ${appt.reference}`);
      void queryClient.invalidateQueries({ queryKey: ["appointments"] });
      void queryClient.invalidateQueries({ queryKey: ["slots"] });
    },
    onError: (e) => {
      setPayError(e instanceof Error ? e.message : "Payment failed — try again");
    },
  });

  if (isLoaded && !isSignedIn) {
    return (
      <Navigate
        to={`/sign-in?redirect=${encodeURIComponent(location.pathname + location.search)}`}
        replace
      />
    );
  }

  // SUCCESS — appointment pass
  if (paid) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-14 md:px-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-emerald-400">
          TXN // COMPLETE
        </p>
        <h1 className="mt-3 font-heading text-4xl font-bold uppercase tracking-tight text-zinc-50">
          Slot locked<span className="text-emerald-400">.</span>
        </h1>

        <div
          className="panel-corners relative mt-8 border border-emerald-500/30 bg-[#10121B] p-6"
          data-testid="appointment-pass"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500">
                Booking reference
              </p>
              <p className="mt-1 font-mono text-2xl font-bold tracking-tight text-zinc-50" data-testid="appointment-reference">
                {paid.reference}
              </p>
            </div>
            <StatusBadge status={paid.status} />
          </div>
          <div className="mt-6 grid gap-4 border-t border-white/10 pt-6 font-mono text-xs text-zinc-300 sm:grid-cols-2">
            <p>
              <span className="block text-[10px] uppercase tracking-[0.2em] text-zinc-500">Patient</span>
              {paid.patient_name}
            </p>
            <p>
              <span className="block text-[10px] uppercase tracking-[0.2em] text-zinc-500">Slot</span>
              {fmtDate(paid.date)} · {fmtTime(paid.time)}
            </p>
            <p>
              <span className="block text-[10px] uppercase tracking-[0.2em] text-zinc-500">Doctor</span>
              {paid.doctor_name} — {paid.doctor_specialisation}
            </p>
            <p>
              <span className="block text-[10px] uppercase tracking-[0.2em] text-zinc-500">Clinic</span>
              {paid.clinic_name}, {paid.clinic_city}
            </p>
            <p>
              <span className="block text-[10px] uppercase tracking-[0.2em] text-zinc-500">Paid via</span>
              {paid.payment_mode} · {paid.payment_status}
            </p>
            <p>
              <span className="block text-[10px] uppercase tracking-[0.2em] text-zinc-500">Amount</span>
              {inr(paid.amount)}
            </p>
          </div>
          <div className="mt-6 border-t border-white/10 pt-6">
            <QrMock seed={paid.reference} />
          </div>
          <p className="mt-4 border border-amber-500/40 bg-amber-500/10 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-amber-400" data-testid="mocked-payment-banner">
            Demo payment simulator — mocked // no real money charged
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/dashboard" data-testid="pass-view-dashboard" className={buttonVariants({ className: "font-mono" })}>
            View my dashboard ↗
          </Link>
          <Link to="/doctors" data-testid="pass-book-another" className={buttonVariants({ variant: "outline", className: "font-mono" })}>
            Book another ↗
          </Link>
        </div>
      </div>
    );
  }

  const fee = doctor.data?.fee ?? 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
      <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-amber-400" data-testid="mocked-checkout-banner">
        ⚠ Demo payment simulator — mocked // no real money moves
      </p>
      <h1 className="mt-3 font-heading text-4xl font-bold uppercase tracking-tight text-zinc-50 md:text-5xl">
        Checkout<span className="text-emerald-400">.</span>
      </h1>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        {/* SUMMARY + PATIENT DETAILS */}
        <div className="border border-white/12 bg-[#10121B] p-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500">
            Booking summary
          </p>
          <div className="mt-4 space-y-1 font-mono text-sm text-zinc-200">
            <p className="font-heading text-lg font-semibold uppercase tracking-tight text-zinc-50">
              {doctor.data?.name ?? "…"}
            </p>
            <p className="text-[11px] uppercase tracking-wider text-emerald-400">
              {doctor.data?.specialisation}
            </p>
            <p className="text-xs text-zinc-500">
              {doctor.data?.clinic_name} · {doctor.data?.area}, {doctor.data?.city}
            </p>
            <p className="pt-2 text-xs text-zinc-300" data-testid="checkout-slot-summary">
              {date && time ? `${fmtDate(date)} · ${fmtTime(time)}` : "—"}
            </p>
          </div>

          <div className="mt-6 space-y-4 border-t border-white/10 pt-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500">
              Patient details
            </p>
            <div>
              <label htmlFor="checkout-name" className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400">
                Full name
              </label>
              <Input
                id="checkout-name"
                data-testid="checkout-name-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="mt-1 border-white/15 bg-transparent font-mono text-sm"
              />
            </div>
            <div>
              <label htmlFor="checkout-phone" className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400">
                Phone (optional)
              </label>
              <Input
                id="checkout-phone"
                data-testid="checkout-phone-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91…"
                className="mt-1 border-white/15 bg-transparent font-mono text-sm"
              />
            </div>
          </div>
        </div>

        {/* PAYMENT CONSOLE */}
        <div className="border border-white/12 bg-[#10121B] p-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500">
            Payment method
          </p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {METHODS.map((m) => (
              <button
                key={m.v}
                type="button"
                data-testid={`pay-method-${m.v.toLowerCase()}`}
                onClick={() => setMode(m.v)}
                className={`border px-3 py-3 font-mono text-xs tracking-wider transition-colors ${
                  mode === m.v
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-300"
                    : "border-white/15 text-zinc-400 hover:border-emerald-500/40"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          <div className="mt-6 divide-y divide-white/10 border border-white/10">
            <div className="flex items-center justify-between px-4 py-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                Consultation fee
              </span>
              <span className="font-mono text-sm text-zinc-200">{inr(fee)}</span>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                Platform fee
              </span>
              <span className="font-mono text-sm text-zinc-200">₹0</span>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                GST
              </span>
              <span className="font-mono text-sm text-zinc-200">INCLUDED</span>
            </div>
            <div className="flex items-center justify-between bg-emerald-500/5 px-4 py-3">
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-300">
                Total payable
              </span>
              <span className="font-mono text-lg font-bold text-emerald-400" data-testid="checkout-total">
                {inr(fee)}
              </span>
            </div>
          </div>

          {payError && (
            <p className="mt-4 border border-red-500/40 bg-red-500/10 px-3 py-2 font-mono text-[11px] text-red-400" data-testid="checkout-error">
              ERR // {payError}
            </p>
          )}

          <Button
            className="mt-6 w-full font-mono"
            size="lg"
            data-testid="pay-button"
            disabled={!name.trim() || !doctor.data || pay.isPending || !date || !time}
            onClick={() => pay.mutate()}
          >
            {pay.isPending ? (
              <span>
                PROCESSING<span className="animate-caret">▍</span>
              </span>
            ) : (
              `PAY ${inr(fee)} ↗`
            )}
          </Button>
          <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-600">
            Mocked UPI / card rails — booking confirms instantly
          </p>
        </div>
      </div>
    </div>
  );
}
