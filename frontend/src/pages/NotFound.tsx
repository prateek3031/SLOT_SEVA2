import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <section className="flex min-h-[calc(100svh-4rem)] flex-col items-center justify-center px-6 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-emerald-400">
        ERROR // 404
      </p>
      <h1 className="mt-4 font-heading text-5xl font-bold uppercase tracking-tight text-zinc-50">
        Page not found
      </h1>
      <p className="mt-4 max-w-md font-mono text-sm leading-relaxed text-zinc-400">
        This page does not exist or may have moved.
      </p>
      <Link
        to="/"
        className="mt-8 border border-emerald-500/50 px-5 py-3 font-mono text-xs uppercase tracking-wider text-emerald-400 transition-colors hover:bg-emerald-500/10"
      >
        Return home
      </Link>
    </section>
  );
}