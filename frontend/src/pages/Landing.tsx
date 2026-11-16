import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DoctorCard from "@/components/DoctorCard";
import { useTriage } from "@/components/triage/TriageContext";
import { apiGet } from "@/lib/api";
import type { Doctor, DoctorMeta } from "@/lib/types";

const SPEC_GLYPHS: Record<string, string> = {
  "General Physician": "✚",
  Cardiologist: "◉",
  "Orthopaedics & Sports Medicine": "◈",
  Dermatologist: "✦",
  Pediatrician: "⌁",
  "Gynaecologist": "❋",
  "ENT Specialist": "◎",
  Neurologist: "⚡",
};

function IndexRow({
  n,
  label,
  sub,
  to,
  onClick,
  testId,
}: {
  n: string;
  label: string;
  sub: string;
  to?: string;
  onClick?: () => void;
  testId: string;
}) {
  const cls =
    "flex w-full items-center justify-between px-5 py-5 text-left transition-colors hover:bg-white/[0.04]";
  const inner = (
    <>
      <div>
        <p className="font-mono text-[10px] tracking-[0.3em] text-zinc-500">{n}</p>
        <p className="mt-1 font-heading text-lg font-semibold uppercase tracking-tight text-zinc-100">
          {label}
        </p>
        <p className="font-mono text-[11px] text-zinc-500">{sub}</p>
      </div>
      <span className="font-mono text-emerald-400">↗</span>
    </>
  );
  return to ? (
    <Link to={to} data-testid={testId} className={cls}>
      {inner}
    </Link>
  ) : (
    <button type="button" onClick={onClick} data-testid={testId} className={cls}>
      {inner}
    </button>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const { setOpen } = useTriage();
  const [q, setQ] = useState("");

  // Non-blocking probes: the shell always renders; only the numbers/dashboards degrade.
  const meta = useQuery({
    queryKey: ["doctors-meta"],
    queryFn: () => apiGet<DoctorMeta>("/doctors/meta"),
    retry: false,
  });
  const docs = useQuery({
    queryKey: ["doctors", "top"],
    queryFn: () => apiGet<Doctor[]>("/doctors"),
    retry: false,
  });

  const stats = [
    { label: "Clinicians listed", value: meta.data?.doctors },
    { label: "Cities live", value: meta.data?.cities },
    { label: "Specialisations", value: meta.data?.specialisations },
  ];

  return (
    <div className="text-zinc-200">
      {/* HERO */}
      <section className="scanlines relative overflow-hidden border-b border-white/10">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-14 md:px-8 md:py-24 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-emerald-400">
              SYS // SLOTSEVA <span className="online-dot">●</span> ONLINE — LOCAL CLINICS, INSTANT
              SLOTS
            </p>
            <h1 className="mt-6 font-heading text-5xl font-bold uppercase leading-[0.95] tracking-[-0.03em] text-zinc-50 md:text-7xl">
              Book the
              <br />
              <span className="text-emerald-400">right doctor.</span>
              <br />
              In minutes.
            </h1>
            <p className="mt-6 max-w-md font-mono text-sm leading-relaxed text-zinc-400">
              SLOT SEVA connects you to verified neighbourhood clinics — filter by specialisation,
              grab a live slot, pay at the demo checkout, walk in.
            </p>
            <form
              className="mt-8 flex max-w-md border border-white/15 bg-[#10121B]"
              onSubmit={(e) => {
                e.preventDefault();
                navigate(`/doctors?q=${encodeURIComponent(q)}`);
              }}
            >
              <Input
                data-testid="hero-search-input"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search doctor, clinic, specialisation…"
                className="border-0 bg-transparent font-mono text-sm focus-visible:ring-0"
              />
              <Button type="submit" data-testid="hero-search-button" className="font-mono">
                FIND ↗
              </Button>
            </form>
            <div className="mt-10 grid max-w-md grid-cols-3 divide-x divide-white/10 border border-white/10">
              {stats.map((s) => (
                <div key={s.label} className="px-4 py-3">
                  <p className="font-heading text-2xl font-bold text-emerald-400">
                    {s.value ?? "—"}
                  </p>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-500">
              Index directory
            </p>
            <div className="panel-corners relative mt-3 divide-y divide-white/10 border border-white/12">
              <IndexRow
                n="01 ↗"
                label="Find a doctor"
                sub="Filter by specialisation, city & fee"
                to="/doctors"
                testId="landing-index-doctors"
              />
              <IndexRow
                n="02 ↗"
                label="Specialisation index"
                sub="Eight specialties, listed live"
                to="/doctors"
                testId="landing-index-specialisations"
              />
              <IndexRow
                n="03 ↗"
                label="Symptom AI triage"
                sub="Describe your problem, get a match"
                onClick={() => setOpen(true)}
                testId="landing-index-triage"
              />
              <IndexRow
                n="04 ↗"
                label="How it works"
                sub="Search → slot → checkout → walk in"
                onClick={() => document.getElementById("how")?.scrollIntoView({ behavior: "smooth" })}
                testId="landing-index-how"
              />
            </div>
          </div>
        </div>
      </section>

      {/* SPECIALISATION MATRIX */}
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-14 md:px-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-emerald-400">
            01 // Specialisation index
          </p>
          <h2 className="mt-3 font-heading text-3xl font-bold uppercase tracking-tight text-zinc-50 md:text-4xl">
            Every specialty.
            <br />
            Neighbourhood close.
          </h2>
          <div className="mt-8 grid grid-cols-2 gap-px border border-white/10 bg-white/10 md:grid-cols-4">
            {(meta.data?.specialisation_list ?? []).slice(0, 8).map((f, i) => (
              <Link
                key={f.name}
                to={`/doctors?specialisation=${encodeURIComponent(f.name)}`}
                data-testid={`spec-card-${i}`}
                className="bg-[#0B0D14] px-5 py-6 transition-colors hover:bg-[#10121B]"
              >
                <span className="text-xl text-emerald-400">{SPEC_GLYPHS[f.name] ?? "◈"}</span>
                <p className="mt-3 font-heading text-sm font-semibold uppercase tracking-tight text-zinc-100">
                  {f.name}
                </p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                  {f.count} doctors
                </p>
              </Link>
            ))}
            {!meta.data && (
              <div className="col-span-2 bg-[#0B0D14] px-5 py-6 font-mono text-[11px] text-zinc-600 md:col-span-4">
                LOADING INDEX <span className="animate-caret">▍</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* DOCTOR MATRIX */}
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-14 md:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-emerald-400">
                02 // Clinician directory
              </p>
              <h2 className="mt-3 font-heading text-3xl font-bold uppercase tracking-tight text-zinc-50 md:text-4xl">
                Top rated near you.
              </h2>
            </div>
            <Link
              to="/doctors"
              data-testid="landing-view-all-doctors"
              className="font-mono text-[11px] uppercase tracking-[0.2em] text-emerald-400 hover:text-emerald-300"
            >
              View all ↗
            </Link>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {(docs.data ?? []).slice(0, 4).map((d, i) => (
              <DoctorCard key={d.id} doctor={d} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-14 md:px-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-emerald-400">
            03 // Direct reservation
          </p>
          <h2 className="mt-3 font-heading text-3xl font-bold uppercase tracking-tight text-zinc-50 md:text-4xl">
            Don&apos;t queue.
            <br />
            Reserve.
          </h2>
          <div className="mt-8 grid gap-px border border-white/10 bg-white/10 md:grid-cols-3">
            {[
              {
                n: "01",
                t: "Search & filter",
                d: "Open the directory and filter by specialisation, city and fee — every clinician is a verified local clinic.",
              },
              {
                n: "02",
                t: "Pick a live slot",
                d: "Choose a date in the next 7 days and grab an open 30-minute slot from the doctor's real consulting hours.",
              },
              {
                n: "03",
                t: "Pay & walk in",
                d: "Confirm at the demo checkout (no real money), get your booking reference and show up 10 minutes early.",
              },
            ].map((s) => (
              <div key={s.n} className="bg-[#0B0D14] px-6 py-8">
                <p className="font-heading text-4xl font-bold text-emerald-400/40">{s.n}</p>
                <p className="mt-4 font-heading text-lg font-semibold uppercase tracking-tight text-zinc-100">
                  {s.t}
                </p>
                <p className="mt-2 font-mono text-xs leading-relaxed text-zinc-500">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI TRIAGE BAND */}
      <section className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-4 py-14 md:flex-row md:items-center md:px-8">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-emerald-400">
              04 // Symptom AI
            </p>
            <h2 className="mt-3 font-heading text-3xl font-bold uppercase tracking-tight text-zinc-50 md:text-4xl">
              Don&apos;t know which specialist?
              <br />
              Describe it. We&apos;ll match it.
            </h2>
          </div>
          <Button
            size="lg"
            data-testid="landing-open-triage"
            onClick={() => setOpen(true)}
            className="font-mono"
          >
            ✦ OPEN SYMPTOM AI ↗
          </Button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#07080C]">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-4 py-10 md:flex-row md:items-center md:px-8">
          <div className="flex items-baseline gap-2">
            <span className="font-heading text-base font-bold uppercase tracking-tight text-zinc-100">
              Slot Seva
            </span>
            <span className="text-emerald-400">◈</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-600">
              Built for local clinics
            </span>
          </div>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-600">
            LOC // IND-DEL-MUM-BLR — 24×7 DESK — SLOT SEVA / 2026
          </p>
        </div>
      </footer>
    </div>
  );
}
