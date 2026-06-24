import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useStore, estimatedWaitMins, patientsAhead, avgConsultMins, activeDoctor } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Home, Car, Building2, QrCode, Clock, Stethoscope, CheckCircle2, Sparkles, TrendingDown, Activity, Timer, MapPin, Bell, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { EmergencyCard } from "@/components/EmergencyCard";

export const Route = createFileRoute("/journey")({
  head: () => ({
    meta: [
      { title: "Smart Journey — Upriter" },
      { name: "description", content: "Your live path from home to consultation, predicted in real-time." },
    ],
  }),
  component: JourneyPage,
});

function JourneyPage() {
  const state = useStore();
  const myToken = state.patients.find((p) => p.id === state.myTokenId);
  const doc = activeDoctor(state);
  const wait = myToken ? estimatedWaitMins(state, myToken.token) : 18;
  const ahead = myToken ? patientsAhead(state, myToken.token) : 7;
  const travel = state.travelTimeMins;
  const avg = Math.round(avgConsultMins(state));

  const now = new Date();
  const buffer = 5;
  const consultAt = new Date(now.getTime() + wait * 60000);
  const arriveAt = new Date(consultAt.getTime() - buffer * 60000);
  const leaveAt = new Date(arriveAt.getTime() - travel * 60000);
  const endAt = new Date(consultAt.getTime() + avg * 60000);
  const hospitalAvg = 90;
  const yourWait = Math.max(buffer, Math.round(wait - travel));
  const saved = Math.max(0, hospitalAvg - yourWait);

  // Progress stage
  const stageIndex = myToken?.status === "completed" ? 6 :
                     myToken?.status === "in_progress" ? 5 :
                     0;

  if (!myToken) {
    return (
      <AppShell title="Smart Journey" subtitle="Your live path from home to consultation.">
        <Card className="p-10 text-center">
          <div className="mx-auto size-14 rounded-2xl bg-gradient-hero grid place-items-center shadow-glow">
            <Sparkles className="size-6 text-white" />
          </div>
          <h2 className="mt-5 text-xl font-semibold tracking-tight">No active appointment</h2>
          <p className="mt-1 text-sm text-muted-foreground">Book a token to see your full smart journey.</p>
          <Link to="/patient"><Button className="mt-5 gap-2">Book appointment <ArrowRight className="size-4" /></Button></Link>
        </Card>
      </AppShell>
    );
  }

  const steps = [
    { icon: Home,        label: "Home",                  time: format(now, "p"),       sub: "You are here",                    done: true },
    { icon: Car,         label: "Leave home",            time: format(leaveAt, "p"),   sub: `${travel} min drive`,             current: stageIndex === 0 },
    { icon: Building2,   label: "Reach hospital",        time: format(arriveAt, "p"),  sub: "Pull up to entrance",             done: false },
    { icon: QrCode,      label: "Check-in",              time: format(arriveAt, "p"),  sub: "Scan QR at kiosk",                done: false },
    { icon: Clock,       label: "Waiting area",          time: `~${buffer} min`,       sub: "Premium lounge",                  done: false },
    { icon: Stethoscope, label: "Doctor consultation",   time: format(consultAt, "p"), sub: doc.name,                          done: false, accent: true },
    { icon: CheckCircle2,label: "Consultation complete", time: format(endAt, "p"),     sub: "Done — you're free",              done: false },
  ];

  return (
    <AppShell title="Smart Journey" subtitle="Arrive when you're needed, not hours before.">
      <div className="space-y-5">
        <EmergencyCard patient={myToken} />

        {/* Top summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <Summary label="Now serving" value={`#${state.currentToken}`} icon={Activity} />
          <Summary label="Your token" value={`#${myToken.token}`} icon={Activity} tone="primary" />
          <Summary label="Expected wait" value={`${wait}m`} icon={Clock} />
          <Summary label="Travel time" value={`${travel}m`} icon={Car} />
          <Summary label="Doctor" value={doc.status === "available" ? "On time" : doc.status === "late" ? `+${doc.delayMins}m` : "Break"} icon={Stethoscope} tone={doc.status === "available" ? "success" : "warning"} />
          <Summary label="Time saved" value={`${saved}m`} icon={TrendingDown} tone="success" />
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          {/* Timeline */}
          <Card className="lg:col-span-2 p-6 relative overflow-hidden">
            <div className="absolute -top-24 -right-24 size-72 rounded-full bg-gradient-hero opacity-10 blur-3xl" />
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-lg bg-gradient-hero grid place-items-center"><Sparkles className="size-4 text-white" /></div>
                <div>
                  <h3 className="text-lg font-semibold tracking-tight">Your Journey</h3>
                  <p className="text-xs text-muted-foreground">Live timeline · updates with doctor delays</p>
                </div>
              </div>
              <Badge variant="outline" className="gap-1 border-success/40 text-success">
                <span className="size-1.5 rounded-full bg-success animate-pulse" /> Live
              </Badge>
            </div>

            <ol className="mt-6 relative">
              <div className="absolute left-[19px] top-2 bottom-2 w-px bg-gradient-to-b from-success via-primary/40 to-border" />
              {steps.map((s, i) => {
                const Icon = s.icon;
                const isDone = i <= stageIndex;
                const isCurrent = i === stageIndex + 1;
                return (
                  <li key={i} className="relative pl-14 pb-5 last:pb-0 animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
                    <div className={`absolute left-0 top-0 size-10 rounded-xl grid place-items-center transition-all
                      ${isDone ? "bg-success text-white" :
                        isCurrent ? "bg-gradient-hero text-white shadow-glow ring-4 ring-primary/20 animate-pulse-ring" :
                        s.accent ? "bg-accent text-accent-foreground" :
                        "bg-muted text-muted-foreground"}`}>
                      <Icon className="size-4" />
                    </div>
                    <div className="flex items-baseline justify-between gap-3">
                      <div>
                        <div className={`font-medium text-sm ${isDone ? "text-success" : ""}`}>{s.label}</div>
                        <div className="text-xs text-muted-foreground">{s.sub}</div>
                      </div>
                      <div className="font-semibold tabular-nums text-sm whitespace-nowrap">{s.time}</div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </Card>

          {/* Right column */}
          <div className="space-y-5">
            {/* AI recommendation */}
            <Card className="p-5 bg-gradient-hero text-white relative overflow-hidden">
              <div className="absolute -bottom-10 -right-10 size-40 rounded-full bg-white/10 blur-2xl" />
              <div className="flex items-center gap-2">
                <Sparkles className="size-4" />
                <div className="text-[10px] uppercase tracking-wider opacity-80">AI Copilot</div>
              </div>
              <div className="mt-2 text-xl font-semibold tracking-tight">Leave home at {format(leaveAt, "p")}</div>
              <p className="mt-1 text-sm opacity-90">
                {doc.status === "late"
                  ? `Doctor is running ${doc.delayMins} min late — your ETA has shifted.`
                  : `You'll save ~${saved} minutes vs. the average hospital visit today.`}
              </p>
            </Card>

            {/* Patient status ring */}
            <Card className="p-5">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Status</div>
              <StatusRing stage={stageIndex} />
            </Card>

            {/* Live feed */}
            <Card className="p-5">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                <Bell className="size-3" /> Live activity
              </div>
              <ul className="mt-3 space-y-2.5 text-xs">
                {state.notifications.slice(0, 5).map((n) => (
                  <li key={n.id} className="flex items-start gap-2">
                    <span className={`size-1.5 mt-1.5 rounded-full ${n.type === "warning" ? "bg-warning" : n.type === "success" ? "bg-success" : "bg-primary"}`} />
                    <div>
                      <div>{n.text}</div>
                      <div className="text-muted-foreground text-[10px]">{new Date(n.time).toLocaleTimeString()}</div>
                    </div>
                  </li>
                ))}
                {state.notifications.length === 0 && <div className="text-muted-foreground text-xs">No activity yet.</div>}
              </ul>
            </Card>
          </div>
        </div>

        {/* Time savings side-by-side */}
        <div className="grid md:grid-cols-2 gap-5">
          <Card className="p-6 bg-muted/40 border-border">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Traditional hospital visit</div>
            <div className="mt-3 text-4xl font-semibold tabular-nums">{hospitalAvg}<span className="text-xl text-muted-foreground"> min</span></div>
            <div className="mt-1 text-sm text-muted-foreground">Average waiting time</div>
            <div className="mt-4 h-2 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-muted-foreground/40" style={{ width: "100%" }} />
            </div>
          </Card>
          <Card className="p-6 bg-gradient-soft border-primary/30 shadow-glow">
            <div className="text-xs uppercase tracking-wider text-primary">Upriter experience</div>
            <div className="mt-3 text-4xl font-semibold tabular-nums">{yourWait}<span className="text-xl text-muted-foreground"> min</span></div>
            <div className="mt-1 text-sm">Predicted wait — <span className="text-success font-semibold">save {saved} min</span></div>
            <div className="mt-4 h-2 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-gradient-hero transition-all" style={{ width: `${Math.max(8, Math.round((yourWait / hospitalAvg) * 100))}%` }} />
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

function Summary({ label, value, icon: Icon, tone }: { label: string; value: string; icon: any; tone?: "primary" | "success" | "warning" }) {
  const cls =
    tone === "primary" ? "bg-gradient-hero text-white border-transparent shadow-glow" :
    tone === "success" ? "bg-success/10 border-success/30 text-success" :
    tone === "warning" ? "bg-warning/10 border-warning/30 text-warning-foreground" :
    "bg-card border-border";
  return (
    <Card className={`p-4 ${cls}`}>
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider opacity-80">
        <Icon className="size-3" /> {label}
      </div>
      <div className="mt-1.5 text-2xl font-semibold tabular-nums">{value}</div>
    </Card>
  );
}

function StatusRing({ stage }: { stage: number }) {
  const stages = ["Booked", "Travelling", "Arrived", "Waiting", "In Consult", "Completed"];
  const pct = Math.min(100, Math.round(((stage + 1) / stages.length) * 100));
  const r = 44;
  const c = 2 * Math.PI * r;
  return (
    <div className="mt-3 flex items-center gap-4">
      <div className="relative size-28">
        <svg className="size-28 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={r} stroke="var(--muted)" strokeWidth="8" fill="none" />
          <circle cx="50" cy="50" r={r} stroke="url(#g-ring)" strokeWidth="8" fill="none"
                  strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c - (c * pct) / 100}
                  className="transition-all duration-700" />
          <defs>
            <linearGradient id="g-ring" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--chart-1)" />
              <stop offset="100%" stopColor="var(--chart-2)" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <div className="text-center">
            <div className="text-2xl font-semibold tabular-nums">{pct}%</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">progress</div>
          </div>
        </div>
      </div>
      <ol className="text-xs space-y-1">
        {stages.map((s, i) => (
          <li key={s} className={`flex items-center gap-1.5 ${i <= stage ? "text-foreground font-medium" : "text-muted-foreground"}`}>
            <span className={`size-1.5 rounded-full ${i < stage ? "bg-success" : i === stage ? "bg-primary animate-pulse" : "bg-muted-foreground/40"}`} />
            {s}
          </li>
        ))}
      </ol>
    </div>
  );
}
