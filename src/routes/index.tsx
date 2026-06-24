import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, ArrowRight, BarChart3, ClipboardList, MapPin, Sparkles, Stethoscope, Timer, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Upriter — Arrive when you're needed, not hours before." },
      { name: "description", content: "AI-powered patient flow and queue management for multi-speciality hospitals." },
      { property: "og:title", content: "Upriter — AI Patient Flow OS" },
      { property: "og:description", content: "Arrive when you're needed, not hours before." },
    ],
  }),
  component: Landing,
});

const roles = [
  { to: "/patient", icon: User, title: "Patient", desc: "Book, track your token, plan arrival.", tone: "from-teal-500/15 to-blue-500/10" },
  { to: "/doctor", icon: Stethoscope, title: "Doctor", desc: "Schedule, consultation controls, delays.", tone: "from-blue-500/15 to-teal-500/10" },
  { to: "/reception", icon: ClipboardList, title: "Reception", desc: "Queue, walk-ins, fast actions.", tone: "from-teal-500/15 to-cyan-500/10" },
  { to: "/admin", icon: BarChart3, title: "Hospital Admin", desc: "Analytics & utilization.", tone: "from-blue-500/15 to-indigo-500/10" },
] as const;

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="px-6 md:px-10 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="size-9 rounded-xl bg-gradient-hero grid place-items-center shadow-glow">
            <Activity className="size-5 text-white" />
          </div>
          <div>
            <div className="font-semibold text-lg tracking-tight">Upriter</div>
            <div className="text-[10px] text-muted-foreground -mt-0.5 uppercase tracking-wider">Patient Flow OS</div>
          </div>
        </div>
        <nav className="hidden md:flex items-center gap-1 text-sm">
          <Link to="/patient" className="px-3 py-2 text-muted-foreground hover:text-foreground">Patient</Link>
          <Link to="/doctor" className="px-3 py-2 text-muted-foreground hover:text-foreground">Doctor</Link>
          <Link to="/reception" className="px-3 py-2 text-muted-foreground hover:text-foreground">Reception</Link>
          <Link to="/admin" className="px-3 py-2 text-muted-foreground hover:text-foreground">Admin</Link>
        </nav>
        <Link to="/patient">
          <Button size="sm" className="gap-1">Open app <ArrowRight className="size-4" /></Button>
        </Link>
      </header>

      {/* Hero */}
      <section className="px-6 md:px-10 pt-10 md:pt-20 pb-20 max-w-6xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-muted/60 text-xs">
          <Sparkles className="size-3.5 text-primary" />
          <span className="text-muted-foreground">AI patient flow for multi-speciality hospitals</span>
        </div>
        <h1 className="mt-5 text-4xl md:text-6xl font-semibold tracking-tight leading-[1.05] max-w-3xl">
          Arrive when you're <span className="text-gradient">needed</span>, not hours before.
        </h1>
        <p className="mt-5 text-lg text-muted-foreground max-w-2xl">
          Upriter predicts your exact consultation time using real queue data, doctor delays and your travel time —
          so patients wait at home, not in waiting rooms.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/journey"><Button size="lg" className="gap-2">See your Smart Journey <ArrowRight className="size-4" /></Button></Link>
          <Link to="/patient"><Button size="lg" variant="outline">Book an appointment</Button></Link>
        </div>

        {/* Hero stats */}
        <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {[
            { icon: Timer, k: "−74%", v: "Average wait time" },
            { icon: MapPin, k: "22 min", v: "Smarter arrivals" },
            { icon: Activity, k: "Live", v: "Cross-device sync" },
            { icon: Sparkles, k: "AI", v: "Arrival Planner" },
          ].map((s, i) => (
            <Card key={i} className="p-4">
              <s.icon className="size-4 text-primary" />
              <div className="mt-3 text-2xl font-semibold tracking-tight">{s.k}</div>
              <div className="text-xs text-muted-foreground">{s.v}</div>
            </Card>
          ))}
        </div>
      </section>

      {/* Role picker */}
      <section className="px-6 md:px-10 pb-24 max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">Choose a workspace</h2>
        <p className="text-muted-foreground mt-1">Each role gets a tailored dashboard. Open multiple tabs to see real-time sync.</p>
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {roles.map((r) => (
            <Link key={r.to} to={r.to} className="group">
              <Card className={`p-5 h-full bg-gradient-to-br ${r.tone} hover:shadow-glow transition-all group-hover:-translate-y-0.5`}>
                <div className="size-10 rounded-xl bg-card grid place-items-center shadow-soft">
                  <r.icon className="size-5 text-primary" />
                </div>
                <div className="mt-5 text-lg font-semibold tracking-tight">{r.title}</div>
                <div className="text-sm text-muted-foreground mt-1">{r.desc}</div>
                <div className="mt-6 flex items-center gap-1 text-sm font-medium text-primary">
                  Open <ArrowRight className="size-3.5 group-hover:translate-x-0.5 transition" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <footer className="border-t border-border px-6 md:px-10 py-6 text-xs text-muted-foreground flex justify-between">
        <div>© Upriter — Demo build</div>
        <div>Built with Lovable</div>
      </footer>
    </div>
  );
}
