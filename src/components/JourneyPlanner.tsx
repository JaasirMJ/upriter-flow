import { Card } from "@/components/ui/card";
import { Home, Car, Building2, Clock, Stethoscope, Sparkles, TrendingDown } from "lucide-react";
import { useStore, estimatedWaitMins, activeDoctor } from "@/lib/store";
import { format } from "date-fns";

export function JourneyPlanner() {
  const state = useStore();
  const myToken = state.patients.find((p) => p.id === state.myTokenId);
  const wait = myToken ? estimatedWaitMins(state, myToken.token) : 48;
  const travel = state.travelTimeMins;
  const doc = activeDoctor(state);

  const now = new Date();
  const buffer = 5;
  const consultAt = new Date(now.getTime() + wait * 60000);
  const arriveAt = new Date(consultAt.getTime() - buffer * 60000);
  const leaveAt = new Date(arriveAt.getTime() - travel * 60000);
  const insideWait = Math.max(0, Math.min(15, Math.round(wait - travel - buffer)));

  const hospitalAvg = 90;
  const predicted = insideWait + buffer;
  const saved = Math.max(0, hospitalAvg - predicted);

  const steps = [
    { icon: Home, label: "Home", time: format(now, "p"), sub: "You are here", tone: "muted" },
    { icon: Car, label: "Leave home", time: format(leaveAt, "p"), sub: `${travel} min drive`, tone: "primary" },
    { icon: Building2, label: "Arrive at hospital", time: format(arriveAt, "p"), sub: "Check in at kiosk", tone: "primary" },
    { icon: Clock, label: "Wait inside", time: `~${insideWait} min`, sub: "Premium lounge", tone: "muted" },
    { icon: Stethoscope, label: "Consultation", time: format(consultAt, "p"), sub: doc.name, tone: "accent" },
  ];

  return (
    <Card className="p-6 relative overflow-hidden">
      <div className="absolute -top-20 -right-20 size-64 rounded-full bg-gradient-hero opacity-10 blur-3xl" />
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-gradient-hero grid place-items-center"><Sparkles className="size-4 text-white" /></div>
          <div>
            <h3 className="text-lg font-semibold tracking-tight">Smart Journey Planner</h3>
            <p className="text-xs text-muted-foreground">Your full path from home to consultation</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 border border-success/30 text-success text-xs font-medium">
          <TrendingDown className="size-3.5" /> Saving {saved} mins vs. average
        </div>
      </div>

      {/* Timeline */}
      <ol className="mt-6 relative">
        <div className="absolute left-[19px] top-2 bottom-2 w-px bg-gradient-to-b from-primary via-primary/40 to-border" />
        {steps.map((s, i) => {
          const Icon = s.icon;
          return (
            <li key={i} className="relative pl-14 pb-5 last:pb-0">
              <div className={`absolute left-0 top-0 size-10 rounded-xl grid place-items-center ${
                s.tone === "primary" ? "bg-gradient-hero text-white shadow-glow" :
                s.tone === "accent" ? "bg-accent text-accent-foreground" :
                "bg-muted text-muted-foreground"
              }`}>
                <Icon className="size-4" />
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <div>
                  <div className="font-medium text-sm">{s.label}</div>
                  <div className="text-xs text-muted-foreground">{s.sub}</div>
                </div>
                <div className="font-semibold tabular-nums text-sm whitespace-nowrap">{s.time}</div>
              </div>
            </li>
          );
        })}
      </ol>

      {/* Time saved card */}
      <div className="mt-6 grid grid-cols-3 gap-3">
        <SavedTile label="Hospital average" value={`${hospitalAvg}m`} tone="muted" />
        <SavedTile label="Your predicted wait" value={`${predicted}m`} tone="primary" />
        <SavedTile label="Time saved" value={`${saved}m`} tone="success" />
      </div>
    </Card>
  );
}

function SavedTile({ label, value, tone }: { label: string; value: string; tone: "muted" | "primary" | "success" }) {
  const cls =
    tone === "primary" ? "bg-gradient-hero text-white border-transparent shadow-glow" :
    tone === "success" ? "bg-success/10 border-success/30 text-success" :
    "bg-muted/60 border-border";
  return (
    <div className={`rounded-xl border p-4 ${cls}`}>
      <div className="text-[10px] uppercase tracking-wider opacity-80">{label}</div>
      <div className="text-2xl font-semibold tabular-nums mt-1">{value}</div>
    </div>
  );
}
