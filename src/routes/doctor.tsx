import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useStore, activeDoctor, avgConsultMins } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Coffee, Pause, Play, Stethoscope, Timer, CheckCircle2, AlertCircle, Activity } from "lucide-react";
import { Stat } from "@/components/Stat";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/doctor")({
  head: () => ({ meta: [{ title: "Doctor — Upriter" }] }),
  component: DoctorPage,
});

function DoctorPage() {
  const state = useStore();
  const doc = activeDoctor(state);
  const inProgress = state.patients.find((p) => p.status === "in_progress");
  const waiting = state.patients.filter((p) => p.status === "waiting").sort((a, b) => a.token - b.token);
  const done = state.patients.filter((p) => p.status === "completed").length;
  const avg = avgConsultMins(state);

  return (
    <AppShell title="Doctor Dashboard" subtitle={`${doc.name} • ${doc.specialty}`}>
      <div className="grid md:grid-cols-4 gap-4">
        <Stat icon={CheckCircle2} label="Seen today" value={done} tone="success" />
        <Stat icon={Timer} label="Avg consult" value={`${Math.round(avg)} m`} tone="primary" />
        <Stat icon={Activity} label="In queue" value={waiting.length} />
        <Stat
          icon={AlertCircle}
          label="Delay"
          value={doc.status === "late" ? `+${doc.delayMins}m` : doc.status === "break" ? "Break" : "On time"}
          tone={doc.status === "available" ? "success" : "warning"}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-5 mt-5">
        <div className="lg:col-span-2 space-y-5">
          <ConsultationCard inProgress={inProgress} />
          <ScheduleTable />
        </div>
        <div className="space-y-5">
          <StatusCard />
        </div>
      </div>
    </AppShell>
  );
}

function ConsultationCard({ inProgress }: { inProgress?: any }) {
  const { startConsultation, endConsultation, callNext } = useStore();
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!inProgress?.startedAt) return setElapsed(0);
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - inProgress.startedAt) / 1000)), 1000);
    return () => clearInterval(t);
  }, [inProgress?.startedAt]);

  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");

  return (
    <Card className="p-6 relative overflow-hidden">
      <div className="absolute -top-20 -right-20 size-56 rounded-full bg-gradient-hero opacity-10 blur-2xl" />
      <div className="text-xs uppercase tracking-wider text-muted-foreground">Current consultation</div>
      {inProgress ? (
        <>
          <div className="mt-2 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">{inProgress.name}</h2>
              <div className="text-sm text-muted-foreground">Token #{inProgress.token} • Age {inProgress.age}</div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-semibold tabular-nums">{mm}:{ss}</div>
              <div className="text-xs text-muted-foreground">elapsed</div>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {!inProgress.startedAt && (
              <Button onClick={startConsultation} className="gap-2"><Play className="size-4" />Start consultation</Button>
            )}
            <Button onClick={endConsultation} variant="default" className="gap-2"><CheckCircle2 className="size-4" />End & call next</Button>
          </div>
        </>
      ) : (
        <div className="mt-3">
          <p className="text-muted-foreground">No active consultation.</p>
          <Button onClick={callNext} className="mt-3 gap-2"><Play className="size-4" />Call next patient</Button>
        </div>
      )}
    </Card>
  );
}

function ScheduleTable() {
  const state = useStore();
  const list = [...state.patients]
    .filter((p) => p.status !== "completed" || true)
    .sort((a, b) => a.token - b.token);

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold tracking-tight">Today's schedule</h3>
        <Badge variant="secondary">{list.filter((p) => p.status === "waiting").length} waiting</Badge>
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
              <th className="py-2 pr-3">Token</th>
              <th className="py-2 pr-3">Patient</th>
              <th className="py-2 pr-3">Time</th>
              <th className="py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {list.map((p) => (
              <tr key={p.id} className="border-b border-border/60 last:border-0">
                <td className="py-3 pr-3 font-medium tabular-nums">#{p.token}</td>
                <td className="py-3 pr-3">{p.name} <span className="text-xs text-muted-foreground">• {p.age}y</span></td>
                <td className="py-3 pr-3 text-muted-foreground">{p.appointmentTime ? new Date(p.appointmentTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Walk-in"}</td>
                <td className="py-3"><StatusBadge status={p.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    waiting: { label: "Waiting", cls: "bg-muted text-muted-foreground" },
    in_progress: { label: "In progress", cls: "bg-primary/10 text-primary" },
    completed: { label: "Completed", cls: "bg-success/10 text-success" },
    skipped: { label: "Skipped", cls: "bg-warning/20 text-warning-foreground" },
    no_show: { label: "No show", cls: "bg-destructive/10 text-destructive" },
  };
  const m = map[status] ?? map.waiting;
  return <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${m.cls}`}>{m.label}</span>;
}

function StatusCard() {
  const state = useStore();
  const doc = activeDoctor(state);
  const setDoctorStatus = useStore((s) => s.setDoctorStatus);
  const [delay, setDelay] = useState(15);

  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 mb-3">
        <Stethoscope className="size-4 text-primary" />
        <h3 className="font-semibold">Your status</h3>
      </div>
      <div className="space-y-2">
        <Button variant={doc.status === "available" ? "default" : "outline"} className="w-full justify-start gap-2" onClick={() => setDoctorStatus("available")}>
          <Activity className="size-4" /> Available
        </Button>
        <Button variant={doc.status === "late" ? "default" : "outline"} className="w-full justify-start gap-2" onClick={() => setDoctorStatus("late", delay)}>
          <Timer className="size-4" /> Running late
        </Button>
        {doc.status === "late" && (
          <div className="flex items-center gap-2 px-3">
            <span className="text-xs text-muted-foreground">Delay</span>
            <input type="range" min={5} max={60} step={5} value={delay} onChange={(e) => { const v = Number(e.target.value); setDelay(v); setDoctorStatus("late", v); }} className="flex-1" />
            <span className="text-sm font-medium tabular-nums w-12 text-right">+{delay}m</span>
          </div>
        )}
        <Button variant={doc.status === "break" ? "default" : "outline"} className="w-full justify-start gap-2" onClick={() => setDoctorStatus("break")}>
          <Coffee className="size-4" /> Break
        </Button>
      </div>
      <p className="mt-4 text-xs text-muted-foreground">Patient queues update in real time when status changes.</p>
    </Card>
  );
}
