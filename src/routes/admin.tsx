import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useStore, avgConsultMins } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Stat } from "@/components/Stat";
import { Activity, Clock, Stethoscope, Timer, Users, ShieldAlert, Zap, Building2, CalendarCheck, ClipboardList } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { HospitalLiveStatus } from "@/components/HospitalLiveStatus";
import { RushHourHeatmap } from "@/components/RushHourHeatmap";
import { HOSPITALS, DOCTORS } from "@/lib/data";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Hospital Admin — Upriter" }] }),
  component: AdminPage,
});

function AdminPage() {
  const state = useStore();
  const completed = state.patients.filter((p) => p.status === "completed").length;
  const waiting = state.patients.filter((p) => p.status === "waiting").length;
  const avg = avgConsultMins(state);
  const activeDoctors = state.doctors.filter((d) => d.status !== "break").length;

  // Approx avg wait: avg consult * mean position ahead
  const avgWait = Math.round((avg * Math.max(1, waiting)) / 2);

  // Patients per day (mock 7 days, today is dynamic)
  const perDay = [
    { d: "Mon", v: 48 },
    { d: "Tue", v: 56 },
    { d: "Wed", v: 61 },
    { d: "Thu", v: 52 },
    { d: "Fri", v: 70 },
    { d: "Sat", v: 82 },
    { d: "Today", v: state.patients.length },
  ];

  // Department load
  const deptLoad = [
    { name: "Cardiology", value: 42 },
    { name: "Orthopedics", value: 28 },
    { name: "Dermatology", value: 18 },
    { name: "Neurology", value: 12 },
  ];

  // Doctor utilization
  const docUtil = state.doctors.map((d, i) => ({
    name: d.name.replace("Dr. ", ""),
    util: 60 + ((i * 13) % 35),
  }));

  const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

  const highRisk = state.patients.filter((p) => p.riskLevel === "high" || p.riskLevel === "critical").length;
  const emergencyReviews = state.patients.filter((p) => p.reviewStatus === "pending" || p.reviewStatus === "doctor_review").length;
  const fastTracked = state.patients.filter((p) => p.reviewStatus === "fast_track").length;

  const riskDist = (["critical", "high", "medium", "low"] as const).map((lvl) => ({
    name: lvl[0].toUpperCase() + lvl.slice(1),
    value: state.patients.filter((p) => (p.riskLevel ?? "low") === lvl).length || (lvl === "low" ? state.patients.length : 0),
  }));
  const RISK_COLORS = ["var(--destructive)", "#f97316", "var(--chart-3)", "var(--chart-2)"];

  return (
    <AppShell title="Hospital Admin" subtitle="Operational analytics across departments and doctors.">
      <div className="space-y-5">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Stat icon={Building2} label="Registered hospitals" value={HOSPITALS.length} tone="primary" />
          <Stat icon={Stethoscope} label="Total doctors" value={DOCTORS.length} />
          <Stat icon={Users} label="Total patients" value={state.patients.length} />
          <Stat icon={CalendarCheck} label="Total appointments" value={state.patients.length + 142} />
          <Stat icon={ClipboardList} label="Total consultations" value={completed + 87} tone="success" />
        </div>
        <HospitalLiveStatus />

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat icon={ShieldAlert} label="High-risk patients today" value={highRisk} tone="warning" />
          <Stat icon={Activity} label="Emergency reviews" value={emergencyReviews} tone="warning" />
          <Stat icon={Zap} label="Fast-tracked" value={fastTracked} tone="primary" />
          <Stat icon={Timer} label="Avg emergency response" value="4.2 min" tone="success" />
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat icon={Users} label="Patients served today" value={completed} tone="success" />
          <Stat icon={Timer} label="Avg consultation" value={`${Math.round(avg)} min`} tone="primary" />
          <Stat icon={Clock} label="Avg waiting" value={`${avgWait} min`} />
          <Stat icon={Stethoscope} label="Active doctors" value={`${activeDoctors}/${state.doctors.length}`} tone="primary" />
        </div>

        <RushHourHeatmap />

      <div className="grid lg:grid-cols-3 gap-5">

        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold tracking-tight">Patients per day</h3>
            <span className="text-xs text-muted-foreground">Last 7 days</span>
          </div>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={perDay}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="d" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="v" stroke="var(--chart-1)" strokeWidth={2} fill="url(#g1)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold tracking-tight">Department load</h3>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={deptLoad} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80} paddingAngle={3}>
                  {deptLoad.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5 lg:col-span-2">
          <h3 className="font-semibold tracking-tight">Doctor utilization</h3>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={docUtil}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} unit="%" />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="util" fill="var(--chart-2)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold tracking-tight">AI risk distribution</h3>
          <p className="text-xs text-muted-foreground">Pending human review</p>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={riskDist} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80} paddingAngle={3}>
                  {riskDist.map((_, i) => <Cell key={i} fill={RISK_COLORS[i]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
        </div>
      </div>
    </AppShell>
  );
}
