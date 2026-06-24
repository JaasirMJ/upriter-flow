import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Stat } from "@/components/Stat";
import { Calendar, Clock, FileText, Stethoscope, Timer, TrendingUp, Users, Activity } from "lucide-react";
import { useProfile, healthSummary } from "@/lib/profile";

export const Route = createFileRoute("/history")({
  head: () => ({ meta: [{ title: "My History — Upriter" }] }),
  component: HistoryPage,
});

function HistoryPage() {
  const visits = useProfile((s) => s.visits);
  const reports = useProfile((s) => s.reports);
  const sum = healthSummary(visits, reports.length);
  const sortedVisits = [...visits].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <AppShell title="Patient History" subtitle="Your visits, tests and time saved with Upriter.">
      <div className="space-y-5">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
          <Stat icon={Calendar} label="Total visits" value={sum.totalVisits} tone="primary" />
          <Stat icon={Activity} label="Tests conducted" value={sum.totalTests} />
          <Stat icon={Stethoscope} label="Doctors consulted" value={sum.doctorsConsulted} />
          <Stat icon={FileText} label="Reports uploaded" value={sum.reportsCount} />
          <Stat icon={Timer} label="Avg consult time" value={`${sum.avgConsultMins} min`} tone="primary" />
          <Stat icon={Clock} label="Time saved" value={`${sum.timeSavedHours} hrs`} tone="success" />
          <Stat icon={Users} label="Preferred department" value={sum.preferredDepartment} />
          <Stat icon={TrendingUp} label="Preferred doctor" value={sum.preferredDoctor} />
        </div>

        <Card className="p-6">
          <h3 className="font-semibold tracking-tight">Visit timeline</h3>
          <ol className="mt-4 relative">
            <div className="absolute left-[15px] top-2 bottom-2 w-px bg-border" />
            {sortedVisits.map((v) => (
              <li key={v.id} className="relative pl-11 pb-5 last:pb-0">
                <div className="absolute left-0 top-0 size-8 rounded-lg bg-accent text-accent-foreground grid place-items-center">
                  <Stethoscope className="size-4" />
                </div>
                <div className="flex items-baseline justify-between gap-3 flex-wrap">
                  <div className="font-medium text-sm">{v.doctorName} · {v.department}</div>
                  <div className="text-[11px] text-muted-foreground">{new Date(v.date).toLocaleDateString()} · {v.time}</div>
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">{v.hospitalName}</div>
                {v.notes && <div className="text-xs mt-1">{v.notes}</div>}
                <div className="mt-2 flex flex-wrap gap-1.5 text-[10px]">
                  <Badge variant="secondary">Consult: {v.consultationMins}m</Badge>
                  <Badge variant="secondary">Waited: {v.waitedMins}m</Badge>
                  {v.testsTaken ? <Badge variant="outline">{v.testsTaken} tests</Badge> : null}
                  {v.status === "upcoming" && <Badge>Upcoming</Badge>}
                </div>
              </li>
            ))}
            {sortedVisits.length === 0 && <div className="text-sm text-muted-foreground pl-11">No visits yet.</div>}
          </ol>
        </Card>
      </div>
    </AppShell>
  );
}
