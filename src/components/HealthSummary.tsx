import { Card } from "@/components/ui/card";
import { Activity, Calendar, Clock, FileText, Heart, Stethoscope, Timer, TrendingUp } from "lucide-react";
import { useProfile, healthSummary } from "@/lib/profile";

export function HealthSummary() {
  const visits = useProfile((s) => s.visits);
  const reports = useProfile((s) => s.reports);
  const profile = useProfile((s) => s.profile);
  const s = healthSummary(visits, reports.length);

  const tiles = [
    { icon: Calendar, label: "Total visits", value: s.totalVisits, tone: "text-primary" },
    { icon: Activity, label: "Total tests", value: s.totalTests, tone: "text-blue-500" },
    { icon: Timer, label: "Avg consult", value: `${s.avgConsultMins} m`, tone: "text-violet-500" },
    { icon: Clock, label: "Time saved", value: `${s.timeSavedHours} hrs`, tone: "text-success" },
  ];

  return (
    <Card className="p-6 overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-soft -z-10" />
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Heart className="size-3.5 text-destructive" /> My Health Summary
          </div>
          <h2 className="text-2xl font-semibold tracking-tight mt-1">
            {profile ? `Hi ${profile.name.split(" ")[0]} 👋` : "Welcome 👋"}
          </h2>
          <div className="text-sm text-muted-foreground mt-0.5">{profile?.city ?? "—"} · Blood group {profile?.bloodGroup ?? "—"}</div>
        </div>
        <div className="flex gap-3 text-sm">
          <div className="rounded-xl border border-border bg-card/70 backdrop-blur px-4 py-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1"><Stethoscope className="size-3" />Preferred doctor</div>
            <div className="font-semibold">{s.preferredDoctor}</div>
          </div>
          <div className="rounded-xl border border-border bg-card/70 backdrop-blur px-4 py-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1"><TrendingUp className="size-3" />Preferred hospital</div>
            <div className="font-semibold">{s.preferredHospital}</div>
          </div>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
        {tiles.map((t) => {
          const Icon = t.icon;
          return (
            <div key={t.label} className="rounded-xl border border-border p-4 bg-card/60">
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground"><Icon className={`size-3 ${t.tone}`} />{t.label}</div>
              <div className="mt-1.5 text-2xl font-semibold tabular-nums">{t.value}</div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
