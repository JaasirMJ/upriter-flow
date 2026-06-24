import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore, activeDoctor, avgConsultMins } from "@/lib/store";
import { Activity, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/display")({
  head: () => ({ meta: [{ title: "Live Display — Upriter" }] }),
  component: DisplayPage,
});

function DisplayPage() {
  const patients = useStore((s) => s.patients);
  const currentToken = useStore((s) => s.currentToken);
  const lastUpdatedAt = useStore((s) => s.lastUpdatedAt);
  const now = useStore((s) => s.now);
  const doctor = useStore((s) => activeDoctor(s));
  const avg = useStore((s) => avgConsultMins(s));

  const current = patients.find((p) => p.status === "in_progress");
  const waiting = patients.filter((p) => p.status === "waiting").sort((a, b) => a.token - b.token);
  const next3 = waiting.slice(0, 3);
  const estWait = Math.round(waiting.length * avg + (doctor.status === "late" ? doctor.delayMins : doctor.status === "break" ? 10 : 0));
  const secsSince = Math.max(0, Math.floor((now - lastUpdatedAt) / 1000));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white p-8 md:p-14 flex flex-col">
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-3">
          <div className="size-12 rounded-2xl bg-gradient-to-br from-teal-400 to-blue-500 grid place-items-center shadow-lg">
            <Activity className="size-7 text-white" />
          </div>
          <div>
            <div className="text-2xl font-semibold tracking-tight">Upriter Live</div>
            <div className="text-sm text-slate-400 uppercase tracking-widest">Hospital Display</div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-xs uppercase tracking-widest text-slate-400">Doctor</div>
            <div className="text-2xl font-semibold">{doctor.name}</div>
            <div className="text-sm text-teal-300">{doctor.specialty}</div>
          </div>
          <Link to="/reception" className="hidden md:inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition">
            <ArrowLeft className="size-3.5" /> Exit
          </Link>
        </div>
      </div>

      <div className="flex-1 grid lg:grid-cols-3 gap-8 items-stretch">
        {/* Now serving */}
        <div className="lg:col-span-2 rounded-3xl bg-gradient-to-br from-teal-500/20 to-blue-500/10 border border-teal-400/30 p-10 md:p-14 flex flex-col justify-center shadow-2xl">
          <div className="text-sm uppercase tracking-[0.3em] text-teal-300 mb-4 flex items-center gap-2">
            <span className="size-2 rounded-full bg-teal-400 animate-pulse" />
            Now serving
          </div>
          <div className="text-[10rem] md:text-[14rem] leading-none font-bold tabular-nums bg-gradient-to-br from-white to-teal-200 bg-clip-text text-transparent">
            {currentToken}
          </div>
          <div className="mt-6 text-2xl md:text-3xl font-medium text-slate-100">
            {current ? current.name : "—"}
          </div>
        </div>

        {/* Next + wait */}
        <div className="flex flex-col gap-6">
          <div className="rounded-3xl bg-white/5 border border-white/10 p-8 backdrop-blur">
            <div className="text-xs uppercase tracking-[0.25em] text-slate-400 mb-4">Next tokens</div>
            <div className="space-y-3">
              {next3.length === 0 && <div className="text-slate-500 text-lg">Queue empty</div>}
              {next3.map((p, i) => (
                <div key={p.id} className="flex items-baseline justify-between gap-4 py-2 border-b border-white/5 last:border-0">
                  <span className={`tabular-nums font-semibold ${i === 0 ? "text-5xl text-white" : "text-4xl text-slate-300"}`}>{p.token}</span>
                  <span className="text-sm text-slate-400 truncate">{p.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-white/5 border border-white/10 p-8 backdrop-blur">
            <div className="text-xs uppercase tracking-[0.25em] text-slate-400 mb-3">Estimated wait</div>
            <div className="flex items-baseline gap-2">
              <span className="text-6xl font-bold tabular-nums text-white">{estWait}</span>
              <span className="text-2xl text-slate-400">mins</span>
            </div>
            <div className="mt-2 text-sm text-slate-400">{waiting.length} patients in queue</div>
          </div>
        </div>
      </div>

      <div className="mt-10 flex items-center justify-between text-sm text-slate-500">
        <div className="flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Live · auto-refresh
        </div>
        <div>Last updated {secsSince}s ago · {new Date(now).toLocaleTimeString()}</div>
      </div>
    </div>
  );
}
