import { Card } from "@/components/ui/card";
import { useStore, avgConsultMins } from "@/lib/store";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function DoctorPerformance() {
  const state = useStore();
  const completed = state.patients.filter((p) => p.status === "completed");
  const avg = Math.round(avgConsultMins(state));
  const longest = Math.max(...state.consultationDurations, 0);
  const utilization = Math.min(95, 55 + completed.length * 4);

  const tiles = [
    { label: "Seen today", value: completed.length },
    { label: "Avg consult", value: `${avg} min` },
    { label: "Longest", value: `${longest} min` },
    { label: "Utilization", value: `${utilization}%` },
  ];

  const deptCompare = [
    { name: "Cardiology", consults: 42, avg: 12 },
    { name: "Ortho", consults: 28, avg: 14 },
    { name: "Derm", consults: 22, avg: 8 },
    { name: "Neuro", consults: 18, avg: 18 },
    { name: "Peds", consults: 26, avg: 10 },
  ];

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold tracking-tight">Doctor performance</h3>
          <p className="text-xs text-muted-foreground">Today's snapshot vs. department average</p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
        {tiles.map((t) => (
          <div key={t.label} className="rounded-xl border border-border p-4 bg-card">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{t.label}</div>
            <div className="text-2xl font-semibold tabular-nums mt-1">{t.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Department comparison</div>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={deptCompare}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={11} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} />
              <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="consults" fill="var(--chart-1)" radius={[8, 8, 0, 0]} name="Consults" />
              <Bar dataKey="avg" fill="var(--chart-2)" radius={[8, 8, 0, 0]} name="Avg min" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
}
