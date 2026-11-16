import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { apiGet } from "@/lib/api";
import type { Doctor, SlotDay } from "@/lib/types";
import { dayLabel, fmtDate, fmtTime, inr, parseDay } from "@/lib/format";
import { format } from "date-fns";

export default function DoctorProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const doctor = useQuery({
    enabled: !!id,
    queryKey: ["doctor", id],
    queryFn: () => apiGet<Doctor>(`/doctors/${id}`),
    retry: false,
  });

  const slotsQ = useQuery({
    enabled: !!id,
    queryKey: ["slots", id, date],
    queryFn: () => apiGet<SlotDay>(`/doctors/${id}/slots${date ? `?date=${date}` : ""}`),
    placeholderData: (prev) => prev,
  });

  const days = slotsQ.data?.days ?? [];
  const today = days[0] ?? "";
  const activeDate = date || slotsQ.data?.date || "";
  const slots = slotsQ.data?.slots ?? [];

  const groups = [
    { label: "Morning", items: slots.filter((s) => s.time < "12:00") },
    { label: "Afternoon", items: slots.filter((s) => s.time >= "12:00" && s.time < "17:00") },
    { label: "Evening", items: slots.filter((s) => s.time >= "17:00") },
  ];

  if (doctor.isError) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-red-400">
          ERR // doctor not found
        </p>
        <Link to="/doctors" data-testid="profile-back-to-directory" className={buttonVariants({ variant: "outline", className: "mt-6 font-mono" })}>
          Back to directory ↗
        </Link>
      </div>
    );
  }

  const d = doctor.data;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
      <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-emerald-400">
        03 // Direct reservation
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        {/* PROFILE PANEL */}
        <div className="border border-white/12 bg-[#10121B]">
          <div className="relative h-64 border-b border-white/10">
            {d?.image_url && (
              <img src={d.image_url} alt={d.name} className="h-full w-full object-cover object-top opacity-85" />
            )}
          </div>
          <div className="space-y-4 p-6">
            <div>
              <h1 className="font-heading text-3xl font-bold uppercase tracking-tight text-zinc-50" data-testid="doctor-profile-name">
                {d?.name ?? "…"}
              </h1>
              <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.2em] text-emerald-400" data-testid="doctor-profile-specialisation">
                {d?.specialisation}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="border-white/15 font-mono text-[10px] text-zinc-300">
                ★ {d?.rating.toFixed(1) ?? "—"} ({d?.reviews ?? 0} reviews)
              </Badge>
              <Badge variant="outline" className="border-white/15 font-mono text-[10px] text-zinc-300">
                {d?.experience_years ?? 0} YRS EXP
              </Badge>
              <Badge variant="outline" className="border-white/15 font-mono text-[10px] text-zinc-300">
                {d?.languages.join(" · ")}
              </Badge>
            </div>
            <div className="border-t border-white/10 pt-4 font-mono text-xs leading-relaxed text-zinc-400">
              <p className="font-heading text-sm font-semibold uppercase tracking-tight text-zinc-200">
                {d?.clinic_name}
              </p>
              <p className="mt-1">{d?.address}</p>
              <p className="mt-3 text-zinc-500">{d?.about}</p>
            </div>
            <div className="divide-y divide-white/10 border border-white/10">
              <div className="flex items-center justify-between px-4 py-3">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                  Consultation fee
                </span>
                <span className="font-mono text-sm font-bold text-zinc-100">{inr(d?.fee ?? 0)}</span>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                  Consulting hours
                </span>
                <span className="font-mono text-[11px] text-zinc-300">
                  {Array.from(new Set((d?.windows ?? []).map((w) => `${w.start}–${w.end}`))).join(" · ")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* SLOT BAY */}
        <div className="border border-white/12 bg-[#10121B]">
          <p className="border-b border-white/10 px-5 py-3 font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500">
            Live slot bay // next 7 days
          </p>

          <div className="flex gap-2 overflow-x-auto border-b border-white/10 p-4" data-testid="date-strip">
            {days.map((day) => (
              <button
                key={day}
                type="button"
                data-testid={`date-${day}`}
                onClick={() => {
                  setDate(day);
                  setTime("");
                }}
                className={`min-w-[72px] border px-3 py-2 text-center transition-colors ${
                  activeDate === day
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-300"
                    : "border-white/15 text-zinc-400 hover:border-emerald-500/40"
                }`}
              >
                <span className="block font-mono text-[10px] uppercase tracking-wider">
                  {dayLabel(day, today)}
                </span>
                <span className="block font-mono text-[11px]">{format(parseDay(day), "dd MMM")}</span>
              </button>
            ))}
          </div>

          <div className="space-y-5 p-5" data-testid="slot-groups">
            {groups.map((g) =>
              g.items.length === 0 ? null : (
                <div key={g.label}>
                  <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500">
                    {g.label} — {fmtDate(activeDate)}
                  </p>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {g.items.map((s) => (
                      <button
                        key={s.time}
                        type="button"
                        data-testid={`slot-${s.time}`}
                        disabled={s.status !== "open"}
                        onClick={() => setTime(s.time)}
                        className={`border px-2 py-2 font-mono text-xs transition-colors ${
                          time === s.time
                            ? "border-emerald-500 bg-emerald-500/15 text-emerald-300"
                            : s.status === "open"
                              ? "border-white/15 text-zinc-300 hover:border-emerald-500/50"
                              : "border-white/5 text-zinc-600 line-through"
                        }`}
                      >
                        {fmtTime(s.time)}
                      </button>
                    ))}
                  </div>
                </div>
              ),
            )}
            {slotsQ.isFetching && slots.length === 0 && (
              <p className="font-mono text-[11px] text-zinc-600">
                LOADING SLOTS <span className="animate-caret">▍</span>
              </p>
            )}
            {!slotsQ.isFetching && slots.length === 0 && (
              <p className="font-mono text-[11px] text-zinc-500" data-testid="slots-empty-state">
                No consulting hours on this day — try another date.
              </p>
            )}
          </div>

          <div className="sticky bottom-0 border-t border-white/10 bg-[#10121B] p-4">
            <Button
              className="w-full font-mono"
              size="lg"
              data-testid="proceed-checkout-button"
              disabled={!time}
              onClick={() =>
                navigate(`/checkout?doctor=${id}&date=${activeDate}&time=${time}`)
              }
            >
              {time
                ? `Proceed to checkout // ${fmtTime(time)} ↗`
                : "Select a slot to continue"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
