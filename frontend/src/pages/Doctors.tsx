import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DoctorCard from "@/components/DoctorCard";
import { apiGet } from "@/lib/api";
import type { Doctor, DoctorMeta } from "@/lib/types";

const FEE_LABELS: Record<string, string> = {
  "": "ANY FEE",
  "500": "UNDER ₹500",
  "1000": "UNDER ₹1,000",
};

const SORT_LABELS: Record<string, string> = {
  rating: "TOP RATED",
  fee_low: "LOWEST FEE",
  experience: "MOST EXPERIENCED",
};

export default function Doctors() {
  const [params, setParams] = useSearchParams();
  const specialisation = params.get("specialisation") ?? "";
  const city = params.get("city") ?? "";
  const maxFee = params.get("max_fee") ?? "";
  const sort = params.get("sort") || "rating";
  const [qInput, setQInput] = useState(params.get("q") ?? "");

  const meta = useQuery({
    queryKey: ["doctors-meta"],
    queryFn: () => apiGet<DoctorMeta>("/doctors/meta"),
    retry: false,
  });

  const qs = useMemo(() => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries({ specialisation, city, max_fee: maxFee, sort, q: params.get("q") ?? "" })) {
      if (v) p.set(k, v);
    }
    const s = p.toString();
    return s ? `?${s}` : "";
  }, [specialisation, city, maxFee, sort, params]);

  const doctors = useQuery({
    queryKey: ["doctors", qs],
    queryFn: () => apiGet<Doctor[]>(`/doctors${qs}`),
    placeholderData: (prev) => prev,
  });

  function setParam(key: string, value: string): void {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  }

  const list = doctors.data ?? [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
      <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-emerald-400">
        02 // Doctor discovery
      </p>
      <h1 className="mt-3 font-heading text-4xl font-bold uppercase tracking-tight text-zinc-50 md:text-5xl">
        Clinician directory<span className="text-emerald-400">.</span>
      </h1>

      <div className="mt-10 grid gap-8 lg:grid-cols-[280px_1fr]">
        {/* FILTER MATRIX */}
        <aside className="self-start lg:sticky lg:top-24">
          <div className="border border-white/12 bg-[#10121B]">
            <p className="border-b border-white/10 px-5 py-3 font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500">
              Filter matrix
            </p>
            <form
              className="border-b border-white/10 p-4"
              onSubmit={(e) => {
                e.preventDefault();
                setParam("q", qInput.trim());
              }}
            >
              <Input
                data-testid="doctor-search-input"
                value={qInput}
                onChange={(e) => setQInput(e.target.value)}
                placeholder="Search name / clinic…"
                className="border-white/15 bg-transparent font-mono text-sm"
              />
            </form>

            <div className="border-b border-white/10 p-4">
              <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500">
                Specialisation
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  data-testid="filter-spec-all"
                  onClick={() => setParam("specialisation", "")}
                  className={`border px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider transition-colors ${
                    !specialisation
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-300"
                      : "border-white/15 text-zinc-400 hover:border-emerald-500/40"
                  }`}
                >
                  All
                </button>
                {(meta.data?.specialisation_list ?? []).map((f) => (
                  <button
                    key={f.name}
                    type="button"
                    data-testid={`filter-spec-${f.name.toLowerCase().replace(/[^a-z]+/g, "-")}`}
                    onClick={() => setParam("specialisation", specialisation === f.name ? "" : f.name)}
                    className={`border px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider transition-colors ${
                      specialisation === f.name
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-300"
                        : "border-white/15 text-zinc-400 hover:border-emerald-500/40"
                    }`}
                  >
                    {f.name} <span className="text-zinc-600">{f.count}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4 p-4">
              <div>
                <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500">City</p>
                <Select value={city} onValueChange={(v: string) => setParam("city", v)}>
                  <SelectTrigger data-testid="filter-city-select" className="w-full font-mono text-xs">
                    <SelectValue>{(v: unknown) => (v as string) || "ALL CITIES"}</SelectValue>
                  </SelectTrigger>
                  <SelectContent className="font-mono text-xs">
                    <SelectItem value="ALL_CITIES_SENTINEL" hidden>
                      ALL CITIES
                    </SelectItem>
                    {(meta.data?.city_list ?? []).map((c) => (
                      <SelectItem key={c.name} value={c.name}>
                        {c.name} ({c.count})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500">Fee</p>
                <Select value={maxFee} onValueChange={(v: string) => setParam("max_fee", v)}>
                  <SelectTrigger data-testid="filter-fee-select" className="w-full font-mono text-xs">
                    <SelectValue>{(v: unknown) => FEE_LABELS[v as string] ?? "ANY FEE"}</SelectValue>
                  </SelectTrigger>
                  <SelectContent className="font-mono text-xs">
                    {Object.entries(FEE_LABELS).map(([v, label]) => (
                      <SelectItem key={v || "any"} value={v || "ANY_FEE_SENTINEL"}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500">Sort</p>
                <Select value={sort} onValueChange={(v: string) => setParam("sort", v)}>
                  <SelectTrigger data-testid="filter-sort-select" className="w-full font-mono text-xs">
                    <SelectValue>{(v: unknown) => SORT_LABELS[v as string] ?? "TOP RATED"}</SelectValue>
                  </SelectTrigger>
                  <SelectContent className="font-mono text-xs">
                    {Object.entries(SORT_LABELS).map(([v, label]) => (
                      <SelectItem key={v} value={v}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="outline"
                size="sm"
                data-testid="filters-clear-button"
                className="w-full font-mono"
                onClick={() => setParams({}, { replace: true })}
              >
                Clear all filters
              </Button>
            </div>
          </div>
        </aside>

        {/* RESULTS */}
        <div>
          <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.25em] text-zinc-500" data-testid="doctors-result-count">
            {doctors.isFetching ? "SCANNING" : `${list.length} RESULTS`} //{" "}
            {specialisation || "ALL SPECIALISATIONS"}
          </p>
          <motion.div
            className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
            initial="hidden"
            animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
          >
            {list.map((d, i) => (
              <motion.div
                key={d.id}
                variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
              >
                <DoctorCard doctor={d} index={i} />
              </motion.div>
            ))}
          </motion.div>
          {!doctors.isFetching && list.length === 0 && (
            <div className="border border-white/12 bg-[#10121B] px-6 py-12 text-center">
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-zinc-500" data-testid="doctors-empty-state">
                0 results // adjust the filter matrix
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
