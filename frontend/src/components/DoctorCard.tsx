import { Link } from "react-router-dom";
import type { Doctor } from "@/lib/types";
import { inr } from "@/lib/format";

export default function DoctorCard({ doctor, index }: { doctor: Doctor; index: number }) {
  return (
    <Link
      to={`/doctors/${doctor.id}`}
      data-testid={`doctor-card-${doctor.id}`}
      className="group relative flex flex-col border border-white/12 bg-[#10121B] transition-colors hover:border-emerald-500/50"
    >
      <div className="relative h-44 overflow-hidden border-b border-white/10">
        <img
          src={doctor.image_url}
          alt={doctor.name}
          loading="lazy"
          className="h-full w-full object-cover object-top opacity-80 transition-opacity group-hover:opacity-100"
        />
        <span className="absolute left-2 top-2 border border-white/20 bg-black/60 px-1.5 py-0.5 font-mono text-[10px] tracking-[0.2em] text-zinc-300">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="absolute right-2 top-2 border border-emerald-500/40 bg-black/60 px-1.5 py-0.5 font-mono text-[10px] text-emerald-400">
          ★ {doctor.rating.toFixed(1)}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h3 className="font-heading text-base font-semibold uppercase tracking-tight text-zinc-50">
          {doctor.name}
        </h3>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-400/90">
          {doctor.specialisation}
        </p>
        <p className="font-mono text-[11px] leading-relaxed text-zinc-500">
          {doctor.clinic_name} · {doctor.area}, {doctor.city}
        </p>
        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="font-mono text-sm font-bold text-zinc-100">
            {inr(doctor.fee)}
            <span className="ml-1 text-[10px] font-normal text-zinc-500">/ consult</span>
          </span>
          <span className="font-mono text-[11px] uppercase tracking-wider text-emerald-400 group-hover:text-emerald-300">
            Book ↗
          </span>
        </div>
      </div>
    </Link>
  );
}
