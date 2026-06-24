import { Card } from "@/components/ui/card";
import { useStore } from "@/lib/store";
import { Users, Activity, Calendar, CheckCircle2, PhoneOff } from "lucide-react";

export function HospitalLiveStatus() {
  const state = useStore();
  const waiting = state.patients.filter((p) => p.status === "waiting").length;
  const inCons = state.patients.filter((p) => p.status === "in_progress").length;
  const upcoming = state.patients.filter((p) => p.status === "waiting" && p.appointmentTime).length;
  const completed = state.patients.filter((p) => p.status === "completed").length;
  const noShows = state.patients.filter((p) => p.status === "no_show").length;

  const tiles = [
    { label: "Waiting now", value: waiting, icon: Users, color: "text-primary", bg: "bg-primary/10" },
    { label: "In consultation", value: inCons, icon: Activity, color: "text-blue", bg: "bg-[color:var(--blue)]/10" },
    { label: "Upcoming", value: upcoming, icon: Calendar, color: "text-warning-foreground", bg: "bg-warning/15" },
    { label: "Completed", value: completed, icon: CheckCircle2, color: "text-success", bg: "bg-success/10" },
    { label: "No-shows", value: noShows, icon: PhoneOff, color: "text-destructive", bg: "bg-destructive/10" },
  ];

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold tracking-tight">Hospital live status</h3>
          <p className="text-xs text-muted-foreground">Real-time across all departments</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-success">
          <span className="size-1.5 rounded-full bg-success animate-pulse-ring" /> Live
        </div>
      </div>
      <div className="mt-5 grid grid-cols-2 md:grid-cols-5 gap-3">
        {tiles.map((t) => {
          const Icon = t.icon;
          return (
            <div key={t.label} className="rounded-xl border border-border p-4 bg-card relative overflow-hidden">
              <div className={`absolute -top-6 -right-6 size-20 rounded-full ${t.bg} blur-xl`} />
              <div className={`size-8 rounded-lg ${t.bg} ${t.color} grid place-items-center relative`}>
                <Icon className="size-4" />
              </div>
              <div className="mt-3 text-2xl font-semibold tabular-nums">{t.value}</div>
              <div className="text-[11px] text-muted-foreground uppercase tracking-wider">{t.label}</div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
